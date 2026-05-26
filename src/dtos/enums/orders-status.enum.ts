export const OrderStatusEnum = {
  RECEIVED : "RECEIVED",
  KITCHEN_ACCEPTED: "KITCHEN_ACCEPTED",
  OUT_FOR_DELIVERY: "OUT_FOR_DELIVERY",
  PREPARING : "PREPARING",
  ON_ROUTE : "ON_ROUTE",
  DELIVERED : "DELIVERED",
  CANCELED : "CANCELED",
} as const;

export type OrderStatusEnum =
  typeof OrderStatusEnum[keyof typeof OrderStatusEnum];
