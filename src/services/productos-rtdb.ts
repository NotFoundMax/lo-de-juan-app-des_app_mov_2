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
  deletedAt?: string;
}

const rootRef = ref(rtdb, "products");

function snapToArray(snap: any): Producto[] {
  if (!snap.val()) return [];
  return Object.entries(snap.val()).map(([id, data]) => ({
    id,
    ...(data as Omit<Producto, "id">),
  }));
}

// Orden alfabético por nombre (case-insensitive)
function sortByName(a: Producto, b: Producto): number {
  return a.name
    .trim()
    .toLowerCase()
    .localeCompare(b.name.trim().toLowerCase());
}

// Obtiene todos los productos ordenados alfabéticamente
export async function getProductos(): Promise<Producto[]> {
  const snap = await get(rootRef);
  return snapToArray(snap).sort(sortByName);
}

// Obtiene solo los productos activos (no eliminados)
export async function getProductosActivos(): Promise<Producto[]> {
  const snap = await get(rootRef);
  return snapToArray(snap)
    .filter((p) => p.active && !p.deletedAt)
    .sort(sortByName);
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

// Elimina un producto (borrado lógico para poder restaurarlo)
export async function deleteProducto(id: string): Promise<void> {
  await update(child(rootRef, id), { deletedAt: new Date().toISOString() });
}

// Restaura un producto eliminado
export async function restoreProducto(id: string): Promise<void> {
  await update(child(rootRef, id), { deletedAt: null });
}

// Elimina un producto de forma definitiva (no se puede restaurar)
export async function deleteProductoPermanente(id: string): Promise<void> {
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

// Suscripción en tiempo real a productos activos
export function subscribeToProductosActivos(
  callback: (productos: Producto[]) => void,
): () => void {
  const unsubscribe = onValue(rootRef, (snap) => {
    const productos = snapToArray(snap)
      .filter((p) => p.active && !p.deletedAt)
      .sort(sortByName);
    callback(productos);
  });
  return () => off(rootRef, "value", unsubscribe);
}

// Suscripción en tiempo real a todos los productos
export function subscribeToProductos(
  callback: (productos: Producto[]) => void,
): () => void {
  const unsubscribe = onValue(rootRef, (snap) => {
    const productos = snapToArray(snap).sort(sortByName);
    callback(productos);
  });
  return () => off(rootRef, "value", unsubscribe);
}

// Verifica si ya existe un producto con el mismo nombre (case-insensitive)
export async function existsByName(
  name: string,
  excludeId?: string,
): Promise<boolean> {
  const normalized = name.trim().toLowerCase();
  const productos = await getProductos();
  return productos.some(
    (p) =>
      p.id !== excludeId && p.name.trim().toLowerCase() === normalized,
  );
}
