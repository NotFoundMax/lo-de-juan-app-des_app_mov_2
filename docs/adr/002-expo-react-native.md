# ADR-002: Expo + React Native

## Estado

Aceptado.

## Contexto

Necesitamos una solución que funcione en:
- Android
- iOS
- Web (versión básica para delivery / cocina)

## Decisión

Usaremos **React Native con Expo SDK 54**.

### Razones

| Criterio | Expo | React Native CLI |
|---|---|---|
| **Multiplataforma** | Android + iOS + Web (expo-router) | Android + iOS |
| **Setup inicial** | `npx create-expo-app` | Configuración manual con Metro |
| **Deploy** | EAS Build + App Store | Manual con Fastlane |
| **Over-the-air updates** | EAS Update | No nativo |
| **Librerías nativas** | Expo Modules + Dev Client | 100% control nativo |
| **Expo Router** | File-based routing (como Next.js) | React Navigation manual |

### Consecuencias

**Positivas:**
- Desarrollo más rápido con hot reload
- Expo Router simplifica la navegación
- Actualizaciones OTA sin pasar por App Store
- La web se obtiene gratis con expo-router

**Negativas:**
- Algunas librerías nativas requieren Dev Client (no Expo Go)
- Menos control sobre módulos nativos que CLI puro
- El bundle final puede ser más grande

**Neutral:**
- Compatible con NativeWind + Tailwind sin configuraciones extra
