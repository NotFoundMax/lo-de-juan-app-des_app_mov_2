# Contribuir al proyecto

## Branch strategy

```
main          ← Producción. Solo merge desde dev.
  ↑
dev           ← Integración. Acá se juntan las features.
  ↑
feature/*     ← Tu trabajo. PR a dev.
```

## Flujo diario

```bash
# 1. Actualizar dev
git checkout dev
git pull origin dev

# 2. Crear rama
git checkout -b feature/mi-cambio

# 3. Trabajar y commitear
git add -A
git commit -m "tipo: descripción"

# 4. Subir
git push origin feature/mi-cambio
```

### Tipos de commit

| Tipo | Cuándo usarlo |
|---|---|
| `feat` | Nueva funcionalidad |
| `fix` | Corrección de bug |
| `docs` | Documentación |
| `refactor` | Cambio sin agregar funcionalidad |
| `style` | Formato, lint, estilos |
| `test` | Tests |
| `chore` | Configuración, dependencias |

## Pull Request

1. Título descriptivo: `feat: carrito con Yape y tarjeta`
2. Base: `dev` ← Compare: tu rama
3. Reviewers: mínimo 1 compañero
4. Checklist en la descripción:
   - [ ] Código funcional y probado
   - [ ] Build sin errores (`npx expo export`)
   - [ ] No rompe funcionalidad existente
   - [ ] Documentación actualizada si aplica

## Reglas

- `main` es sagrado. Solo se mergea desde `dev`.
- Nunca trabajes directo en `main` ni `dev`.
- Nunca mergees tu propio PR.
- Commits cortos y frecuentes (un cambio lógico por commit).
- Conflictos = responsabilidad de quien abrió el PR.
