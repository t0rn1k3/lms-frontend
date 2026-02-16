import apiClient from "../apiClient";
import { endpoints } from "../endpoints";

/** Questions API for teachers (uses /questions, teacher token). */
export const teacherQuestionService = {
  list: () => apiClient.get(endpoints.questions.list),
  getOne: (id) => apiClient.get(endpoints.questions.getOne(id)),
  create: (examId, data) =>
    apiClient.post(endpoints.questions.create(examId), data),
  update: (id, data) =>
    apiClient.put(endpoints.questions.update(id), data),
};
