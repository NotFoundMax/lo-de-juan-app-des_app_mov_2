# Flujo — Cliente

```mermaid
flowchart TD
    START([Abrir app]) -->|No registrado| REGISTRO[Registrarse]
    START -->|Ya tiene cuenta| LOGIN[Iniciar sesión]
    REGISTRO --> LOGIN
    LOGIN --> HOME[Catálogo de productos]

    HOME -->|Navegar| CATEGORIAS[Ver productos por categoría]
    HOME -->|Buscar| BUSCADOR[Buscador de productos]
    HOME -->|Ver carrito| CARRITO[Carrito de compras]

    CATEGORIAS --> SELECCIONAR{Seleccionar producto}
    BUSCADOR --> SELECCIONAR
    SELECCIONAR --> DETALLE[Detalle del producto]
    DETALLE --> AGREGAR_CARRITO[Agregar al carrito + cantidad]
    AGREGAR_CARRITO -->|Seguir comprando| HOME

    CARRITO --> REVISAR[Revisar carrito]
    REVISAR --> TIPO_PEDIDO{Tipo de entrega}
    TIPO_PEDIDO -->|Delivery| DIRECCION[Ingresar dirección]
    TIPO_PEDIDO -->|Recogida en local| LOCAL[Listo - local seleccionado]

    DIRECCION --> CONFIRMAR[Confirmar pedido]
    LOCAL --> CONFIRMAR

    CONFIRMAR --> PAGO{Elegir método de pago}
    PAGO -->|Yape / Plin| QR_PAGO[Escanea QR desde tu app]
    PAGO -->|Tarjeta| FORM_TARJETA[Ingresar datos de tarjeta]
    PAGO -->|Efectivo| EFECTIVO[Pagas al recibir/recoger]

    QR_PAGO -->|Pagado| PEDIDO_CONFIRMADO[✅ Pedido confirmado]
    FORM_TARJETA -->|Pagado| PEDIDO_CONFIRMADO
    EFECTIVO --> PEDIDO_CONFIRMADO

    PEDIDO_CONFIRMADO --> SEGUIMIENTO[Seguimiento del pedido]

    subgraph "Estados del pedido"
        PENDIENTE[🟡 Pendiente]
        PREPARANDO[🔵 En preparación]
        LISTO[🟢 Listo]
        ENTREGADO[✅ Entregado]
    end

    SEGUIMIENTO -->|Estado actual| PENDIENTE
    PENDIENTE -->|Empleado acepta| PREPARANDO
    PREPARANDO -->|Cocina termina| LISTO
    LISTO -->|Cliente recibe| ENTREGADO

    SEGUIMIENTO -->|Delivery| EN_CAMINO[🚚 Delivery en camino<br/>hora estimada]
    EN_CAMINO -->|Repartidor llegó| ENTREGADO

    ENTREGADO --> PUNTOS[✨ Ganaste puntos de fidelización]
    PUNTOS --> PERFIL[Ir a mi perfil]

    subgraph "Perfil del cliente"
        HISTORIAL[Historial de pedidos]
        MIS_PUNTOS[Puntos acumulados]
        CANJEAR[Canjear puntos]
        FAVORITOS[Mis productos favoritos]
        SOPORTE[Contactar soporte]
    end

    PERFIL --> HISTORIAL
    PERFIL --> MIS_PUNTOS
    MIS_PUNTOS --> CANJEAR
    CANJEAR -->|Producto canjeado| PEDIDO_CONFIRMADO
```
