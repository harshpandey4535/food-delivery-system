import axios from "axios";
import { LoginPayload, MealPlanRequest, PaymentVerificationPayload, RegisterPayload, RecommendationRequest, RazorpayOrderResponse } from "../types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

function getAccessToken() {
  return localStorage.getItem("meallane-access-token");
}

function getRefreshToken() {
  return localStorage.getItem("meallane-refresh-token");
}

async function refreshAccessToken() {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    throw new Error("Missing refresh token");
  }

  const { data } = await api.post("/refresh-token", { refreshToken });
  localStorage.setItem("meallane-access-token", data.accessToken);
  localStorage.setItem("meallane-refresh-token", data.refreshToken);
  return data.accessToken as string;
}

api.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;

      try {
        const newToken = await refreshAccessToken();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem("meallane-access-token");
        localStorage.removeItem("meallane-refresh-token");
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export const apiClient = {
  login: async (payload: LoginPayload) => api.post("/login", payload).then((response) => response.data),
  register: async (payload: RegisterPayload) => api.post("/register", payload).then((response) => response.data),
  getRestaurants: async () => api.get("/restaurants").then((response) => response.data),
  getMenu: async (restaurantId: string) => api.get(`/menu/${restaurantId}`).then((response) => response.data),
  addToCart: async (payload: unknown) => api.post("/cart", payload).then((response) => response.data),
  placeOrder: async (payload: unknown) => api.post("/order", payload).then((response) => response.data),
  getOrders: async () => api.get("/orders").then((response) => response.data),
  generateMealPlan: async (payload: MealPlanRequest) => api.post("/meal-plan", payload).then((response) => response.data),
  recommendMeals: async (payload: RecommendationRequest) => api.post("/recommend", payload).then((response) => response.data),
  createRazorpayOrder: async (amount: number) => api.post("/payment/create-order", { amount }).then((response) => response.data as RazorpayOrderResponse),
  verifyPayment: async (payload: PaymentVerificationPayload) => api.post("/payment/verify", payload).then((response) => response.data),
  refreshToken: async () => refreshAccessToken(),
};
