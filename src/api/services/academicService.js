import apiClient from "../apiClient";
import { endpoints } from "../endpoints";
import { getCachedOrFetch, invalidateCache } from "../../utils/schoolCache";

async function cachedFetcher(path) {
  const res = await apiClient.get(path);
  return res.data?.data ?? res.data;
}

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

  // Class Levels (cached)
  getClassLevels: () =>
    getCachedOrFetch("classLevels", endpoints.classLevels.list, cachedFetcher).then(
      (data) => ({ data: { data } })
    ),
  getClassLevel: (id) => apiClient.get(endpoints.classLevels.getOne(id)),
  createClassLevel: (data) =>
    apiClient.post(endpoints.classLevels.create, data).then((res) => {
      invalidateCache("classLevels");
      return res;
    }),
  updateClassLevel: (id, data) =>
    apiClient.put(endpoints.classLevels.update(id), data).then((res) => {
      invalidateCache("classLevels");
      return res;
    }),
  deleteClassLevel: (id) =>
    apiClient.delete(endpoints.classLevels.delete(id)).then((res) => {
      invalidateCache("classLevels");
      return res;
    }),

  // Programs (cached)
  getPrograms: () =>
    getCachedOrFetch("programs", endpoints.programs.list, cachedFetcher).then(
      (data) => ({ data: { data } })
    ),
  getProgram: (id) => apiClient.get(endpoints.programs.getOne(id)),
  getProgramCurriculum: (id) =>
    apiClient.get(endpoints.programs.getCurriculum(id)),
  downloadProgramCurriculum: async (id, locale) => {
    try {
      const lang = locale?.startsWith("ka") ? "ka" : "en";
      const res = await apiClient.get(endpoints.programs.getCurriculumDownload(id), {
        responseType: "blob",
        params: { locale: lang },
        headers: { "Accept-Language": lang },
      });
      const blob = res.data;
      const disp = res.headers["content-disposition"] || "";
      const quoted = disp.match(/filename="([^"]+)"/)?.[1];
      const filename = quoted ? decodeURIComponent(quoted) : "curriculum.xlsx";
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      if (err.response?.data instanceof Blob) {
        const text = await err.response.data.text();
        let data = {};
        try {
          data = JSON.parse(text);
        } catch (_) {}
        const e = new Error(data?.message || "Download failed");
        e.apiError = { messageKey: data?.messageKey, message: data?.message };
        throw e;
      }
      throw err;
    }
  },
  updateProgramCurriculum: (id, data) =>
    apiClient.put(endpoints.programs.updateCurriculum(id), data).then((res) => {
      invalidateCache("programs");
      return res;
    }),
  deleteProgramCurriculum: (id) =>
    apiClient.delete(endpoints.programs.deleteCurriculum(id)).then((res) => {
      invalidateCache("programs");
      return res;
    }),
  createProgram: (data) =>
    apiClient.post(endpoints.programs.create, data).then((res) => {
      invalidateCache("programs");
      return res;
    }),
  updateProgram: (id, data) =>
    apiClient.put(endpoints.programs.update(id), data).then((res) => {
      invalidateCache("programs");
      return res;
    }),
  deleteProgram: (id) =>
    apiClient.delete(endpoints.programs.delete(id)).then((res) => {
      invalidateCache("programs");
      return res;
    }),

  // Subjects (cached)
  getSubjects: () =>
    getCachedOrFetch("subjects", endpoints.subjects.list, cachedFetcher).then(
      (data) => ({ data: { data } })
    ),
  getSubject: (id) => apiClient.get(endpoints.subjects.getOne(id)),
  createSubject: (programId, data) =>
    apiClient.post(endpoints.subjects.create(programId), data).then((res) => {
      invalidateCache("subjects");
      return res;
    }),
  updateSubject: (id, data) =>
    apiClient.put(endpoints.subjects.update(id), data).then((res) => {
      invalidateCache("subjects");
      return res;
    }),
  deleteSubject: (id) =>
    apiClient.delete(endpoints.subjects.delete(id)).then((res) => {
      invalidateCache("subjects");
      return res;
    }),

  // Year Groups (cached)
  getYearGroups: () =>
    getCachedOrFetch("yearGroups", endpoints.yearGroups.list, cachedFetcher).then(
      (data) => ({ data: { data } })
    ),
  getYearGroup: (id) => apiClient.get(endpoints.yearGroups.getOne(id)),
  createYearGroup: (data) =>
    apiClient.post(endpoints.yearGroups.create, data).then((res) => {
      invalidateCache("yearGroups");
      return res;
    }),
  updateYearGroup: (id, data) =>
    apiClient.put(endpoints.yearGroups.update(id), data).then((res) => {
      invalidateCache("yearGroups");
      return res;
    }),
  deleteYearGroup: (id) =>
    apiClient.delete(endpoints.yearGroups.delete(id)).then((res) => {
      invalidateCache("yearGroups");
      return res;
    }),
};
