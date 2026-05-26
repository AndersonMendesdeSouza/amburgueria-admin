import { OrderStatusEnum } from "../../dtos/enums/orders-status.enum";
import type { OrderResponseDto } from "../../dtos/response/orders-response.dto";
import styles from "./Orders.module.css";
import { FiMoreHorizontal } from "react-icons/fi";
import { OrderCard } from "../../components/OrderCard";
import { useEffect, useState } from "react";
import { OrderService } from "../../service/order.service";

type BoardOrder = {
  id: string;
  number: string;
  customerName: string;
  minutes: number;
  total: number;
  status: OrderStatusEnum;
  items: { name: string; quantity: number }[];
};

type ColumnTone = "yellow" | "blue" | "orange" | "green";

const ORDER_COLUMNS: {
  title: string;
  status: OrderStatusEnum;
  tone: ColumnTone;
}[] = [
  {
    title: "NOVOS",
    status: OrderStatusEnum.RECEIVED,
    tone: "yellow",
  },
  {
    title: "EM PREPARO",
    status: OrderStatusEnum.PREPARING,
    tone: "blue",
  },
  {
    title: "EM ROTA",
    status: OrderStatusEnum.ON_ROUTE,
    tone: "orange",
  },
  {
    title: "ENTREGUES",
    status: OrderStatusEnum.DELIVERED,
    tone: "green",
  },
];

function getMinutesAgo(createdAt: Date | string) {
  const createdAtTime = new Date(createdAt).getTime();
  const diff = Date.now() - createdAtTime;

  if (Number.isNaN(createdAtTime) || diff < 0) {
    return 0;
  }

  return Math.floor(diff / 60000);
}

function getBoardStatus(status: OrderResponseDto["status"]): OrderStatusEnum {
  if (status === "KITCHEN_ACCEPTED" || status === OrderStatusEnum.PREPARING) {
    return OrderStatusEnum.PREPARING;
  }

  if (status === "OUT_FOR_DELIVERY" || status === OrderStatusEnum.ON_ROUTE) {
    return OrderStatusEnum.ON_ROUTE;
  }

  return status as OrderStatusEnum;
}

function mapOrderToBoardOrder(order: OrderResponseDto): BoardOrder {
  return {
    id: order.id,
    number: String(order.code),
    customerName: order.customerName,
    minutes: getMinutesAgo(order.createdAt),
    total: Number(order.total),
    status: getBoardStatus(order.status),
    items: (order.items || []).map((item) => ({
      name: item.name,
      quantity: item.quantity,
    })),
  };
}

function ColumnHeader({
  title,
  count,
  tone,
}: {
  title: string;
  count: number;
  tone: ColumnTone;
}) {
  return (
    <div className={styles.columnHeader}>
      <div className={styles.columnTitle}>
        <span className={`${styles.dot} ${styles[`dot_${tone}`]}`} />
        <span className={styles.columnTitleText}>{title}</span>
        <span className={`${styles.count} ${styles[`count_${tone}`]}`}>
          {String(count).padStart(2, "0")}
        </span>
      </div>

      <button className={styles.kebab} type="button" aria-label="Menu">
        <FiMoreHorizontal />
      </button>
    </div>
  );
}

export function Orders() {
  const [orders, setOrders] = useState<BoardOrder[]>([]);

  useEffect(() => {
    async function loadOrders() {
      const data = await OrderService.findAll();
      setOrders(data.map(mapOrderToBoardOrder));
    }

    loadOrders();
    const intervalId = window.setInterval(loadOrders, 10000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  async function alterStatus(
    id: string,
    status: OrderStatusEnum,
  ): Promise<void> {
    const updatedOrder = await OrderService.alterStatus(id, status);
    const boardOrder = mapOrderToBoardOrder(updatedOrder);

    setOrders((currentOrders) =>
      currentOrders.map((order) => (order.id === id ? boardOrder : order)),
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.board}>
        {ORDER_COLUMNS.map((column) => {
          const columnOrders = orders.filter((o) => o.status === column.status);

          return (
            <section className={styles.column} key={column.status}>
              <ColumnHeader
                title={column.title}
                count={columnOrders.length}
                tone={column.tone}
              />
              <div className={styles.list}>
                {columnOrders.map((o) => (
                  <div
                    key={o.id}
                    className={`${styles.cardWrapper} ${
                      styles[`cardWrapper_${column.tone}`]
                    }`}
                  >
                    <OrderCard
                      navigateTo={`/orders-details/${o.id}`}
                      status={o.status}
                      orderNumber={o.number}
                      customerName={o.customerName}
                      minutesAgo={o.minutes}
                      items={o.items}
                      total={o.total}
                      onAccept={
                        o.status === OrderStatusEnum.DELIVERED
                          ? undefined
                          : () => alterStatus(o.id, o.status)
                      }
                    />
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
