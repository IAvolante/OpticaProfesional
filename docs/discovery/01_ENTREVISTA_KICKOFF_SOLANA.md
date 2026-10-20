# 01. Guía de Entrevista de Kickoff — Solana (Óptica Profesional & SMART OPTICAL)

**Objetivo de la sesión:** Alinear las reglas clínicas y comerciales de mostrador con el motor determinístico del cotizador digital para **Óptica Profesional (B2C)** y sentar las bases operativas de **SMART OPTICAL (B2B)** en Salta, Argentina.

---

## BLOQUE 1: Identidad de Marca & Posicionamiento Visual
> *Durante este bloque abriremos el prototipo interactivo en vivo y usaremos el widget `ThemeSwitcherDev` para comparar en tiempo real las 3 direcciones estéticas (`Neutral`, `Boutique`, `Clinical`).*

1. **Personalidad de Óptica Profesional (B2C):**
   - Cuando un paciente entra al local en Salta o ve una historia en Instagram, ¿qué sensación queremos transmitir primero?
     - *Opción A (Boutique / Editorial):* Calidez, asesoramiento estético personalizado, cuidado de imagen y cercanía (Tonos crema, blush, rubí, tipografía con serifas elegantes).
     - *Opción B (Clínica de Alta Precisión):* Especialización óptica, tecnología digital en cristales, salud visual y exactitud técnica (Blanco óptico, azul cobalto, gris titanio).
     - *Opción C (Híbrida):* Estructura clínica limpia con acentos cálidos de marca.
2. **Diferenciación B2C vs. B2B (SMART OPTICAL):**
   - ¿SMART OPTICAL compartirá paleta cromática con Óptica Profesional o tendrá identidad visual independiente (ej. estética industrial/laboratorio para ópticas clientes)?
3. **Tono de Comunicación:**
   - ¿Hablamos de "vos" cercano y pedagógico o un tono más institucional?
   - ¿Cómo llaman habitualmente en el mostrador a los cristales? (ej. *"Cristales con filtro azul"* vs. *"Blue Cut / Blue Light"*, *"Fotocromáticos"* vs. *"Transitions"*).

---

## BLOQUE 2: Reglas de Mostrador (Árbol de Decisión de Cristales)
> *Objetivo: Traducir exactamente las preguntas que Solana y su equipo hacen en el mostrador al árbol `src/data/questions.data.ts`.*

1. **Pregunta 1 — Necesidad / Tipo de Visión:**
   - Cuando el cliente NO sabe leer su receta, ¿qué preguntas le hacen para saber si necesita **Monofocal (Visión Sencilla)**, **Bifocal** o **Multifocal / Progresivo**?
   - ¿Ofrecemos cotización directa para quienes buscan **Descanso Visual sin graduación (Neutros con Blue Cut)**?
2. **Pregunta 2 — Exposición a Pantallas Digitales:**
   - ¿A partir de cuántas horas frente a PC/celular recomiendan pasar de un Antirreflex tradicional a un **Filtro de Luz Azul (Blue Cut)**?
   - ¿Tienen dos niveles de filtro azul (ej. estándar vs. premium/digital) o una línea principal?
3. **Pregunta 3 — Exposición Exterior / Conducción / Sol:**
   - ¿Qué perfil de cliente dispara la recomendación de **Fotocromáticos**?
   - Si el cliente maneja mucho en ruta/ciudad en Salta (alta radiación UV), ¿qué le recomiendan como primera opción y qué como alternativa (ej. Fotocromático vs. Sol con graduación / Polarizado)?
4. **Pregunta 4 — Magnitud de Graduación / Estética de Espesor:**
   - Para graduaciones medias o altas (donde el cristal común queda grueso o pesado), ¿cuándo recomiendan **Policarbonato (1.59)** y cuándo **Alto Índice (1.67)**?
   - ¿Recomiendan Policarbonato siempre para armazones ranurados (semi al aire) o montados al aire por resistencia al impacto?
5. **Estrategia de Doble Recomendación (`primaryOption` vs `alternativeOption`):**
   - En la pantalla de resultado mostramos la **Recomendación Ideal (Principal)** y una **Alternativa / Upgrade Inteligente**.
   - Ejemplo a validar con Solana: Si el cliente pide un Monofocal con Blue Cut, ¿la alternativa debería ser la versión **Fotocromática + Blue Cut**, o la versión en **Policarbonato más delgado**?

---

## BLOQUE 3: Corte de Dioptrías — Rango Stock vs. Rango Laboratorio
> *Punto crítico comercial para evitar malentendidos de precio cuando el paciente envía la foto de su receta por WhatsApp.*

1. **Definición del Rango de Stock Estándar:**
   - En la lista de precios de facturación actual, ¿cuál es el corte exacto de dioptrías para que un cristal entre como **Stock**?
   - *Validar estándar habitual:* Esférico de `-4.00 a +4.00 D` (o `-6.00 a +4.00 D` según línea) con Cilíndrico (astigmatismo) hasta `-2.00 D`.
2. **Transición a Rango Laboratorio (Tallado Especial):**
   - Cuando una receta supera el cilindro `-2.00 D` o la esfera de stock, o cuando es un **Multifocal / Progresivo** (que siempre requiere tallado de laboratorio):
     - ¿Mostramos ambos precios en el resultado web (*"Precio en Rango Stock"* y *"Precio Tallado de Laboratorio"*) con una nota explicativa clara?
     - ¿Qué demora estimada informamos para cristales de Stock (ej. 24-48 hs) vs. cristales de Laboratorio (ej. 5 a 10 días hábiles)?
3. **Política de Precios en Web:**
   - ¿Los precios mostrados en el cotizador son por el **par de cristales**? (Confirmar que todos los valores de la planilla expresen el par).
   - ¿Incluyen calibración/armado si el paciente trae su propio armazón, o el calibrado tiene un ítem aparte?

---

## BLOQUE 4: Formato del Mensaje de WhatsApp & Cierre en Mostrador
> *Objetivo: Que quien reciba el mensaje de WhatsApp tenga toda la radiografía del cliente lista para cerrar la venta.*

1. **Estructura del Mensaje Pre-armado (`whatsapp.encoder.ts`):**
   - Revisar si el siguiente resumen es óptimo para atención rápida:
     - Nombre del paciente y si ya cuenta con receta médica vigente.
     - Resumen de sus respuestas (Distancia visual, Horas de pantalla, Sensibilidad al sol, Graduación estimada).
     - Cristal principal cotizado + Código SKU + Precio Stock / Precio Laboratorio informados en pantalla.
     - Llamado a la acción final: *"Te adjunto foto de mi receta para confirmar si entra en rango Stock o Laboratorio"*.
2. **Derivación y Horarios:**
   - ¿A qué número único de WhatsApp Business derivamos los leads de B2C?
   - ¿Tienen respuestas rápidas o etiquetas en WhatsApp Business para clasificar a los pacientes que vienen desde el cotizador web?
3. **Obras Sociales, Prepagas y Medios de Pago:**
   - ¿Qué tarjetas, cuotas sin interés (ej. Plan Cuota Simple / Bancos locales en Salta) o descuentos por transferencia/efectivo debemos destacar junto al precio?
   - ¿Trabajan con reintegros de obras sociales mediante factura B/C?
