# Errores comunes

## Código

### Error: `ERR_UNSUPPORTED_ESM_URL_SCHEME`

```
Error [ERR_UNSUPPORTED_ESM_URL_SCHEME]: Error loading Metro config at: .../metro.config.js
Received protocol 'c:'
```

**Causa:** Node.js 20 no maneja correctamente rutas absolutas en Windows con módulos ESM.

**Solución:** Usar Node.js 22, o ejecutar con:

```bash
node node_modules/expo/bin/cli.js start -c
```

### Error: Firebase Auth sin AsyncStorage

```
You are initializing Firebase Auth for React Native without providing AsyncStorage.
```

**Causa:** Falta `@react-native-async-storage/async-storage`.

**Solución:**

```bash
npm install @react-native-async-storage/async-storage
npx expo start -c
```

### Error: `TypeError: Cannot read properties of null (reading 'data')`

**Causa:** El documento de Firestore/Postgres no existe o el usuario no tiene permisos.

**Solución:** Verificar que:
1. El documento existe en la BD
2. Las reglas de seguridad permiten la lectura
3. El usuario está autenticado

### Error: `UniqueViolation` en PostgreSQL

**Causa:** Se intentó insertar un email o código que ya existe.

**Solución:** Verificar que el dato es único. Si es un error de seed, reiniciar la BD.

## Base de datos

### Productos no visibles en el catálogo

**Causa:** Falta índice compuesto en Firestore, o los productos tienen `active = false`.

**Solución:**
1. Verificar que `active = true` en los productos
2. Crear el índice compuesto (ver `docs/api/firestore-indexes.md`)

### Las alertas de stock no aparecen

**Causa:** El trigger `deduct_stock` no está creado, o el stock no bajó del mínimo.

**Solución:**
1. Verificar que el trigger existe en la BD
2. Verificar que `stock <= min_stock` en algún producto
3. Verificar que hay usuarios con rol `admin` para recibir la notificación

### Los puntos de fidelización no se acumulan

**Causa:** El trigger `accrue_loyalty_points` no se ejecutó.

**Solución:**
1. Verificar que la orden cambió a estado `delivered`
2. Verificar que el trigger está activo
3. Verificar que el cliente tiene un documento en `loyalty_points`

## Pagos

### El QR de Yape/Plin no se genera

**Causa:** Error de conexión con la pasarela de pagos.

**Solución:**
1. Verificar que la API Key de la pasarela es correcta
2. Verificar que la Edge Function responde
3. Revisar logs de Supabase

### El webhook de pago no llega

**Causa:** La URL del webhook no es accesible desde internet.

**Solución:**
1. En desarrollo, usar ngrok para exponer el servidor local
2. Verificar que la Edge Function está desplegada
3. Configurar la URL correcta en el panel de la pasarela

### El pago con tarjeta falla

**Causa:** Tarjeta sin fondos, datos incorrectos o rechazo del banco.

**Solución:**
1. Verificar que la tarjeta tiene fondos suficientes
2. Verificar que los datos (número, fecha, CVV) son correctos
3. En sandbox, usar las tarjetas de prueba del proveedor

## Deploy

### El APK no se genera

**Causa:** Error en EAS Build.

**Solución:**
```bash
eas build --platform android --profile preview --clear-cache
```

### La actualización OTA no se aplica

**Causa:** La versión de la app en el celular no coincide con la actualización.

**Solución:**
1. Verificar que el canal de EAS Update es correcto
2. Cerrar y reabrir la app dos veces
3. Si persiste, reinstalar la app
