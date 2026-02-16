import axios from "axios";
import { useAuthStore } from "../store/useAuthStore";
import { API_BASE_URL } from "./config";

/**
 * Centralized Axios instance for all API calls.
 * - Base URL from config (env)
 * - Token auto-injected from Zustand store
 * - 401 triggers logout + redirect
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Inject auth token into every request
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle responses and errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

/**
 * Extract error message from axios error.
 * Backend returns { message: "..." } or { status, message }.
 */
export const getErrorMessage = (error) => {
  const msg = error.response?.data?.message;
  if (typeof msg === "string") return msg;
  return error.message || "Something went wrong";
};

export default apiClient;
export { API_BASE_URL };
