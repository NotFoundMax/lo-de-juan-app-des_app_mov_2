import {
  child,
  get,
  push,
  ref,
  remove,
  set,
  update,
} from "firebase/database";
import { rtdb } from "./firebase-rtdb";

export interface Categoria {
  id: string;
  name: string;
  description: string;
  order: number;
  imageUrl?: string;
}

const rootRef = ref(rtdb, "categories");

function snapToArray(snap: any): Categoria[] {
  if (!snap.val()) return [];
  return Object.entries(snap.val()).map(([id, data]) => ({
    id,
    ...(data as Omit<Categoria, "id">),
  }));
}

// Obtiene las categorías ordenadas por orden
export async function getCategorias(): Promise<Categoria[]> {
  const snap = await get(rootRef);
  return snapToArray(snap).sort((a, b) => a.order - b.order);
}

// Obtiene una categoría por id
export async function getCategoria(id: string): Promise<Categoria | null> {
  const snap = await get(child(rootRef, id));
  if (!snap.exists()) return null;
  return { id, ...snap.val() } as Categoria;
}

// Crea una categoría en RTDB
export async function createCategoria(
  data: Omit<Categoria, "id">,
): Promise<string> {
  const newRef = push(rootRef);
  await set(newRef, data);
  return newRef.key!;
}

// Actualiza una categoría en RTDB
export async function updateCategoria(
  id: string,
  data: Partial<Categoria>,
): Promise<void> {
  await update(child(rootRef, id), data);
}

// Elimina una categoría de RTDB
export async function deleteCategoria(id: string): Promise<void> {
  await remove(child(rootRef, id));
}
