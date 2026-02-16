import apiClient from "../apiClient";
import { endpoints } from "../endpoints";

export const studentService = {
  list: () => apiClient.get(endpoints.students.list),
  getOne: (id) => apiClient.get(endpoints.students.getOne(id)),
  update: (id, data) =>
    apiClient.put(endpoints.students.update(id), data),
};
