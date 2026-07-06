# Índices compuestos — Firestore

> **Nota:** Al migrar a Supabase (PostgreSQL), los índices se manejan con sentencias SQL `CREATE INDEX` en las migraciones.

## Índices actuales

### orders

| Campos | Orden | Propósito |
|---|---|---|
| `status` ASC, `createdAt` DESC | 🔺🔻 | Listar pedidos por estado + más recientes |
| `customerId` ASC, `createdAt` DESC | 🔺🔻 | Historial de pedidos del cliente |
| `type` ASC, `status` ASC, `createdAt` DESC | 🔺🔺🔻 | Filtrar por tipo + estado |

### products

| Campos | Orden | Propósito |
|---|---|---|
| `categoryId` ASC, `active` ASC, `name` ASC | 🔺🔺🔺 | Productos activos por categoría |
| `stock` ASC, `minStock` ASC | 🔺🔺 | Alertas de stock bajo |

### points_history

| Campos | Orden | Propósito |
|---|---|---|
| `customerId` ASC, `createdAt` DESC | 🔺🔻 | Historial de puntos del cliente |

### notifications

| Campos | Orden | Propósito |
|---|---|---|
| `userId` ASC, `read` ASC, `createdAt` DESC | 🔺🔺🔻 | Notificaciones no leídas del usuario |

## SQL equivalente (para migración a Supabase)

```sql
-- Ordenar pedidos por estado y fecha
CREATE INDEX idx_orders_status_created ON orders(status, created_at DESC);

-- Historial por cliente
CREATE INDEX idx_orders_customer ON orders(customer_id, created_at DESC);

-- Productos activos por categoría
CREATE INDEX idx_products_category_active ON products(category_id, active, name);

-- Alertas de stock bajo
CREATE INDEX idx_products_stock_alert ON products(stock, min_stock)
  WHERE stock <= min_stock AND active = true;

-- Notificaciones no leídas
CREATE INDEX idx_notifications_unread ON notifications(user_id, read, created_at DESC)
  WHERE read = false;
```
