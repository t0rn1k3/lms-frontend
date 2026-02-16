import apiClient from "../apiClient";
import { endpoints } from "../endpoints";

export const adminService = {
  getProfile: () => apiClient.get(endpoints.admins.profile),
  updateProfile: (data) => apiClient.put(endpoints.admins.update, data),
};
