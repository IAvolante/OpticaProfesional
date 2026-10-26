import { ENV_CONFIG } from '../config/env';
import { FALLBACK_LENS_CATALOG } from '../data/catalog.fallback';
import type {
  BrandThemeId,
  CompletedOpticalAnswers,
  LeadContactData,
  LensCatalogItem,
  OpticalRecommendationResult,
} from '../types/optical.types';
import { parseFlexibleARSPrice } from '../utils/formatters';
import {
  ACTIVITY_CONTEXT_LABELS,
  BUDGET_PREFERENCE_LABELS,
  CLIENT_PRIORITY_LABELS,
  IMPROVEMENT_GOAL_LABELS,
} from '../utils/whatsapp.encoder';

const CATALOG_CACHE_STORAGE_KEY = 'optica_profesional_catalog_cache_v2';

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

interface RemoteSheetsPostResponse {
  readonly ok?: unknown;
  readonly photoUrl?: unknown;
}

export interface FetchCatalogResult {
  readonly items: readonly LensCatalogItem[];
  readonly source: 'LIVE_SHEETS' | 'LOCAL_CACHE' | 'STATIC_FALLBACK';
  readonly updatedAtISO: string;
}

export type LeadSubmissionStage = 'QUOTE_VIEWED' | 'LEAD_SUBMITTED';

export interface SubmitLeadToSheetsPayload {
  readonly leadId: string;
  readonly lead: LeadContactData;
  readonly answers: CompletedOpticalAnswers;
  readonly recommendation: OpticalRecommendationResult;
  readonly selectedTier: 'PRIMARY' | 'ALTERNATIVE';
  readonly activeTheme: BrandThemeId;
  readonly stage?: LeadSubmissionStage;
}

export interface SubmitLeadToSheetsResult {
  readonly ok: boolean;
  readonly uploadedPhotoUrl?: string;
}

const LEGACY_SKU_ALIAS_MAP: Readonly<Record<string, string>> = {
  'MONO-AR-150': 'ORGANICO-AR',
  'MONO-BLUE-156': 'ORGANICO-BLUE-AR',
  'DESC-BLUE-156': 'ORGANICO-BLUE-AR',
  'MONO-HI-167': 'ALTO-INDICE-167',
  'MONO-POLY-159': 'ALTO-INDICE-167',
  'MULTI-DIG-156': 'MULTIFOCAL-AR',
  'MULTI-PHOTO-159': 'MULTIFOCAL-AR',
  'MONO-PHOTO-156': 'ORGANICO-FOTOCROMATICO',
};

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
    // Ignorar en modo incógnito
  }
}

function mergeRemotePricesIntoCatalog(
  remoteItems: readonly RemoteSheetItemRaw[]
): readonly LensCatalogItem[] {
  const remoteMap = new Map<string, RemoteSheetItemRaw>();

  for (const rawItem of remoteItems) {
    if (typeof rawItem.sku === 'string' && rawItem.sku.trim().length > 0) {
      const cleanSku = rawItem.sku.trim().toUpperCase();
      remoteMap.set(cleanSku, rawItem);
      const mappedNewSku = LEGACY_SKU_ALIAS_MAP[cleanSku];
      if (mappedNewSku && !remoteMap.has(mappedNewSku)) {
        remoteMap.set(mappedNewSku, rawItem);
      }
    }
  }

  return FALLBACK_LENS_CATALOG.map((baseItem): LensCatalogItem => {
    const remote = remoteMap.get(baseItem.sku);
    if (!remote) {
      return baseItem;
    }

    const priceStock = parseFlexibleARSPrice(remote.priceStockARS);
    const priceLab = parseFlexibleARSPrice(remote.priceLabARS);
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
 * Envía los datos del Lead y la foto de la receta en Base64 (si el usuario la cargó en el Paso 5)
 * al Google Apps Script para guardarla en Google Drive/Sheets y obtener el link directo de la imagen.
 */
export async function submitLeadToGoogleSheets(
  payload: SubmitLeadToSheetsPayload
): Promise<SubmitLeadToSheetsResult> {
  const endpoint = ENV_CONFIG.googleSheetsWebAppUrl;
  if (!endpoint) {
    if (ENV_CONFIG.isDevelopment) {
      console.info(
        '[SheetsService::MockPost] Lead registrado localmente (VITE_GOOGLE_SHEETS_WEBAPP_URL vacío):',
        payload
      );
    }
    return { ok: true };
  }

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => {
    controller.abort();
  }, Math.max(ENV_CONFIG.fetchTimeoutMs, 6500));

  try {
    const stage: LeadSubmissionStage = payload.stage ?? 'LEAD_SUBMITTED';
    const isAnonymousPreview =
      stage === 'QUOTE_VIEWED' || !payload.lead.whatsapp.trim();

    const chosenOption =
      payload.selectedTier === 'ALTERNATIVE'
        ? payload.recommendation.alternativeOption
        : payload.recommendation.primaryOption;

    const step4Labels =
      payload.answers.budgetPreferences.length > 0
        ? payload.answers.budgetPreferences
            .map((item) => BUDGET_PREFERENCE_LABELS[item])
            .join(' + ')
        : 'Soy particular';

    const alreadyUploadedUrl =
      payload.answers.prescriptionPhotoRemoteUrl ??
      payload.lead.prescriptionPhotoRemoteUrl ??
      '';

    const body = JSON.stringify({
      stage,
      leadStatus: isAnonymousPreview
        ? 'Vio precios (Sin completar datos)'
        : 'Pendiente de contacto',
      leadId: payload.leadId,
      passportCode: payload.lead.passportCode ?? payload.leadId,
      fullName: isAnonymousPreview
        ? '⏳ Vio precios (Sin completar datos)'
        : payload.lead.fullName,
      whatsapp: isAnonymousPreview ? '-' : payload.lead.whatsapp,
      whatsappLink: isAnonymousPreview
        ? 'Completó las 5 preguntas (Sin WhatsApp)'
        : `https://wa.me/549${payload.lead.whatsapp}`,
      selectedTier: isAnonymousPreview
        ? 'Viendo cotización'
        : payload.selectedTier === 'ALTERNATIVE'
          ? 'Opción 2'
          : 'Opción 1',
      selectedSku: chosenOption.sku,
      selectedCommercialName: chosenOption.commercialName,
      selectedPriceARS: chosenOption.priceStockARS,
      primarySku: payload.recommendation.primaryOption.sku,
      primaryName: payload.recommendation.primaryOption.commercialName,
      priceStockARS: payload.recommendation.primaryOption.priceStockARS,
      alternativeSku: payload.recommendation.alternativeOption.sku,
      alternativeName: payload.recommendation.alternativeOption.commercialName,
      alternativePriceARS:
        payload.recommendation.alternativeOption.priceStockARS,
      improvementGoal: payload.answers.improvementGoal,
      step1Label: IMPROVEMENT_GOAL_LABELS[payload.answers.improvementGoal],
      activityContext: payload.answers.activityContext,
      step2Label: ACTIVITY_CONTEXT_LABELS[payload.answers.activityContext],
      clientPriority: payload.answers.clientPriority,
      step3Label: CLIENT_PRIORITY_LABELS[payload.answers.clientPriority],
      budgetPreferences: payload.answers.budgetPreferences.join(', '),
      step4Label: step4Labels,
      prescriptionAttachment: payload.answers.prescriptionAttachment,
      step5Label:
        payload.answers.prescriptionAttachment === 'cargar_foto_receta'
          ? 'Adjuntó foto de receta'
          : 'Aún no tiene la receta',
      prescriptionPhotoName: payload.answers.prescriptionPhotoName ?? '',
      prescriptionPhotoUrl: alreadyUploadedUrl,
      prescriptionPhotoBase64: alreadyUploadedUrl
        ? ''
        : (payload.answers.prescriptionPhotoDataUrl ?? ''),
      warrantyBenefit: 'CERTIFICADO RECAMBIO 12 MESES GRATIS',
      activeTheme: payload.activeTheme,
      utmSource:
        typeof window !== 'undefined' && window.location.search
          ? window.location.search
          : 'Tráfico Directo / Orgánico',
    });

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body,
      keepalive: body.length < 60000,
      signal: controller.signal,
    });

    try {
      const json: unknown = await response.json();
      const parsed = json as RemoteSheetsPostResponse;
      if (
        parsed &&
        typeof parsed.photoUrl === 'string' &&
        parsed.photoUrl.trim().length > 0
      ) {
        return {
          ok: true,
          uploadedPhotoUrl: parsed.photoUrl.trim(),
        };
      }
    } catch {
      // Si el Apps Script no devuelve JSON, igual damos por enviado
    }

    return { ok: true };
  } catch {
    return { ok: false };
  } finally {
    window.clearTimeout(timeoutId);
  }
}
