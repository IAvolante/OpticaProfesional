# 04. Single Source of Truth (SSOT) — Definiciones Acordadas con el Cliente

> **Estado del Documento:** `HIDRATADO CON DATOS REALES DE @opticaprofesionalsla & opticaprofesional.com.ar`  
> **Última Actualización:** 14 de Octubre de 2026  
> **Propósito:** Centraliza los datos reales relevados de la presencia digital actual de **Óptica Profesional Salta** y las decisiones listas para validar con Solana.

---

## 1. Ficha Institucional y Comercial Relevada

| Parámetro | Valor Relevado y Configurado en el Código | Fuente / Estado |
| :--- | :--- | :--- |
| **Nombre Comercial B2C** | **Óptica Profesional Salta** | ✅ Verificado (`@opticaprofesionalsla`) |
| **Unidad Mayorista / Lab B2B** | **SMART OPTICAL** | ✅ Configurado |
| **Instagram Oficial** | [`@opticaprofesionalsla`](https://www.instagram.com/opticaprofesionalsla/) (848 seguidores) | ✅ Verificado |
| **Sitio Web Actual** | `https://opticaprofesional.com.ar/` | ✅ Relevado |
| **Dirección Física en Salta** | **Dr. Adolfo Güemes 180, Salta Capital** *(validar sucursal Mitre 498)* | ✅ Verificado |
| **Horarios de Atención** | **Lun a Vie: 9:00 a 13:00 y 17:00 a 20:00 hs · Sáb: 9:00 a 13:00 hs** | ✅ Verificado |
| **WhatsApp B2C (Ventas)** | **`5493875164050`** (`+54 9 387 516-4050`) | ✅ Extraído de su widget oficial |
| **Teléfono Fijo** | **`0387-4953596`** | ✅ Verificado |
| **Email Oficial** | `info@opticaprofesional.com.ar` | ✅ Verificado |
| **Meta Pixel ID Real** | **`1815663315407962`** | ✅ Extraído de `opticaprofesional.com.ar` |
| **Logo Oficial** | Descargado e integrado en `/public/logo-optica-profesional.png` | ✅ Activo en el Header Móvil |
| **Paleta Oficial Relevada** | **Teal Esmeralda (`#147A6E`) + Azul Marino (`#1A4B75`)** del logo + **Borgoña (`#A7144C`)** de su web | ✅ Calibrado en `theme-clinical` y `theme-boutique` |
| **Marcas de Cristales** | **Zeiss, Essilor, Novar** (Tallado en laboratorios digitales especializados) | ✅ Integrado |
| **Diferenciales Comerciales** | Convenios con **Obras Sociales, Mutuales, Sindicatos, Coseguro Integral y Pedidos del Interior** | ✅ Integrado |

---

## 2. Hallazgos Técnicos Críticos del Sitio Web Viejo (`opticaprofesional.com.ar`) para Mostrarle a Solana

Durante la auditoría técnica de su web actual en WordPress/WooCommerce detectamos **3 puntos críticos** que justifican al 100% la migración a esta nueva arquitectura React 19:
1. **Cotizador viejo bloqueado con contraseña:** La ruta actual `opticaprofesional.com.ar/producto/cristales/` figura como *"Protegido: Cotizá tus cristales"*, impidiendo que los pacientes de Instagram coticen libremente.
2. **Inyección de Spam SEO en `/convenios/`:** El meta-description de su página actual `/convenios/` en WordPress sufrió una inyección de texto spam de casinos (`pinupmosbet az1win...`), lo cual daña el posicionamiento en Google y la reputación del dominio.
3. **Dependencias obsoletas (jQuery 1.11 del año 2014):** El sitio viejo carga librerías de hace 10 años no pensadas para el navegador interno de Instagram en smartphones modernos.

---

## 3. Matriz de Cristales y Cortes de Dioptrías (Stock vs. Laboratorio)

| SKU | Nombre Comercial en Web | Familia | Índice | Precio Par Rango Stock (ARS) | Precio Par Rango Lab (ARS) | Corte Exacto de Rango Stock |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `DESC-BLUE-156` | Cristales Descanso Digital Blue Cut | `DESCANSO` | `1.56` | `$54.000` | `$89.000` | Neutro a Esf `±2.00 D` / Cil `-1.50 D` |
| `MONO-AR-150` | Monofocal Orgánico Antirreflex | `MONOFOCAL` | `1.50` | `$48.000` | `$82.000` | Esf `±4.00 D` / Cil hasta `-2.00 D` |
| `MONO-BLUE-156` | Monofocal Digital Blue Cut Antirreflex | `MONOFOCAL` | `1.56` | `$68.000` | `$112.000` | Esf `±4.00 D` / Cil hasta `-2.00 D` |
| `MONO-PHOTO-156` | Monofocal Fotocromático + Blue Cut | `MONOFOCAL` | `1.56` | `$108.000` | `$165.000` | Esf `±4.00 D` / Cil hasta `-2.00 D` |
| `MONO-POLY-159` | Monofocal Policarbonato Ultraliviano + Blue Cut | `MONOFOCAL` | `1.59` | `$118.000` | `$178.000` | Esf `-6.00 a +4.00 D` / Cil hasta `-2.00 D` |
| `MONO-HI-167` | Monofocal Alto Índice 1.67 Extra Delgado | `MONOFOCAL` | `1.67` | `$164.000` | `$235.000` | Esf `-8.00 a +6.00 D` / Cil hasta `-2.00 D` |
| `MULTI-DIG-156` | Multifocal Progresivo Digital HD + Blue Cut | `MULTIFOCAL` | `1.56` | `$195.000` *(Base)* | `$268.000` *(Tallado Freeform)* | Tallado Digital Personalizado |
| `MULTI-PHOTO-159` | Multifocal Progresivo Digital Policarbonato + Foto | `MULTIFOCAL` | `1.59` | `$255.000` *(Base)* | `$340.000` *(Tallado Freeform)* | Tallado Digital Personalizado |
