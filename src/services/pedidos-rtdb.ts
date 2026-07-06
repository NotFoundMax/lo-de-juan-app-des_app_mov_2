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

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  notes?: string;
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
  paidAt: string | null;
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
