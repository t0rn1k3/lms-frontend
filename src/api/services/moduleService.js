import apiClient from "../apiClient";
import { endpoints } from "../endpoints";
import { getCachedOrFetch, invalidateCache } from "../../utils/schoolCache";

async function cachedFetcher(path) {
  const res = await apiClient.get(path);
  return res.data?.data ?? res.data;
}

export const moduleService = {
  list: (params = {}) => {
    const { program, teacher } = params;
    if (program) {
      return apiClient.get(endpoints.modules.listByProgram(program));
    }
    if (teacher) {
      return apiClient.get(endpoints.modules.listByTeacher(teacher));
    }
    // Full list: use cache
    return getCachedOrFetch("modules", endpoints.modules.list, cachedFetcher).then(
      (data) => ({ data: { data } })
    );
  },
  getOne: (id) => apiClient.get(endpoints.modules.getOne(id)),
  create: (data) =>
    apiClient.post(endpoints.modules.create, data).then((res) => {
      invalidateCache("modules");
      return res;
    }),
  update: (id, data) =>
    apiClient.put(endpoints.modules.update(id), data).then((res) => {
      invalidateCache("modules");
      return res;
    }),
  delete: (id) =>
    apiClient.delete(endpoints.modules.delete(id)).then((res) => {
      invalidateCache("modules");
      return res;
    }),
};
