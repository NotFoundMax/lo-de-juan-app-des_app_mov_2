# ADR-003: NativeWind + Tailwind CSS

## Estado

Aceptado.

## Contexto

Necesitamos un sistema de estilos que sea:
- Consistente entre Android, iOS y Web
- Fácil de mantener
- Productivo para el equipo

## Decisión

Usaremos **NativeWind v4** con **Tailwind CSS v3** para los estilos.

### Razones

| Criterio | NativeWind + Tailwind | StyleSheet (RN puro) | Styled Components |
|---|---|---|---|
| **Curva de aprendizaje** | Baja (si conocen Tailwind) | Media | Media |
| **Consistencia** | Design system con tokens | Manual | Theme Provider |
| **Velocidad de desarrollo** | Alta (utility-first) | Media | Media |
| **Web** | Compatible (React Native Web) | Limitado | Compatible |
| **Tema oscuro** | `dark:` variant nativo | Manual | Manual |

### Consecuencias

**Positivas:**
- Misma sintaxis que Tailwind web
- Design tokens (colores, espaciados) centralizados
- `dark:` mode sin esfuerzo adicional
- Clases condicionales con template literals

**Negativas:**
- Archivo `global.css` necesario para directivas Tailwind
- NativeWind compila las clases en build time
- Algunos estilos avanzados requieren `style` de React Native

**Neutral:**
- Compatible con Expo SDK 54
- Sin dependencias extra de runtime CSS
