import apiClient from "../apiClient";
import { endpoints } from "../endpoints";

export const examService = {
  list: () => apiClient.get(endpoints.exams.list),
  getOne: (id) => apiClient.get(endpoints.exams.getOne(id)),
  create: (data) => apiClient.post(endpoints.exams.create, data),
  update: (id, data) => apiClient.put(endpoints.exams.update(id), data),
};
