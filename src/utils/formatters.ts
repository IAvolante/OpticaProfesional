import type { LensCatalogItem } from '../types/optical.types';

/**
 * Formateador nativo de moneda para Pesos Argentinos (ARS) sin decimales,
 * según estándar de facturación de mostrador óptico en Argentina.
 */
const arsCurrencyFormatter = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
});

export function formatCurrencyARS(amount: number): string {
  if (!Number.isFinite(amount) || amount < 0) {
    return arsCurrencyFormatter.format(0);
  }
  return arsCurrencyFormatter.format(Math.round(amount));
}

/**
 * Formatea el precio de un cristal respetando la columna Precio de encuesta.xlsx:
 * - Si tiene monto numérico y prefijo 'DESDE': "Desde $ XX.XXX"
 * - Si tiene prefijo 'DESDE' y monto 0 (Ocupacionales, Bifocales, Multifocales): "Desde · Según receta"
 * - Si tiene prefijo 'CONSULTAR' y monto 0 (Policarbonato Ar): "Según receta"
 * - Caso normal con monto > 0: "$ 36.000", "$ 42.000", "$ 51.000", "$ 104.000", "$ 130.000", "$ 150.000"
 */
export function formatLensPriceARS(
  lens: Pick<LensCatalogItem, 'priceStockARS' | 'pricePrefix'>
): string {
  if (lens.pricePrefix === 'DESDE') {
    if (lens.priceStockARS > 0) {
      return `Desde ${formatCurrencyARS(lens.priceStockARS)}`;
    }
    return 'Desde · Según receta';
  }

  if (lens.pricePrefix === 'CONSULTAR' && lens.priceStockARS <= 0) {
    return 'Según receta';
  }

  if (lens.priceStockARS <= 0) {
    return 'Según receta';
  }

  return formatCurrencyARS(lens.priceStockARS);
}

/**
 * Sanitiza un número de teléfono argentino quitando prefijos interurbanos '0', '54', '549'
 * y el '15' móvil después del código de área (ej: "0387 15 512-3456" -> "3875123456").
 */
export function sanitizeArgentinePhone(rawPhone: string): string {
  let digits = rawPhone.replace(/\D/g, '');
  if (digits.length === 0) {
    return '';
  }

  if (digits.startsWith('549') && digits.length > 10) {
    digits = digits.slice(3);
  } else if (digits.startsWith('54') && digits.length > 10) {
    digits = digits.slice(2);
  }

  if (digits.startsWith('0')) {
    digits = digits.slice(1);
  }

  // Quita el 15 móvil luego de códigos de área de 2, 3 o 4 dígitos si sobran dígitos
  if (digits.length === 12) {
    if (digits.slice(2, 4) === '15') {
      digits = `${digits.slice(0, 2)}${digits.slice(4)}`;
    } else if (digits.slice(3, 5) === '15') {
      digits = `${digits.slice(0, 3)}${digits.slice(5)}`;
    } else if (digits.slice(4, 6) === '15') {
      digits = `${digits.slice(0, 4)}${digits.slice(6)}`;
    }
  } else if (digits.length === 11 && digits.startsWith('15')) {
    digits = digits.slice(2);
  }

  return digits;
}

/**
 * Parsea de forma resiliente montos numéricos provenientes de Google Sheets
 * (soporta números puros o strings como "$ 48.000", "48.000", "48,000").
 */
export function parseFlexibleARSPrice(raw: unknown): number {
  if (typeof raw === 'number' && Number.isFinite(raw)) {
    return Math.round(raw);
  }
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (!trimmed) return NaN;
    // Remueve todo excepto dígitos, puntos y comas
    const clean = trimmed.replace(/[^\d.,]/g, '');
    if (!clean) return NaN;
    // Si tiene punto de miles argentino (ej: "48.000" o "112.500")
    const digitsOnly = clean.replace(/[.,]\d{1,2}$/, '').replace(/[.,]/g, '');
    const parsed = Number(digitsOnly);
    return Number.isFinite(parsed) ? parsed : NaN;
  }
  return NaN;
}

/**
 * Genera un ID corto determinístico/único para el Certificado 12 Meses / Pasaporte Óptico.
 */
export function generateLeadId(): string {
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  const timePart = Date.now().toString(36).slice(-3).toUpperCase();
  return `OP-${timePart}${randomPart}`;
}

/**
 * Dispara una micro-vibración háptica (10ms) en dispositivos móviles compatibles.
 */
export function triggerHapticFeedback(durationMs = 10): void {
  if (
    typeof navigator !== 'undefined' &&
    typeof navigator.vibrate === 'function'
  ) {
    try {
      navigator.vibrate(durationMs);
    } catch {
      // Ignorar si el navegador restringe vibración
    }
  }
}

/**
 * Comprime la foto de la receta en el navegador del cliente (máx 1200px, JPEG 0.78)
 * para lograr vista previa instantánea y subida rápida a Google Drive / Google Sheets.
 */
export function compressPrescriptionImageToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('No se pudo leer la imagen'));
    reader.onload = () => {
      const resultStr = typeof reader.result === 'string' ? reader.result : '';
      if (!resultStr) {
        reject(new Error('Imagen vacía'));
        return;
      }

      const img = new Image();
      img.onerror = () => resolve(resultStr);
      img.onload = () => {
        try {
          const maxDim = 1200;
          let width = img.width;
          let height = img.height;

          if (width > maxDim || height > maxDim) {
            if (width >= height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(resultStr);
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.78);
          resolve(compressedDataUrl);
        } catch {
          resolve(resultStr);
        }
      };
      img.src = resultStr;
    };
    reader.readAsDataURL(file);
  });
}
