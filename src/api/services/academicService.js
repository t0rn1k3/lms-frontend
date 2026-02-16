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

  // Academic Terms
  getAcademicTerms: () => apiClient.get(endpoints.academicTerms.list),
  getAcademicTerm: (id) => apiClient.get(endpoints.academicTerms.getOne(id)),
  createAcademicTerm: (data) =>
    apiClient.post(endpoints.academicTerms.create, data),
  updateAcademicTerm: (id, data) =>
    apiClient.put(endpoints.academicTerms.update(id), data),
  deleteAcademicTerm: (id) =>
    apiClient.delete(endpoints.academicTerms.delete(id)),

  // Class Levels
  getClassLevels: () => apiClient.get(endpoints.classLevels.list),
  getClassLevel: (id) => apiClient.get(endpoints.classLevels.getOne(id)),
  createClassLevel: (data) =>
    apiClient.post(endpoints.classLevels.create, data),
  updateClassLevel: (id, data) =>
    apiClient.put(endpoints.classLevels.update(id), data),
  deleteClassLevel: (id) => apiClient.delete(endpoints.classLevels.delete(id)),

  // Programs
  getPrograms: () => apiClient.get(endpoints.programs.list),
  getProgram: (id) => apiClient.get(endpoints.programs.getOne(id)),
  createProgram: (data) => apiClient.post(endpoints.programs.create, data),
  updateProgram: (id, data) =>
    apiClient.put(endpoints.programs.update(id), data),
  deleteProgram: (id) => apiClient.delete(endpoints.programs.delete(id)),
};
