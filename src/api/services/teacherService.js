import apiClient from "../apiClient";
import { endpoints } from "../endpoints";

export const teacherService = {
  // Admin: list teachers
  list: (params = {}) => {
    const searchParams = new URLSearchParams();
    if (params.page != null) searchParams.set("page", params.page);
    if (params.limit != null) searchParams.set("limit", params.limit);
    if (params.name) searchParams.set("name", params.name);
    const query = searchParams.toString();
    const url = query
      ? `${endpoints.teachers.list}?${query}`
      : endpoints.teachers.list;
    return apiClient.get(url);
  },
  getOne: (id) => apiClient.get(endpoints.teachers.getOne(id)),
  update: (id, data) => apiClient.put(endpoints.teachers.update(id), data),

  // Teacher: own profile
  getProfile: () => apiClient.get(endpoints.teachers.profile),
  updateProfile: (data) =>
    apiClient.put(endpoints.teachers.profileUpdate, data),
};
