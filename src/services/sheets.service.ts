import { ENV_CONFIG } from '../config/env';
import { FALLBACK_LENS_CATALOG } from '../data/catalog.fallback';
import type {
  BrandThemeId,
  CompletedOpticalAnswers,
  LeadContactData,
  LensCatalogItem,
  OpticalRecommendationResult,
} from '../types/optical.types';

const CATALOG_CACHE_STORAGE_KEY = 'optica_profesional_catalog_cache_v1';

interface CachedCatalogEnvelope {
  readonly savedAtMs: number;
  readonly updatedAtISO: string;
  readonly items: readonly LensCatalogItem[];
}

interface RemoteSheetItemRaw {
  readonly sku?: unknown;
  readonly commercialName?: unknown;
  readonly priceStockARS?: unknown;
  readonly priceLabARS?: unknown;
  readonly stockRangeDescription?: unknown;
  readonly deliveryTimeStock?: unknown;
  readonly deliveryTimeLab?: unknown;
  readonly warrantyMonths?: unknown;
}

interface RemoteSheetsGetResponse {
  readonly ok?: unknown;
  readonly updatedAt?: unknown;
  readonly items?: unknown;
}

export interface FetchCatalogResult {
  readonly items: readonly LensCatalogItem[];
  readonly source: 'LIVE_SHEETS' | 'LOCAL_CACHE' | 'STATIC_FALLBACK';
  readonly updatedAtISO: string;
}

export interface SubmitLeadToSheetsPayload {
  readonly leadId: string;
  readonly lead: LeadContactData;
  readonly answers: CompletedOpticalAnswers;
  readonly recommendation: OpticalRecommendationResult;
  readonly activeTheme: BrandThemeId;
}

/**
 * Lee el catálogo cacheado en `localStorage` si es válido.
 */
export function readCachedCatalog(): {
  readonly items: readonly LensCatalogItem[];
  readonly updatedAtISO: string;
  readonly isFresh: boolean;
} | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(CATALOG_CACHE_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      !('savedAtMs' in parsed) ||
      !('items' in parsed) ||
      !Array.isArray(parsed.items) ||
      parsed.items.length === 0
    ) {
      return null;
    }

    const savedAtMs =
      typeof parsed.savedAtMs === 'number' ? parsed.savedAtMs : 0;
    const updatedAtISO =
      'updatedAtISO' in parsed && typeof parsed.updatedAtISO === 'string'
        ? parsed.updatedAtISO
        : new Date(savedAtMs).toISOString();

    const ttlMs = ENV_CONFIG.cacheTtlMinutes * 60 * 1000;
    const isFresh = Date.now() - savedAtMs < ttlMs;

    return {
      items: parsed.items as readonly LensCatalogItem[],
      updatedAtISO,
      isFresh,
    };
  } catch {
    return null;
  }
}

function saveCatalogToCache(
  items: readonly LensCatalogItem[],
  updatedAtISO: string
): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const envelope: CachedCatalogEnvelope = {
      savedAtMs: Date.now(),
      updatedAtISO,
      items,
    };
    window.localStorage.setItem(
      CATALOG_CACHE_STORAGE_KEY,
      JSON.stringify(envelope)
    );
  } catch {
    // Ignorar quota exceeded en modo incógnito
  }
}

/**
 * Fusiona los precios dinámicos de la hoja `Precios_Cristales` de Google Sheets
 * sobre la estructura clínica del catálogo base, garantizando integridad de tipos.
 */
function mergeRemotePricesIntoCatalog(
  remoteItems: readonly RemoteSheetItemRaw[]
): readonly LensCatalogItem[] {
  const remoteMap = new Map<string, RemoteSheetItemRaw>();

  for (const rawItem of remoteItems) {
    if (typeof rawItem.sku === 'string' && rawItem.sku.trim().length > 0) {
      remoteMap.set(rawItem.sku.trim(), rawItem);
    }
  }

  return FALLBACK_LENS_CATALOG.map((baseItem): LensCatalogItem => {
    const remote = remoteMap.get(baseItem.sku);
    if (!remote) {
      return baseItem;
    }

    const priceStock = Number(remote.priceStockARS);
    const priceLab = Number(remote.priceLabARS);
    const warranty = Number(remote.warrantyMonths);

    return {
      ...baseItem,
      commercialName:
        typeof remote.commercialName === 'string' &&
        remote.commercialName.trim().length > 0
          ? remote.commercialName.trim()
          : baseItem.commercialName,
      priceStockARS:
        Number.isFinite(priceStock) && priceStock > 0
          ? priceStock
          : baseItem.priceStockARS,
      priceLabARS:
        Number.isFinite(priceLab) && priceLab > 0
          ? priceLab
          : baseItem.priceLabARS,
      stockRangeDescription:
        typeof remote.stockRangeDescription === 'string' &&
        remote.stockRangeDescription.trim().length > 0
          ? remote.stockRangeDescription.trim()
          : baseItem.stockRangeDescription,
      deliveryTimeStock:
        typeof remote.deliveryTimeStock === 'string' &&
        remote.deliveryTimeStock.trim().length > 0
          ? remote.deliveryTimeStock.trim()
          : baseItem.deliveryTimeStock,
      deliveryTimeLab:
        typeof remote.deliveryTimeLab === 'string' &&
        remote.deliveryTimeLab.trim().length > 0
          ? remote.deliveryTimeLab.trim()
          : baseItem.deliveryTimeLab,
      warrantyMonths:
        Number.isFinite(warranty) && warranty > 0
          ? warranty
          : baseItem.warrantyMonths,
    };
  });
}

/**
 * Obtiene el catálogo de precios con estrategia Cache-First y timeout controlado.
 * Si no hay URL de Google Sheets configurada aún (Etapa Discovery), devuelve
 * instantáneamente `FALLBACK_LENS_CATALOG`.
 */
export async function fetchOpticalCatalogWithCache(
  forceRefresh = false
): Promise<FetchCatalogResult> {
  const cached = readCachedCatalog();

  if (!forceRefresh && cached && cached.isFresh) {
    return {
      items: cached.items,
      source: 'LOCAL_CACHE',
      updatedAtISO: cached.updatedAtISO,
    };
  }

  const endpoint = ENV_CONFIG.googleSheetsWebAppUrl;
  if (!endpoint) {
    return {
      items: FALLBACK_LENS_CATALOG,
      source: 'STATIC_FALLBACK',
      updatedAtISO: new Date().toISOString(),
    };
  }

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => {
    controller.abort();
  }, ENV_CONFIG.fetchTimeoutMs);

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data: unknown = await response.json();
    const typedResponse = data as RemoteSheetsGetResponse;

    if (
      typedResponse &&
      typedResponse.ok === true &&
      Array.isArray(typedResponse.items) &&
      typedResponse.items.length > 0
    ) {
      const mergedItems = mergeRemotePricesIntoCatalog(
        typedResponse.items as readonly RemoteSheetItemRaw[]
      );
      const updatedAtISO =
        typeof typedResponse.updatedAt === 'string'
          ? typedResponse.updatedAt
          : new Date().toISOString();

      saveCatalogToCache(mergedItems, updatedAtISO);

      return {
        items: mergedItems,
        source: 'LIVE_SHEETS',
        updatedAtISO,
      };
    }

    throw new Error('Formato de respuesta de Google Sheets inválido');
  } catch {
    if (cached) {
      return {
        items: cached.items,
        source: 'LOCAL_CACHE',
        updatedAtISO: cached.updatedAtISO,
      };
    }

    return {
      items: FALLBACK_LENS_CATALOG,
      source: 'STATIC_FALLBACK',
      updatedAtISO: new Date().toISOString(),
    };
  } finally {
    window.clearTimeout(timeoutId);
  }
}

/**
 * Envía de forma asíncrona y resiliente los datos del Lead a la pestaña `Leads_Campañas`
 * del Google Sheet mediante `doPost`. Nunca bloquea la navegación del usuario a WhatsApp.
 */
export async function submitLeadToGoogleSheets(
  payload: SubmitLeadToSheetsPayload
): Promise<boolean> {
  const endpoint = ENV_CONFIG.googleSheetsWebAppUrl;
  if (!endpoint) {
    if (ENV_CONFIG.isDevelopment) {
      console.info(
        '[SheetsService::MockPost] Lead registrado localmente (VITE_GOOGLE_SHEETS_WEBAPP_URL vacío):',
        payload
      );
    }
    return true;
  }

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => {
    controller.abort();
  }, ENV_CONFIG.fetchTimeoutMs);

  try {
    const body = JSON.stringify({
      leadId: payload.leadId,
      passportCode: payload.lead.passportCode,
      fullName: payload.lead.fullName,
      whatsapp: payload.lead.whatsapp,
      locality: payload.lead.locality,
      preferredPayment: payload.lead.preferredPayment ?? 'CASH_TRANSFER',
      healthInsuranceName: payload.lead.healthInsuranceName ?? '',
      prescriptionStatus: payload.lead.prescriptionStatus,
      prescriptionPhotoName: payload.lead.prescriptionPhotoName ?? '',
      clinicalNotes: payload.lead.clinicalNotes ?? '',
      primarySku: payload.recommendation.primaryOption.sku,
      primaryName: payload.recommendation.primaryOption.commercialName,
      priceStockARS: payload.recommendation.primaryOption.priceStockARS,
      priceLabARS: payload.recommendation.primaryOption.priceLabARS,
      alternativeSku: payload.recommendation.alternativeOption.sku,
      answers: payload.answers,
      activeTheme: payload.activeTheme,
      utmSource:
        typeof window !== 'undefined' && window.location.search
          ? window.location.search
          : 'direct',
    });

    await fetch(endpoint, {
      method: 'POST',
      headers: {
        // Content-Type text/plain evita preflight CORS en Google Apps Script
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body,
      signal: controller.signal,
    });

    return true;
  } catch {
    return false;
  } finally {
    window.clearTimeout(timeoutId);
  }
}
