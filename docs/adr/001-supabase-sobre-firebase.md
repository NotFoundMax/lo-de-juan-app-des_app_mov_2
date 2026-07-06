# ADR-001: Supabase sobre Firebase

## Estado

Propuesto — pendiente de validación con el equipo.

## Contexto

Necesitamos un backend que provea:
- Base de datos
- Autenticación de usuarios
- Almacenamiento de archivos
- Notificaciones en tiempo real (Realtime)

Las opciones consideradas son Firebase (NoSQL) y Supabase (PostgreSQL).

## Decisión

Usaremos **Supabase** como backend principal.

### Razones

| Criterio | Supabase | Firebase |
|---|---|---|
| **Base de datos** | PostgreSQL (SQL) — relaciones, joins, migraciones | Firestore (NoSQL documental) |
| **Consultas complejas** | SQL nativo: JOINs, GROUP BY, agregaciones | Limitado, requiere índices compuestos |
| **Migraciones** | Migraciones SQL versionadas | No tiene, cambios manuales |
| **Reportes** | Consultas SQL directas para métricas | Requiere exportación a BigQuery |
| **Realtime** | WebSockets nativos sobre Postgres | Firestore Realtime (propietario) |
| **Auth** | Auth con email + Magic Link + OAuth | Auth con email + OAuth |
| **Storage** | S3 compatible (escalable) | Firebase Storage |
| **Costo** | Plan gratuito generoso, pago por uso | Facturación por lectura/escritura |
| **Open source** | Sí (código abierto) | No (propietario) |
| **Lock-in** | Bajo (Postgres estándar) | Alto (solo ecosistema Google) |

### Consecuencias

**Positivas:**
- Podemos hacer consultas SQL complejas para reportes sin herramientas externas
- Migraciones versionadas que podemos trackear en Git
- Sin vendor lock-in: Postgres corre en cualquier lado
- Realtime nativo sobre Postgres (listen/notify)

**Negativas:**
- Menos ecosistema de extensiones que Firebase
- Las Edge Functions tienen menos triggers preconfigurados que Cloud Functions
- El equipo necesita saber SQL

**Neutral:**
- Migrar datos existentes de Firestore a Postgres requiere un script ETL
