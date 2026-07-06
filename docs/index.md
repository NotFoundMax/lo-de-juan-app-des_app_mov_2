# Documentación — Lo de Juan

Bienvenido a la documentación del proyecto. Acá encontrás todo lo necesario para entender, desarrollar y operar la aplicación.

---

## Arquitectura

| Documento | Descripción |
|---|---|
| [Arquitectura general](architecture/overview.md) | Diagrama de contexto y contenedores del sistema |
| [Flujo de datos](architecture/data-flow.md) | Cómo viaja la información entre componentes |
| [Modelo Entidad-Relación](architecture/er-model.md) | Estructura de la base de datos |

## Flujos de usuario

| Documento | Rol |
|---|---|
| [Flujo Admin](flows/flow-admin.md) | Gestión completa del sistema |
| [Flujo Employee](flows/flow-employee.md) | POS, pedidos, stock |
| [Flujo Customer](flows/flow-customer.md) | Catálogo, carrito, delivery |

## Guías de inicio

| Documento | Para quién |
|---|---|
| [Setup Admin](guides/setup-admin.md) | Desarrollador full |
| [Setup Employee](guides/setup-employee.md) | Pruebas limitadas |
| [Setup Customer](guides/setup-customer.md) | Solo probar la app |

## API y Firebase

| Documento | Descripción |
|---|---|
| [Reglas de seguridad](api/firestore-rules.md) | Quién lee y escribe cada colección |
| [Índices](api/firestore-indexes.md) | Índices compuestos necesarios |
| [Triggers](api/triggers.md) | Automatizaciones y Cloud Functions |

## Decisiones técnicas (ADR)

| Documento | Decisión |
|---|---|
| [001 - Supabase vs Firebase](adr/001-supabase-sobre-firebase.md) | Backend SQL |
| [002 - Expo + React Native](adr/002-expo-react-native.md) | Framework mobile |
| [003 - NativeWind + Tailwind](adr/003-nativewind-tailwind.md) | Estilos |
| [004 - Pasarela de pagos](adr/004-pasarela-pagos.md) | Pagos integrados |

## Operaciones

| Documento | Descripción |
|---|---|
| [Troubleshooting Android](runbooks/troubleshooting-android.md) | Problemas comunes Android |
| [Troubleshooting Web](runbooks/troubleshooting-web.md) | Problemas comunes web |
| [Errores frecuentes](runbooks/errors-comunes.md) | Catálogo de errores y soluciones |
