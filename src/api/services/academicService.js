import apiClient from "../apiClient";
import { endpoints } from "../endpoints";

export const academicService = {
  // Academic Years
  getAcademicYears: () => apiClient.get(endpoints.academicYears.list),
  getAcademicYear: (id) => apiClient.get(endpoints.academicYears.getOne(id)),
  createAcademicYear: (data) =>
    apiClient.post(endpoints.academicYears.create, data),
  updateAcademicYear: (id, data) =>
    apiClient.put(endpoints.academicYears.update(id), data),
  deleteAcademicYear: (id) =>
    apiClient.delete(endpoints.academicYears.delete(id)),
};
