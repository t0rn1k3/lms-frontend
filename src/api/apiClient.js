import axios from "axios";
import i18n from "../i18n/config";
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
  // Let browser set Content-Type (with boundary) for FormData - do not use application/json
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }
  return config;
});

// Normalize success response: { status, data, message }
// Skip transformation for Blob (file downloads) - preserve raw response
apiClient.interceptors.response.use(
  (response) => {
    if (response.data instanceof Blob) {
      return response;
    }
    const body = response.data ?? {};
    response.data = {
      status: body.status ?? "success",
      data: body.data ?? body,
      message: body.message ?? "",
    };
    return response;
  },
  (error) => {
    if (error.response?.status === 401 && !error.config?.skip401Redirect) {
      useAuthStore.getState().logout();
      window.location.href = "/login";
    }

    // Normalize error: { status, message, messageKey, statusCode }
    const body = error.response?.data ?? {};
    const message =
      typeof body.message === "string"
        ? body.message
        : error.message || "Something went wrong";

    error.apiError = {
      status: body.status ?? "failed",
      message,
      messageKey: body.messageKey,
      statusCode: error.response?.status,
    };

    return Promise.reject(error);
  },
);

/**
 * Extract error message from axios error.
 * When backend returns messageKey, look up translation for current locale.
 * Falls back to message or generic text when translation is missing.
 */
export const getErrorMessage = (error) => {
  const apiError = error?.apiError ?? error?.response?.data;
  const messageKey = apiError?.messageKey;
  const fallbackMessage =
    apiError?.message ??
    error?.response?.data?.message ??
    error?.message;

  if (messageKey) {
    const translated = i18n.t(`errors.${messageKey}`, { defaultValue: "" });
    if (translated) return translated;
  }

  return fallbackMessage ?? "Something went wrong";
};

export default apiClient;
export { API_BASE_URL };
