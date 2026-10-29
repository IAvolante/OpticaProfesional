import { ENV_CONFIG } from '../config/env';
import type {
  ActivityContextAnswer,
  BudgetPreferenceAnswer,
  ClientPriorityAnswer,
  CompletedOpticalAnswers,
  ImprovementGoalAnswer,
  LeadContactData,
  OpticalRecommendationResult,
} from '../types/optical.types';
import {
  formatLensPriceARS,
  sanitizeArgentinePhone,
} from './formatters';

export interface WhatsAppMessagePayload {
  readonly lead: LeadContactData;
  readonly answers: CompletedOpticalAnswers;
  readonly recommendation: OpticalRecommendationResult;
  readonly selectedLensType?: 'PRIMARY' | 'ALTERNATIVE';
  readonly selectedOptionNumber?: number;
}

export const IMPROVEMENT_GOAL_LABELS: Record<ImprovementGoalAnswer, string> = {
  organico_ar: 'Ver con mayor nitidez (ORGÁNICO AR)',
  organico_blue_ar:
    'Sentir mayor comodidad visual cuando uso pantallas (ORGÁNICO BLUE AR)',
  alto_indice:
    'Tener cristales más finos y livianos (POLICARBONATO AR / ORGÁNICO 1,61 y 1,67)',
  bifocal_multifocal:
    'Evitar cambiar de anteojos para distintas distancias (OCUPACIONALES / BIFOCALES / MULTIFOCALES)',
  filtro_fotocromatico:
    'Manejar mejor, reflejos o molestias del sol (ORGÁNICO FOTOCROMÁTICO AR)',
};

export const ACTIVITY_CONTEXT_LABELS: Record<ActivityContextAnswer, string> = {
  computadora_celular: 'Trabajando con la computadora o usando el celular',
  lectura_cerca: 'Leyendo o realizando tareas de cerca',
  manejando_aire_libre: 'Manejando o realizando actividades al aire libre',
  actividades_diarias: 'En todas mis actividades diarias',
};

export const CLIENT_PRIORITY_LABELS: Record<ClientPriorityAnswer, string> = {
  precio: 'Equilibrio entre calidad y precio (PRECIO)',
  tecnologia: 'Últimas tecnologías del mercado (TECNOLOGÍA)',
  moda: 'Que combinen con mi estilo y se vean bien estéticamente (MODA)',
  solucion: 'Resolver mi necesidad visual de forma práctica (SOLUCIÓN)',
};

export const BUDGET_PREFERENCE_LABELS: Record<BudgetPreferenceAnswer, string> = {
  tengo_obra_social: 'Tengo obra social',
  soy_particular: 'Soy particular',
  interes_cuotas_tarjeta: 'Me interesa conocer cuotas según mi tarjeta',
  beneficio_pago_contado: 'Beneficio pago contado',
};

/**
 * Construye el mensaje de cierre para WhatsApp con:
 * - Certificado de Beneficio Exclusivo (Recambio de cristales gratis en 12 meses)
 * - Las 2 opciones cotizadas (destacando la elegida)
 * - Las respuestas de los 5 pasos del asesor virtual
 * - Link directo a la foto de la receta cargada en el Paso 5 (si se subió)
 */
export function buildWhatsAppQuoteMessage(
  payload: WhatsAppMessagePayload
): string {
  const {
    lead,
    answers,
    recommendation,
    selectedLensType = 'PRIMARY',
    selectedOptionNumber,
  } = payload;

  const allOptions = recommendation.allMatchedOptions ?? [
    {
      optionNumber: 1,
      lens: recommendation.primaryOption,
      tagline: recommendation.primaryCardTagline,
      matchedQuestions: ['P1'] as const,
    },
    {
      optionNumber: 2,
      lens: recommendation.alternativeOption,
      tagline: recommendation.alternativeCardTagline,
      matchedQuestions: ['P2'] as const,
    },
  ];

  const activeOptionNumber =
    selectedOptionNumber ?? (selectedLensType === 'ALTERNATIVE' ? 2 : 1);

  const chosenItem =
    allOptions.find((item) => item.optionNumber === activeOptionNumber) ??
    allOptions[0]!;
  const chosenLens = chosenItem.lens;

  const passportCode = lead.passportCode ?? 'OP-2026';

  const budgetLabels =
    answers.budgetPreferences.length > 0
      ? answers.budgetPreferences
          .map((item) => BUDGET_PREFERENCE_LABELS[item])
          .join(' / ')
      : 'Particular';

  const remotePhotoUrl =
    lead.prescriptionPhotoRemoteUrl ?? answers.prescriptionPhotoRemoteUrl;
  const photoName =
    lead.prescriptionPhotoName ?? answers.prescriptionPhotoName;

  const prescriptionLine = remotePhotoUrl
    ? `Foto de Receta Cargada: ${remotePhotoUrl}`
    : answers.prescriptionAttachment === 'cargar_foto_receta' && photoName
      ? `Receta cargada en el cotizador (${photoName}) — La envío a continuación`
      : 'Aún no tengo la receta';

  const optionLines = allOptions.map(
    (item) =>
      `- *Opción ${item.optionNumber}${item.optionNumber === activeOptionNumber ? ' (Elegida)' : ''}:* ${item.lens.commercialName} (${item.lens.visionRangeLabel ?? 'monofocal'}) — *${formatLensPriceARS(item.lens)}*`
  );

  const lines: string[] = [
    `Hola *${ENV_CONFIG.brandNameB2C}*! Quiero aprovechar mi beneficio exclusivo del cotizador online.`,
    ``,
    `*CERTIFICADO BENEFICIO EXCLUSIVO #${passportCode}*`,
    `*¡RENOVÁ TUS CRISTALES GRATIS!* (1 recambio sin cargo durante los próximos 12 meses)`,
    `------------------------------------`,
    `*DATOS DEL CLIENTE*`,
    `- Nombre: *${lead.fullName.trim()}*`,
    `- WhatsApp: ${lead.whatsapp}`,
    ``,
    `*ALTERNATIVAS SEGÚN MATRIZ ÓPTICA*`,
    ...optionLines,
    `- *Cristal Seleccionado:* *Opción ${chosenItem.optionNumber} — ${chosenLens.commercialName}* (*${formatLensPriceARS(chosenLens)}*)`,
    ``,
    `*RESPUESTAS DEL ASESOR VIRTUAL*`,
    `1. Mejora principal: ${IMPROVEMENT_GOAL_LABELS[answers.improvementGoal]}`,
    `2. Actividad principal: ${ACTIVITY_CONTEXT_LABELS[answers.activityContext]}`,
    `3. Prioridad: ${CLIENT_PRIORITY_LABELS[answers.clientPriority]}`,
    `4. Datos para presupuesto: *${budgetLabels}*`,
    `5. Receta: *${prescriptionLine}*`,
  ];

  return lines.join('\n');
}

export function buildWhatsAppDeepLink(payload: WhatsAppMessagePayload): string {
  const targetPhone =
    sanitizeArgentinePhone(ENV_CONFIG.whatsappNumberB2C) || '5493875164050';
  const messageText = buildWhatsAppQuoteMessage(payload);
  const encodedText = encodeURIComponent(messageText);
  return `https://wa.me/${targetPhone}?text=${encodedText}`;
}
