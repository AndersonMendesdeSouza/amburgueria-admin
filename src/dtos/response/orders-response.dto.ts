import type { OrderItem } from "../../types/Orders-type";
import type { OrderStatusEnum } from "../enums/orders-status.enum";
import type { PaymentMethodEnum } from "../enums/payment-method.enum";

type OrderHistory = {
  status: OrderStatusEnum;
  label: string;
  time?: string;
  createdAt: string;
};

export interface OrderResponseDto {
  id: string;
  code: number;
  status: OrderStatusEnum;
  paymentMethod: PaymentMethodEnum;
  customerName: string;
  customerPhone: string;
  addressStreet: string;
  addressCityState: string;
  addressComplement?: string;
  subtotal: string;
  deliveryFee: string;
  discount: string;
  total: string;
  items: OrderItem[];
  history: OrderHistory[];
  createdAt: Date;
  updatedAt: Date;
}
