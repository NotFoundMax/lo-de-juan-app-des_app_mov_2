import { child, get, ref, update } from "firebase/database";
import { rtdb } from "./firebase-rtdb";

export interface UserAddress {
  label: string;
  address: string;
  lat: number;
  lng: number;
  phone: string;
  notes: string;
  isDefault: boolean;
}

export interface UserProfile {
  name: string;
  email: string;
  role: string;
  addresses: UserAddress[];
  createdAt: string;
}

function userRef(uid: string) {
  return ref(rtdb, `users/${uid}`);
}

// Calcula distancia en metros con fórmula Haversine
function distanceMeters(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6371000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

// Genera la siguiente etiqueta de dirección
function nextLabel(existing: UserAddress[]): string {
  const numbers = existing
    .map((a) => {
      const m = a.label.match(/(\d+)/);
      return m ? parseInt(m[1], 10) : 0;
    })
    .filter((n) => n > 0);
  const max = numbers.length > 0 ? Math.max(...numbers) : 0;
  return `Dirección ${max + 1}`;
}

// Obtiene el perfil del usuario desde RTDB
async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await get(userRef(uid));
  if (!snap.exists()) return null;
  return snap.val() as UserProfile;
}

// Guarda o reemplaza la dirección del usuario
export async function saveUserAddress(
  uid: string,
  address: Omit<UserAddress, "label"> & { label?: string },
): Promise<void> {
  const snap = await get(userRef(uid));
  if (!snap.exists()) return;

  const cleanPhone = (address.phone ?? "").replace(/\D/g, "").slice(0, 9);

  const data = snap.val() as UserProfile;
  const existing: UserAddress[] = data.addresses ?? [];

  const nearExisting = existing.find(
    (a) =>
      distanceMeters(
        { lat: a.lat, lng: a.lng },
        { lat: address.lat, lng: address.lng },
      ) < 50,
  );

  let updated: UserAddress[];

  if (nearExisting) {
    updated = existing.map((a) =>
      a.label === nearExisting.label
        ? {
            ...a,
            address: address.address,
            lat: address.lat,
            lng: address.lng,
            phone: cleanPhone,
            notes: address.notes,
            isDefault: true,
          }
        : { ...a, isDefault: false },
    );
  } else {
    const newLabel = address.label ?? nextLabel(existing);
    updated = existing.map((a) => ({ ...a, isDefault: false }));
    updated.push({
      label: newLabel,
      address: address.address,
      lat: address.lat,
      lng: address.lng,
      phone: cleanPhone,
      notes: address.notes,
      isDefault: true,
    });
  }

  await update(userRef(uid), { addresses: updated });
}

// Obtiene las direcciones guardadas del usuario
export async function getUserAddresses(uid: string): Promise<UserAddress[]> {
  const profile = await getUserProfile(uid);
  return profile?.addresses ?? [];
}

// Renombra una etiqueta de dirección
export async function updateAddressLabel(
  uid: string,
  oldLabel: string,
  newLabel: string,
): Promise<void> {
  const snap = await get(userRef(uid));
  if (!snap.exists()) return;

  const data = snap.val() as UserProfile;
  const addresses: UserAddress[] = data.addresses ?? [];
  const updated = addresses.map((a) =>
    a.label === oldLabel ? { ...a, label: newLabel } : a,
  );
  await update(userRef(uid), { addresses: updated });
}

// Elimina una dirección por etiqueta
export async function deleteAddress(uid: string, label: string): Promise<void> {
  const snap = await get(userRef(uid));
  if (!snap.exists()) return;

  const data = snap.val() as UserProfile;
  const addresses: UserAddress[] = data.addresses ?? [];
  const updated = addresses.filter((a) => a.label !== label);
  await update(userRef(uid), { addresses: updated });
}
