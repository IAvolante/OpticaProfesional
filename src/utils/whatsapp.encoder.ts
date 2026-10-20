import { ENV_CONFIG } from '../config/env';
import type {
  CompletedOpticalAnswers,
  LeadContactData,
  OpticalRecommendationResult,
  PaymentBenefitMode,
} from '../types/optical.types';
import { formatCurrencyARS, sanitizeArgentinePhone } from './formatters';

export interface WhatsAppMessagePayload {
  readonly lead: LeadContactData;
  readonly answers: CompletedOpticalAnswers;
  readonly recommendation: OpticalRecommendationResult;
  readonly selectedLensType?: 'PRIMARY' | 'ALTERNATIVE';
  readonly paymentMode?: PaymentBenefitMode;
}

const VISION_NEED_LABELS: Record<CompletedOpticalAnswers['visionNeed'], string> = {
  single_distance: 'Visión Sencilla (Monofocal Lejos o Cerca)',
  near_and_far: 'Lejos, Intermedia y Cerca (Multifocal Progresivo)',
  visual_rest: 'Descanso Visual / Protección Digital',
};

const SCREEN_EXPOSURE_LABELS: Record<CompletedOpticalAnswers['screenExposure'], string> = {
  low_under_3h: 'Baja (menos de 3 hs/día)',
  moderate_3_to_6h: 'Moderada (3 a 6 hs/día en oficina/estudio)',
  intensive_6h_plus: 'Intensiva (+6 hs/día frente a pantallas)',
};

const LIGHT_SENSITIVITY_LABELS: Record<CompletedOpticalAnswers['lightSensitivity'], string> = {
  mostly_indoors: 'Uso mayormente en interiores (Cristal claro)',
  outdoor_commute: 'Alta sensibilidad al sol de Salta (Fotocromático UV400)',
  day_night_driving: 'Conducción frecuente diurna/nocturna (Antirreflex HD)',
};

const GRADUATION_LABELS: Record<CompletedOpticalAnswers['graduationSeverity'], string> = {
  neutral_or_low: 'Baja o Descanso (hasta ±2.00 D · Rango Stock)',
  moderate_up_to_4: 'Intermedia (±2.25 a ±4.00 D · Índice 1.56 / 1.59)',
  high_plus_4: 'Alta (mayor a ±4.00 D o astigmatismo fuerte · Rango Lab)',
  unknown_recipe: 'Tengo receta médica para verificar dioptrías',
};

const FRAME_PREFERENCE_LABELS: Record<CompletedOpticalAnswers['framePreference'], string> = {
  need_new_frame: 'Necesito Armazón Nuevo + Cristales Completos',
  need_clip_on: 'Busco Armazón con Clip-On Magnético (Sol + Receta)',
  own_frame: 'Ya tengo mi propio armazón (Solo Cristales)',
  undecided_frame: 'Quiero ver opciones de armazones con Ventas',
};

const SHORT_FRAME_LABELS: Record<CompletedOpticalAnswers['framePreference'], string> = {
  need_new_frame: 'Armazón Nuevo + Cristales',
  need_clip_on: 'Armazón Clip-On Magnético',
  own_frame: 'Tengo Armazón Propio',
  undecided_frame: 'Cotizar Armazón Opcional',
};

const PRESCRIPTION_STATUS_LABELS: Record<LeadContactData['prescriptionStatus'], string> = {
  HAS_RECENT_RX: 'Sí, tengo receta médica vigente',
  NEEDS_CHECKUP: 'Sin receta vigente / Solicito orientación óptica',
  REST_NO_RX: 'Cristales de descanso sin aumento',
};

const PAYMENT_MODE_LABELS: Record<PaymentBenefitMode, string> = {
  CASH_TRANSFER: 'Bonificación Contado / Transferencia (-15% OFF)',
  LIST_INSTALLMENTS: 'Precio de Lista / Financiación con Tarjeta',
  HEALTH_INSURANCE: 'Convenio Obra Social / Mutual',
};

/**
 * Construye la Ficha Técnica y Comercial completa de Derivación a Ventas para WhatsApp.
 * Formato corporativo limpio, sin emojis artificiales, estructurado para lectura inmediata
 * en mostrador y en la vista previa de WhatsApp iOS/Android.
 */
export function buildWhatsAppQuoteMessage(payload: WhatsAppMessagePayload): string {
  const {
    lead,
    answers,
    recommendation,
    selectedLensType = 'PRIMARY',
    paymentMode = lead.preferredPayment ?? 'CASH_TRANSFER',
  } = payload;

  const chosenLens =
    selectedLensType === 'ALTERNATIVE'
      ? recommendation.alternativeOption
      : recommendation.primaryOption;

  const secondaryLens =
    selectedLensType === 'ALTERNATIVE'
      ? recommendation.primaryOption
      : recommendation.alternativeOption;

  const cashStockPrice = Math.round(chosenLens.priceStockARS * 0.85);
  const cashLabPrice = Math.round(chosenLens.priceLabARS * 0.85);
  const secondaryCashStock = Math.round(secondaryLens.priceStockARS * 0.85);

  const activeStockPrice =
    paymentMode === 'CASH_TRANSFER' ? cashStockPrice : chosenLens.priceStockARS;
  const activeLabPrice =
    paymentMode === 'CASH_TRANSFER' ? cashLabPrice : chosenLens.priceLabARS;

  const passportCode = lead.passportCode ?? 'OP-SALTA';

  const insuranceDetail =
    paymentMode === 'HEALTH_INSURANCE' && lead.healthInsuranceName
      ? ` (${lead.healthInsuranceName})`
      : lead.healthInsuranceName
        ? ` — Cobertura: ${lead.healthInsuranceName}`
        : '';

  const shortPaymentLabel =
    paymentMode === 'CASH_TRANSFER'
      ? 'Contado/Transf. (-15% OFF)'
      : paymentMode === 'HEALTH_INSURANCE'
        ? `Obra Social${lead.healthInsuranceName ? `: ${lead.healthInsuranceName}` : ''}`
        : 'Tarjeta / Cuotas';

  const shortRxAction = lead.prescriptionPhotoName
    ? 'Adjunto foto de mi receta a continuación'
    : lead.prescriptionStatus === 'HAS_RECENT_RX'
      ? 'Tengo receta médica para enviar foto'
      : lead.prescriptionStatus === 'REST_NO_RX'
        ? 'Descanso visual sin receta'
        : 'Solicito asesoramiento de receta';

  const lines: string[] = [
    `*FICHA DE DERIVACIÓN A VENTAS — ${ENV_CONFIG.brandNameB2C.toUpperCase()}*`,
    `*Orden / Pasaporte Óptico:* #${passportCode} (Vigencia 7 días)`,
    `------------------------------------`,
    `*01. DATOS DEL CLIENTE Y OPERACIÓN*`,
    `- Cliente: *${lead.fullName.trim()}*`,
    `- WhatsApp: ${lead.whatsapp}`,
    `- Localidad: ${lead.locality.trim()}`,
    `- Beneficio / Cobertura: *${PAYMENT_MODE_LABELS[paymentMode]}${insuranceDetail}*`,
    `- Armazón / Montura: *${FRAME_PREFERENCE_LABELS[answers.framePreference]}*`,
    ``,
    `*02. RELEVAMIENTO CLÍNICO Y RECETA*`,
    `- Distancia Visual: ${VISION_NEED_LABELS[answers.visionNeed]}`,
    `- Exposición a Pantallas: ${SCREEN_EXPOSURE_LABELS[answers.screenExposure]}`,
    `- Sol y Conducción: ${LIGHT_SENSITIVITY_LABELS[answers.lightSensitivity]}`,
    `- Graduación Estimada: ${GRADUATION_LABELS[answers.graduationSeverity]}`,
    `- Estado de Receta: *${PRESCRIPTION_STATUS_LABELS[lead.prescriptionStatus]}*`,
    `- Foto de Receta: ${lead.prescriptionPhotoName ? `Vinculada en App (${lead.prescriptionPhotoName})` : 'Se enviará en este chat / A confirmar'}`,
  ];

  if (lead.clinicalNotes && lead.clinicalNotes.trim().length > 0) {
    lines.push(`- Observaciones del Cliente: "${lead.clinicalNotes.trim()}"`);
  }

  lines.push(
    ``,
    `*03. PRESUPUESTO DE CRISTALES EMITIDO*`,
    `- *Opción Elegida:* ${chosenLens.commercialName} [${chosenLens.sku}]`,
    `- Material e Índice: Índice ${chosenLens.refractiveIndex} — ${chosenLens.shortBadge}`,
    `- Tratamientos: ${chosenLens.treatments.join(' + ')}`,
    `- *Precio Rango Stock* (${chosenLens.stockRangeDescription}):`,
    `  Contado (-15%): *${formatCurrencyARS(cashStockPrice)}* | Lista: ${formatCurrencyARS(chosenLens.priceStockARS)} (${chosenLens.deliveryTimeStock})`,
    `- *Precio Rango Laboratorio* (${chosenLens.labRangeDescription}):`,
    `  Contado (-15%): *${formatCurrencyARS(cashLabPrice)}* | Lista: ${formatCurrencyARS(chosenLens.priceLabARS)} (${chosenLens.deliveryTimeLab})`,
    `- *Opción Alternativa:* ${secondaryLens.commercialName} [${secondaryLens.sku}] (Stock Contado: ${formatCurrencyARS(secondaryCashStock)} | Lista: ${formatCurrencyARS(secondaryLens.priceStockARS)})`,
    `------------------------------------`,
    `*RESUMEN EJECUTIVO VENTAS #${passportCode}*`,
    `Cliente: *${lead.fullName.trim()}* (${lead.locality.trim()}) · ${shortPaymentLabel}`,
    `Cristal: *${chosenLens.commercialName}* · Stock: *${formatCurrencyARS(activeStockPrice)}* | Lab: *${formatCurrencyARS(activeLabPrice)}*`,
    `Montura: *${SHORT_FRAME_LABELS[answers.framePreference]}* · Receta: ${shortRxAction}`
  );

  return lines.join('\n');
}

export function buildWhatsAppDeepLink(payload: WhatsAppMessagePayload): string {
  const targetPhone = sanitizeArgentinePhone(ENV_CONFIG.whatsappNumberB2C) || '5493875164050';
  const messageText = buildWhatsAppQuoteMessage(payload);
  const encodedText = encodeURIComponent(messageText);
  return `https://wa.me/${targetPhone}?text=${encodedText}`;
}

export function buildB2BSmartOpticalWhatsAppLink(): string {
  const targetPhone = sanitizeArgentinePhone(ENV_CONFIG.whatsappNumberB2B) || '5493875164050';
  const text = encodeURIComponent(
    `Hola *${ENV_CONFIG.brandNameB2B}*! Me contacto desde el Cotizador Online por consultas de cuenta mayorista / laboratorio óptico B2B en Salta.`
  );
  return `https://wa.me/${targetPhone}?text=${text}`;
}
