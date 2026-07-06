# Modelo Entidad-Relación

```mermaid
erDiagram
    USERS {
        uuid id PK
        string name
        string email UK
        string phone
        string role "admin | employee | customer"
        string avatar_url
        timestamp created_at
    }

    CATEGORIES {
        uuid id PK
        string name
        string description
        int sort_order
        boolean active
        timestamp created_at
    }

    PRODUCTS {
        uuid id PK
        string name
        string description
        int price "en céntimos (S/.)"
        uuid category_id FK
        string image_url
        int stock
        int min_stock
        boolean active
        boolean available_for_delivery
        timestamp created_at
    }

    ORDERS {
        uuid id PK
        uuid customer_id FK "nullable (venta directa)"
        string customer_name
        string customer_phone
        string delivery_address
        string type "pos | online"
        string status "pending | preparing | ready | delivered | cancelled"
        int total "en céntimos"
        string payment_method "yape | plin | card | cash"
        string transaction_id
        int discount
        timestamp created_at
        timestamp completed_at
    }

    ORDER_ITEMS {
        uuid id PK
        uuid order_id FK
        uuid product_id FK
        string product_name "snapshot al vender"
        int quantity
        int unit_price "en céntimos"
        int subtotal "quantity * unit_price"
    }

    DELIVERIES {
        uuid id PK
        uuid order_id FK
        string delivery_address
        string delivery_zone
        int estimated_minutes
        timestamp dispatched_at
        timestamp completed_at
    }

    LOYALTY_POINTS {
        uuid id PK
        uuid customer_id FK
        int total_points
        timestamp updated_at
    }

    POINTS_HISTORY {
        uuid id PK
        uuid customer_id FK
        uuid order_id FK
        int points "positivo = ganó, negativo = canjeó"
        string reason "compra | canje | bonus"
        timestamp created_at
    }

    PROMOTIONS {
        uuid id PK
        string title
        string description
        string type "descuento | 2x1 | combo"
        string code UK "nullable (código promocional)"
        int discount_percent
        uuid product_id FK "nullable"
        date start_date
        date end_date
        boolean active
        timestamp created_at
    }

    COUPONS {
        uuid id PK
        uuid customer_id FK
        uuid promotion_id FK
        string code UK
        boolean used
        date expires_at
        timestamp used_at
    }

    TRAINING {
        uuid id PK
        string title
        string description
        string file_url
        string file_type "pdf | video | image"
        string category "recetas | protocolos | manuales"
        timestamp created_at
    }

    NOTIFICATIONS {
        uuid id PK
        uuid user_id FK
        string title
        string body
        string type "order_status | promotion | stock_alert"
        boolean read
        timestamp created_at
    }

    USERS ||--o{ ORDERS : "tiene"
    USERS ||--o| LOYALTY_POINTS : "fidelización"
    USERS ||--o{ POINTS_HISTORY : "historial de puntos"
    USERS ||--o{ NOTIFICATIONS : "recibe"
    CATEGORIES ||--o{ PRODUCTS : "contiene"
    PRODUCTS ||--o{ ORDER_ITEMS : "vendido en"
    PRODUCTS ||--o{ PROMOTIONS : "aplica a"
    ORDERS ||--o{ ORDER_ITEMS : "tiene"
    ORDERS ||--o| DELIVERIES : "genera"
    ORDERS ||--o{ POINTS_HISTORY : "genera puntos"
    PROMOTIONS ||--o{ COUPONS : "se canjea como"
    CUSTOMERS ||--o{ COUPONS : "recibe"
    CUSTOMERS ||--o{ ORDERS : "realiza"
```

## Resumen de colecciones

| Colección | Propósito | ¿SQL? |
|---|---|---|
| `users` | Perfiles de usuario (todos los roles) | Postgres |
| `categories` | Categorías de productos | Postgres |
| `products` | Platillos del menú | Postgres |
| `orders` | Pedidos (POS + online) | Postgres |
| `order_items` | Detalle de cada pedido | Postgres |
| `deliveries` | Entrega a domicilio (sin GPS) | Postgres |
| `loyalty_points` | Puntos acumulados por cliente | Postgres |
| `points_history` | Movimientos de puntos | Postgres |
| `promotions` | Promociones activas | Postgres |
| `coupons` | Cupones asignados a clientes | Postgres |
| `training` | Materiales de capacitación | Postgres |
| `notifications` | Notificaciones push | Postgres |
