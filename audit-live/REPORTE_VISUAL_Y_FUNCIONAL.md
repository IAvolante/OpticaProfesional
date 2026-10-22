# REPORTE DE AUDITORÍA VISUAL Y FUNCIONAL E2E (PLAYWRIGHT)

- **URL Auditada:** `https://iavolante.github.io/OpticaProfesional/`
- **Fecha de Ejecución:** `2026-10-22T19:25:57.320Z`
- **Motor y Viewport:** Chromium (Playwright) — `393x852px` (iPhone 14 Pro, `deviceScaleFactor: 2`)
- **Título del Documento:** `Óptica Profesional | Cotizador de Cristales`

---

## 1. Resumen Ejecutivo y Salud Técnica (Consola y Red)

| Métrica | Resultado | Detalle |
| :--- | :--- | :--- |
| **Errores de Consola (`console.error`)** | **0 errores** | Ningún error ni warning de React o TypeScript en tiempo de ejecución. |
| **Excepciones No Controladas (`pageerror`)** | **0 excepciones** | Transiciones de estado (`framer-motion`), selección múltiple y validación operan sin fallos. |
| **Peticiones de Red (`HTTP`)** | **0 fallos de assets** | HTML, bundle JS/CSS, fuentes Google Fonts (`Inter`, `DM Sans`, `JetBrains Mono`), logos PNG (`200 OK`) y los 3 videos generativos `.mp4` (`206 Partial Content`) cargaron íntegramente. *(Nota: las 2 entradas hacia `wa.me` fueron abortadas intencionalmente por el interceptor de prueba para evitar salir del dominio y capturar la URL exacta).* |
| **Arquitectura de Inicio Directo** | **Cumplido** | No existe pantalla de bienvenida ni botón "Inicio" en el Header; la aplicación abre directamente en el **Paso 1 de 5** con reproducción de video silenciosa (`muted`, `playsInline`, `loop`, sin controles de volumen). |

---

## 2. Estilos Computados e Identidad Visual (Edición 2026)

Valores extraídos directamente del DOM renderizado mediante `window.getComputedStyle`:

### Variables CSS Globales (`:root`)
- `--brand-primary`: `#336699` (`rgb(51, 102, 153)`) — Azul Profesional 2026
- `--brand-secondary`: `#99CC99` (`rgb(153, 204, 153)`) — Verde Salvia 2026
- `--brand-canvas`: `#f4f8fb` (`rgb(244, 248, 251)`) — Fondo clínico luminoso
- `--brand-surface`: `#ffffff` (`rgb(255, 255, 255)`) — Superficie de tarjetas

### Tipografía y Colores Base (`<body>`)
- `font-family`: `Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
- `background-color`: `rgb(244, 248, 251)` (`#f4f8fb`)
- `color`: `rgb(16, 35, 54)` (`#102336`)
- **Títulos (`<h1>`, `<h2>`, `<h3>`):** `DM Sans, Inter, sans-serif`, `font-weight: 700`, `font-size: 20px` (Mobile `393px`), `line-height: 25px` (`1.25`).
- **Badges y Precios (`font-mono`):** `JetBrains Mono, monospace`.

### Superficies y Bordes (`.glass-card` y Tarjetas Interactivas)
- **Tarjetas de Pasos 1 a 5:**
  - `background-color`: `color(srgb 1 1 1 / 0.9)` (`rgba(255, 255, 255, 0.9)`)
  - `border-color`: `color(srgb 0.855059 0.899922 0.941333)` (`#dae6f0`, `1px solid`)
  - `border-radius`: `16px` (`1rem`)
  - `box-shadow`: `rgba(15, 23, 42, 0.08) 0px 10px 30px -10px, rgba(255, 255, 255, 0.85) 0px 1px 0px 0px inset`
- **Tarjeta seleccionada (Estado Activo):**
  - `border-color`: `rgb(51, 102, 153)` (`#336699`) con anillo `rgba(153, 204, 153, 0.45)`
  - `background`: gradiente suave de `rgba(51, 102, 153, 0.06)` a `rgba(153, 204, 153, 0.14)`
- **Contenedor Principal de Cierre (Paso 6):**
  - `border-radius`: `24px` (`1.5rem`)
- **Certificado "Renová tus Cristales Gratis":**
  - `background`: `linear-gradient(135deg, #244b73 0%, #336699 58%, #4d8888 100%)`
  - `border`: `2px solid rgba(153, 204, 153, 0.45)`
  - `border-radius`: `16px`
- **Botón CTA Principal ("Quiero aprovechar mi beneficio"):**
  - `background-color`: `rgb(51, 102, 153)` (`#336699`)
  - `color`: `rgb(255, 255, 255)` (`#ffffff`)
  - `border-radius`: `12px`, `height: 54px`

---

## 3. Recorrido E2E Paso a Paso y Textos Renderizados

### Vista 00 y 01 — Estado Inicial y Paso 1 (`Material`)
- **Capturas:**
  - `./00_hero_inicio.png`
  - `./01_paso1_material.png`
- **Header:** Logo oficial horizontal `Óptica Profesional` (`height: 36px`, proporción intacta) + Badge `Paso 1 de 5`.
- **Barra de Progreso:** `01 Material` (activo) · `02 Solución` · `03 Prioridad` · `04 Beneficios` · `05 Receta` (`20%`).
- **Banner de Video:** `optical-hero-flow.mp4` (`autoplay`, `muted`, `loop`, `playsinline`, sin controles de audio) — Etiqueta: `Tecnología en Cristales · Óptica Profesional` / `PASO 01`.
- **Encabezado:**
  - Subtítulo: `PASO 1 DE 5 · MATERIAL Y MEJORA VISUAL` (`Tocá una opción`)
  - Pregunta: **`¿Qué es lo principal que querés mejorar con tus nuevos anteojos?`**
  - Ayuda: `Seleccioná el aspecto principal que querés lograr con tus nuevos cristales.`
- **Opciones Renderizadas:**
  1. `ORGÁNICO AR` — **Ver con mayor nitidez** — *Visión clara y definida eliminando los reflejos molestos de las luces.* (`Orgánico con Antirreflejo (AR)`)
  2. `ORGÁNICO BLUE AR` — **Sentir mayor comodidad visual cuando uso pantallas** — *Alivio frente al cansancio visual por uso de computadora, celular o tablet.* (`Filtro de Luz Azul + Antirreflejo`) **[Opción Seleccionada en el Test]**
  3. `ORGÁNICOS ALTO ÍNDICE (1.67 Y 1.74)` — **Tener cristales más finos y livianos** — *Reducción de espesor y peso para una estética superior en tu armazón.* (`Ultradelgados Índices 1.67 y 1.74`)
  4. `BIFOCAL Y MULTIFOCALES` — **Evitar cambiar de anteojos para distintas distancias** — *Ver bien de lejos, intermedia y cerca con un único par de anteojos.* (`Progresivos Multifocales y Bifocales`)
  5. `ORGÁNICO CON FILTRO O FOTOCROMÁTICO` — **Manejar mejor, reflejos o molestias del sol** — *Mayor confort al aire libre, reducción de encandilamiento y adaptación solar.* (`Filtro UV400 / Fotocromático Inteligente`)

---

### Vista 02 — Paso 2 (`Solución`)
- **Captura:** `./02_paso2_solucion.png`
- **Header Badge:** `Paso 2 de 5` (Progreso `40%`)
- **Banner de Video:** `optical-titanium-bluecut-flow.mp4` — Etiqueta: `Comodidad Visual en tu Rutina Diaria` / `PASO 02`.
- **Encabezado:**
  - Subtítulo: `PASO 2 DE 5 · TU RUTINA DIARIA` (`Tocá una opción`)
  - Pregunta: **`¿En qué actividades necesitás mayor comodidad visual?`**
  - Ayuda: `Contanos en qué momento del día sentís que más necesitás tus cristales.`
- **Opciones Renderizadas:**
  1. **Trabajando con la computadora o usando el celular.** — *Jornadas de oficina, estudio o uso continuo de dispositivos digitales.* (`Confort Digital y Enfoque Intermedio`) **[Opción Seleccionada en el Test]**
  2. **Leyendo o realizando tareas de cerca.** — *Lectura prolongada, estudio o actividades manuales de precisión.* (`Nitidez en Visión Próxima`)
  3. **Manejando o realizando actividades al aire libre.** — *Conducción en ciudad o ruta, exposición al sol y cambios de luz.* (`Protección Exterior y Antirreflejo Vial`)
  4. **En todas mis actividades diarias.** — *Uso permanente durante todo el día tanto en interiores como al salir.* (`Solución Integral para Todo el Día`)

---

### Vista 03 — Paso 3 (`Prioridad`)
- **Captura:** `./03_paso3_prioridad.png`
- **Header Badge:** `Paso 3 de 5` (Progreso `60%`)
- **Banner de Video:** `optical-photochromic-flow.mp4` — Etiqueta: `Calidad, Tecnología yMejor Precio` / `PASO 03`.
- **Encabezado:**
  - Subtítulo: `PASO 3 DE 5 · TU PRIORIDAD` (`Tocá una opción`)
  - Pregunta: **`¿Cuál es tu prioridad a la hora de elegir tus anteojos?`**
  - Ayuda: `Así personalizamos las 2 alternativas que mejor se ajustan a lo que buscás.`
- **Opciones Renderizadas:**
  1. `PRECIO` — **Encontrar un buen equilibrio entre calidad y precio** — *Busco cuidar mi presupuesto sin resignar calidad óptica ni durabilidad.* (`Mejor Relación Calidad / Precio`) **[Opción Seleccionada en el Test]**
  2. `TECNOLOGÍA` — **Priorizo cristales con las últimas tecnologías del mercado** — *Quiero la máxima protección visual, filtros avanzados y precisión digital.* (`Innovación y Tratamientos Premium`)
  3. `MODA` — **Que mis anteojos combinen con mi estilo y se vean bien estéticamente.** — *Priorizo cristales delgados, sin reflejos y con terminación estética impecable.* (`Estética, Delgadez y Transparencia`)
  4. `SOLUCIÓN` — **Resolver mi necesidad visual de forma práctica, sin complicaciones.** — *Quiero una recomendación clara, rápida y lista para usar cuanto antes.* (`Practicidad y Rapidez de Entrega`)

---

### Vista 04 — Paso 4 (`Beneficios` - Selección Múltiple)
- **Captura:** `./04_paso4_beneficios.png`
- **Header Badge:** `Paso 4 de 5` (Progreso `80%`)
- **Banner de Video:** `optical-hero-flow.mp4` — Etiqueta: `Obras Sociales · Cuotas · Beneficio Contado` / `PASO 04`.
- **Encabezado:**
  - Subtítulo: `PASO 4 DE 5 · BENEFICIOS PARA TU PRESUPUESTO` (`Podés elegir varias`)
  - Pregunta: **`¿Datos útiles para tu presupuesto?`**
  - Ayuda: `Podés seleccionar más de una opción para sumar todos tus beneficios en el cierre.`
- **Opciones Renderizadas:**
  1. `OBRA SOCIAL` — **Tengo obra social** — *Si está en nuestra lista de prestadores, contás con un armazón estándar sin cargo al venir a probártelo.* (`Beneficio Armazón Estándar Sin Cargo`) **[Seleccionada]**
  2. `PARTICULAR` — **Soy particular** — *Cotización directa con el precio más competitivo y entrega rápida.* (`Atención Directa Particular`)
  3. `CUOTAS` — **Me interesa conocer cuotas según mi tarjeta** — *Opciones de financiación en cuotas según tu tarjeta bancaria.* (`Financiación con Tarjeta`) **[Seleccionada]**
  4. `PAGO CONTADO` — **Beneficio pago contado** — *Bonificación especial abonando de contado en efectivo o transferencia.* (`Descuento Especial Contado`)
- **Botón de Avance Múltiple:** `Continuar con 2 opciones seleccionadas`

---

### Vista 05 — Paso 5 (`Receta`)
- **Captura:** `./05_paso5_receta.png`
- **Header Badge:** `Paso 5 de 5` (Progreso `100%`)
- **Banner de Video:** `optical-titanium-bluecut-flow.mp4` — Etiqueta: `Adjuntá tu Receta en 1 Toque` / `PASO 05`.
- **Encabezado:**
  - Subtítulo: `PASO 5 DE 5 · TU RECETA` (`Tocá una opción`)
  - Pregunta: **`¿Querés adjuntarnos tu receta?`**
  - Ayuda: `Si la tenés a mano, tocá para subir la foto ahora mismo y que se adjunte a tu consulta.`
- **Opciones Renderizadas:**
  1. `ADJUNTAR FOTO` — **Cargar la foto de la receta** — *Tocá acá para sacar una foto o elegirla de tu galería en un solo paso.* (`Subida Directa desde tu Celular`) — *(Dispara directamente el selector de archivos/cámara nativo al pulsar la tarjeta)*.
  2. `CONTINUAR SIN RECETA` — **Aún no la tengo** — *Ver directamente mis 2 opciones recomendadas y mi certificado de garantía de 12 meses.* (`Ver Resultado Ahora`) **[Seleccionada en el Test]**

---

### Vista 06 — Resultado Final y Cierre (`Asesor Virtual` + `Certificado 12 Meses`)
- **Captura:** `./06_resultado_cierre.png`
- **Header Badge:** `Tu Resultado`
- **Bloque 1 — Asesor Virtual:**
  - Encabezado: `Optica Profesional` / **`Asesor Virtual`**
  - Copy dinámico empático:
    > *"Por lo que nos contás, pasás muchas horas frente a la computadora o el celular y buscás mayor comodidad visual durante el día, sin gastar de más.*
    > *Por eso, seleccionamos dos alternativas que se adaptan a tu rutina, para que puedas elegir la que mejor se ajuste a lo que necesitás."*
- **Bloque 2 — Las 2 Alternativas Cotizadas (con Precios en Vivo):**
  - **OPCIÓN 1 (Seleccionada por defecto):**
    - Cristal: **Orgánico con antirreflejo**
    - Precio: **`$ 48.000`**
    - Subtítulo: *Práctica y conveniente*
  - **OPCIÓN 2:**
    - Cristal: **Orgánico Blue Cut AR**
    - Precio: **`$ 68.000`**
    - Subtítulo: *Con filtro adicional*
- **Píldoras de Beneficios Seleccionados en Paso 4:**
  - `Tengo obra social`
  - `Cuotas con tarjeta`
- **Acceso rápido a Receta:** Botón desplegable `¿Querés sumar foto de tu receta?`
- **Bloque 3 — Cupón / Certificado Diferencial:**
  - Badge: `BENEFICIO EXCLUSIVO`
  - Título: **`¡RENOVÁ TUS CRISTALES GRATIS!`**
  - Subtítulo: **Comprá hoy y tenés un recambio sin cargo durante los próximos 12 meses.**
  - Detalle legal/comercial: *Con la compra de tus anteojos con cristales incluidos, te llevás un certificado para realizar un recambio de cristales de la misma categoría y características, por única vez, dentro de los 12 meses posteriores a tu compra.*
  - Pie: *Beneficio personal, no transferible. Sujeto a las condiciones del certificado.*
- **Bloque 4 — Registro y Conversión a WhatsApp:**
  - Título: `Completá tu nombre y WhatsApp para activar tu certificado:`
  - Campos validados (con auto-scroll suave si se pulsa el botón sin completar):
    - `Tu Nombre y Apellido *` (Probado con: `Mariana Gómez`)
    - `Tu Número de WhatsApp *` (Probado con: `3875123456`)
  - CTA Principal: **`Quiero aprovechar mi beneficio`**

---

## 4. URL y Mensaje de WhatsApp Interceptado

Al completar los datos y hacer clic en **`Quiero aprovechar mi beneficio`**, la aplicación generó la siguiente URL exacta:

### URL Codificada (`window.open` / `location.href`)
```text
https://wa.me/5493875164050?text=Hola%20*%C3%93ptica%20Profesional*!%20Quiero%20aprovechar%20mi%20beneficio%20exclusivo%20del%20cotizador%20online.%0A%0A*CERTIFICADO%20BENEFICIO%20EXCLUSIVO%20%23OP-MF69R48*%0A*%C2%A1RENOV%C3%81%20TUS%20CRISTALES%20GRATIS!*%20(1%20recambio%20sin%20cargo%20durante%20los%20pr%C3%B3ximos%2012%20meses)%0A------------------------------------%0A*DATOS%20DEL%20CLIENTE*%0A-%20Nombre%3A%20*Mariana%20G%C3%B3mez*%0A-%20WhatsApp%3A%203875123456%0A%0A*ALTERNATIVAS%20COTIZADAS*%0A-%20*Opci%C3%B3n%201%20(Elegida)%3A*%20Org%C3%A1nico%20con%20antirreflejo%20%E2%80%94%20*%24%C2%A048.000*%20(Pr%C3%A1ctica%20y%20conveniente)%0A-%20*Opci%C3%B3n%202%3A*%20Org%C3%A1nico%20Blue%20Cut%20AR%20%E2%80%94%20*%24%C2%A068.000*%20(Con%20filtro%20adicional)%0A-%20*Cristal%20Seleccionado%3A*%20*Org%C3%A1nico%20con%20antirreflejo*%20(*%24%C2%A048.000*)%0A%0A*RESPUESTAS%20DEL%20ASESOR%20VIRTUAL*%0A1.%20Mejora%20principal%3A%20Sentir%20mayor%20comodidad%20visual%20cuando%20uso%20pantallas%20(ORG%C3%81NICO%20BLUE%20AR)%0A2.%20Actividad%20principal%3A%20Trabajando%20con%20la%20computadora%20o%20usando%20el%20celular%0A3.%20Prioridad%3A%20Equilibrio%20entre%20calidad%20y%20precio%20(PRECIO)%0A4.%20Datos%20para%20presupuesto%3A%20*Tengo%20obra%20social%20%2F%20Me%20interesa%20conocer%20cuotas%20seg%C3%BAn%20mi%20tarjeta*%0A5.%20Receta%3A%20*A%C3%BAn%20no%20tengo%20la%20receta*
```

### Mensaje Decodificado Enviado al WhatsApp de la Óptica (`+54 9 387 516-4050`)
```text
Hola *Óptica Profesional*! Quiero aprovechar mi beneficio exclusivo del cotizador online.

*CERTIFICADO BENEFICIO EXCLUSIVO #OP-MF69R48*
*¡RENOVÁ TUS CRISTALES GRATIS!* (1 recambio sin cargo durante los próximos 12 meses)
------------------------------------
*DATOS DEL CLIENTE*
- Nombre: *Mariana Gómez*
- WhatsApp: 3875123456

*ALTERNATIVAS COTIZADAS*
- *Opción 1 (Elegida):* Orgánico con antirreflejo — *$ 48.000* (Práctica y conveniente)
- *Opción 2:* Orgánico Blue Cut AR — *$ 68.000* (Con filtro adicional)
- *Cristal Seleccionado:* *Orgánico con antirreflejo* (*$ 48.000*)

*RESPUESTAS DEL ASESOR VIRTUAL*
1. Mejora principal: Sentir mayor comodidad visual cuando uso pantallas (ORGÁNICO BLUE AR)
2. Actividad principal: Trabajando con la computadora o usando el celular
3. Prioridad: Equilibrio entre calidad y precio (PRECIO)
4. Datos para presupuesto: *Tengo obra social / Me interesa conocer cuotas según mi tarjeta*
5. Receta: *Aún no tengo la receta*
```

---

## 5. Observaciones de Detalle Detectadas en la Auditoría

1. **Micro-typo en el subtítulo del video del Paso 3:** En el banner superior del Paso 3 se lee `"Calidad, Tecnología yMejor Precio"` (falta un espacio entre `y` y `Mejor` en `src/components/wizard/QuestionStep.tsx`).
2. **Proporción de Logos y Favicon:** Tanto el logo horizontal del Header (`126.78px × 36px`), el sello del footer (`98.61px × 28px`) como el favicon `1:1` (`favicon-64.png`) se ven nítidos y sin deformación circular.
