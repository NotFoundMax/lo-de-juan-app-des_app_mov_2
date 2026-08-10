import type { Order, OrderItem } from "@/src/services/pedidos-rtdb";

export type MesaItemStatus = "pending" | "preparing" | "ready" | "served";

// Etiqueta y colores por estado de ítem/ronda en mesa
export const ROUND_STATUS: Record<
  MesaItemStatus,
  { label: string; color: string; bg: string }
> = {
  pending: { label: "Pedido", color: "#616161", bg: "#eeeeee" },
  preparing: { label: "Preparando", color: "#1976d2", bg: "#e3f2fd" },
  ready: { label: "Listo", color: "#43A047", bg: "#e8f5e9" },
  served: { label: "Servido", color: "#805140", bg: "#f5f5f5" },
};

export interface RoundGroup {
  round: number;
  status: MesaItemStatus;
  items: OrderItem[];
}

// Agrupa los ítems de un pedido por ronda, ordenadas de menor a mayor
export function groupByRound(items: OrderItem[]): RoundGroup[] {
  const map = new Map<number, OrderItem[]>();
  for (const item of items) {
    const r = item.round ?? 1;
    map.set(r, [...(map.get(r) ?? []), item]);
  }
  return [...map.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([round, list]) => ({
      round,
      status: (list[0].status ?? "pending") as MesaItemStatus,
      items: list,
    }));
}

// True si los ítems del pedido ya llevan estado propio (pedidos nuevos)
export function hasItemStatus(items: OrderItem[]): boolean {
  return items.some((i) => !!i.status);
}

// Monto ya cobrado del pedido (legacy: si pagó sin paidAmount, se da por pagado)
export function paidAmountOf(order: {
  total: number;
  paidAmount?: number;
  paidAt?: string | null;
}): number {
  return order.paidAmount ?? (order.paidAt ? order.total : 0);
}

// Saldo pendiente de cobrar
export function outstandingOf(order: {
  total: number;
  paidAmount?: number;
  paidAt?: string | null;
}): number {
  return Math.max(0, order.total - paidAmountOf(order));
}

// True si la mesa está ocupada: hay un pedido POS de mesa activo (no cancelado
// ni liberado) con ese número de mesa
export function isMesaOcupada(
  orders: Order[],
  tableNumber: string,
): boolean {
  return orders.some(
    (o) =>
      o.type === "pos" &&
      o.deliveryMode === "mesa" &&
      o.tableNumber === tableNumber &&
      o.status !== "cancelled" &&
      !o.releasedAt,
  );
}
