import apiClient from "../apiClient";
import { endpoints } from "../endpoints";

export const adminService = {
  getProfile: () => apiClient.get(endpoints.admins.profile),
  updateProfile: (data) => apiClient.put(endpoints.admins.update, data),
  getExamResults: () => apiClient.get(endpoints.admins.examResults),
  getExams: () => apiClient.get(endpoints.admins.exams),
  getExam: (id) => apiClient.get(endpoints.admins.examsGetOne(id)),
};
