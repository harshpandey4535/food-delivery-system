export type DietType = "veg" | "non-veg" | "vegan" | "any";

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  calories: number;
  category: string;
  veg: boolean;
  description: string;
  tags: string[];
}

export interface Restaurant {
  id: string;
  name: string;
  location: string;
  cuisine: string;
  rating: number;
  deliveryTime: string;
  tags: string[];
  menu: MenuItem[];
}

export interface CartItem extends MenuItem {
  restaurantId: string;
  restaurantName: string;
  quantity: number;
}

export interface OrderItem extends CartItem {}

export interface Order {
  id: string;
  userId: string;
  restaurantId: string;
  restaurantName: string;
  items: OrderItem[];
  totalPrice: number;
  status: "Placed" | "Paid" | "Preparing" | "Delivered" | "Cancelled";
  createdAt: string;
  paymentId?: string;
  paymentStatus?: string;
}

export interface MealPlanDay {
  day: string;
  breakfast: MenuItem;
  lunch: MenuItem;
  dinner: MenuItem;
  totalCalories: number;
  totalCost: number;
}

export interface MealPlan {
  id: string;
  userId: string;
  budget: number;
  preferences: string[];
  weeklyPlan: MealPlanDay[];
  totalCalories: number;
  totalCost: number;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  preferences: {
    diet: DietType;
    cuisines: string[];
    budget: number;
  };
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  diet: DietType;
  cuisines: string[];
  budget: number;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RecommendationRequest {
  preferences: {
    diet: DietType;
    cuisines: string[];
    budget: number;
  };
  history: string[];
  menuItems: MenuItem[];
}

export interface MealPlanRequest {
  budget: number;
  preferences: {
    diet: DietType;
    cuisines: string[];
    budget: number;
  };
  history: string[];
  menuItems: MenuItem[];
}

export interface RazorpayOrderResponse {
  id: string;
  amount: number;
  currency: string;
}

export interface PaymentVerificationPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

declare global {
  interface Window {
    Razorpay?: new (options: unknown) => { open: () => void };
  }
}
