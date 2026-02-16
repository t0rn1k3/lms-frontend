import apiClient from "../apiClient";
import { endpoints } from "../endpoints";

export const examResultService = {
  // Admin: publish/unpublish
  togglePublish: (id, publish) =>
    apiClient.put(endpoints.examResults.togglePublish(id), { publish }),

  // Student: list and get own results
  list: () => apiClient.get(endpoints.examResults.list),
  getOne: (id) => apiClient.get(endpoints.examResults.getOne(id)),
};
