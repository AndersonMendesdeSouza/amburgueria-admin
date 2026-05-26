import type { SystemSettingsRequest } from "../dtos/request/system-settings-request.dto";
import type { SystemSettingsResponse } from "../dtos/response/system-settings-response.dto";
import api from "./api";

const API_URL = "/system-settings";

export const SystemSettingsService = {
  findSettings: async (): Promise<SystemSettingsResponse> => {
    const response = await api.get<SystemSettingsResponse>(API_URL);
    return response.data;
  },

  updateSettings: async (
    settings: SystemSettingsRequest,
  ): Promise<SystemSettingsResponse> => {
    const response = await api.put<SystemSettingsResponse>(API_URL, settings);
    return response.data;
  },
};
