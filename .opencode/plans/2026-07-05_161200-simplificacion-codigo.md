# Plan de Simplificación de Código — Lo de Juan

> **Para implementar:** Usar tareas individuales, una por una, en orden.

**Goal:** Reducir deuda técnica: componentes gigantes → atómicos, emojis → Ionicons, patrones repetidos → hooks, estilos inline → NativeWind, types sueltos → tipados.

**Arquitectura:** Extracción gradual: primero el bug crítico, luego los 2 archivos monstruo (pedidosAdmin, DeliveryModal), después emojis/hooks/estilos, finalmente limpieza fina. Cada tarea es independiente y verificable con `npx tsc --noEmit`.

**Files totales a tocar:** ~25 archivos entre crear, modificar y eliminar.

---

## Orden de ejecución

1. Bug crítico (runtime error)
2. Archivos monstruo (partir en componentes)
3. Emojis → Ionicons
4. Patrones duplicados → hooks compartidos
5. Estilos inline → NativeWind
6. Tipar `any` sueltos
7. Limpieza final (comentarios, imports)

---

### Task 1: Arreglar bug `catch (e)` en pago-yape.tsx

**Objective:** El catch sin parámetro referencia `e` que no existe — lanza ReferenceError en runtime.

**Files:**
- Modify: `app/pago-yape.tsx:51-54`

**Cambio:**

```
// ANTES:
} catch {
  if (e?.message?.includes("User did not share")) return;
  console.error("Error guardando QR:", e);
}

// DESPUÉS:
} catch (e: any) {
  if (e?.message?.includes("User did not share")) return;
  console.error("Error guardando QR:", e);
}
```

**Verificación:** `npx tsc --noEmit` — el error `Cannot find name 'e'` desaparece.

---

### Task 2: Partir `pedidosAdmin.tsx` (706 líneas → ~6 archivos)

**Objective:** El archivo más grande del proyecto. Contiene 3 componentes + 3 helpers todo junto.

**Files:**
- Create: `src/components/orders/AdminOrderCard.tsx`
- Create: `src/components/orders/ComandaCard.tsx`
- Create: `src/components/orders/useElapsed.ts`
- Create: `src/components/orders/OrderSeparator.tsx`
- Create: `src/components/orders/StatusStamp.tsx`
- Create: `src/components/orders/FilterTab.tsx`
- Modify: `app/(todos)/pedidosAdmin.tsx` (importar todo, dejar solo el screen)

**Tarea 2a: Extraer `StatusStamp`**

El badge circular de estado que muestra el ícono + tiempo transcurrido.

```tsx
// src/components/orders/StatusStamp.tsx
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const STATUS_ICONS: Record<string, { icon: keyof typeof Ionicons.glyphMap; color: string }> = {
  pending: { icon: "time-outline", color: "#f59e0b" },
  preparing: { icon: "flame-outline", color: "#f84d3f" },
  ready: { icon: "checkmark-circle-outline", color: "#22c55e" },
  delivered: { icon: "bag-check-outline", color: "#3b82f6" },
  cancelled: { icon: "close-circle-outline", color: "#6b7280" },
};

export default function StatusStamp({ status, time }: { status: string; time: string }) {
  const cfg = STATUS_ICONS[status] ?? { icon: "help-outline", color: "#9ca3af" };
  return (
    <View className="items-center">
      <Ionicons name={cfg.icon as any} size={28} color={cfg.color} />
      <Text className="text-tiny text-text-muted mt-1">{time}</Text>
    </View>
  );
}
```

**Tarea 2b: Extraer `OrderSeparator`**

```tsx
// src/components/orders/OrderSeparator.tsx
import { View, Text } from "react-native";

export default function OrderSeparator({ label }: { label: string }) {
  return (
    <View className="flex-row items-center px-4 py-2 bg-gray-100">
      <View className="flex-1 h-px bg-gray-300" />
      <Text className="mx-3 text-small text-text-muted font-semibold">{label}</Text>
      <View className="flex-1 h-px bg-gray-300" />
    </View>
  );
}
```

**Tarea 2c: Extraer `useElapsed` hook**

```tsx
// src/components/orders/useElapsed.ts
import { useState, useEffect } from "react";

export function useElapsed(createdAt: string) {
  const [elapsed, setElapsed] = useState("");

  useEffect(() => {
    const update = () => {
      const diff = Date.now() - new Date(createdAt).getTime();
      const min = Math.floor(diff / 60000);
      if (min < 1) setElapsed("ahora");
      else if (min < 60) setElapsed(`hace ${min} min`);
      else setElapsed(`hace ${Math.floor(min / 60)}h ${min % 60}m`);
    };
    update();
    const id = setInterval(update, 30000);
    return () => clearInterval(id);
  }, [createdAt]);

  return elapsed;
}
```

**Tarea 2d: Extraer `AdminOrderCard`**

El card principal de la lista de pedidos en vista admin. Recibe `order`, `onStatusChange`, `elapsed`. Tiene los botones de cambiar estado, la info del pedido, y llama a `StatusStamp`.

Mover el código del renderItem de la lista admin (líneas ~180-330 actuales).

**Tarea 2e: Extraer `ComandaCard`**

El card grande tipo comanda/cocina. Migrar todos sus `style={{}}` a NativeWind className. Actualmente ~50 estilos inline entre líneas 349-480.

**Tarea 2f: Extraer `FilterTab`**

```tsx
// src/components/orders/FilterTab.tsx
import { TouchableOpacity, Text } from "react-native";

export default function FilterTab({
  label, count, isActive, onPress,
}: {
  label: string; count: number; isActive: boolean; onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="mr-2 px-4 py-2 rounded-full"
      style={{ backgroundColor: isActive ? "#f84d3f" : "#f5f5f5" }}
    >
      <Text style={{ color: isActive ? "#fff" : "#333", fontWeight: "600" }}>
        {label} ({count})
      </Text>
    </TouchableOpacity>
  );
}
```

**Tarea 2g: Extraer IIFE `MiniStepper`**

La IIFE de las líneas ~119 actuales va a su propio componente:

```tsx
// src/components/orders/MiniStepper.tsx (crear)
export default function MiniStepper({ currentIdx, miniSteps }: {
  currentIdx: number; miniSteps: string[];
}) {
  return (
    <View className="flex-row items-center gap-1">
      {miniSteps.map((step, i) => (
        <React.Fragment key={i}>
          {i > 0 && <View className="w-4 h-px bg-gray-300" />}
          <View className={`w-3 h-3 rounded-full ${i <= currentIdx ? "bg-primary" : "bg-gray-300"}`} />
        </React.Fragment>
      ))}
    </View>
  );
}
```

**Tarea 2h: Limpiar `pedidosAdmin.tsx`**

Importar todos los componentes extraídos. Dejar solo el screen con los imports y la lógica de orquestación.

**Verificación:** `npx tsc --noEmit` sin errores nuevos. La app funciona igual.

---

### Task 3: Partir `DeliveryModal.tsx` (531 líneas → ~5 archivos)

**Objective:** El segundo archivo más grande. 4 sub-componentes + el modal orquestador.

**Files:**
- Create: `src/components/delivery/StepChoose.tsx`
- Create: `src/components/delivery/StepRecoger.tsx`
- Create: `src/components/delivery/SucursalCard.tsx`
- Create: `src/components/delivery/StepDelivery.tsx`
- Modify: `src/components/DeliveryModal.tsx` (importar todo, dejar solo orquestador)

**Tarea 3a: Extraer `SucursalCard`**

```tsx
// src/components/delivery/SucursalCard.tsx
import { TouchableOpacity, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Sucursal {
  id: string; name: string; address: string; hours: string; phone: string;
}

export default function SucursalCard({
  sucursal, selected, onSelect,
}: {
  sucursal: Sucursal; selected: boolean; onSelect: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onSelect}
      className={`p-4 mb-3 rounded-xl border ${selected ? "border-primary bg-primary/5" : "border-gray-200"}`}
    >
      <Text className="text-subtitle font-bold">{sucursal.name}</Text>
      <View className="flex-row items-center mt-1 gap-1">
        <Ionicons name="location-outline" size={14} color="#6b7280" />
        <Text className="text-small text-text-muted flex-1">{sucursal.address}</Text>
      </View>
      <View className="flex-row items-center mt-1 gap-1">
        <Ionicons name="time-outline" size={14} color="#6b7280" />
        <Text className="text-small text-text-muted">{sucursal.hours}</Text>
      </View>
      <View className="flex-row items-center mt-1 gap-1">
        <Ionicons name="call-outline" size={14} color="#6b7280" />
        <Text className="text-small text-text-muted">{sucursal.phone}</Text>
      </View>
    </TouchableOpacity>
  );
}
```

**Tarea 3b: Extraer `StepChoose`**

Opción de recoger vs delivery. Dos botones grandes con iconos Ionicons.

**Tarea 3c: Extraer `StepRecoger`**

Lista de sucursales con `SucursalCard`.

**Tarea 3d: Extraer `StepDelivery`**

Formulario de dirección con mapa.

**Tarea 3e: Limpiar `DeliveryModal.tsx`**

Importar los 4 componentes. Usarlos en el switch de pasos.

**Verificación:** `npx tsc --noEmit` sin errores.

---

### Task 4: Reemplazar emojis → Ionicons (~30 ocurrencias)

**Objective:** Todos los emojis-icono del proyecto pasan a `@expo/vector-icons` (Ionicons).

**Files a modificar** (en orden de prioridad):
- `app/(tabs)/login.tsx` — 🍗 → `fast-food-outline`
- `app/(tabs)/index.tsx` — 🍗 🛒
- `app/(tabs)/pos.tsx` — 📦 → `cube-outline`
- `app/(tabs)/capacitacion.tsx` — 📚 → `book-outline`
- `app/(tabs)/pedidosCustomer.tsx` — 📍 🏪 🪑 📋
- `app/(tabs)/admin/index.tsx` — 🍗 📂 👥 📋 💰 📚 🌱
- `app/carrito.tsx` — 📱 💳 🏪 🛵 🛒
- `app/pago-yape.tsx` — (verificar)
- `src/components/DeliveryModal.tsx` — 🏪 🛵 📍 🕐 📞 📝 → componentes extraídos
- `src/components/MapWebView.tsx` — 📍 → `location-outline`
- `src/components/pos/CartPanel.tsx` — 🛒 → `cart-outline`
- `src/components/pos/ProductCard.tsx` — 🍗 → `fast-food-outline`
- `src/components/pos/CheckoutModal.tsx` — 🪑 → `chair-outline`

**Forward migration:** Cada emoji reemplazado por su equivalente Ionicons. Si el emoji está en un `<Text>`, se reemplaza por `<Ionicons name="..." size={20} color="..." />`.

**Mapa completo:**

| Emoji | Ionicón |
|-------|---------|
| 🍗 | `fast-food-outline` |
| 🛒 | `cart-outline` |
| 📦 | `cube-outline` |
| 📚 | `book-outline` |
| 📍 | `location-outline` |
| 🏪 | `storefront-outline` |
| 🪑 | `chair-outline` |
| 📋 | `receipt-outline` |
| 📱 | `phone-portrait-outline` |
| 💳 | `card-outline` |
| 🛵 | `bicycle-outline` |
| 📂 | `folder-outline` |
| 👥 | `people-outline` |
| 💰 | `cash-outline` |
| 🌱 | `leaf-outline` |
| 🕐 | `time-outline` |
| 📞 | `call-outline` |
| 📝 | `document-text-outline` |
| 🔍 | `search-outline` |
| 🍳 | `egg-outline` |
| 🚚 | `car-outline` |

**Verificación:** `npx tsc --noEmit`. Revisar visualmente que los iconos se vean bien.

---

### Task 5: Crear hooks compartidos (DRY)

**Objective:** Eliminar patrones repetidos en +10 archivos.

**Files:**
- Create: `src/hooks/useAsyncData.ts`
- Create: `src/hooks/useConfirmDelete.ts`
- Create: `src/hooks/useBottomPadding.ts`
- Create: `src/utils/order.ts` (helpers)

---

#### Tarea 5a: `useAsyncData`

```tsx
// src/hooks/useAsyncData.ts
import { useState, useEffect, useCallback } from "react";

export function useAsyncData<T>(
  fetcher: () => Promise<T>,
  deps: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const result = await fetcher();
      setData(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, deps);

  useEffect(() => { load(); }, [load]);

  return { data, loading, refreshing, setRefreshing, load };
}
```

**Archivos que usan este patrón y pueden migrar:**
- `app/(tabs)/index.tsx`
- `app/(tabs)/pos.tsx`
- `app/(tabs)/pedidosCustomer.tsx`
- `app/(tabs)/pedidosAdmin.tsx`
- `app/(tabs)/capacitacion.tsx`
- `app/(tabs)/admin/productos.tsx`
- `app/(tabs)/admin/categorias.tsx`
- `app/(tabs)/admin/capacitacion.tsx`
- `app/(tabs)/admin/usuarios.tsx`
- `app/(tabs)/admin/index.tsx`

Cada archivo migra de:
```tsx
const [data, setData] = useState(...);
const [loading, setLoading] = useState(true);
const [refreshing, setRefreshing] = useState(false);
const load = async () => { ... };
useEffect(() => { load(); }, []);
```

A:
```tsx
const { data, loading, refreshing, setRefreshing, load } = useAsyncData(fetcher);
```

---

#### Tarea 5b: `useConfirmDelete`

```tsx
// src/hooks/useConfirmDelete.ts
import { Alert } from "react-native";

export function useConfirmDelete(onDelete: () => Promise<void>, onSuccess: () => void) {
  return (name: string) => {
    Alert.alert("Eliminar", `¿Eliminar "${name}"?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar", style: "destructive",
        onPress: async () => {
          try {
            await onDelete();
            onSuccess();
          } catch {
            Alert.alert("Error", "No se pudo eliminar.");
          }
        },
      },
    ]);
  };
}
```

**Archivos que migran:** `admin/productos.tsx`, `admin/categorias.tsx`, `admin/capacitacion.tsx`

---

#### Tarea 5c: `useBottomPadding`

```tsx
// src/hooks/useBottomPadding.ts
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function useBottomPadding() {
  const { bottom } = useSafeAreaInsets();
  return Platform.OS === "android" ? bottom + 8 : 16;
}
```

**Archivos que migran:** `carrito.tsx`, `pago-yape.tsx`, `pago-tarjeta.tsx`, `DeliveryModal.tsx`

---

#### Tarea 5d: `mapItemsToOrderItems`

```tsx
// src/utils/order.ts
import type { OrderItem } from "@/src/services/pedidos";

interface CartItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

export function mapItemsToOrderItems(items: CartItem[]): OrderItem[] {
  return items.map((i) => ({
    productId: i.productId,
    name: i.name,
    quantity: i.quantity,
    unitPrice: i.price,
    subtotal: i.price * i.quantity,
  }));
}
```

**Archivos que migran:** `pos.tsx`, `pago-yape.tsx`, `pago-tarjeta.tsx`

---

### Task 6: Migrar estilos inline de ComandaCard a NativeWind

**Objective:** ~50 estilos inline en `ComandaCard` (pedidosAdmin.tsx líneas 349-480) pasan a className.

**File:**
- Modify: `src/components/orders/ComandaCard.tsx`

**Patrón de migración:**
```tsx
// ANTES:
<View style={{
  backgroundColor: "#fff",
  borderRadius: 16,
  padding: 16,
  marginHorizontal: 16,
  marginBottom: 12,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 8,
  elevation: 4,
}}>

// DESPUÉS:
<View className="bg-white rounded-xl p-4 mx-4 mb-3 shadow-lg">
```

**Verificación:** `npx tsc --noEmit`. Comparar visualmente que los componentes se vean igual.

---

### Task 7: Tipar `any` sueltos

**Objective:** Eliminar `any` donde sea trivial tipar correctamente.

**Files:**
- Modify: `src/services/pedidos.ts:59,85`
- Modify: `src/components/MapWebView.tsx:179`

**Tarea 7a: Tipar `stripUndefined`**

```tsx
// src/services/pedidos.ts
function stripUndefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  ) as Partial<T>;
}
```

Y en L85:
```tsx
const clean = stripUndefined(data);
```

**Tarea 7b: Tipar `WebViewMessageEvent`**

```tsx
// src/components/MapWebView.tsx
import type { WebViewMessageEvent } from "react-native-webview";

// ...

const handleMessage = (event: WebViewMessageEvent) => {
  const data = JSON.parse(event.nativeEvent.data) as { lat: number; lng: number; address: string };
  onLocationSelect?.(data);
};
```

---

### Task 8: Eliminar `StyleSheet.create` en MapWebView.tsx

**Objective:** Migrar a NativeWind.

**File:**
- Modify: `src/components/MapWebView.tsx`

```tsx
// ANTES:
const styles = StyleSheet.create({
  container: { height: 250, borderRadius: 12, overflow: "hidden" },
  webview: { flex: 1 },
});

// DESPUÉS (en el JSX):
<View className="h-[250px] rounded-xl overflow-hidden">
  <WebView className="flex-1" ... />
</View>
```

Eliminar el import de `StyleSheet`.

---

### Task 9: Eliminar comentarios boilerplate redundantes

**Objective:** +50 comentarios que repiten lo que el código ya dice.

**Files:** Todos los .tsx del proyecto.

**Qué eliminar:**
```tsx
// Process user login  → el nombre handleLogin ya lo dice
const handleLogin = async () => { ...

// Load products       → el nombre load ya lo dice
const load = async () => { ...

// Yape payment screen → el nombre YapeScreen ya lo dice
export default function YapeScreen() { ...

// ─── Section ─────────────────────  → separá en archivos, no en comentarios
```

**Qué conservar:**
```tsx
// Sleep 1.5s para que el usuario vea el feedback visual antes del redirect
await new Promise((r) => setTimeout(r, 1500));

// Se usa /legacy porque la versión estándar no soporta share en SDK < 52
import * as FileSystem from "expo-file-system/legacy";
```

**Verificación:** `npx tsc --noEmit`. Leer los archivos resultantes y confirmar que siguen siendo comprensibles.

---

### Task 10: Eliminar import `React` redundante

**Objective:** En Expo SDK 50+ con JSX transform automático, `import React from "react"` no es necesario en archivos que solo usan JSX.

**Files:** Todos los .tsx que importan `React` pero no usan `React.xxx`.

**Buscar:**
```tsx
import React, { useState } from "react";
// → se puede dejar porque es un import combinado, pero si solo usa JSX:
import React from "react";
// → se puede eliminar
```

**Verificación:** `npx tsc --noEmit`.

---

## Verificación final

```bash
npx tsc --noEmit
# Expected: 0 errores (los 6 pre-existentes deberían estar resueltos o igual)
```

Si la app corre con `npx expo start --web` y las pantallas se ven correctas, la simplificación está completa.

---

## Resumen de archivos a crear

| Archivo | Propósito |
|---|---|
| `src/components/orders/AdminOrderCard.tsx` | Card de pedido en vista admin |
| `src/components/orders/ComandaCard.tsx` | Card de comanda para cocina |
| `src/components/orders/StatusStamp.tsx` | Badge circular de estado |
| `src/components/orders/OrderSeparator.tsx` | Separador con línea y título |
| `src/components/orders/FilterTab.tsx` | Tab de filtro con contador |
| `src/components/orders/MiniStepper.tsx` | Stepper de pasos mínimo |
| `src/components/orders/useElapsed.ts` | Hook de tiempo transcurrido |
| `src/components/delivery/StepChoose.tsx` | Paso elegir modalidad |
| `src/components/delivery/StepRecoger.tsx` | Paso recoger en tienda |
| `src/components/delivery/SucursalCard.tsx` | Card de sucursal |
| `src/components/delivery/StepDelivery.tsx` | Paso delivery con mapa |
| `src/hooks/useAsyncData.ts` | Hook genérico fetch+loading+refresh |
| `src/hooks/useConfirmDelete.ts` | Hook de confirmación de borrado |
| `src/hooks/useBottomPadding.ts` | Hook safe area bottom padding |
| `src/utils/order.ts` | Helpers de pedidos |
