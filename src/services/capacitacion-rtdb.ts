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

export type MaterialType = "manual" | "recipe" | "video";

export const MATERIAL_CONFIG: Record<
  MaterialType,
  { icon: string; color: string; label: string }
> = {
  manual: { icon: "📄", color: "#1976d2", label: "Manual" },
  recipe: { icon: "🍳", color: "#e65100", label: "Receta" },
  video: { icon: "🎬", color: "#7b1fa2", label: "Video" },
};

export interface Material {
  id: string;
  title: string;
  description: string;
  type: MaterialType;
  url: string;
  active: boolean;
  createdAt: string;
}

const rootRef = ref(rtdb, "training-materials");

function snapToArray(snap: any): Material[] {
  if (!snap.val()) return [];
  return Object.entries(snap.val()).map(([id, data]) => ({
    id,
    ...(data as Omit<Material, "id">),
  }));
}

// Obtiene todos los materiales de capacitación
export async function getMateriales(): Promise<Material[]> {
  const snap = await get(rootRef);
  return snapToArray(snap).sort(
    (a, b) => b.createdAt?.localeCompare(a.createdAt ?? "") ?? 0,
  );
}

// Obtiene solo los materiales activos
export async function getMaterialesActivos(): Promise<Material[]> {
  const snap = await get(rootRef);
  return snapToArray(snap)
    .filter((m) => m.active)
    .sort((a, b) => b.createdAt?.localeCompare(a.createdAt ?? "") ?? 0);
}

// Obtiene un material por id
export async function getMaterial(id: string): Promise<Material | null> {
  const snap = await get(child(rootRef, id));
  if (!snap.exists()) return null;
  return { id, ...snap.val() } as Material;
}

// Crea un material en RTDB
export async function createMaterial(
  data: Omit<Material, "id">,
): Promise<string> {
  const newRef = push(rootRef);
  await set(newRef, data);
  return newRef.key!;
}

// Actualiza un material en RTDB
export async function updateMaterial(
  id: string,
  data: Partial<Material>,
): Promise<void> {
  await update(child(rootRef, id), data);
}

// Elimina un material de RTDB
export async function deleteMaterial(id: string): Promise<void> {
  await remove(child(rootRef, id));
}
