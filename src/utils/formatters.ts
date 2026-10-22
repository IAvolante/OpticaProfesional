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
 * Sanitiza un número de teléfono argentino dejándolo listo para wa.me.
 */
export function sanitizeArgentinePhone(rawPhone: string): string {
  const digits = rawPhone.replace(/\D/g, '');
  if (digits.length === 0) {
    return '';
  }
  return digits;
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
