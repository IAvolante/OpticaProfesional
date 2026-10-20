# Óptica Profesional (B2C) & SMART OPTICAL (B2B) — Salta, Argentina

Arquitectura escalable **Punto 0 (Etapa Discovery)** construida con **React 19 + TypeScript 5 (`strict: true`, `noUncheckedIndexedAccess: true`, cero `any`) + Tailwind CSS + Framer Motion**.

---

## Características de Ingeniería

1. **Design System de Tokens Semánticos CSS Conmutables en Vivo:**
   - Permite alternar en 1 clic durante la sesión de Discovery con Solana entre 3 propuestas estéticas (`theme-neutral`, `theme-boutique`, `theme-clinical`) mediante `ThemeSwitcherDev.tsx`.
2. **Motor Determinístico Puro (`calculateOpticalRecommendation`):**
   - Pondera distancia visual, exposición digital a pantallas, sensibilidad solar / conducción en Salta y magnitud de graduación para recomendar una opción principal (`primaryOption`) y un upgrade/alternativa (`alternativeOption`).
3. **Desglose Pedagógico de Precio Rango Stock vs. Rango Laboratorio:**
   - Explica de forma transparente el corte de dioptrías en Pesos Argentinos (`Intl.NumberFormat('es-AR')`).
4. **Integración Serverless con Google Sheets (`sheets.service.ts`):**
   - Estrategia **Cache-First** en `localStorage` con timeout controlado (`AbortController`) y fallback automático a `catalog.fallback.ts`.
5. **Embudo de Conversión WhatsApp + Meta Pixel:**
   - Generación de enlaces profundos tipados (`whatsapp.encoder.ts`) y telemetría automática de eventos `ViewContent`, `Lead` y `Contact` (`metaPixel.tracker.ts`).

---

## Comandos Rápidos

```bash
# Levantar servidor de desarrollo interactivo
npm run dev

# Verificar tipado estricto (tsc -b) y empaquetar para producción (vite build)
npm run build

# Ejecutar auditoría estática con ESLint (cero errores, cero any)
npm run lint
```
