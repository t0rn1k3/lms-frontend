import apiClient from "../apiClient";
import { endpoints } from "../endpoints";

/**
 * Auth API calls.
 * Usage: import { authService } from "../api/services/authService";
 */

export const authService = {
  // Admin
  adminLogin: (email, password) =>
    apiClient.post(endpoints.admins.login, { email, password }),

  adminRegister: (name, email, password) =>
    apiClient.post(endpoints.admins.register, { name, email, password }),

  // Teacher
  teacherLogin: (email, password) =>
    apiClient.post(endpoints.teachers.login, { email, password }),

  teacherRegister: (name, email, password) =>
    apiClient.post(endpoints.teachers.register, { name, email, password }),

  // Student
  studentLogin: (email, password) =>
    apiClient.post(endpoints.students.login, { email, password }),

  studentRegister: (name, email, password) =>
    apiClient.post(endpoints.students.register, { name, email, password }),
};
