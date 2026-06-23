import styles from "./Dashboard.module.css";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { FiDownload, FiCalendar, FiEye } from "react-icons/fi";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { OrderService } from "../../service/order.service";
import type { OrderResponseDto } from "../../dtos/response/orders-response.dto";
import type { OrderStatusEnum } from "../../dtos/enums/orders-status.enum";
import { formatOrderCode } from "../../utils/formatOrderCode";

type MetricCard = {
  label: string;
  value: string;
  badge: string;
  icon: "money" | "orders" | "ticket" | "top";
  sub?: string;
};

type RecentSale = {
  orderId: string;
  id: string;
  date: string;
  time: string;
  client: { initials: string };
  clientName: string;
  products: string;
  total: string;
  status: OrderStatusEnum;
  statusLabel: string;
  statusTone: "new" | "preparing" | "route" | "done" | "canceled";
};

type CustomTooltipProps = {
  active?: boolean;
  payload?: { value?: number | string }[];
  label?: string;
};

const METRICS: MetricCard[] = [
  { label: "FATURAMENTO TOTAL", value: "R$ 12.450,00", badge: "+12.5%", icon: "money" },
  { label: "NÚMERO DE PEDIDOS", value: "432", badge: "+5.2%", icon: "orders" },
  { label: "TICKET MÉDIO", value: "R$ 28,82", badge: "+2.1%", icon: "ticket" },
  {
    label: "PRODUTO MAIS VENDIDO",
    value: "Bacon Deluxe",
    sub: "85 unidades este mês",
    badge: "Top 1",
    icon: "top",
  },
];

const CHART_DATA = [
  { name: "SEG", value: 48 },
  { name: "TER", value: 64 },
  { name: "QUA", value: 58 },
  { name: "QUI", value: 92 },
  { name: "SEX", value: 24 },
  { name: "SÁB", value: 96 },
  { name: "DOM", value: 86 },
];

function formatDate(date: string | Date): { date: string; time: string } {
  const d = new Date(date);
  const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  
  const formattedDate = `${d.getDate()} ${months[d.getMonth()]}`;
  const formattedTime = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  
  return { date: formattedDate, time: formattedTime };
}

function getInitials(name: string): string {
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
}

function formatMoney(value: string | number): string {
  return Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function getStatusInfo(status: OrderStatusEnum): {
  label: string;
  tone: RecentSale["statusTone"];
} {
  if (status === "RECEIVED") return { label: "NOVO", tone: "new" };
  if (status === "KITCHEN_ACCEPTED" || status === "PREPARING") {
    return { label: "EM PREPARO", tone: "preparing" };
  }
  if (status === "OUT_FOR_DELIVERY" || status === "ON_ROUTE") {
    return { label: "EM ROTA", tone: "route" };
  }
  if (status === "DELIVERED") return { label: "CONCLUÍDO", tone: "done" };
  if (status === "CANCELED") return { label: "CANCELADO", tone: "canceled" };
  return { label: String(status), tone: "new" };
}

function mapOrderToRecentSale(order: OrderResponseDto): RecentSale {
  const { date, time } = formatDate(order.createdAt);
  const statusInfo = getStatusInfo(order.status);
  const productsText = (order.items || [])
    .map(item => `${item.quantity}x ${item.name}`)
    .join(", ");

  return {
    orderId: order.id,
    id: formatOrderCode(order.code),
    date,
    time,
    client: { initials: getInitials(order.customerName) },
    clientName: order.customerName,
    products: productsText || "Sem itens",
    total: formatMoney(order.total),
    status: order.status,
    statusLabel: statusInfo.label,
    statusTone: statusInfo.tone,
  };
}

const RECENT: RecentSale[] = [
  {
    orderId: "88421",
    id: "#88421",
    date: "12 Out",
    time: "19:42",
    client: { initials: "RM" },
    clientName: "Ricardo Mendes",
    products: "1x Bacon Deluxe, 1x Batata M",
    total: "R$ 54,90",
    status: "DELIVERED",
    statusLabel: "CONCLUÍDO",
    statusTone: "done",
  },
  {
    orderId: "88428",
    id: "#88428",
    date: "12 Out",
    time: "19:30",
    client: { initials: "AS" },
    clientName: "Amanda Silva",
    products: "2x Cheese Burger, 2x Coca-Cola",
    total: "R$ 82,00",
    status: "DELIVERED",
    statusLabel: "CONCLUÍDO",
    statusTone: "done",
  },
  {
    orderId: "88419",
    id: "#88419",
    date: "12 Out",
    time: "19:25",
    client: { initials: "JO" },
    clientName: "João Oliveira",
    products: "1x Smash Onion, 1x Suco Natural",
    total: "R$ 42,50",
    status: "CANCELED",
    statusLabel: "CANCELADO",
    statusTone: "canceled",
  },
  {
    orderId: "88418",
    id: "#88418",
    date: "12 Out",
    time: "19:10",
    client: { initials: "CP" },
    clientName: "Carla P.",
    products: "3x Combo Kids",
    total: "R$ 115,00",
    status: "DELIVERED",
    statusLabel: "CONCLUÍDO",
    statusTone: "done",
  },
];

function MetricIcon({ kind }: { kind: MetricCard["icon"] }) {
  if (kind === "money") return <span className={styles.metricIcon}>💰</span>;
  if (kind === "orders") return <span className={styles.metricIcon}>🛒</span>;
  if (kind === "ticket") return <span className={styles.metricIcon}>🎟️</span>;
  return <span className={styles.metricIcon}>🏆</span>;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const value = Number(payload[0]?.value ?? 0);
  return (
    <div className={styles.tooltip}>
      <div className={styles.tooltipTitle}>{label}</div>
      <div className={styles.tooltipValue}>R$ {(value * 13).toFixed(2)}</div>
    </div>
  );
}

export function Dashboard() {
  const [recentSales, setRecentSales] = useState<RecentSale[]>(RECENT);
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;

    async function loadRecentOrders() {
      try {
        const orders = await OrderService.findAll();
        if (!active) return;

        const mapped = [...orders]
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          )
          .map(mapOrderToRecentSale);

        setRecentSales(mapped);
      } catch (error) {
        console.error("Erro ao carregar pedidos recentes:", error);
        setRecentSales(RECENT);
      }
    }

    void loadRecentOrders();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.top}>
        <div>
          <h1 className={styles.title}>Relatórios de Vendas</h1>
          <p className={styles.subtitle}>
            Acompanhe o desempenho comercial da sua hamburgueria em tempo real.
          </p>
        </div>

        <div className={styles.actions}>
          <button className={styles.btnGhost} type="button">
            <FiDownload />
            Exportar CSV
          </button>
          <button className={styles.btnPrimary} type="button">
            <FiDownload />
            Exportar PDF
          </button>
        </div>
      </div>

      <div className={styles.metrics}>
        {METRICS.map((m) => (
          <div key={m.label} className={styles.metricCard}>
            <div className={styles.metricHeader}>
              <MetricIcon kind={m.icon} />
              <span className={styles.metricBadge}>{m.badge}</span>
            </div>

            <div className={styles.metricLabel}>{m.label}</div>

            {m.sub ? (
              <>
                <div className={styles.metricValueSmall}>{m.value}</div>
                <div className={styles.metricSub}>{m.sub}</div>
              </>
            ) : (
              <div className={styles.metricValue}>{m.value}</div>
            )}
          </div>
        ))}
      </div>

      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <div className={styles.panelTitle}>Desempenho de Vendas</div>
            <div className={styles.panelSub}>
              Volume de vendas diário no período selecionado
            </div>
          </div>

          <div className={styles.tabs}>
            <button className={styles.tab} type="button">
              Dia
            </button>
            <button className={`${styles.tab} ${styles.tabActive}`} type="button">
              Semana
            </button>
            <button className={styles.tab} type="button">
              Mês
            </button>
          </div>
        </div>

        <div className={styles.chartWrap}>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={CHART_DATA} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="fillYellow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ffd400" stopOpacity={0.28} />
                  <stop offset="100%" stopColor="#ffd400" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#ffd400"
                strokeWidth={3}
                fill="url(#fillYellow)"
                dot={false}
                activeDot={{ r: 6 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className={styles.tablePanel}>
        <div className={styles.tableHeader}>
          <div className={styles.tableTitle}>Vendas Recentes</div>

          <div className={styles.tableActions}>
            <button className={styles.filterBtn} type="button">
              <FiCalendar />
              01Out - 31Out
            </button>
            <button className={styles.filterBtn} type="button">
              Todos os Status
            </button>
          </div>
        </div>

        <div className={styles.table}>
          <div className={`${styles.row} ${styles.thead}`}>
            <div>ID PEDIDO</div>
            <div>DATA/HORA</div>
            <div>CLIENTE</div>
            <div>PRODUTOS</div>
            <div>VALOR TOTAL</div>
            <div>STATUS</div>
            <div>AÇÕES</div>
          </div>

          {recentSales.map((r) => (
            <div key={r.id} className={styles.row}>
              <div className={styles.idCell}>{r.id}</div>

              <div className={styles.dateCell}>
                <div>{r.date}</div>
                <div className={styles.muted}>{r.time}</div>
              </div>

              <div className={styles.clientCell}>
                <div className={styles.avatar}>{r.client.initials}</div>
                <div className={styles.clientName}>{r.clientName}</div>
              </div>

              <div className={styles.productsCell}>{r.products}</div>

              <div className={styles.totalCell}>{r.total}</div>

              <div>
                <span
                  className={
                    `${styles.statusPill} ${styles[`status_${r.statusTone}`]}`
                  }
                >
                  {r.statusLabel}
                </span>
              </div>

              <div className={styles.actionsCell}>
                <button
                  className={styles.eyeBtn}
                  type="button"
                  aria-label="Ver"
                  onClick={() => navigate(`/orders-details/${r.orderId}`)}
                >
                  <FiEye />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.tableFooter}>
          <div className={styles.muted}>
            Mostrando {recentSales.length} de {recentSales.length} pedidos
            recentes
          </div>

          <div className={styles.pagination}>
            <button className={`${styles.pageBtn} ${styles.pageBtnActive}`} type="button">
              1
            </button>
            <button className={styles.pageBtn} type="button">
              2
            </button>
            <button className={styles.pageBtn} type="button">
              3
            </button>
            <button className={styles.pageBtn} type="button">
              ›
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
