# Troubleshooting — Web

## La app web no carga

| Síntoma | Causa | Solución |
|---|---|---|
| Pantalla en blanco | Error de JavaScript | Abrir Consola (F12 → Console) y ver el error. Reportar al admin. |
| "Module not found" | Dependencia faltante | `npm install` y reiniciar el servidor. |
| "Cannot read property of undefined" | Estado inválido | Recargar la página (F5). Si persiste, limpiar caché del navegador. |
| Carga infinita | Bucle de render | Limpiar localStorage y recargar. |

## Error de conexión

| Síntoma | Causa | Solución |
|---|---|---|
| "Failed to fetch" | CORS | Verificar que Supabase tenga configurado el origen de la web. |
| "NetworkError" | Servidor caído | Verificar que `npx expo start` esté corriendo. |
| Conexión rechazada | Puerto ocupado | Matar proceso anterior: `npx kill-port 8081` y reiniciar. |

## Pantalla

| Síntoma | Causa | Solución |
|---|---|---|
| Diseño roto | Responsive no adaptado | Hacer zoom a 100% (Ctrl+0). La app está optimizada para mobile. |
| Scroll horizontal | Overflow | Verificar tamaño de ventana. Mínimo 320px de ancho. |
| Imágenes no cargan | Storage URL incorrecta | Verificar `EXPO_PUBLIC_SUPABASE_URL` y las URLs de Storage. |

## Performance

| Síntoma | Causa | Solución |
|---|---|---|
| App lenta | Muchas re-renderizaciones | Cerrar otras pestañas pesadas. |
| POS lento al agregar items | Sin optimización | Usar modo incógnito (menos extensiones). |
| Mapas tardan en cargar | API Key sin bill | Verificar que la API Key de Google Maps tenga facturación habilitada. |

## Si nada funciona

```bash
# Limpiar todo
npx expo start -c
# Probar en modo incógnito
# Probar en otro navegador (Chrome / Edge / Firefox)
```
