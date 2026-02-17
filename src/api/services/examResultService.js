import apiClient from "../apiClient";
import { endpoints } from "../endpoints";

export const examResultService = {
  // Admin: publish/unpublish
  togglePublish: (id, publish) =>
    apiClient.put(endpoints.examResults.togglePublish(id), { publish }),

  // Student: list and get own results (backend returns only published)
  list: () => apiClient.get(endpoints.examResults.list),
  getOne: (id) => apiClient.get(endpoints.examResults.getOne(id)),

  // Teacher: list, view, grade, publish exam results for their exams
  teacherList: () => apiClient.get(endpoints.examResults.teacherList),
  teacherGetOne: (id) => apiClient.get(endpoints.examResults.teacherGetOne(id)),
  teacherGrade: (id, gradedAnswers) =>
    apiClient.put(endpoints.examResults.teacherGrade(id), { gradedAnswers }),
  teacherPublish: (id) =>
    apiClient.put(endpoints.examResults.teacherPublish(id)),
};
