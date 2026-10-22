import type { BrandThemeId, FontPairId } from '../types/optical.types';

/**
 * Definición de un preset visual del Design System.
 */
export interface BrandThemePreset {
  readonly id: BrandThemeId;
  readonly name: string;
  readonly shortLabel: string;
  readonly tagline: string;
  readonly description: string;
  readonly previewSwatches: readonly [string, string, string];
  readonly typographySummary: string;
}

export interface FontPairPreset {
  readonly id: FontPairId;
  readonly shortLabel: string;
  readonly name: string;
  readonly summary: string;
}

export const BRAND_THEME_STORAGE_KEY = 'optica_profesional_active_theme_v3';
export const FONT_PAIR_STORAGE_KEY = 'optica_profesional_active_font_pair_v1';

export const BRAND_THEME_PRESETS: readonly BrandThemePreset[] = [
  {
    id: 'theme-clinical',
    name: '1. Clínica Luminosa (Light)',
    shortLabel: '1. Clínica Luminosa',
    tagline: 'Estética médica luminosa (#F4F8FB, tarjetas blancas puras, #336699 y #99CC99)',
    description:
      'Superficie clínica luminosa (#F4F8FB) con tarjetas blancas puras, acentos #336699 y #99CC99, y tarjeta de Certificado en azul profundo.',
    previewSwatches: ['#F4F8FB', '#336699', '#99CC99'],
    typographySummary: 'Plus Jakarta Sans + DM Sans',
  },
  {
    id: 'theme-dark-glass',
    name: '2. Dark Glass Asesor (Dark PDF)',
    shortLabel: '2. Dark Glass Asesor',
    tagline: 'Estética nocturna premium inspirada en el cierre de PREGUNTAS.pdf (#0A111A)',
    description:
      'Fondo #0A111A, tarjetas glass oscuras #111C2A/90 con bordes sutiles, badge BENEFICIO EXCLUSIVO en verde esmeralda traslúcido y botón CTA blanco puro.',
    previewSwatches: ['#0A111A', '#111C2A', '#99CC99'],
    typographySummary: 'Outfit + Inter + Space Grotesk',
  },
] as const;

export const FONT_PAIR_PRESETS: readonly FontPairPreset[] = [
  {
    id: 'font-logo-match',
    shortLabel: 'Fuente A (Logo Match)',
    name: 'Plus Jakarta Sans + DM Sans',
    summary: 'Títulos en Plus Jakarta Sans + Cuerpo en DM Sans',
  },
  {
    id: 'font-tech-optical',
    shortLabel: 'Fuente B (Tech Optical)',
    name: 'Outfit + Inter + Space Grotesk',
    summary: 'Títulos en Outfit + Cuerpo en Inter + Precios en Space Grotesk',
  },
  {
    id: 'font-boutique-editorial',
    shortLabel: 'Fuente C (Boutique Editorial)',
    name: 'Fraunces + Plus Jakarta Sans',
    summary: 'Títulos en Fraunces (Serif moderna) + Cuerpo en Plus Jakarta Sans',
  },
] as const;

export function isValidBrandThemeId(value: unknown): value is BrandThemeId {
  return (
    value === 'theme-clinical' ||
    value === 'theme-dark-glass' ||
    value === 'theme-neutral' ||
    value === 'theme-boutique'
  );
}

export function isValidFontPairId(value: unknown): value is FontPairId {
  return (
    value === 'font-logo-match' ||
    value === 'font-tech-optical' ||
    value === 'font-boutique-editorial'
  );
}

export function getBrandThemePreset(themeId: BrandThemeId): BrandThemePreset {
  const found = BRAND_THEME_PRESETS.find((preset) => preset.id === themeId);
  if (found) {
    return found;
  }
  return BRAND_THEME_PRESETS[0] as BrandThemePreset;
}
