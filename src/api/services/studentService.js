import apiClient from "../apiClient";
import { endpoints } from "../endpoints";

export const studentService = {
  // Admin: list/update students
  list: () => apiClient.get(endpoints.students.list),
  getOne: (id) => apiClient.get(endpoints.students.getOne(id)),
  update: (id, data) => apiClient.put(endpoints.students.update(id), data),
  withdraw: (id) => apiClient.put(endpoints.students.withdraw(id)),

  // Student: own profile
  getProfile: () => apiClient.get(endpoints.students.profile),
  updateProfile: (data) =>
    apiClient.put(endpoints.students.profileUpdate, data),

  // Student: exams
  getExams: () => apiClient.get(endpoints.students.examsList),
  getExam: (examId) => apiClient.get(endpoints.students.getExam(examId)),
  writeExam: (examId, data) =>
    apiClient.post(endpoints.students.writeExam(examId), data),
};
