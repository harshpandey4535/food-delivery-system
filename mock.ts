import { CartItem, MealPlan, MenuItem, Order, Restaurant } from "../types";

const breakfast: MenuItem[] = [
  {
    id: "m1",
    name: "Oats Berry Bowl",
    price: 180,
    calories: 290,
    category: "Breakfast",
    veg: true,
    description: "Rolled oats, berries, chia seeds, and honey.",
    tags: ["healthy", "veg", "fiber"],
  },
  {
    id: "m2",
    name: "Paneer Wrap",
    price: 220,
    calories: 410,
    category: "Breakfast",
    veg: true,
    description: "Grilled paneer with mint yogurt and fresh salad.",
    tags: ["protein", "veg"],
  },
  {
    id: "m3",
    name: "Egg Power Box",
    price: 210,
    calories: 370,
    category: "Breakfast",
    veg: false,
    description: "Boiled eggs, toast, avocado, and roasted tomatoes.",
    tags: ["protein", "eggs"],
  },
];

const lunch: MenuItem[] = [
  {
    id: "m4",
    name: "Grilled Veg Platter",
    price: 260,
    calories: 460,
    category: "Lunch",
    veg: true,
    description: "Seasonal vegetables, quinoa, and lemon dressing.",
    tags: ["veg", "budget", "light"],
  },
  {
    id: "m5",
    name: "Chicken Rice Bowl",
    price: 320,
    calories: 560,
    category: "Lunch",
    veg: false,
    description: "Tender chicken, rice, yogurt sauce, and greens.",
    tags: ["high-protein", "non-veg"],
  },
  {
    id: "m6",
    name: "Thai Tofu Noodles",
    price: 280,
    calories: 490,
    category: "Lunch",
    veg: true,
    description: "Rice noodles, tofu, peanuts, and fresh herbs.",
    tags: ["vegan", "asian"],
  },
];

const dinner: MenuItem[] = [
  {
    id: "m7",
    name: "Dal Khichdi Comfort Bowl",
    price: 240,
    calories: 430,
    category: "Dinner",
    veg: true,
    description: "Rice, lentils, ghee, and seasonal vegetables.",
    tags: ["comfort", "veg", "budget"],
  },
  {
    id: "m8",
    name: "Tandoori Chicken Grill",
    price: 350,
    calories: 540,
    category: "Dinner",
    veg: false,
    description: "Char-grilled chicken with mint chutney and salad.",
    tags: ["protein", "non-veg"],
  },
  {
    id: "m9",
    name: "Mushroom Stir Fry",
    price: 270,
    calories: 410,
    category: "Dinner",
    veg: true,
    description: "Mushrooms, peppers, broccoli, and soy glaze.",
    tags: ["vegan", "light"],
  },
];

const snacks: MenuItem[] = [
  {
    id: "m10",
    name: "Fruit Cup",
    price: 120,
    calories: 140,
    category: "Snack",
    veg: true,
    description: "Fresh seasonal fruit with lime and mint.",
    tags: ["light", "veg"],
  },
  {
    id: "m11",
    name: "Protein Smoothie",
    price: 190,
    calories: 230,
    category: "Snack",
    veg: true,
    description: "Banana, peanut butter, oat milk, and protein.",
    tags: ["protein", "post-workout"],
  },
];

export const restaurants: Restaurant[] = [
  {
    id: "r1",
    name: "Green Spoon",
    location: "Downtown",
    cuisine: "Healthy",
    rating: 4.8,
    deliveryTime: "20-30 min",
    tags: ["veg", "meal prep", "budget friendly"],
    menu: [breakfast[0], breakfast[1], lunch[0], lunch[2], dinner[0], snacks[0]],
  },
  {
    id: "r2",
    name: "Spice Junction",
    location: "City Center",
    cuisine: "Indian",
    rating: 4.7,
    deliveryTime: "25-35 min",
    tags: ["family", "comfort food", "customizable"],
    menu: [breakfast[1], lunch[1], lunch[0], dinner[0], dinner[1], snacks[1]],
  },
  {
    id: "r3",
    name: "Urban Grill",
    location: "Riverside",
    cuisine: "Grill",
    rating: 4.6,
    deliveryTime: "30-40 min",
    tags: ["high-protein", "non-veg", "late night"],
    menu: [breakfast[2], lunch[1], dinner[1], dinner[2], snacks[1]],
  },
  {
    id: "r4",
    name: "Bento House",
    location: "Tech Park",
    cuisine: "Asian",
    rating: 4.5,
    deliveryTime: "18-28 min",
    tags: ["light", "fast", "office lunch"],
    menu: [lunch[2], lunch[0], dinner[2], snacks[0]],
  },
];

export const allMenuItems: MenuItem[] = restaurants.flatMap((restaurant) => restaurant.menu);

export const demoCart: CartItem[] = [
  {
    ...restaurants[0].menu[0],
    restaurantId: restaurants[0].id,
    restaurantName: restaurants[0].name,
    quantity: 1,
  },
  {
    ...restaurants[1].menu[2],
    restaurantId: restaurants[1].id,
    restaurantName: restaurants[1].name,
    quantity: 2,
  },
];

export const demoOrders: Order[] = [
  {
    id: "ORD-1001",
    userId: "demo@meallane.app",
    restaurantId: "r1",
    restaurantName: "Green Spoon",
    items: [
      {
        ...restaurants[0].menu[0],
        restaurantId: "r1",
        restaurantName: "Green Spoon",
        quantity: 1,
      },
    ],
    totalPrice: 180,
    status: "Delivered",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    paymentId: "pay_demo_001",
    paymentStatus: "captured",
  },
  {
    id: "ORD-1002",
    userId: "demo@meallane.app",
    restaurantId: "r3",
    restaurantName: "Urban Grill",
    items: [
      {
        ...restaurants[2].menu[0],
        restaurantId: "r3",
        restaurantName: "Urban Grill",
        quantity: 1,
      },
      {
        ...restaurants[2].menu[2],
        restaurantId: "r3",
        restaurantName: "Urban Grill",
        quantity: 1,
      },
    ],
    totalPrice: 620,
    status: "Delivered",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 9).toISOString(),
    paymentId: "pay_demo_002",
    paymentStatus: "captured",
  },
];

export const demoMealPlan: MealPlan = {
  id: "PLAN-1001",
  userId: "demo@meallane.app",
  budget: 1500,
  preferences: ["veg", "high-protein"],
  weeklyPlan: [
    {
      day: "Monday",
      breakfast: restaurants[0].menu[0],
      lunch: restaurants[0].menu[2],
      dinner: restaurants[0].menu[4],
      totalCalories: 1140,
      totalCost: 680,
    },
    {
      day: "Tuesday",
      breakfast: restaurants[1].menu[1],
      lunch: restaurants[1].menu[0],
      dinner: restaurants[1].menu[3],
      totalCalories: 1390,
      totalCost: 780,
    },
  ],
  totalCalories: 2530,
  totalCost: 1460,
  createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
};

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function scoreItem(item: MenuItem, preferences: { diet: string; cuisines: string[]; budget: number }, history: string[]) {
  let score = 0;

  if (preferences.diet === "veg" && item.veg) score += 30;
  if (preferences.diet === "vegan" && item.tags.includes("vegan")) score += 30;
  if (preferences.diet === "non-veg" && !item.veg) score += 20;
  if (preferences.cuisines.some((cuisine) => item.tags.includes(cuisine.toLowerCase()))) score += 20;
  if (item.price <= preferences.budget) score += 15;
  if (history.includes(item.name)) score -= 12;
  if (item.tags.includes("high-protein")) score += 8;
  if (item.tags.includes("budget")) score += 8;

  return score;
}

export function recommendMeals({
  preferences,
  history,
  menuItems,
}: {
  preferences: { diet: string; cuisines: string[]; budget: number };
  history: string[];
  menuItems: MenuItem[];
}) {
  return [...menuItems]
    .map((item) => ({ item, score: scoreItem(item, preferences, history) }))
    .filter(({ item }) => item.price <= Math.max(preferences.budget, 1))
    .sort((left, right) => right.score - left.score || left.item.price - right.item.price)
    .slice(0, 6)
    .map(({ item }) => item);
}

export function buildMealPlan({
  budget,
  preferences,
  history,
  menuItems,
}: {
  budget: number;
  preferences: { diet: string; cuisines: string[]; budget: number };
  history: string[];
  menuItems: MenuItem[];
}) {
  const sorted = recommendMeals({ preferences: { ...preferences, budget }, history, menuItems });
  const source = sorted.length > 0 ? sorted : allMenuItems;

  const weeklyPlan = days.map((day, index) => {
    const breakfastItem = source[index % source.length];
    const lunchItem = source[(index + 1) % source.length];
    const dinnerItem = source[(index + 2) % source.length];
    const totalCalories = breakfastItem.calories + lunchItem.calories + dinnerItem.calories;
    const totalCost = breakfastItem.price + lunchItem.price + dinnerItem.price;

    return {
      day,
      breakfast: breakfastItem,
      lunch: lunchItem,
      dinner: dinnerItem,
      totalCalories,
      totalCost,
    };
  });

  const totalCalories = weeklyPlan.reduce((sum, day) => sum + day.totalCalories, 0);
  const totalCost = weeklyPlan.reduce((sum, day) => sum + day.totalCost, 0);

  const mealPlan: MealPlan = {
    id: `PLAN-${Date.now()}`,
    userId: "local",
    budget,
    preferences: [preferences.diet, ...preferences.cuisines],
    weeklyPlan,
    totalCalories,
    totalCost,
    createdAt: new Date().toISOString(),
  };

  return mealPlan;
}

export function buildChatReply(message: string) {
  const text = message.toLowerCase();

  if (text.includes("budget")) {
    return "Try the Veg Platter, Dal Khichdi, or Fruit Cup for low-cost meals. The planner can keep your weekly spend within budget.";
  }

  if (text.includes("protein")) {
    return "The Chicken Rice Bowl, Egg Power Box, and Protein Smoothie are strong high-protein picks.";
  }

  if (text.includes("veg")) {
    return "I would suggest Oats Berry Bowl, Thai Tofu Noodles, and Mushroom Stir Fry.";
  }

  if (text.includes("order")) {
    return "You can add items to the cart, then use Razorpay test checkout to place the order securely.";
  }

  return "Tell me your diet preference, budget, or calorie goal and I will suggest a meal plan.";
}
