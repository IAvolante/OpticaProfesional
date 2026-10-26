import { isValidBrandThemeId } from './brandTheme';
import type { BrandThemeId } from '../types/optical.types';

/**
 * Configuración centralizada de entorno y datos reales relevados de
 * Óptica Profesional Salta (@opticaprofesionalsla / opticaprofesional.com.ar)
 * y SMART OPTICAL (B2B).
 */
export interface AppEnvConfig {
  readonly brandNameB2C: string;
  readonly brandNameB2B: string;
  readonly instagramHandle: string;
  readonly instagramUrl: string;
  readonly addressSalta: string;
  readonly businessHours: string;
  readonly landlinePhone: string;
  readonly cityAndProvince: string;
  readonly whatsappNumberB2C: string;
  readonly whatsappNumberB2B: string;
  readonly googleSheetsWebAppUrl: string;
  readonly metaPixelId: string;
  readonly clarityProjectId: string;
  readonly defaultTheme: BrandThemeId;
  readonly isDevelopment: boolean;
  readonly cacheTtlMinutes: number;
  readonly fetchTimeoutMs: number;
}

function readEnvString(key: string, fallback: string): string {
  const rawValue: unknown = import.meta.env[key];
  if (typeof rawValue === 'string' && rawValue.trim().length > 0) {
    return rawValue.trim();
  }
  return fallback;
}

const rawTheme = readEnvString('VITE_DEFAULT_BRAND_THEME', 'theme-clinical');

export const ENV_CONFIG: AppEnvConfig = {
  brandNameB2C: 'Óptica Profesional',
  brandNameB2B: 'SMART OPTICAL',
  instagramHandle: '@opticaprofesionalsla',
  instagramUrl: 'https://www.instagram.com/opticaprofesionalsla/',
  addressSalta: 'Dr. Adolfo Güemes 180 · Salta Capital',
  businessHours: 'Lun a Vie 9-13 y 17-20 hs · Sáb 9-13 hs',
  landlinePhone: '0387-4953596',
  cityAndProvince: 'Salta Capital, Argentina',
  whatsappNumberB2C: readEnvString('VITE_WHATSAPP_NUMBER_B2C', '5493875164050'),
  whatsappNumberB2B: readEnvString('VITE_WHATSAPP_NUMBER_B2B', '5493875164050'),
  googleSheetsWebAppUrl: readEnvString(
    'VITE_GOOGLE_SHEETS_WEBAPP_URL',
    'https://script.google.com/macros/s/AKfycbyMtqUv5aprawD7AacE_fPAcX8Fy5N7LpR_o3M5nCnscOXQ7-VZKH1L0gtuhiZhIt3I/exec'
  ),
  metaPixelId: readEnvString('VITE_META_PIXEL_ID', '1815663315407962'),
  clarityProjectId: readEnvString('VITE_CLARITY_PROJECT_ID', 'z3yioxauzm'),
  defaultTheme: isValidBrandThemeId(rawTheme) ? rawTheme : 'theme-clinical',
  isDevelopment: Boolean(import.meta.env.DEV),
  cacheTtlMinutes: 15,
  fetchTimeoutMs: 4500,
};
