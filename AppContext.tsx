import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { apiClient } from "../services/api";
import {
  buildChatReply,
  buildMealPlan,
  allMenuItems,
  demoCart,
  demoMealPlan,
  demoOrders,
  recommendMeals,
  restaurants,
} from "../data/mock";
import {
  CartItem,
  DietType,
  LoginPayload,
  MealPlan,
  MenuItem,
  Order,
  RegisterPayload,
  Restaurant,
  UserProfile,
} from "../types";

type FoodContextValue = {
  user: UserProfile | null;
  restaurants: Restaurant[];
  cart: CartItem[];
  orders: Order[];
  mealPlan: MealPlan | null;
  recommendations: MenuItem[];
  isReady: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
  addToCart: (item: MenuItem, restaurant: Restaurant) => void;
  changeCartQuantity: (itemId: string, quantity: number) => void;
  removeFromCart: (itemId: string) => void;
  placeOrder: (payload?: { paymentId?: string; paymentStatus?: string; razorpayOrderId?: string }) => Promise<Order | null>;
  generatePlan: (payload: { budget: number; diet: DietType; cuisines: string[] }) => Promise<MealPlan | null>;
  refreshRecommendations: () => Promise<void>;
  saveChatReply: (message: string) => string;
};

const FoodContext = createContext<FoodContextValue | undefined>(undefined);

const DEMO_EMAIL = "demo@meallane.app";

const storage = {
  user: "meallane-user",
  access: "meallane-access-token",
  refresh: "meallane-refresh-token",
  cart: (email: string) => `meallane-cart:${email}`,
  orders: (email: string) => `meallane-orders:${email}`,
  mealPlan: (email: string) => `meallane-mealplan:${email}`,
};

function readJSON<T>(key: string, fallback: T) {
  const raw = localStorage.getItem(key);

  if (!raw) return fallback;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJSON(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

function createLocalTokens(email: string) {
  return {
    accessToken: `local-access.${btoa(email)}.${Date.now()}`,
    refreshToken: `local-refresh.${btoa(email)}.${Date.now()}`,
  };
}

function createProfileFromRegister(payload: RegisterPayload): UserProfile {
  return {
    id: payload.email,
    name: payload.name,
    email: payload.email,
    preferences: {
      diet: payload.diet,
      cuisines: payload.cuisines,
      budget: payload.budget,
    },
  };
}

function defaultProfile(email: string): UserProfile {
  return {
    id: email,
    name: email.split("@")[0],
    email,
    preferences: {
      diet: "veg",
      cuisines: ["healthy"],
      budget: 1200,
    },
  };
}

function createOrderId() {
  return `ORD-${Date.now().toString().slice(-7)}`;
}

function sumCart(cart: CartItem[]) {
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function buildOrderFromCart(user: UserProfile, cart: CartItem[], payment?: { paymentId?: string; paymentStatus?: string; razorpayOrderId?: string }) {
  const baseRestaurant = cart[0];

  return {
    id: createOrderId(),
    userId: user.email,
    restaurantId: baseRestaurant.restaurantId,
    restaurantName: baseRestaurant.restaurantName,
    items: cart,
    totalPrice: sumCart(cart),
    status: payment?.paymentStatus === "captured" ? ("Paid" as const) : ("Placed" as const),
    createdAt: new Date().toISOString(),
    paymentId: payment?.paymentId,
    paymentStatus: payment?.paymentStatus,
  };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(() => readJSON<UserProfile | null>(storage.user, null));
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [recommendations, setRecommendations] = useState<MenuItem[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!user) {
      setCart([]);
      setOrders([]);
      setMealPlan(null);
      setRecommendations([]);
      setIsReady(true);
      return;
    }

    const cartKey = storage.cart(user.email);
    const ordersKey = storage.orders(user.email);
    const planKey = storage.mealPlan(user.email);

    const savedCart = readJSON<CartItem[]>(cartKey, user.email === DEMO_EMAIL ? demoCart : []);
    const savedOrders = readJSON<Order[]>(ordersKey, user.email === DEMO_EMAIL ? demoOrders : []);
    const savedMealPlan = readJSON<MealPlan | null>(planKey, user.email === DEMO_EMAIL ? demoMealPlan : null);

    setCart(savedCart);
    setOrders(savedOrders);
    setMealPlan(savedMealPlan);
    setIsReady(true);
  }, [user?.email]);

  useEffect(() => {
    if (!user) return;

    writeJSON(storage.user, user);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    writeJSON(storage.cart(user.email), cart);
  }, [cart, user]);

  useEffect(() => {
    if (!user) return;
    writeJSON(storage.orders(user.email), orders);
  }, [orders, user]);

  useEffect(() => {
    if (!user) return;
    writeJSON(storage.mealPlan(user.email), mealPlan);
  }, [mealPlan, user]);

  useEffect(() => {
    if (!user) return;

    let active = true;
    const history = orders.flatMap((order) => order.items.map((item) => item.name));

    apiClient
      .recommendMeals({ preferences: user.preferences, history, menuItems: allMenuItems })
      .then((data) => {
        if (active && Array.isArray(data)) {
          setRecommendations(data);
        }
      })
      .catch(() => {
        if (active) {
          setRecommendations(
            recommendMeals({ preferences: user.preferences, history, menuItems: allMenuItems }),
          );
        }
      });

    return () => {
      active = false;
    };
  }, [user?.email, user?.preferences.diet, user?.preferences.budget, user?.preferences.cuisines.join("|") , orders]);

  const login = async (payload: LoginPayload) => {
    try {
      const response = await apiClient.login(payload);
      const profile: UserProfile = response.user ?? defaultProfile(payload.email);
      localStorage.setItem(storage.access, response.accessToken ?? createLocalTokens(payload.email).accessToken);
      localStorage.setItem(storage.refresh, response.refreshToken ?? createLocalTokens(payload.email).refreshToken);
      setUser(profile);
      return;
    } catch {
      const tokens = createLocalTokens(payload.email);
      localStorage.setItem(storage.access, tokens.accessToken);
      localStorage.setItem(storage.refresh, tokens.refreshToken);
      const profile = defaultProfile(payload.email);
      setUser(profile);
      writeJSON(storage.user, profile);
    }
  };

  const register = async (payload: RegisterPayload) => {
    try {
      const response = await apiClient.register(payload);
      const profile: UserProfile = response.user ?? createProfileFromRegister(payload);
      localStorage.setItem(storage.access, response.accessToken ?? createLocalTokens(payload.email).accessToken);
      localStorage.setItem(storage.refresh, response.refreshToken ?? createLocalTokens(payload.email).refreshToken);
      setUser(profile);
      return;
    } catch {
      const tokens = createLocalTokens(payload.email);
      localStorage.setItem(storage.access, tokens.accessToken);
      localStorage.setItem(storage.refresh, tokens.refreshToken);
      const profile = createProfileFromRegister(payload);
      setUser(profile);
      writeJSON(storage.user, profile);
    }
  };

  const logout = () => {
    if (user) {
      localStorage.removeItem(storage.cart(user.email));
      localStorage.removeItem(storage.orders(user.email));
      localStorage.removeItem(storage.mealPlan(user.email));
    }

    localStorage.removeItem(storage.user);
    localStorage.removeItem(storage.access);
    localStorage.removeItem(storage.refresh);
    setUser(null);
  };

  const addToCart = (item: MenuItem, restaurant: Restaurant) => {
    setCart((current) => {
      const existing = current.find((entry) => entry.id === item.id && entry.restaurantId === restaurant.id);
      const next = existing
        ? current.map((entry) =>
            entry.id === item.id && entry.restaurantId === restaurant.id
              ? { ...entry, quantity: entry.quantity + 1 }
              : entry,
          )
        : [
            ...current,
            {
              ...item,
              restaurantId: restaurant.id,
              restaurantName: restaurant.name,
              quantity: 1,
            },
          ];

      return next;
    });
  };

  const changeCartQuantity = (itemId: string, quantity: number) => {
    setCart((current) =>
      current
        .map((entry) => (entry.id === itemId ? { ...entry, quantity: Math.max(quantity, 1) } : entry))
        .filter((entry) => entry.quantity > 0),
    );
  };

  const removeFromCart = (itemId: string) => {
    setCart((current) => current.filter((entry) => entry.id !== itemId));
  };

  const placeOrder = async (payment?: { paymentId?: string; paymentStatus?: string; razorpayOrderId?: string }) => {
    if (!user || cart.length === 0) return null;

    const order = buildOrderFromCart(user, cart, payment);

    try {
      const response = await apiClient.placeOrder({ order, payment, cart });
      const savedOrder: Order = response.order ?? order;
      setOrders((current) => [savedOrder, ...current]);
      setCart([]);
      return savedOrder;
    } catch {
      setOrders((current) => [order, ...current]);
      setCart([]);
      return order;
    }
  };

  const generatePlan = async (payload: { budget: number; diet: DietType; cuisines: string[] }) => {
    if (!user) return null;

    const history = orders.flatMap((order) => order.items.map((item) => item.name));

    try {
      const response = await apiClient.generateMealPlan({
        budget: payload.budget,
        preferences: { diet: payload.diet, cuisines: payload.cuisines, budget: payload.budget },
        history,
        menuItems: allMenuItems,
      });

      const serverPlan = response.mealPlan ?? null;
      if (serverPlan) {
        setMealPlan({ ...serverPlan, userId: user.email });
        return serverPlan;
      }
    } catch {
      // Fall back to a local plan so the demo still works without the backend.
    }

    const localPlan = buildMealPlan({
      budget: payload.budget,
      preferences: { diet: payload.diet, cuisines: payload.cuisines, budget: payload.budget },
      history,
      menuItems: allMenuItems,
    });

    setMealPlan({ ...localPlan, userId: user.email });
    return localPlan;
  };

  const refreshRecommendations = async () => {
    if (!user) return;

    const history = orders.flatMap((order) => order.items.map((item) => item.name));

    try {
      const response = await apiClient.recommendMeals({ preferences: user.preferences, history, menuItems: allMenuItems });
      setRecommendations(Array.isArray(response) ? response : recommendMeals({ preferences: user.preferences, history, menuItems: allMenuItems }));
    } catch {
      setRecommendations(recommendMeals({ preferences: user.preferences, history, menuItems: allMenuItems }));
    }
  };

  const saveChatReply = (message: string) => buildChatReply(message);

  return (
    <FoodContext.Provider
      value={{
        user,
        restaurants,
        cart,
        orders,
        mealPlan,
        recommendations,
        isReady,
        login,
        register,
        logout,
        addToCart,
        changeCartQuantity,
        removeFromCart,
        placeOrder,
        generatePlan,
        refreshRecommendations,
        saveChatReply,
      }}
    >
      {children}
    </FoodContext.Provider>
  );
}

export function useFoodApp() {
  const context = useContext(FoodContext);

  if (!context) {
    throw new Error("useFoodApp must be used within AppProvider");
  }

  return context;
}
