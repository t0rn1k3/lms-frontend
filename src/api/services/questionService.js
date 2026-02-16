import apiClient from "../apiClient";
import { endpoints } from "../endpoints";

export const questionService = {
  list: () => apiClient.get(endpoints.admins.questions),
  getOne: (id) => apiClient.get(endpoints.admins.questionsGetOne(id)),
  create: (examId, data) =>
    apiClient.post(endpoints.admins.questionsCreate(examId), data),
  update: (id, data) =>
    apiClient.put(endpoints.admins.questionsUpdate(id), data),
};
