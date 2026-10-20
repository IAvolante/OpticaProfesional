import type { BrandThemeId } from '../types/optical.types';

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

export const BRAND_THEME_STORAGE_KEY = 'optica_profesional_active_theme_v2';

/**
 * 3 propuestas de diseño calibradas con la identidad real de @opticaprofesionalsla:
 * - theme-clinical: Identidad Oficial Logo (Teal Esmeralda #147A6E + Azul Marino Óptico #1A4B75)
 * - theme-boutique: Identidad Borgoña Web (#A7144C) + Crema Travertino (#FAF7F2) del video Google Flow
 * - theme-neutral: Wireframe limpio de ingeniería (Slate / Indigo)
 */
export const BRAND_THEME_PRESETS: readonly BrandThemePreset[] = [
  {
    id: 'theme-clinical',
    name: 'Identidad Logo Oficial (Teal & Azul Óptico)',
    shortLabel: 'Oficial',
    tagline: 'Colores exactos del isologo de Óptica Profesional Salta (#147A6E + #1A4B75)',
    description:
      'Integra el Verde Esmeralda Óptico (#147A6E) y Azul Profundo (#1A4B75) del logo oficial sobre cristal esmerilado.',
    previewSwatches: ['#F0FDF9', '#147A6E', '#1A4B75'],
    typographySummary: 'Plus Jakarta Sans + Inter',
  },
  {
    id: 'theme-boutique',
    name: 'Boutique Borgoña & Travertino',
    shortLabel: 'Boutique',
    tagline: 'Acento Borgoña (#A7144C de su web actual) + Crema cálido del video Flow',
    description:
      'Fusiona el tono Borgoña (#A7144C) característico de opticaprofesional.com.ar con la piedra travertino cálida (#FAF7F2).',
    previewSwatches: ['#FAF7F2', '#FCEEF2', '#A7144C'],
    typographySummary: 'Playfair Display + Plus Jakarta Sans',
  },
  {
    id: 'theme-neutral',
    name: 'Neutral Discovery (Smart Optical Lab)',
    shortLabel: 'Neutral',
    tagline: 'Estética minimalista Slate & Indigo para laboratorio B2B',
    description:
      'Paleta técnica neutra pensada para auditar jerarquía de información y uso mayorista en SMART OPTICAL.',
    previewSwatches: ['#F8FAFC', '#4F46E5', '#0F172A'],
    typographySummary: 'Inter + Plus Jakarta Sans',
  },
] as const;

export function isValidBrandThemeId(value: unknown): value is BrandThemeId {
  return (
    value === 'theme-neutral' ||
    value === 'theme-boutique' ||
    value === 'theme-clinical'
  );
}

export function getBrandThemePreset(themeId: BrandThemeId): BrandThemePreset {
  const found = BRAND_THEME_PRESETS.find((preset) => preset.id === themeId);
  if (found) {
    return found;
  }
  return {
    id: 'theme-clinical',
    name: 'Identidad Logo Oficial (Teal & Azul Óptico)',
    shortLabel: 'Oficial',
    tagline: 'Colores exactos del isologo de Óptica Profesional Salta (#147A6E + #1A4B75)',
    description:
      'Integra el Verde Esmeralda Óptico (#147A6E) y Azul Profundo (#1A4B75) del logo oficial sobre cristal esmerilado.',
    previewSwatches: ['#F0FDF9', '#147A6E', '#1A4B75'],
    typographySummary: 'Plus Jakarta Sans + Inter',
  };
}
