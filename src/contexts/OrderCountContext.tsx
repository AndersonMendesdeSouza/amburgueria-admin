/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { OrderService } from "../service/order.service";
import { OrderStatusEnum } from "../dtos/enums/orders-status.enum";

type OrderCountContextType = {
  totalOrders: number;
  newOrders: number;
  refreshOrderCount: () => Promise<void>;
};

const OrderCountContext = createContext({} as OrderCountContextType);

export function OrderCountProvider({ children }: { children: React.ReactNode }) {
  const [totalOrders, setTotalOrders] = useState(0);
  const [newOrders, setNewOrders] = useState(0);

  const refreshOrderCount = useCallback(async () => {
    try {
      const orders = await OrderService.findAll();
      const newOrdersCount = orders.filter(
        (order) => order.status === OrderStatusEnum.RECEIVED
      ).length;
      setTotalOrders(orders.length);
      setNewOrders(newOrdersCount);
    } catch (error) {
      console.error("Erro ao atualizar contagem de pedidos:", error);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void refreshOrderCount();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [refreshOrderCount]);

  return (
    <OrderCountContext.Provider
      value={{ totalOrders, newOrders, refreshOrderCount }}
    >
      {children}
    </OrderCountContext.Provider>
  );
}

export function useOrderCount() {
  return useContext(OrderCountContext);
}
