import {
    child,
    get,
    off,
    onValue,
    push,
    ref,
    set,
    update,
} from "firebase/database";
import { rtdb } from "./firebase-rtdb";

// Estado de cada ítem/ronda dentro de un pedido de mesa
export type OrderItemStatus = "pending" | "preparing" | "ready" | "served";

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  notes?: string;
  // Ronda del ítem en mesa: 1 = pedido original, 2+ = adicionales
  round?: number;
  // Estado de preparación del ítem (avanza junto con el pedido de mesa)
  status?: OrderItemStatus;
}

export type PaymentMethod = "efectivo" | "yape" | "tarjeta";

export type DeliveryMode = "recoger" | "delivery" | "mesa";

export interface Order {
  id: string;
  customerId: string | null;
  customerName: string;
  items: OrderItem[];
  total: number;
  status: "pending" | "preparing" | "ready" | "delivered" | "cancelled";
  type: "pos" | "online";
  paymentMethod: PaymentMethod;
  deliveryMode: DeliveryMode;
  ticketNumber?: string;
  sucursalId?: string;
  deliveryAddress?: string;
  deliveryLat?: number;
  deliveryLng?: number;
  deliveryPhone?: string;
  deliveryNotes?: string;
  tableNumber?: string;
  // Estado del pago: "pending" (yape esperando confirmación) o "confirmed"
  paymentStatus?: "pending" | "confirmed";
  // Nombre del pagador cuando el pago es con Yape
  yapePayerName?: string;
  // Momento en que se sirvió el pedido en mesa
  servedAt?: string;
  paidAt?: string | null;
  // Momento en que se liberó la mesa (deja de estar ocupada y sale de mesas activas)
  releasedAt?: string;
  // Monto acumulado ya cobrado de la mesa (el saldo pendiente es total - paidAmount)
  paidAmount?: number;
  readyAt?: string;
  createdAt: string;
}

const rootRef = ref(rtdb, "orders");

function snapToArray(snap: any): Order[] {
  if (!snap.val()) return [];
  return Object.entries(snap.val()).map(([id, data]) => ({
    id,
    ...(data as Omit<Order, "id">),
  }));
}

function generateTicket(): string {
  const time = Date.now().toString(16).slice(-4).toUpperCase();
  const rand = Math.random().toString(16).substring(2, 4).toUpperCase();
  return `${time}${rand}`;
}

// Elimina las claves con valor undefined del objeto
function stripUndefined(obj: Record<string, any>): Record<string, any> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined),
  );
}

// Obtiene todos los pedidos en orden descendente
export async function getOrders(): Promise<Order[]> {
  const snap = await get(rootRef);
  return snapToArray(snap).sort(
    (a, b) => b.createdAt?.localeCompare(a.createdAt ?? "") ?? 0,
  );
}

// Obtiene los pedidos de un cliente por id
export async function getOrdersByCustomerId(
  customerId: string,
): Promise<Order[]> {
  const snap = await get(rootRef);
  return snapToArray(snap)
    .filter((o) => o.customerId === customerId)
    .sort((a, b) => b.createdAt?.localeCompare(a.createdAt ?? "") ?? 0);
}

// Crea un pedido con número de ticket
export async function createOrder(data: Omit<Order, "id">): Promise<string> {
  const clean = stripUndefined(data as Record<string, any>);
  if (clean.deliveryPhone) {
    clean.deliveryPhone = (clean.deliveryPhone as string)
      .replace(/\D/g, "")
      .slice(0, 9);
  }
  clean.ticketNumber = generateTicket();
  const newRef = push(rootRef);
  await set(newRef, clean);
  return newRef.key!;
}

// Actualiza un pedido en RTDB
export async function updateOrder(
  id: string,
  data: Partial<Order>,
): Promise<void> {
  await update(child(rootRef, id), data);
}

// Agrega ítems a un pedido existente como nueva ronda.
// Los ítems nuevos quedan en "pending" y, si la orden ya estaba lista o servida,
// vuelve a "pending" para que la nueva ronda pase por cocina de nuevo.
export async function addItemsToOrder(
  orderId: string,
  items: Omit<OrderItem, "round" | "status">[],
  extraTotal: number,
): Promise<void> {
  const snap = await get(child(rootRef, orderId));
  if (!snap.exists()) throw new Error("Pedido no encontrado");
  const order = snap.val() as Omit<Order, "id">;
  const currentItems: OrderItem[] = order.items ?? [];
  const nextRound =
    currentItems.reduce((max, i) => Math.max(max, i.round ?? 1), 0) + 1;
  const rounded = items.map((i) => ({
    ...i,
    round: nextRound,
    status: "pending" as const,
  }));
  const wasDone =
    order.status === "ready" || order.status === "delivered" || !!order.servedAt;
  const patch: Record<string, any> = {
    items: [...currentItems, ...rounded],
    total: (order.total ?? 0) + extraTotal,
  };
  if (wasDone) patch.status = "pending";
  await update(child(rootRef, orderId), patch);
}

// Avanza el estado de preparación de un pedido de mesa junto con sus ítems:
// pending -> preparing -> ready -> served (los ítems de la ronda actual cambian juntos).
export async function advanceMesaOrder(
  orderId: string,
  transition: "preparing" | "ready" | "served",
): Promise<void> {
  const snap = await get(child(rootRef, orderId));
  if (!snap.exists()) throw new Error("Pedido no encontrado");
  const order = snap.val() as Omit<Order, "id">;
  const from: Record<string, OrderItemStatus> = {
    preparing: "pending",
    ready: "preparing",
    served: "ready",
  };
  const src = from[transition];
  const items = (order.items ?? []).map((it) =>
    src && (it.status ?? "pending") === src
      ? { ...it, status: transition }
      : it,
  );
  const patch: Record<string, any> = { items };
  if (transition === "served") {
    patch.servedAt = new Date().toISOString();
  } else {
    patch.status = transition;
    if (transition === "ready") patch.readyAt = new Date().toISOString();
  }
  await update(child(rootRef, orderId), patch);
}

// Suscripción en tiempo real a todos los pedidos
export function subscribeToOrders(
  callback: (orders: Order[]) => void,
): () => void {
  const unsubscribe = onValue(rootRef, (snap) => {
    callback(
      snapToArray(snap).sort(
        (a, b) => b.createdAt?.localeCompare(a.createdAt ?? "") ?? 0,
      ),
    );
  });
  return () => off(rootRef, "value", unsubscribe);
}

// Suscripción en tiempo real a los pedidos de un cliente
export function subscribeToOrdersByCustomer(
  customerId: string,
  callback: (orders: Order[]) => void,
): () => void {
  const unsubscribe = onValue(rootRef, (snap) => {
    callback(
      snapToArray(snap)
        .filter((o) => o.customerId === customerId)
        .sort((a, b) => b.createdAt?.localeCompare(a.createdAt ?? "") ?? 0),
    );
  });
  return () => off(rootRef, "value", unsubscribe);
}

// Suscripción en tiempo real a un pedido por su id
export function subscribeToOrderById(
  orderId: string,
  callback: (order: Order | null) => void,
): () => void {
  const unsubscribe = onValue(child(rootRef, orderId), (snap) => {
    if (!snap.exists()) {
      callback(null);
      return;
    }
    callback({ id: orderId, ...(snap.val() as Omit<Order, "id">) });
  });
  return () => off(child(rootRef, orderId), "value", unsubscribe);
}
