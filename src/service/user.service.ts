import type { LoginRequestDto } from "../dtos/request/login-request.dto";
import type { LoginResponseDto } from "../dtos/response/login-response.dto";
import api from "./api";

export const UserService = {
  login: async (dto: LoginRequestDto): Promise<LoginResponseDto> => {
    const response = await api.post<LoginResponseDto>(
      "/users/login",
      dto
    );
    return response.data;
  },
};