# Lo de Juan 🐔

Aplicación móvil para la gestión de pedidos, punto de venta y delivery de una pollería en Lima, Perú. Desarrollada con React Native + Expo y Firebase como backend.

|                |                                                 |
| -------------- | ----------------------------------------------- |
| **Stack**      | React Native 0.81 + Expo SDK 54 + NativeWind v4 |
| **Backend**    | Firebase (Auth + Firestore)                     |
| **Navegación** | Expo Router (file-based routing)                |
| **Lenguaje**   | TypeScript                                      |
| **Pagos**      | Yape · Tarjeta · Efectivo                       |

---

## Descripción del proyecto

"Lo de Juan" es una app multiplataforma (Android, iOS, Web) que centraliza tres flujos principales:

- **Clientes:** exploran el menú, agregan productos al carrito y realizan pedidos con entrega a domicilio, recojo en tienda o consumo en mesa. Pagan con Yape, tarjeta o efectivo.
- **Empleados:** gestionan comandas de cocina, actualizan el estado de los pedidos y acceden al módulo de capacitación.
- **Administradores:** operan el punto de venta (POS), administran productos, categorías y usuarios, y supervisan todos los pedidos.

El sistema soporta **3 sucursales** en Lima (Los Olivos, San Miguel, Surco) y adapta la navegación automáticamente según el rol del usuario autenticado.

---

## Tecnologías utilizadas

| Tecnología              | Versión  | Propósito                            |
| ----------------------- | -------- | ------------------------------------ |
| React Native            | 0.81.5   | Framework principal                  |
| Expo                    | ~54.0.34 | Entorno de desarrollo y build        |
| Expo Router             | ~6.0.23  | Navegación file-based (Stack + Tabs) |
| NativeWind              | ^4.2.5   | Estilos con Tailwind CSS             |
| Firebase                | ^12.14.0 | Auth + Firestore (base de datos)     |
| TypeScript              | ~5.9.2   | Tipado estático                      |
| react-native-reanimated | ~4.1.1   | Animaciones                          |
| react-native-chart-kit  | ^6.12.3  | Gráficas de métricas                 |

---

## Requisitos previos

Antes de ejecutar el proyecto, asegúrate de tener instalado:

- [Node.js](https://nodejs.org/) v18 o superior
- [npm](https://www.npmjs.com/) v9 o superior (viene con Node)
- [Expo CLI](https://docs.expo.dev/get-started/installation/) — instalar globalmente:
  ```bash
  npm install -g expo-cli
  ```
- [Expo Go](https://expo.dev/go) en tu dispositivo Android o iOS (para probar en físico)
- Opcionalmente: [Android Studio](https://developer.android.com/studio) o Xcode para emuladores

---

## Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/NotFoundMax/lo-de-juan.git
cd lo-de-juan
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar Firebase

El proyecto usa Firebase. Las credenciales ya están configuradas en `src/services/firebase.ts`. Si necesitas conectar tu propio proyecto Firebase:

1. Crea un proyecto en [Firebase Console](https://console.firebase.google.com/)
2. Habilita **Authentication** (Email/Password)
3. Habilita **Firestore Database**
4. Reemplaza las credenciales en `src/services/firebase.ts`

---

## Ejecución

### Iniciar el servidor de desarrollo

```bash
npx expo start
```

Se abrirá el menú de Expo en la terminal. Desde ahí puedes:

| Tecla       | Acción                                |
| ----------- | ------------------------------------- |
| `a`         | Abrir en emulador Android             |
| `i`         | Abrir en simulador iOS (solo macOS)   |
| `w`         | Abrir en navegador web                |
| Escanear QR | Abrir en Expo Go (dispositivo físico) |

### Ejecutar directamente en Android

```bash
npx expo start --android
```

### Ejecutar directamente en iOS

```bash
npx expo start --ios
```

### Ejecutar en web

```bash
npx expo start --web
```

---

## Credenciales de prueba

Para probar la app sin registrarte, puedes usar estas cuentas de demostración:

| Rol           | Email                | Contraseña  |
| ------------- | -------------------- | ----------- |
| Administrador | admin@lodjuan.com    | 123456      |
| Empleado      | empleado@lodjuan.pe  | 123456      |
| Cliente       | cliente@lodjuan.pe   | 123456      |

> Si las cuentas no existen aún en tu instancia Firebase, regístrate con cualquier email y luego cambia el campo `role` en Firestore a `admin`, `employee` o `customer`.

---

## Estructura del proyecto

```
lo-de-juan/
├── app/                        # Pantallas (Expo Router)
│   ├── (auth)/                 # Login y registro
│   ├── (tabs)/                 # Navegación principal por tabs
│   │   ├── index.tsx           # Home / Menú del cliente
│   │   ├── pos.tsx             # Punto de venta (admin)
│   │   ├── pedidosAdmin.tsx    # Gestión de comandas
│   │   ├── pedidosCustomer.tsx # Mis pedidos (cliente)
│   │   ├── capacitacion.tsx    # Módulo de capacitación
│   │   ├── perfil.tsx          # Perfil de usuario
│   │   └── admin/              # Panel de administración
│   ├── carrito.tsx             # Modal de carrito
│   ├── pago-yape.tsx           # Flujo de pago con Yape
│   ├── pago-tarjeta.tsx        # Flujo de pago con tarjeta
│   └── pago-exitoso.tsx        # Confirmación de pedido
├── src/
│   ├── components/             # Componentes reutilizables
│   │   ├── pos/                # Componentes del POS
│   │   └── orders/             # Componentes de órdenes
│   ├── contexts/               # Estado global (React Context)
│   │   ├── AuthContext.tsx     # Autenticación y roles
│   │   ├── CarritoContext.tsx  # Carrito de compras
│   │   └── DeliveryContext.tsx # Datos de delivery
│   ├── services/               # Llamadas a Firebase
│   │   ├── auth.ts
│   │   ├── productos.ts
│   │   ├── pedidos.ts
│   │   ├── categorias.ts
│   │   └── capacitacion.ts
│   ├── constants/              # Colores, tipografía, roles
│   └── data/                   # Datos estáticos (sucursales)
├── assets/images/              # Imágenes y recursos
├── docs/                       # Documentación del proyecto
└── app.json                    # Configuración de Expo
```

---

## Funcionalidades principales

### Para clientes

- Catálogo de productos por categoría con imágenes y precios
- Carrito con badge de cantidad y ajuste de ítems
- Modalidades de pedido: **recoger en tienda**, **delivery** o **en mesa**
- Pago con **Yape**, **tarjeta** o **efectivo**
- Historial de pedidos propios con estado en tiempo real

### Para empleados

- Vista de comandas activas con temporizador
- Actualización de estado: pendiente → preparando → listo → entregado
- Módulo de capacitación con materiales de la empresa

### Para administradores

- **POS** completo con búsqueda, filtro por categoría y checkout
- Gestión de pedidos con filtros por estado y tipo
- CRUD de productos (con imágenes, stock y precio)
- CRUD de categorías
- Gestión de usuarios y roles
- Creación y edición de cursos de capacitación

---

## Documentación adicional

```
docs/
├── index.md                    # Mapa de la documentación
├── architecture/               # Arquitectura y modelo de datos
├── flows/                      # Flujos de usuario por rol
├── guides/                     # Guías de setup por rol
├── api/                        # Reglas y triggers de Firestore
├── adr/                        # Decisiones técnicas (ADRs)
├── runbooks/                   # Guías de troubleshooting
└── Prueba de Usabilidad.md     # Resultados de pruebas UX
```

---

## Integrantes del equipo

| Nombre            | Rol           |
| ----------------- | ------------- |
| Max García Campos | Desarrollador |
| Erick Nogales     | Desarrollador |

---

## Institución

**IDAT — Escuela de Tecnología**
Unidad didáctica: Desarrollo de Aplicaciones Móviles 2
