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
 * Genera un ID corto determinístico/único para el Pasaporte Óptico Digital.
 */
export function generateLeadId(): string {
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  const timePart = Date.now().toString(36).slice(-3).toUpperCase();
  return `OP-${timePart}${randomPart}`;
}

/**
 * Dispara una micro-vibración háptica (10ms) en dispositivos móviles compatibles.
 * Falla silenciosamente en escritorio o iOS donde navigator.vibrate no existe.
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
