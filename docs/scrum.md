# Scrum — Lo de Juan

## Roles

| Rol | Persona |
|-----|---------|
| **Product Owner** | Max — prioriza backlog, define qué construir |
| **Scrum Master** | Profesor del curso — facilita ceremonias, remueve bloqueos |
| **Dev Team** | Max, Erick, Lesly |

El Scrum Master es el profesor del curso, quien guía y supervisa la aplicación correcta de Scrum. El Product Owner recae en Max por practicidad del equipo pequeño.

---

## Ceremonias

| Ceremonia | Cuándo | Duración | Qué pasa |
|-----------|--------|----------|----------|
| **Sprint Planning** | Día 1 de cada sprint | 60 min | Elegir historias del backlog para el sprint, dividirlas en tareas |
| **Daily Standup** | Todos los días | 15 min | ¿Qué hice ayer? ¿Qué voy a hacer hoy? ¿Tengo algún bloqueo? |
| **Sprint Review** | Último día del sprint | 30 min | Mostrar lo terminado al equipo. ¿Funciona? ¿Cumple? |
| **Sprint Retro** | Después del Review | 30 min | ¿Qué salió bien? ¿Qué mejorar? ¿Qué dejar de hacer? |

**Dailies:** pueden ser por WhatsApp si no coinciden presencial. Cada uno manda su update antes de arrancar a codear.

---

## Sprint 1 — Semanas 1-2 (Setup + Base)

### Sprint Goal
Tener la app funcionando con login, catálogo de productos y una pantalla de capacitación.

### Backlog del Sprint

| Prioridad | Historia | Puntos | Responsable |
|-----------|----------|--------|-------------|
| P0 | Como admin, quiero registrarme e iniciar sesión para acceder al sistema | 3 | ✅ Terminado |
| P0 | Como admin, quiero crear, editar y eliminar productos del catálogo | 8 | Compañero 1 |
| P0 | Como admin, quiero crear y listar categorías para organizar productos | 3 | Compañero 1 |
| P1 | Como empleado, quiero ver los manuales y recetas en la app | 3 | ✅ Terminado |
| P1 | Como usuario, quiero ver mi perfil y cerrar sesión | 2 | ✅ Terminado |
| P2 | Como admin, quiero ver un listado de usuarios registrados | 3 | ✅ Terminado |

### Definition of Done para cada historia
- Código en `dev` vía PR aprobado por otro miembro
- Build exitoso (`npx expo export`)
- Datos guardados en Firestore correctamente
- La pantalla funciona en web (emulador) y mínimo se ve bien

---

## Sprint 2 — Semanas 3-4 (Núcleo del negocio)

### Sprint Goal
El empleado puede vender desde el POS y el cliente puede hacer pedidos desde la app.

### Backlog del Sprint

| Prioridad | Historia | Puntos | Responsable |
|-----------|----------|--------|-------------|
| P0 | Como empleado, quiero un POS con carrito para cobrar pedidos en mostrador | 13 | Compañero 1 |
| P0 | Como empleado, quiero que al cobrar se descuente el stock automáticamente | 5 | Compañero 1 |
| P0 | Como cliente, quiero ver el catálogo y agregar productos a mi pedido | 8 | Compañero 2 |
| P1 | Como cliente, quiero confirmar mi pedido y que llegue al sistema | 5 | Compañero 2 |
| P2 | Como admin, quiero ver el dashboard con cards de resumen (ventas hoy, pedidos pendientes) | 5 | Max |

---

## Sprint 3 — Semanas 5-6 (Operaciones + Seguimiento)

### Sprint Goal
El empleado gestiona pedidos entrantes, el inventario tiene alertas, y el cliente ve su historial.

### Backlog del Sprint

| Prioridad | Historia | Puntos | Responsable |
|-----------|----------|--------|-------------|
| P0 | Como empleado, quiero ver los pedidos entrantes y cambiar su estado | 8 | Compañero 2 |
| P0 | Como empleado, quiero ver alertas cuando un producto tiene stock bajo | 5 | Compañero 1 |
| P1 | Como admin, quiero ver el stock actual de todos los productos | 3 | Compañero 1 |
| P1 | Como cliente, quiero ver mi historial de pedidos | 5 | Compañero 2 |
| P1 | Como cliente, quiero acumular puntos por mis compras | 5 | Compañero 2 |
| P2 | Como admin, quiero ver un gráfico de ventas por día/semana/mes | 8 | Max |

---

## Sprint 4 — Semanas 7-8 (Reportes + Pulido + Entrega)

### Sprint Goal
Reportes funcionales con datos reales, app estable y presentable para la entrega.

### Backlog del Sprint

| Prioridad | Historia | Puntos | Responsable |
|-----------|----------|--------|-------------|
| P0 | Como admin, quiero ver reportes comparativos de ventas | 8 | Max |
| P0 | Como admin, quiero ver el top productos más vendidos | 5 | Max |
| P1 | Como cliente, quiero canjear mis puntos por productos | 5 | Compañero 2 |
| P1 | Como admin, quiero gestionar usuarios (cambiar rol, desactivar) | 5 | Compañero 2 |
| P2 | Arreglar bugs detectados en los sprints anteriores | 8 | Todos |
| P2 | Últimas pruebas, ajustes de UI, preparar presentación | 5 | Todos |

---

## Historias de usuario — Banco completo (Product Backlog)

### Auth y Navegación ✅ (Terminado)
- ~~Como admin, quiero iniciar sesión y que la app me reconozca por mi rol~~
- ~~Como usuario, quiero registrarme con email y contraseña~~
- ~~Como usuario, quiero cerrar sesión desde mi perfil~~
- ~~Como usuario, quiero ver distintas pantallas según mi rol (admin/employee/customer)~~

### Catálogo
- Como admin, quiero crear productos con nombre, precio, categoría y foto
- Como admin, quiero editar y desactivar productos sin borrarlos
- Como admin, quiero crear categorías y ordenarlas
- Como cliente, quiero ver los productos activos ordenados por categoría

### POS
- Como empleado, quiero buscar productos y agregarlos a un carrito
- Como empleado, quiero ver el total acumulado en el carrito
- Como empleado, quiero cobrar y que se genere un pedido automáticamente
- Como empleado, quiero que al cobrar se descuente el stock de cada producto
- Como empleado, quiero cancelar una venta y que se devuelva el stock

### Inventario
- Como empleado, quiero ver una lista de productos con su stock actual
- Como empleado, quiero ver una alerta visual cuando un producto tiene stock bajo
- Como admin, quiero ajustar el stock manualmente (ingresar mercadería)

### Pedidos Online
- Como cliente, quiero seleccionar productos del catálogo y armar un pedido
- Como cliente, quiero confirmar el pedido y recibir confirmación
- Como cliente, quiero ver el estado de mi pedido (pendiente, en preparación, listo, entregado)
- Como empleado, quiero ver los pedidos entrantes en orden de llegada
- Como empleado, quiero cambiar el estado del pedido a medida que avanza

### CRM y Fidelización
- Como cliente, quiero ver mi historial de compras
- Como cliente, quiero acumular puntos (1 punto por S/.10)
- Como cliente, quiero ver mis puntos disponibles
- Como cliente, quiero canjear puntos (opcional según sprint)

### Reportes y BI
- Como admin, quiero ver un dashboard con ventas del día, semana y mes
- Como admin, quiero ver un gráfico de barras con ventas por día
- Como admin, quiero ver el ranking de productos más vendidos
- Como admin, quiero filtrar reportes por rango de fechas

### Capacitación
- Como empleado, quiero ver una lista de manuales y recetas
- Como empleado, quiero abrir un PDF desde la app
- Como admin, quiero subir nuevos materiales de capacitación

### Admin (Usuarios)
- Como admin, quiero ver el listado de usuarios con su rol
- Como admin, quiero cambiar el rol de un usuario
- Como admin, quiero desactivar un usuario

---

## Estimación de Puntos (Story Points)

| Tamaño | Puntos | Ejemplo |
|--------|--------|---------|
| 🟢 Chico | 2-3 | Pantalla de listado simple, perfil |
| 🟡 Mediano | 5 | CRUD completo, formulario con validación |
| 🔴 Grande | 8 | Flujo multi-pantalla con cambios de estado |
| 🔴🔴 Muy grande | 13 | POS completo con carrito + stock + ticket |

**Velocidad estimada del equipo:** 15-20 puntos por sprint (3 personas × ~5-7 pts c/u).

---

## Product Backlog completo (priorizado)

| # | Historia | Prioridad | Sprint estimado |
|---|----------|-----------|----------------|
| 1 | Login / Register / Roles | P0 | Sprint 1 ✅ |
| 2 | CRUD productos | P0 | Sprint 1 |
| 3 | CRUD categorías | P0 | Sprint 1 |
| 4 | Capacitación (listar + ver PDFs) | P1 | Sprint 1 |
| 5 | Admin usuarios (listar) | P2 | Sprint 1 |
| 6 | POS con carrito y cobro | P0 | Sprint 2 |
| 7 | Descontar stock al cobrar | P0 | Sprint 2 |
| 8 | Catálogo para cliente (ver productos) | P0 | Sprint 2 |
| 9 | Cliente hace pedido (carrito + confirmar) | P0 | Sprint 2 |
| 10 | Dashboard admin (cards resumen) | P2 | Sprint 2 |
| 11 | Empleado gestiona pedidos entrantes | P0 | Sprint 3 |
| 12 | Alertas de stock bajo | P0 | Sprint 3 |
| 13 | Vista de stock general | P1 | Sprint 3 |
| 14 | Historial de pedidos del cliente | P1 | Sprint 3 |
| 15 | Puntos de fidelización (acumular) | P1 | Sprint 3 |
| 16 | Gráfico de ventas (día/semana/mes) | P2 | Sprint 3 |
| 17 | Reportes comparativos | P0 | Sprint 4 |
| 18 | Top productos más vendidos | P0 | Sprint 4 |
| 19 | Canje de puntos | P1 | Sprint 4 |
| 20 | Gestión de usuarios (roles, desactivar) | P1 | Sprint 4 |
| 21 | Bug fixing + pulido UI | P2 | Sprint 4 |
| 22 | Preparación presentación | P2 | Sprint 4 |

---

## Definition of Done (DoD) — General

- [ ] Código escrito y funcional
- [ ] PR abierto a `dev` y aprobado por al menos 1 compañero
- [ ] Build pasa sin errores (`npx expo export`)
- [ ] Datos persistentes en Firestore
- [ ] La historia está testeada manualmente (flujo feliz)
- [ ] No rompe funcionalidad existente (probar en `dev` antes de mergear)
