require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const Razorpay = require("razorpay");
const connectDB = require("./config/db");
const auth = require("./middleware/auth");
const errorHandler = require("./middleware/errorHandler");
const User = require("./models/User");
const Restaurant = require("./models/Restaurant");
const Order = require("./models/Order");
const MealPlan = require("./models/MealPlan");
const sampleRestaurants = require("./data/sampleData");

const app = express();
const port = process.env.PORT || 4000;
const mlServiceUrl = process.env.ML_SERVICE_URL || "http://localhost:5000";
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

function signTokens(user) {
  const accessToken = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "15m" });
  const refreshToken = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });
  return { accessToken, refreshToken };
}

function sanitizeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    preferences: user.preferences,
  };
}

async function loadRestaurants() {
  const count = await Restaurant.countDocuments();

  if (count === 0) {
    await Restaurant.insertMany(sampleRestaurants);
  }
}

async function callMlService(payload) {
  const response = await fetch(`${mlServiceUrl}/recommend`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`ML service failed with status ${response.status}`);
  }

  return response.json();
}

function buildWeeklyPlan(recommendations, budget, userId, preferences) {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const items = recommendations.length > 0 ? recommendations : [];
  const source = items.length > 0 ? items : [
    { name: "Veg Platter", price: 200, calories: 350 },
    { name: "Dal Khichdi", price: 180, calories: 300 },
    { name: "Fruit Bowl", price: 120, calories: 140 },
  ];

  const weeklyPlan = days.map((day, index) => {
    const breakfast = source[index % source.length];
    const lunch = source[(index + 1) % source.length];
    const dinner = source[(index + 2) % source.length];
    const totalCalories = (breakfast.calories || 0) + (lunch.calories || 0) + (dinner.calories || 0);
    const totalCost = (breakfast.price || 0) + (lunch.price || 0) + (dinner.price || 0);

    return { day, breakfast, lunch, dinner, totalCalories, totalCost };
  });

  const totalCalories = weeklyPlan.reduce((sum, item) => sum + item.totalCalories, 0);
  const totalCost = weeklyPlan.reduce((sum, item) => sum + item.totalCost, 0);

  return { userId, budget, preferences, weeklyPlan, totalCalories, totalCost };
}

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.post("/register", async (req, res, next) => {
  try {
    const { name, email, password, diet = "veg", cuisines = [], budget = 1200 } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      preferences: { diet, cuisines, budget },
      orderHistory: [],
      refreshTokens: [],
    });

    const tokens = signTokens(user);
    user.refreshTokens.push(tokens.refreshToken);
    await user.save();

    res.status(201).json({ user: sanitizeUser(user), ...tokens });
  } catch (error) {
    next(error);
  }
});

app.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const tokens = signTokens(user);
    user.refreshTokens.push(tokens.refreshToken);
    await user.save();

    res.json({ user: sanitizeUser(user), ...tokens });
  } catch (error) {
    next(error);
  }
});

app.post("/refresh-token", async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token is required" });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || !user.refreshTokens.includes(refreshToken)) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const tokens = signTokens(user);
    user.refreshTokens = user.refreshTokens.filter((token) => token !== refreshToken);
    user.refreshTokens.push(tokens.refreshToken);
    await user.save();

    res.json(tokens);
  } catch (error) {
    next(error);
  }
});

app.get("/restaurants", async (req, res, next) => {
  try {
    const restaurants = await Restaurant.find().lean();
    res.json(restaurants);
  } catch (error) {
    next(error);
  }
});

app.get("/menu/:id", async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id).lean();
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    res.json(restaurant.menu);
  } catch (error) {
    next(error);
  }
});

app.post("/cart", auth, async (req, res) => {
  const cart = req.body.cart || [];
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  res.json({ success: true, cart, subtotal });
});

app.post("/order", auth, async (req, res, next) => {
  try {
    const { cart = req.body.items || [], payment = {}, order: payloadOrder } = req.body;
    const items = cart.length > 0 ? cart : payloadOrder?.items || [];

    if (!items.length) {
      return res.status(400).json({ message: "Order items are required" });
    }

    const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const baseItem = items[0];
    const order = await Order.create({
      userId: req.user.id,
      restaurantId: baseItem.restaurantId,
      restaurantName: baseItem.restaurantName,
      items,
      totalPrice,
      status: payment.paymentStatus === "captured" ? "Paid" : "Placed",
      paymentId: payment.paymentId,
      paymentStatus: payment.paymentStatus,
    });

    await User.findByIdAndUpdate(req.user.id, { $push: { orderHistory: order._id } });
    res.status(201).json({ order });
  } catch (error) {
    next(error);
  }
});

app.get("/orders", auth, async (req, res, next) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 }).lean();
    res.json(orders);
  } catch (error) {
    next(error);
  }
});

app.post("/recommend", auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate("orderHistory");
    const restaurants = await Restaurant.find().lean();
    const menuItems = restaurants.flatMap((restaurant) =>
      restaurant.menu.map((item) => ({
        ...item,
        restaurantId: restaurant._id.toString(),
        restaurantName: restaurant.name,
      })),
    );
    const history = Array.isArray(req.body.history) && req.body.history.length > 0
      ? req.body.history
      : (user.orderHistory || [])
          .flatMap((order) => order.items || [])
          .map((item) => item.name);

    const mlResponse = await callMlService({
      preferences: req.body.preferences || user.preferences,
      budget: req.body.preferences?.budget || user.preferences.budget,
      history,
      menuItems,
    });

    res.json(mlResponse);
  } catch (error) {
    next(error);
  }
});

app.post("/meal-plan", auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate("orderHistory");
    const restaurants = await Restaurant.find().lean();
    const menuItems = restaurants.flatMap((restaurant) =>
      restaurant.menu.map((item) => ({
        ...item,
        restaurantId: restaurant._id.toString(),
        restaurantName: restaurant.name,
      })),
    );
    const history = Array.isArray(req.body.history) && req.body.history.length > 0
      ? req.body.history
      : (user.orderHistory || [])
          .flatMap((order) => order.items || [])
          .map((item) => item.name);

    const mlResponse = await callMlService({
      preferences: req.body.preferences || user.preferences,
      budget: req.body.budget || user.preferences.budget,
      history,
      menuItems,
    });

    const recommendations = mlResponse.recommendations || [];
    const planData = buildWeeklyPlan(recommendations, req.body.budget || user.preferences.budget, user._id, req.body.preferences || user.preferences);
    const mealPlan = await MealPlan.create(planData);
    res.status(201).json({ mealPlan, recommendations });
  } catch (error) {
    next(error);
  }
});

app.post("/payment/create-order", auth, async (req, res, next) => {
  try {
    const amount = Number(req.body.amount || 0);
    const options = {
      amount,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    next(error);
  }
});

app.post("/payment/verify", auth, async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ verified: false, message: "Invalid payment signature" });
    }

    res.json({ verified: true, message: "Payment verified successfully" });
  } catch (error) {
    next(error);
  }
});

app.use(errorHandler);

connectDB()
  .then(async () => {
    await loadRestaurants();
    app.listen(port, () => {
      console.log(`Backend server running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
