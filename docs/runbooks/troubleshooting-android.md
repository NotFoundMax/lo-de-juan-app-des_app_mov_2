# Troubleshooting — Android

## La app no abre después de instalar

| Síntoma | Causa | Solución |
|---|---|---|
| Pantalla en blanco al abrir | Caché corrupto | Forzar cierre: Ajustes → Apps → Expo Go → Forzar detención. Volver a abrir. |
| "App not installed" | APK corrupto | Desinstalar y reinstalar la app. |
| Se cierra sola al iniciar | Error de JavaScript | Abrir Expo Go → Settings → Clear JS Bundle Cache → Reintentar. |

## Error de conexión

| Síntoma | Causa | Solución |
|---|---|---|
| "Network request failed" | Sin conexión a internet | Verificar datos móviles / WiFi. Si es WiFi, reiniciar router. |
| "Unable to connect" | Puerto bloqueado | Asegurar que el servidor de desarrollo está corriendo. |
| "Timeout" | Red lenta | Cambiar a datos móviles en vez de WiFi. |
| Expo Go no encuentra el servidor | No están en la misma red | El teléfono y la PC deben estar en la misma WiFi. |

## Problemas de pantalla

| Síntoma | Causa | Solución |
|---|---|---|
| Botones muy pequeños | DPI alto no soportado | La app usa NativeWind que se adapta automáticamente. Si persiste, reiniciar. |
| Keyboard cubre inputs | Sin ajuste de teclado | La app usa `KeyboardAvoidingView`. Verificar que no tengas teclado flotante. |
| Textos cortados | Font scale muy grande | Ajustes → Pantalla → Tamaño de fuente → Normal. |

## Rendimiento

| Síntoma | Causa | Solución |
|---|---|---|
| App lenta al navegar | Muchos productos en caché | Cerrar y volver a abrir la app. |
| GPS no funciona en delivery | Permiso desactivado | Ajustes → Apps → Lo de Juan → Permisos → Ubicación → Permitir. |
| Notificaciones no llegan | Permiso desactivado | Ajustes → Apps → Lo de Juan → Notificaciones → Permitir. |

## Si nada funciona

```bash
# Limpiar caché completo de Expo
npx expo start -c
```

O desinstalar Expo Go, reiniciar el teléfono y volver a instalar.
