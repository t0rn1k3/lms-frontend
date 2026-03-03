import apiClient from "../apiClient";
import { endpoints } from "../endpoints";

export const moduleService = {
  list: (params = {}) => {
    const { program, teacher } = params;
    if (program) {
      return apiClient.get(endpoints.modules.listByProgram(program));
    }
    if (teacher) {
      return apiClient.get(endpoints.modules.listByTeacher(teacher));
    }
    return apiClient.get(endpoints.modules.list);
  },
  getOne: (id) => apiClient.get(endpoints.modules.getOne(id)),
  create: (data) => apiClient.post(endpoints.modules.create, data),
  update: (id, data) => apiClient.put(endpoints.modules.update(id), data),
  delete: (id) => apiClient.delete(endpoints.modules.delete(id)),
};
