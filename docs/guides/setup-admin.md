# Guía de setup — Administrador (desarrollador full)

Configuración completa del entorno de desarrollo para trabajar con todo el proyecto.

## Requisitos

- **Node.js** v18+ (v22 recomendado)
- **npm** v10+
- **Expo Go** en tu celular (Android / iOS)
- Cuenta en **Supabase** (gratuita)
- Cuenta en la **pasarela de pagos** (sandbox)

## 1. Clonar e instalar

```bash
git clone https://github.com/NotFoundMax/lo-de-juan.git
cd lo-de-juan
npm install
```

## 2. Configurar variables de entorno

Crear `.env.local` en la raíz:

```env
# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key

# Pasarela de pagos
EXPO_PUBLIC_PAYMENT_PUBLIC_KEY=tu-public-key
EXPO_PUBLIC_MERCHANT_ID=tu-merchant-id
```

## 3. Inicializar base de datos

Ejecutar el script de migración:

```bash
npx supabase db push
```

O desde el panel de Supabase, ejecutar el contenido de `supabase/migrations/`.

## 4. Cargar datos de ejemplo

```bash
npm run seed
```

Esto crea:
- Cuentas admin / employee / customer
- Categorías de ejemplo
- Productos de ejemplo
- Pedidos de demostración

## 5. Iniciar la app

```bash
npx expo start -c
```

Escanea el QR con **Expo Go**. Credenciales de prueba:

| Rol | Email | Contraseña |
|---|---|---|
| Admin | `admin@lodjuan.com` | `123456` |
| Employee | `employee@lodjuan.com` | `123456` |

## 6. Estructura del proyecto

```
app/                    ← Pantallas (Expo Router)
├── (auth)/             ← Login, Register
├── (tabs)/             ← Navegación principal
│   ├── admin/          ← Dashboard, productos, categorías
│   ├── employee/       ← POS, pedidos, stock
│   └── customer/       ← Catálogo, carrito, perfil
src/                    ← Lógica de negocio
├── contexts/           ← AuthContext, CartContext
├── services/           ← Supabase, pagos
├── hooks/              ← Custom hooks
├── components/         ← Componentes compartidos
├── constants/          ← Colores, tipografía
└── types/              ← TypeScript types
docs/                   ← Documentación
supabase/
├── migrations/         ← Migraciones SQL
└── seed.sql            ← Datos de ejemplo
```

## 7. Comandos útiles

```bash
npx expo start -c       # Iniciar con caché limpio
npx expo start --android # Forzar Android
npx expo start --web     # Probar en navegador
npm run lint             # Verificar código
npm run typecheck        # Verificar tipos
```

## Troubleshooting

| Problema | Solución |
|---|---|
| Error de ESM en Node 20 | Usar Node 22 |
| Auth no funciona | Verificar `EXPO_PUBLIC_SUPABASE_ANON_KEY` |
| Realtime no conecta | Verificar que Realtime esté habilitado en Supabase |
| Seed falla | Ejecutar `npx supabase db push` primero |
