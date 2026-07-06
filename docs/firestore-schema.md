# Firestore — Esquema de datos

Todas las colecciones, documentos y campos que usa la app.

---

## `users`

Perfiles de usuario. Se crean al registrarse desde `src/services/auth.ts`.

| Campo | Tipo | Ejemplo |
|-------|------|---------|
| `name` | string | "Juan Pérez" |
| `email` | string | "juan@mail.com" |
| `role` | string | "admin" / "employee" / "customer" |
| `createdAt` | string (ISO) | "2026-06-06T..." |

**Regla CRUD:**
- Lectura: propio documento + admin puede leer todos
- Escritura: solo al registrarse (Firebase Auth trigger)

---

## `categories`

Categorías de productos (ej: Pollos, Parrilla, Bebidas, Guarniciones).

| Campo | Tipo | Ejemplo |
|-------|------|---------|
| `name` | string | "Pollos al Spiedo" |
| `description` | string | "Pollos enteros y porciones" |
| `order` | number | 1 |

**CRUD:** Solo admin (pantalla de catálogo).

---

## `products`

Productos individuales del catálogo.

| Campo | Tipo | Ejemplo |
|-------|------|---------|
| `name` | string | "Pollo entero" |
| `description` | string | "Pollo al spiedo con ensalada" |
| `price` | number | 8500 |
| `categoryId` | string (doc id) | "abc123" |
| `imageUrl` | string (URL) | "https://..." |
| `stock` | number | 15 |
| `minStock` | number | 5 |
| `active` | boolean | true |
| `createdAt` | string (ISO) | "2026-06-06T..." |

**Reglas:**
- `stock` ≥ 0 — no permitir venta si stock < cantidad pedida
- `minStock` — cuando `stock <= minStock` se muestra alerta
- `active: false` — producto oculto del catálogo (no se borra)

**Consultas típicas:**
- Todos los productos activos ordenados por categoría
- Productos con `stock <= minStock` (alerta de inventario)

---

## `orders`

Pedidos generados desde POS o desde la app del cliente.

| Campo | Tipo | Ejemplo |
|-------|------|---------|
| `customerId` | string \| null | uid del usuario o null si es venta directa |
| `customerName` | string | "Juan Pérez" |
| `items` | array | [{ productId, name, quantity, unitPrice, subtotal }] |
| `total` | number | 17000 |
| `status` | string | "pending" / "preparing" / "ready" / "delivered" / "cancelled" |
| `type` | string | "pos" / "online" |
| `createdAt` | string (ISO) | "2026-06-06T..." |
| `completedAt` | string (ISO) \| null | null |

**Estructura de cada item en `items[]`:**

```ts
{
  productId: string,    // doc id del producto
  name: string,         // nombre al momento de la venta
  quantity: number,     // cantidad
  unitPrice: number,    // precio unitario al momento de la venta
  subtotal: number      // quantity * unitPrice
}
```

**Reglas:**
- Al crear un pedido con `type: "pos"` → descontar `stock` del producto
- Al cancelar un pedido → devolver `stock`
- `total` debe dar la suma de `items[].subtotal`

**Consultas típicas:**
- Pedidos por estado (empleado ve "pending" y "preparing")
- Pedidos por fecha (reportes)
- Pedidos por cliente (CRM)

---

## `loyalty_points`

Puntos de fidelización por cliente.

| Campo | Tipo | Ejemplo |
|-------|------|---------|
| `customerId` | string (uid) | "abcd123" |
| `points` | number | 250 |
| `history` | array | [{ date, points, reason, orderId }] |

**Estructura de cada entry en `history[]`:**

```ts
{
  date: string,         // ISO date
  points: number,       // positivos = ganados, negativos = canjeados
  reason: string,       // "compra" | "canje" | "bonus"
  orderId: string       // order id relacionado
}
```

**Regla:** 1 punto por cada S/. 10.00 gastados.

---

## `training`

Documentos / materiales de capacitación.

| Campo | Tipo | Ejemplo |
|-------|------|---------|
| `title` | string | "Receta: Pollo al Spiedo" |
| `description` | string | "Pasos para preparar..." |
| `fileUrl` | string | "https://storage..." |
| `fileType` | string | "pdf" |
| `category` | string | "recetas" / "protocolos" / "manuales" |
| `createdAt` | string (ISO) | "2026-06-06T..." |

**CRUD:** Solo admin crea/edita. Todos leen.

---

## Resumen de relaciones

```
users (1) ────< orders (N)     → un usuario puede tener muchos pedidos
users (1) ────< loyalty_points (1) → un usuario tiene un doc de puntos
categories (1) ────< products (N)  → una categoría tiene muchos productos
products (1) ────< orders.items (N) → un producto aparece en muchos pedidos
```
