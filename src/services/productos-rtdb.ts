import {
  child,
  get,
  off,
  onValue,
  push,
  ref,
  remove,
  runTransaction,
  set,
  update,
} from "firebase/database";
import { rtdb } from "./firebase-rtdb";

export interface Producto {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  imageUrl: string;
  stock: number;
  minStock: number;
  active: boolean;
  createdAt: string;
}

const rootRef = ref(rtdb, "products");

function snapToArray(snap: any): Producto[] {
  if (!snap.val()) return [];
  return Object.entries(snap.val()).map(([id, data]) => ({
    id,
    ...(data as Omit<Producto, "id">),
  }));
}

// Obtiene todos los productos ordenados
export async function getProductos(): Promise<Producto[]> {
  const snap = await get(rootRef);
  return snapToArray(snap).sort(
    (a, b) => b.createdAt?.localeCompare(a.createdAt ?? "") ?? 0,
  );
}

// Obtiene solo los productos activos
export async function getProductosActivos(): Promise<Producto[]> {
  const snap = await get(rootRef);
  return snapToArray(snap)
    .filter((p) => p.active)
    .sort((a, b) => b.createdAt?.localeCompare(a.createdAt ?? "") ?? 0);
}

// Obtiene un producto por id
export async function getProducto(id: string): Promise<Producto | null> {
  const snap = await get(child(rootRef, id));
  if (!snap.exists()) return null;
  return { id, ...snap.val() } as Producto;
}

// Crea un producto en RTDB
export async function createProducto(
  data: Omit<Producto, "id">,
): Promise<string> {
  const newRef = push(rootRef);
  await set(newRef, data);
  return newRef.key!;
}

// Actualiza un producto en RTDB
export async function updateProducto(
  id: string,
  data: Partial<Producto>,
): Promise<void> {
  await update(child(rootRef, id), data);
}

// Elimina un producto de RTDB
export async function deleteProducto(id: string): Promise<void> {
  await remove(child(rootRef, id));
}

// Descuenta el stock del producto
export async function descontarStock(
  id: string,
  quantity: number,
): Promise<void> {
  await runTransaction(child(rootRef, `${id}/stock`), (current) => {
    if (current === null) return 0;
    return (current as number) - quantity;
  });
}
