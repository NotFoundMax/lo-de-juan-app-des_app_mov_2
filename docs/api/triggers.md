# Triggers y automatizaciones

## Triggers de base de datos

### 1. Descontar stock al crear pedido

```
CUÁNDO: AFTER INSERT ON orders
QUÉ HACE:
  - Por cada item en el pedido:
    - UPDATE products SET stock = stock - item.quantity
      WHERE product_id = item.productId
    - Si stock < 0 → ROLLBACK (no puede haber stock negativo)
    - Si stock <= min_stock → INSERT notification (stock_alert)
```

```sql
CREATE OR REPLACE FUNCTION deduct_stock()
RETURNS trigger AS $$
BEGIN
  UPDATE products
  SET stock = stock - (SELECT quantity FROM order_items WHERE order_id = NEW.id)
  WHERE id IN (SELECT product_id FROM order_items WHERE order_id = NEW.id);

  -- Alerta de stock bajo
  INSERT INTO notifications (user_id, title, body, type)
  SELECT
    u.id,
    'Stock bajo',
    'El producto ' || p.name || ' tiene ' || p.stock || ' unidades restantes',
    'stock_alert'
  FROM products p
  JOIN users u ON u.role = 'admin'
  WHERE p.id IN (SELECT product_id FROM order_items WHERE order_id = NEW.id)
    AND p.stock <= p.min_stock;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_deduct_stock
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION deduct_stock();
```

### 2. Devolver stock al cancelar pedido

```
CUÁNDO: AFTER UPDATE ON orders (status → 'cancelled')
QUÉ HACE:
  - Por cada item del pedido cancelado:
    - UPDATE products SET stock = stock + item.quantity
```

```sql
CREATE OR REPLACE FUNCTION restore_stock()
RETURNS trigger AS $$
BEGIN
  IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
    UPDATE products
    SET stock = stock + oi.quantity
    FROM order_items oi
    WHERE products.id = oi.product_id AND oi.order_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_restore_stock
  AFTER UPDATE ON orders
  FOR EACH ROW
  WHEN (NEW.status = 'cancelled')
  EXECUTE FUNCTION restore_stock();
```

### 3. Acumular puntos de fidelización

```
CUÁNDO: AFTER UPDATE ON orders (status → 'delivered')
QUÉ HACE:
  - Calcular puntos: FLOOR(total / 1000) = 1 punto por S/.10
    (total está en céntimos, entonces S/.10 = 1000 céntimos)
  - UPDATE loyalty_points SET total_points = total_points + puntos
  - INSERT INTO points_history (customerId, points, reason, orderId)
```

```sql
CREATE OR REPLACE FUNCTION accrue_loyalty_points()
RETURNS trigger AS $$
DECLARE
  earned_points INT;
BEGIN
  IF NEW.status = 'delivered' AND OLD.status != 'delivered' THEN
    earned_points := FLOOR(NEW.total / 1000); -- 1 punto por S/.10

    INSERT INTO loyalty_points (customer_id, total_points)
    VALUES (NEW.customer_id, earned_points)
    ON CONFLICT (customer_id)
    DO UPDATE SET total_points = loyalty_points.total_points + earned_points;

    INSERT INTO points_history (customer_id, order_id, points, reason)
    VALUES (NEW.customer_id, NEW.id, earned_points, 'compra');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_accrue_points
  AFTER UPDATE ON orders
  FOR EACH ROW
  WHEN (NEW.status = 'delivered')
  EXECUTE FUNCTION accrue_loyalty_points();
```

### 4. Notificar cambio de estado del pedido

```
CUÁNDO: AFTER UPDATE ON orders (status cambia)
QUÉ HACE:
  - INSERT notification para el customer:
    - 'pending' → "Pedido recibido"
    - 'preparing' → "Tu pedido está en preparación"
    - 'ready' → "Tu pedido está listo"
    - 'delivered' → "Pedido entregado"
    - 'cancelled' → "Pedido cancelado"
```

```sql
CREATE OR REPLACE FUNCTION notify_order_status()
RETURNS trigger AS $$
DECLARE
  status_text TEXT;
BEGIN
  status_text := CASE NEW.status
    WHEN 'pending' THEN 'Pedido recibido'
    WHEN 'preparing' THEN 'Tu pedido está en preparación'
    WHEN 'ready' THEN 'Tu pedido está listo'
    WHEN 'delivered' THEN 'Pedido entregado'
    WHEN 'cancelled' THEN 'Pedido cancelado'
    ELSE NEW.status
  END;

  INSERT INTO notifications (user_id, title, body, type)
  VALUES (NEW.customer_id, 'Estado del pedido', status_text, 'order_status');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_notify_status
  AFTER UPDATE ON orders
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION notify_order_status();
```

## Edge Functions (Supabase)

| Función | Trigger | Propósito |
|---|---|---|
| `payment-webhook` | HTTP POST | Recibir confirmación de pago de Ligo/Culqi |
| `send-push` | DB insert en notifications | Enviar push notification via FCM/APNs |
| `generate-qr` | HTTP POST | Generar QR de pago Yape/Plin |
| `calc-report` | HTTP GET | Calcular métricas del dashboard (caché) |
