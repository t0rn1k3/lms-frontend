import apiClient from "../apiClient";
import { endpoints } from "../endpoints";

export const moduleService = {
  list: (programId) =>
    programId
      ? apiClient.get(endpoints.modules.listByProgram(programId))
      : apiClient.get(endpoints.modules.list),
  getOne: (id) => apiClient.get(endpoints.modules.getOne(id)),
  create: (data) => apiClient.post(endpoints.modules.create, data),
  update: (id, data) => apiClient.put(endpoints.modules.update(id), data),
  delete: (id) => apiClient.delete(endpoints.modules.delete(id)),
};
