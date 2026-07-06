# Guía de setup — Empleado (pruebas limitadas)

Guía para probar la app desde el rol de empleado sin necesidad de configurar todo el entorno.

## Requisitos

- **Expo Go** instalado en tu celular
- Credenciales de prueba proporcionadas por el administrador

## 1. Iniciar la app (el admin ya tiene el servidor corriendo)

El administrador comparte un **enlace** o un **código QR** desde su terminal. Abrí Expo Go en tu celular y escaneá el QR.

> Si estás en la misma red WiFi, la app se conecta automáticamente.

## 2. Iniciar sesión

| Campo | Valor |
|---|---|
| Email | `employee@lodjuan.com` |
| Contraseña | `123456` |

## 3. Probar funcionalidades

### POS (Punto de venta)

1. Buscar un producto por nombre
2. Agregar al carrito
3. Ajustar cantidad
4. Seleccionar método de pago (Efectivo / Yape / Plin / Tarjeta)
5. Confirmar venta
6. Ver que el stock se descuenta automáticamente

### Pedidos online

1. Ir a la sección **Pedidos**
2. Ver los pedidos entrantes
3. Cambiar estados: Pendiente → Preparación → Listo → Entregado
4. Cancelar un pedido (verifica que el stock se devuelve)

### Stock

1. Ir a **Inventario**
2. Ver lista de productos con stock actual
3. Identificar alertas de stock bajo (⚠️)
4. Ajustar stock manualmente si es necesario

## 4. Problemas comunes

| Problema | Solución |
|---|---|
| No veo productos | Pedir al admin que cargue datos de ejemplo |
| Error al cobrar | Verificar conexión a internet |
| No llegan notificaciones | Activar notificaciones en el celular |
| App se cierra | Forzar cierre y volver a abrir |

> **Nota**: No necesitás instalar Node.js, clonar el repo ni configurar nada. Solo la app Expo Go y las credenciales.
