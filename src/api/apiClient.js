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

// Normalize success response: { status, data, message }
apiClient.interceptors.response.use(
  (response) => {
    const body = response.data ?? {};
    response.data = {
      status: body.status ?? "success",
      data: body.data ?? body,
      message: body.message ?? "",
    };
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = "/login";
    }

    // Normalize error: { status, message, statusCode }
    const body = error.response?.data ?? {};
    const message =
      typeof body.message === "string"
        ? body.message
        : error.message || "Something went wrong";

    error.apiError = {
      status: body.status ?? "failed",
      message,
      statusCode: error.response?.status,
    };

    return Promise.reject(error);
  },
);

/**
 * Extract error message from axios error.
 * Use error.apiError for full normalized shape.
 */
export const getErrorMessage = (error) => {
  return (
    error?.apiError?.message ??
    error?.response?.data?.message ??
    error?.message ??
    "Something went wrong"
  );
};

export default apiClient;
export { API_BASE_URL };
