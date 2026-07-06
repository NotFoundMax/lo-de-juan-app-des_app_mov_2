# Prueba de Usabilidad — Lo de Juan

## 1. Información General

| Campo         | Valor                                    |
|---------------|------------------------------------------|
| **App**       | Lo de Juan (Pollería)                    |
| **Versión**   | 1.0.0 (prototipo interactivo HTML)       |
| **Plataforma**| Android / iOS (React Native + Firebase)  |
| **Fecha**     | 05/07/2026                               |
| **Lugar**     | IDAT - Sede Principal                    |
| **Evaluador** | Max García Campos & Erick Nogales |
| **Metodología**| Prueba moderada presencial, observación directa |

---

## 2. Objetivos

- Evaluar qué tan intuitivo es el flujo completo de pedido: login → elegir plato → pagar → seguimiento
- Detectar puntos de fricción en la navegación entre pantallas
- Validar que las secciones secundarias (capacitación, perfil, admin) sean accesibles y comprensibles
- Obtener retroalimentación sobre la interfaz para aplicar mejoras antes del despliegue final

---

## 3. Participantes

| # | Nombre             | Edad | Ocupación        | Experiencia con apps delivery |
|---|--------------------|------|------------------|-------------------------------|
| 1 | Max García Campos  | 22   | Estudiante IDAT  | Usa Rappi/PedidosYa 1-2 veces/semana |
| 2 | Erick Nogales      | 23   | Estudiante IDAT  | Usa apps delivery ocasionalmente    |

---

## 4. Tareas Evaluadas

| ID  | Tarea                                                  | Flujo completo                         |
|-----|--------------------------------------------------------|----------------------------------------|
| T1  | Iniciar sesión con número de teléfono y código de verificación | Login → ingreso de código → home    |
| T2  | Explorar categorías, elegir un plato y agregarlo al carrito  | Home → categoría → plato → + Agregar  |
| T3  | Ir al carrito, ajustar cantidades y proceder al pago         | Carrito → qty → checkout              |
| T4  | Seleccionar Yape como método de pago y completar el pedido   | Checkout → seleccionar Yape → pagar   |
| T5  | Revisar el pedido activo y ver el detalle con la línea de tiempo | Pedidos → order card → timeline       |
| T6  | Entrar a Capacitación desde el perfil y abrir un material    | Perfil → Capacitación → ver material   |

---

## 5. Métricas

| Métrica              | Cómo se mide                                               |
|----------------------|------------------------------------------------------------|
| **Tasa de éxito**    | ¿Completó la tarea sin ayuda del moderador? (Sí / No)      |
| **Tiempo por tarea** | Segundos desde que se indica la tarea hasta que se completa |
| **Dificultad percibida** | Escala 1 (muy fácil) a 5 (muy difícil) — lo pregunta el evaluador al final de cada tarea |
| **Clics extra**      | Navegó directo o dio vueltas innecesarias                  |
| **Satisfacción general** | Encuesta rápida al final: 1 a 5                          |

---

## 6. Resultados por Tarea

### Max García Campos

| Tarea | Éxito  | Tiempo | Dificultad (1-5) | Observaciones |
|-------|--------|--------|------------------|---------------|
| T1    | **Sí** | 25s    | 1                | Código llegó automáticamente, sin problemas |
| T2    | **Sí** | 40s    | 2                | Tocó la imagen del plato antes que el botón "+" |
| T3    | **Sí** | 35s    | 2                | Dudó un momento al buscar cómo cambiar cantidad |
| T4    | **Sí** | 55s    | 3                | Preguntó si el QR de Yape era real o simulado |
| T5    | **Sí** | 30s    | 1                | Encontró el pedido y la línea de tiempo sin ayuda |
| T6    | **Sí** | 45s    | 3                | Buscó "Capacitación" en la tab bar, no en Perfil |

### Erick Nogales

| Tarea | Éxito  | Tiempo | Dificultad (1-5) | Observaciones |
|-------|--------|--------|------------------|---------------|
| T1    | **Sí** | 30s    | 1                | Sin contratiempos, flujo claro |
| T2    | **Sí** | 50s    | 2                | También tocó la imagen; demoró más buscando el botón |
| T3    | **Sí** | 40s    | 2                | Encontró los controles +/− sin ayuda externa |
| T4    | **Sí** | 60s    | 3                | Dudó si debía abrir Yape aparte; leyó instrucciones |
| T5    | **Sí** | 25s    | 1                | Navegación intuitiva, tocó la tarjeta directo |
| T6    | **Sí** | 50s    | 3                | Misma confusión — esperaba un tab dedicado |

---

## 7. Ejemplos de situaciones esperadas (editar con resultado real)

### T1 — Login
- **Esperado:** El usuario toca el campo de teléfono (ya prellenado), presiona "Continuar", ingresa el código de 6 dígitos y presiona "Verificar".
- **Posible problema:** No nota que el código se va escribiendo solo con el teclado numérico, intenta copiar y pegar.
- **Resultado real:** Ambos participantes completaron el login sin asistencia. El código de verificación se autocompletó correctamente al escribir los 6 dígitos. Ninguno intentó copiar y pegar.

### T2 — Agregar plato al carrito
- **Esperado:** Desde el home ve las categorías, toca "Pollos a la Brasa" o va directo a la grilla de platos destacados, elige "1/4 Pollo a la Brasa", presiona "+ Agregar".
- **Posible problema:** Confunde las tarjetas de categorías con los platos destacados; intenta tocar el ícono y no el botón "Agregar".
- **Resultado real:** Ambos participantes intentaron tocar la imagen o el nombre del plato para agregarlo al carrito, en vez del botón "+". Esto confirmó que la zona clickeable debía ampliarse a toda la tarjeta.

### T3 — Carrito y checkout
- **Esperado:** Toca el tab "Carrito", ve los items con sus cantidades, ajusta si quiere, toca "Proceder al pago".
- **Posible problema:** No encuentra el botón de proceder porque está abajo del pliegue; no se da cuenta que puede cambiar cantidades.
- **Resultado real:** Max dudó al buscar cómo cambiar cantidades; Erick encontró los controles +/− por exploración. El botón "Proceder al pago" fue visible para ambos sin necesidad de scroll.

### T4 — Pago con Yape
- **Esperado:** En checkout ve las opciones de pago, Yape está seleccionado por defecto, toca "Pagar con Yape", ve el QR, toca "Ya pagué con Yape".
- **Posible problema:** Pregunta si tiene que abrir Yape de verdad; no entiende que es una simulación.
- **Resultado real:** Ambos preguntaron si el QR era funcional o una simulación. Se añadió un texto aclaratorio "Simulación de pago" y el botón "Ya pagué con Yape" se rediseñó con mayor énfasis visual.

### T5 — Estado del pedido
- **Esperado:** Toca el tab "Pedidos", ve la lista de pedidos activos, toca el primero #LDJ-2847, ve la línea de tiempo con 4 estados.
- **Posible problema:** No asocia que tocar la tarjeta del pedido abre el detalle; espera un botón "Ver detalle".
- **Resultado real:** Sin problemas. Ambos tocaron la tarjeta del pedido intuitivamente y navegaron la línea de tiempo sin ayuda.

### T6 — Capacitación
- **Esperado:** Toca "Perfil", toca "Capacitación", toca "Preparación del pollo", lee el contenido y ve el progreso.
- **Posible problema:** No encuentra la entrada a capacitación porque está dentro de "Perfil" y no como tab principal.
- **Resultado real:** Ambos buscaron inicialmente "Capacitación" como un tab independiente en la barra inferior. Al no verlo, exploraron hasta encontrarlo dentro de Perfil. Se confirmó la necesidad de hacerlo más accesible.

---

## 8. Problemas Encontrados

| # | Problema | Gravedad | Tarea | Solución propuesta |
|---|----------|----------|-------|-------------------|
| 1 | El usuario intenta tocar la imagen del plato para agregarlo, no el botón "+" | ● Media | T2 | Hacer toda la tarjeta del producto clickeable (TouchableOpacity en el contenedor) |
| 2 | No es evidente que se pueden cambiar cantidades en el carrito | ● Baja | T3 | Agregar controles +/− con texto visible en cada ítem |
| 3 | Confusión si el QR de Yape es real o simulación | ● Media | T4 | Agregar texto "Simulación de pago" y hacer más prominente el botón "Ya pagué" |
| 4 | Capacitación oculta dentro de Perfil, no se encuentra a primera vista | ● Alta | T6 | Agregar tab dedicado de Capacitación en la barra inferior para empleados y admins |

> **Gravedad:** ● Alta (impide completar) / ● Media (frustra pero lo logra) / ● Baja (detalle cosmético)

### Ejemplos de problemas típicos (editar según resultados reales)

- **● Medio** — El usuario intentó tocar la imagen del plato para agregarlo, en vez del botón "Agregar". *Solución: Hacer toda la tarjeta clickeable.*
- **● Bajo** — No notó que podía cambiar cantidades en el carrito. *Solución: Agregar un texto "Toca para ajustar".*
- **● Medio** — Dudó al elegir método de pago porque Yape ya aparecía seleccionado. *Solución: Añadir un check visible más grande.*
- **● Alto** — No encontró la sección Capacitación porque está dentro de Perfil. *Solución: Agregar un acceso directo en la pantalla de inicio o un tab.*

---

## 9. Mejoras Aplicadas

| # | Problema | Antes | Después | Evidencia |
|---|----------|-------|---------|-----------|
| 1 | Tarjeta de producto con zona clickeable limitada al botón | Solo el botón "+Agregar" respondía al toque | Toda la tarjeta es presionable (TouchableOpacity en contenedor) | Captura 1a / 1b |
| 2 | Sin indicación visual de cantidad editable | Solo números estáticos | Controles +/− visibles con estilo y texto | Captura 2a / 2b |
| 3 | QR de Yape sin contexto | QR sin texto explicativo | Texto "Simulación de pago" + botón "Ya pagué" más grande | Captura 3a / 3b |
| 4 | Capacitación inaccesible desde la tab bar | Solo dentro de Perfil | Tab "Capacitación" visible en barra inferior para empleados/admins | Captura 4a / 4b |

---

## 10. Evidencia

### Capturas del prototipo navegado

> Las capturas del prototipo navegado se encuentran en la carpeta `docs/assets/pruebas-usabilidad/`. Incluyen pantallas del flujo completo: login, home, carrito, pago Yape, detalle de pedido y capacitación.

### Fotos de la sesión

> Las fotos de los participantes probando el prototipo están disponibles en `docs/assets/pruebas-usabilidad/fotos/`. Se tomaron durante la sesión del 05/07/2026 en las instalaciones de IDAT.

### Grabación (opcional)

> [Opcional: link a video si se grabó la sesión]

---

## 11. Conclusiones

### Resumen general

Los 2 participantes completaron las 6 tareas sin ayuda del moderador. El flujo principal (login → catálogo → carrito → pago) es intuitivo y lineal. Se identificaron 4 oportunidades de mejora, todas con solución implementada.

### Fortalezas detectadas

- El flujo login → catálogo → carrito → pago es lineal y los participantes lo recorrieron sin asistencia
- La línea de tiempo de pedidos es clara y permite seguir el estado sin confusión
- Los precios, cantidades y totales son fáciles de leer en todas las pantallas
- La navegación por tabs es familiar para los usuarios tipo (estudiantes que usan apps delivery)

### Debilidades detectadas

- La zona clickeable de las tarjetas de producto es solo el botón "+", no toda la tarjeta
- La sección de capacitación queda oculta dentro de Perfil y no se encuentra a primera vista
- El QR de Yape necesita contexto adicional para que el usuario entienda que es una simulación

### Recomendaciones

1. Hacer la tarjeta de producto completamente clickeable (TouchableOpacity en el contenedor)
2. Agregar tab de Capacitación en la barra inferior para empleados y admins
3. Añadir texto aclaratorio "Simulación de pago" en la pantalla de Yape
4. Agregar controles +/− visibles en el carrito para dejar clara la edición de cantidad

---

## 12. Satisfacción General

| Participante     | Puntaje (1-5) | Comentario |
|------------------|---------------|------------|
| Max García Campos| 4             | "La app se siente rápida, el pago con Yape es cómodo. Mejoraría que se pueda agregar al carrito tocando cualquier parte del plato." |
| Erick Nogales    | 4             | "Bien organizada, los colores de la pollería se ven bien. La capacitación debería estar más a la mano." |

---

## Cronograma

| Actividad                         | Fecha       | Estado                      |
|-----------------------------------|-------------|-----------------------------|
| Preparación del prototipo         | 05/07/2026  | ✅ Hecho                    |
| Prueba con Max García Campos      | 05/07/2026  | ✅ Hecho                    |
| Prueba con Erick Nogales          | 05/07/2026  | ✅ Hecho                    |
| Análisis de resultados            | 05/07/2026  | ✅ Hecho                    |
| Aplicación de mejoras al prototipo| 06/07/2026  | ✅ Hecho                    |
| Documentación final               | 06/07/2026  | ✅ Hecho                    |
