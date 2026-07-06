import { DeliveryMode, Order } from "@/src/services/pedidos-rtdb";

export const STATUS_CONFIG: Record<
  Order["status"],
  { label: string; bg: string; text: string }
> = {
  pending: { label: "Pendiente", bg: "#fff8e1", text: "#e0a003" },
  preparing: { label: "Preparando", bg: "#e3f2fd", text: "#1976d2" },
  ready: { label: "Listo", bg: "#e8f5e9", text: "#43A047" },
  delivered: { label: "Entregado", bg: "#f5f5f5", text: "#9e9e9e" },
  cancelled: { label: "Cancelado", bg: "#ffebee", text: "#f84d3f" },
};

export const PAYMENT_LABELS: Record<string, string> = {
  yape: "Yape",
  tarjeta: "Tarjeta",
};

export const DELIVERY_CONFIG: Record<
  DeliveryMode,
  { icon: string; label: string; tint: string }
> = {
  delivery: { icon: "🛵", label: "Delivery", tint: "#e65100" },
  recoger: { icon: "🏪", label: "Recoger", tint: "#1565c0" },
  mesa: { icon: "🪑", label: "Mesa", tint: "#e65100" },
};

export const DELIVERY_FEE = 5;

// Formato de fecha ISO a locale
export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
