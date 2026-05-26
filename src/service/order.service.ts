import type { OrderStatusEnum } from "../dtos/enums/orders-status.enum";
import type { OrderResponseDto } from "../dtos/response/orders-response.dto";
import api from "./api";

export const OrderService = {
  findAll: async (): Promise<OrderResponseDto[]> => {
    const response = await api.get<OrderResponseDto[]>("/orders/find-all");
    return response.data;
  },

  findById: async (id: string): Promise<OrderResponseDto> => {
    const response = await api.get<OrderResponseDto>(`/orders/${id}`);
    return response.data;
  },

  alterStatus: async (
    id: string,
    status: OrderStatusEnum,
  ): Promise<OrderResponseDto> => {
    const response = await api.patch<OrderResponseDto>(`/orders/${id}`, {
      status,
    });
    return response.data;
  },
};
