import { useCallback, useEffect, useState } from 'react';
import { FALLBACK_LENS_CATALOG } from '../data/catalog.fallback';
import {
  fetchOpticalCatalogWithCache,
  readCachedCatalog,
} from '../services/sheets.service';
import type { CatalogSyncState } from '../types/optical.types';

export interface UseCatalogPricesReturn {
  readonly catalogState: CatalogSyncState;
  readonly refreshCatalog: () => Promise<void>;
}

/**
 * Hook que provee el catálogo de cristales y sus precios (Stock vs. Laboratorio),
 * hidratando instantáneamente desde caché o fallback local y revalidando contra Google Sheets.
 */
export function useCatalogPrices(): UseCatalogPricesReturn {
  const [catalogState, setCatalogState] = useState<CatalogSyncState>(() => {
    const cached = readCachedCatalog();
    if (cached) {
      return {
        items: cached.items,
        source: 'LOCAL_CACHE',
        updatedAtISO: cached.updatedAtISO,
        isLoading: false,
        errorMessage: null,
      };
    }

    return {
      items: FALLBACK_LENS_CATALOG,
      source: 'STATIC_FALLBACK',
      updatedAtISO: new Date().toISOString(),
      isLoading: false,
      errorMessage: null,
    };
  });

  const refreshCatalog = useCallback(async (force = false) => {
    setCatalogState((prev) => ({
      ...prev,
      isLoading: true,
      errorMessage: null,
    }));

    try {
      const result = await fetchOpticalCatalogWithCache(force);
      setCatalogState({
        items: result.items,
        source: result.source,
        updatedAtISO: result.updatedAtISO,
        isLoading: false,
        errorMessage: null,
      });
    } catch {
      setCatalogState((prev) => ({
        ...prev,
        isLoading: false,
        errorMessage:
          'Usando lista de precios local de respaldo. Sin conexión temporal a Google Sheets.',
      }));
    }
  }, []);

  useEffect(() => {
    void refreshCatalog(false);
  }, [refreshCatalog]);

  const handleManualRefresh = useCallback(async () => {
    await refreshCatalog(true);
  }, [refreshCatalog]);

  return {
    catalogState,
    refreshCatalog: handleManualRefresh,
  };
}
