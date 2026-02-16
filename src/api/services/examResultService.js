import apiClient from "../apiClient";
import { endpoints } from "../endpoints";

export const examResultService = {
  togglePublish: (id, publish) =>
    apiClient.put(endpoints.examResults.togglePublish(id), { publish }),
};
