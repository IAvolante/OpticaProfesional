import type { BrandThemeId, FontPairId } from '../types/optical.types';

/**
 * Definición de un preset visual del Design System (Fijado en Modo Light Clínica Luminosa).
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
  readonly optionNumber: number;
  readonly shortLabel: string;
  readonly name: string;
  readonly summary: string;
}

export const BRAND_THEME_STORAGE_KEY = 'optica_profesional_active_theme_v3';
export const FONT_PAIR_STORAGE_KEY = 'optica_profesional_active_font_pair_v2';

export const BRAND_THEME_PRESETS: readonly BrandThemePreset[] = [
  {
    id: 'theme-clinical',
    name: 'Clínica Luminosa (Light)',
    shortLabel: 'Clínica Luminosa',
    tagline: 'Estética médica luminosa (#F4F8FB, tarjetas blancas puras, #336699 y #99CC99)',
    description:
      'Superficie clínica luminosa (#F4F8FB) con tarjetas blancas puras, acentos #336699 y #99CC99, y tarjeta de Certificado en azul profundo.',
    previewSwatches: ['#F4F8FB', '#336699', '#99CC99'],
    typographySummary: 'Plus Jakarta Sans + DM Sans',
  },
] as const;

/**
 * 5 Opciones Tipográficas curadas para que Solana elija en vivo sobre el diseño Light:
 */
export const FONT_PAIR_PRESETS: readonly FontPairPreset[] = [
  {
    id: 'font-logo-match',
    optionNumber: 1,
    shortLabel: 'Fuente 1 · Logo Match',
    name: 'Plus Jakarta Sans + DM Sans',
    summary: 'Redondeada y cálida, idéntica al trazo del nuevo logo 2026',
  },
  {
    id: 'font-tech-optical',
    optionNumber: 2,
    shortLabel: 'Fuente 2 · Tech Optical',
    name: 'Outfit + Inter + Space Grotesk',
    summary: 'Geométrica moderna con números de alta precisión óptica',
  },
  {
    id: 'font-swiss-medical',
    optionNumber: 3,
    shortLabel: 'Fuente 3 · Clínica Suiza',
    name: 'Manrope + Inter',
    summary: 'Ultra limpia, minimalista y de máxima legibilidad médica',
  },
  {
    id: 'font-modern-atelier',
    optionNumber: 4,
    shortLabel: 'Fuente 4 · Vanguardia',
    name: 'Sora + DM Sans',
    summary: 'Contemporánea con personalidad tecnológica y fresca',
  },
  {
    id: 'font-boutique-editorial',
    optionNumber: 5,
    shortLabel: 'Fuente 5 · Boutique Editorial',
    name: 'Fraunces + Plus Jakarta Sans',
    summary: 'Títulos con serifa de autor y cuerpo geométrico limpio',
  },
] as const;

export function isValidBrandThemeId(value: unknown): value is BrandThemeId {
  return value === 'theme-clinical';
}

export function isValidFontPairId(value: unknown): value is FontPairId {
  return (
    value === 'font-logo-match' ||
    value === 'font-tech-optical' ||
    value === 'font-swiss-medical' ||
    value === 'font-modern-atelier' ||
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
