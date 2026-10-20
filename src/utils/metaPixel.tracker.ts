import { ENV_CONFIG } from '../config/env';

/**
 * Eventos estándar de conversión de Meta Pixel requeridos en el embudo óptico.
 */
export type MetaStandardEventName = 'ViewContent' | 'Lead' | 'Contact';

export interface MetaPixelEventPayload {
  readonly content_name: string;
  readonly content_category: string;
  readonly content_ids?: readonly string[];
  readonly value?: number;
  readonly currency?: 'ARS';
  readonly status?: string;
}

type FbqFunction = (
  command: 'track' | 'init',
  eventNameOrPixelId: string,
  params?: Record<string, string | number | readonly string[] | undefined>
) => void;

declare global {
  interface Window {
    fbq?: FbqFunction;
  }
}

/**
 * Dispara eventos de conversión hacia Meta Pixel de forma tipada y segura.
 * En entorno de desarrollo registra la telemetría de forma clara en consola.
 */
export function trackMetaPixelEvent(
  eventName: MetaStandardEventName,
  payload: MetaPixelEventPayload
): void {
  const normalizedParams: Record<string, string | number | readonly string[] | undefined> = {
    content_name: payload.content_name,
    content_category: payload.content_category,
    content_ids: payload.content_ids,
    value: payload.value,
    currency: payload.currency ?? 'ARS',
    status: payload.status,
  };

  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    try {
      window.fbq('track', eventName, normalizedParams);
    } catch {
      // Fallo silencioso ante bloqueadores de anuncios (AdBlock / Brave Shields)
    }
  }

  if (ENV_CONFIG.isDevelopment) {
    console.info(`[MetaPixel::${eventName}]`, normalizedParams);
  }
}
