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
  tengo_obra_social: 'Tengo obra social (¡Armazón seleccionado sin cargo!)',
  soy_particular: 'Soy particular',
  interes_cuotas_tarjeta:
    'Me interesa conocer cuotas según mi tarjeta (12 cuotas Naranja X / 6 cuotas Macro)',
  beneficio_pago_contado:
    'Beneficio pago contado (Renová tus cristales sin cargo dentro de los 12 meses en monofocales)',
};

export function formatBudgetPreferenceForLens(
  pref: BudgetPreferenceAnswer,
  isMonofocal: boolean
): string {
  if (pref === 'beneficio_pago_contado') {
    return isMonofocal
      ? 'Beneficio pago contado (Renová tus cristales sin cargo dentro de los 12 meses)'
      : 'Beneficio pago contado (Consultá por beneficios de contado por WhatsApp.)';
  }
  return BUDGET_PREFERENCE_LABELS[pref];
}

/**
 * Construye el mensaje de cierre para WhatsApp con:
 * - Certificado de Beneficio Exclusivo (Recambio de cristales gratis en 12 meses abonando de contado en monofocales)
 * - Las 2 opciones cotizadas (destacando la elegida)
 * - Las respuestas de los 5 pasos del asesor virtual
 * - Link directo a la foto de la receta y a la ficha de presupuesto en Google Drive (si están disponibles)
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

  const allOptions =
    recommendation.allMatchedOptions &&
    recommendation.allMatchedOptions.length >= 1
      ? recommendation.allMatchedOptions
      : [
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

  const isSingleOption = allOptions.length === 1;
  const activeOptionNumber =
    selectedOptionNumber ?? (selectedLensType === 'ALTERNATIVE' ? 2 : 1);

  const chosenItem =
    allOptions.find((item) => item.optionNumber === activeOptionNumber) ??
    allOptions[0]!;
  const chosenLens = chosenItem.lens;

  const passportCode = lead.passportCode ?? 'OP-2026';
  const isMonofocal = chosenLens.hasAnnualReplacementPromo;
  const hasCashBenefitSelected = answers.budgetPreferences.includes(
    'beneficio_pago_contado'
  );
  const qualifiesForAnnualCashPromo = isMonofocal && hasCashBenefitSelected;

  const budgetLabels =
    answers.budgetPreferences.length > 0
      ? answers.budgetPreferences
          .map((item) => formatBudgetPreferenceForLens(item, isMonofocal))
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

  const optionLines = allOptions.map((item) =>
    isSingleOption
      ? `- *Opción Recomendada:* ${item.lens.commercialName} (${item.lens.visionRangeLabel ?? 'monofocal'}) — *${formatLensPriceARS(item.lens)}*`
      : `- *Opción ${item.optionNumber}${item.optionNumber === activeOptionNumber ? ' (Elegida)' : ''}:* ${item.lens.commercialName} (${item.lens.visionRangeLabel ?? 'monofocal'}) — *${formatLensPriceARS(item.lens)}*`
  );

  const headerLines: string[] = qualifiesForAnnualCashPromo
    ? [
        `Hola *${ENV_CONFIG.brandNameB2C}*! Quiero aprovechar mi beneficio exclusivo de pago contado del cotizador online.`,
        ``,
        `*CERTIFICADO BENEFICIO EXCLUSIVO #${passportCode}*`,
        `*¡RENOVÁ TUS CRISTALES GRATIS!* (1 recambio sin cargo durante los próximos 12 meses en monofocales abonando de contado)`,
      ]
    : isMonofocal
      ? [
          `Hola *${ENV_CONFIG.brandNameB2C}*! Hice mi consulta en el Asesor Virtual y quiero avanzar con mi presupuesto *#${passportCode}*.`,
          ``,
          `*PRESUPUESTO ASESOR VIRTUAL #${passportCode}*`,
          `*Cristal Monofocal Elegido:* ${chosenLens.commercialName} — *${formatLensPriceARS(chosenLens)}*`,
        ]
      : [
          `Hola *${ENV_CONFIG.brandNameB2C}*! Hice mi consulta en el Asesor Virtual y quiero recibir asesoramiento para mis cristales *${chosenLens.commercialName}* (#${passportCode}).`,
          ``,
          `*ASESORAMIENTO Y MEDICIÓN A MEDIDA #${passportCode}*`,
          `*Cristal de Laboratorio:* ${chosenLens.commercialName} (${chosenLens.visionRangeLabel ?? 'múltiples distancias'}) — ${
            hasCashBenefitSelected
              ? 'Quiero consultar por beneficios de contado y opciones según mi receta.'
              : 'Quiero conocer opciones según mi receta y planes de pago.'
          }`,
        ];

  const step1Goals =
    answers.improvementGoals && answers.improvementGoals.length > 0
      ? answers.improvementGoals
          .map((g) => IMPROVEMENT_GOAL_LABELS[g])
          .join(' + ')
      : IMPROVEMENT_GOAL_LABELS[answers.improvementGoal];

  const step2Activities =
    answers.activityContexts && answers.activityContexts.length > 0
      ? answers.activityContexts
          .map((a) => ACTIVITY_CONTEXT_LABELS[a])
          .join(' + ')
      : ACTIVITY_CONTEXT_LABELS[answers.activityContext];

  const step3Priorities =
    answers.clientPriorities && answers.clientPriorities.length > 0
      ? answers.clientPriorities
          .map((p) => CLIENT_PRIORITY_LABELS[p])
          .join(' + ')
      : CLIENT_PRIORITY_LABELS[answers.clientPriority];

  const lines: string[] = [
    ...headerLines,
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
    `1. Necesito mis lentes para: ${step1Goals}`,
    `2. Actividad principal: ${step2Activities}`,
    `3. Prioridad: ${step3Priorities}`,
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
