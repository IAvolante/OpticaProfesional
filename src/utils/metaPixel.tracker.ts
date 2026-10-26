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

type ClarityFunction = (
  command: 'set' | 'identify' | 'event',
  keyOrEvent: string,
  value?: string
) => void;

declare global {
  interface Window {
    fbq?: FbqFunction;
    clarity?: ClarityFunction;
  }
}

/**
 * Inicializa Microsoft Clarity (mapas de calor y grabaciones de sesión en video)
 * si `ENV_CONFIG.clarityProjectId` está configurado.
 */
export function initClarityHeatmaps(): void {
  const projectId = ENV_CONFIG.clarityProjectId;
  if (typeof window === 'undefined' || !projectId) {
    return;
  }

  if (
    typeof window.clarity === 'function' ||
    document.getElementById('ms-clarity-script')
  ) {
    return;
  }

  try {
    const script = document.createElement('script');
    script.id = 'ms-clarity-script';
    script.async = true;
    script.src = `https://www.clarity.ms/tag/${projectId}`;

    const win = window as unknown as Record<string, unknown>;
    if (typeof win['clarity'] !== 'function') {
      const clarityQueue: unknown[][] = [];
      const clarityFn = (...args: unknown[]) => {
        clarityQueue.push(args);
      };
      (clarityFn as unknown as { q: unknown[][] }).q = clarityQueue;
      win['clarity'] = clarityFn;
    }

    document.head.appendChild(script);
  } catch {
    // Fallo silencioso ante bloqueadores de anuncios
  }
}

/**
 * Etiqueta la grabación de video en Microsoft Clarity con datos del embudo
 * (por ejemplo, el código `#OP-XXXX` para poder buscar el video exacto de esa fila de Google Sheets).
 */
export function tagClaritySession(key: string, value: string): void {
  if (typeof window !== 'undefined' && typeof window.clarity === 'function') {
    try {
      window.clarity('set', key, value);
    } catch {
      // Ignorar si hay bloqueador
    }
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
