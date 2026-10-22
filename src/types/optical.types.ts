/**
 * ============================================================================
 * CONTRATOS DE DOMINIO ESTRICTOS — ÓPTICA PROFESIONAL (2026)
 * ============================================================================
 * Tipado estricto (strict: true, noUncheckedIndexedAccess: true, cero any).
 * Alineado 100% con el flujo definido por Solana (PREGUNTAS .pdf + LOGO 2026).
 */

export type BrandThemeId =
  | 'theme-clinical'
  | 'theme-dark-glass'
  | 'theme-neutral'
  | 'theme-boutique';

export type FontPairId = 'font-logo-match' | 'font-tech-optical' | 'font-boutique-editorial';

export type BusinessUnit = 'B2C_OPTICA_PROFESIONAL' | 'B2B_SMART_OPTICAL';

/**
 * Identificadores estrictos de los 5 pasos del carrusel definidos en PREGUNTAS .pdf.
 */
export type QuestionId =
  | 'improvementGoal' // 1. ¿Qué es lo principal que querés mejorar con tus nuevos anteojos? (material)
  | 'activityContext' // 2. ¿En qué actividades necesitás mayor comodidad visual? (solución)
  | 'clientPriority' // 3. ¿Cuál es tu prioridad a la hora de elegir tus anteojos? (Tipo de cliente)
  | 'budgetPreferences' // 4. ¿Datos útiles para tu presupuesto? (se puede seleccionar más de una)
  | 'prescriptionAttachment'; // 5. ¿Querés adjuntarnos tu receta?

/**
 * 1. ¿Qué es lo principal que querés mejorar con tus nuevos anteojos? (material)
 */
export type ImprovementGoalAnswer =
  | 'organico_ar' // Ver con mayor nitidez (ORGÁNICO AR)
  | 'organico_blue_ar' // Sentir mayor comodidad visual cuando uso pantallas (ORGÁNICO BLUE AR)
  | 'alto_indice' // Tener cristales más finos y livianos (ORGÁNICOS ALTO ÍNDICE (1,67 Y 1,74))
  | 'bifocal_multifocal' // Evitar cambiar de anteojos para distintas distancias (BIFOCAL Y MULTIFOCALES)
  | 'filtro_fotocromatico'; // Manejar mejor, reflejos o molestias del sol (ORGÁNICO CON FILTRO O FOTOCROMÁTICO)

/**
 * 2. ¿En qué actividades necesitás mayor comodidad visual? (solución)
 */
export type ActivityContextAnswer =
  | 'computadora_celular' // Trabajando con la computadora o usando el celular.
  | 'lectura_cerca' // Leyendo o realizando tareas de cerca.
  | 'manejando_aire_libre' // Manejando o realizando actividades al aire libre.
  | 'actividades_diarias'; // En todas mis actividades diarias.

/**
 * 3. ¿Cuál es tu prioridad a la hora de elegir tus anteojos? (Tipo de cliente)
 */
export type ClientPriorityAnswer =
  | 'precio' // Encontrar un buen equilibrio entre calidad y precio (PRECIO)
  | 'tecnologia' // Priorizo cristales con las últimas tecnologías del mercado (TECNOLOGÍA)
  | 'moda' // Que mis anteojos combinen con mi estilo y se vean bien estéticamente. (MODA)
  | 'solucion'; // Resolver mi necesidad visual de forma práctica, sin complicaciones. (SOLUCIÓN)

/**
 * 4. ¿Datos útiles para tu presupuesto? (se puede seleccionar más de una, cierre de venta)
 */
export type BudgetPreferenceAnswer =
  | 'tengo_obra_social' // Tengo obra social
  | 'soy_particular' // Soy particular
  | 'interes_cuotas_tarjeta' // Me interesa conocer cuotas según mi tarjeta
  | 'beneficio_pago_contado'; // Beneficio pago contado

/**
 * 5. ¿Querés adjuntarnos tu receta?
 */
export type PrescriptionAttachmentAnswer =
  | 'cargar_foto_receta' // Cargar la foto de la receta
  | 'aun_no_la_tengo'; // Aún no la tengo

/**
 * Valor literal válido de cualquier opción de pregunta.
 */
export type QuestionOptionValue =
  | ImprovementGoalAnswer
  | ActivityContextAnswer
  | ClientPriorityAnswer
  | BudgetPreferenceAnswer
  | PrescriptionAttachmentAnswer;

/**
 * Mapa tipado de respuestas del usuario durante el flujo de los 5 pasos.
 */
export interface UserOpticalAnswers {
  readonly improvementGoal?: ImprovementGoalAnswer;
  readonly activityContext?: ActivityContextAnswer;
  readonly clientPriority?: ClientPriorityAnswer;
  readonly budgetPreferences?: readonly BudgetPreferenceAnswer[];
  readonly prescriptionAttachment?: PrescriptionAttachmentAnswer;
  readonly prescriptionPhotoName?: string;
  readonly prescriptionPhotoDataUrl?: string;
  readonly prescriptionPhotoRemoteUrl?: string;
}

/**
 * Respuestas completas validadas de los 5 pasos (requeridas para el Paso 6: RESULTADO).
 */
export interface CompletedOpticalAnswers {
  readonly improvementGoal: ImprovementGoalAnswer;
  readonly activityContext: ActivityContextAnswer;
  readonly clientPriority: ClientPriorityAnswer;
  readonly budgetPreferences: readonly BudgetPreferenceAnswer[];
  readonly prescriptionAttachment: PrescriptionAttachmentAnswer;
  readonly prescriptionPhotoName?: string;
  readonly prescriptionPhotoDataUrl?: string;
  readonly prescriptionPhotoRemoteUrl?: string;
}

/**
 * Estructura de una opción individual dentro de una pregunta del Wizard.
 */
export interface WizardQuestionOption<TValue extends QuestionOptionValue = QuestionOptionValue> {
  readonly value: TValue;
  readonly label: string;
  readonly description: string;
  readonly clinicalHint: string;
  readonly badgeText?: string;
}

/**
 * Definición desacoplada de una pregunta del árbol de relevamiento.
 */
export interface WizardQuestionDefinition {
  readonly id: QuestionId;
  readonly stepNumber: number;
  readonly categoryBadge: string;
  readonly title: string;
  readonly subtitle: string;
  readonly isMultiSelect?: boolean;
  readonly options: readonly WizardQuestionOption[];
}

export type LensFamily = 'DESCANSO' | 'MONOFOCAL' | 'BIFOCAL' | 'MULTIFOCAL';

export type RefractiveIndex = '1.50' | '1.56' | '1.59' | '1.67' | '1.74';

/**
 * Ítem del catálogo de cristales sincronizado con Google Sheets.
 */
export interface LensCatalogItem {
  readonly sku: string;
  readonly commercialName: string;
  readonly shortBadge: string;
  readonly family: LensFamily;
  readonly refractiveIndex: RefractiveIndex;
  readonly materialDescription: string;
  readonly treatments: readonly string[];
  readonly idealForSummary: string;
  readonly priceStockARS: number;
  readonly priceLabARS: number;
  readonly stockRangeDescription: string;
  readonly labRangeDescription: string;
  readonly deliveryTimeStock: string;
  readonly deliveryTimeLab: string;
  readonly warrantyMonths: number;
}

export interface ClinicalTag {
  readonly id: string;
  readonly label: string;
  readonly category: 'protection' | 'material' | 'optics' | 'range';
}

/**
 * Salida determinística del motor `calculateOpticalRecommendation()` para el Paso 6 (RESULTADO).
 */
export interface OpticalRecommendationResult {
  readonly primaryOption: LensCatalogItem;
  readonly primaryCardTagline: string;
  readonly alternativeOption: LensCatalogItem;
  readonly alternativeCardTagline: string;
  readonly advisorObservationParagraph: string;
  readonly advisorClosingParagraph: string;
  readonly alternativeUpgradeReason: string;
  readonly personalizedReasoning: readonly string[];
  readonly clinicalTags: readonly ClinicalTag[];
  readonly requiresLabRangeWarning: boolean;
  readonly estimatedRangeNote: string;
}

export type PrescriptionStatus = 'HAS_RECENT_RX' | 'NEEDS_CHECKUP' | 'REST_NO_RX';

export type PaymentBenefitMode = 'CASH_TRANSFER' | 'LIST_INSTALLMENTS' | 'HEALTH_INSURANCE';

export interface LeadContactData {
  readonly fullName: string;
  readonly whatsapp: string;
  readonly locality?: string;
  readonly prescriptionStatus?: PrescriptionStatus;
  readonly preferredPayment?: PaymentBenefitMode;
  readonly healthInsuranceName?: string;
  readonly clinicalNotes?: string;
  readonly prescriptionPhotoName?: string;
  readonly prescriptionPhotoRemoteUrl?: string;
  readonly passportCode?: string;
}

export type WizardStepType = 'WELCOME' | 'QUESTIONS' | 'LEAD_CAPTURE' | 'QUOTE_RESULT';

export type WizardStateDiscriminated =
  | {
      readonly step: 'QUESTIONS';
      readonly activeQuestionIndex: number;
      readonly answers: UserOpticalAnswers;
      readonly lead: LeadContactData | null;
    }
  | {
      readonly step: 'QUOTE_RESULT';
      readonly activeQuestionIndex: number;
      readonly answers: CompletedOpticalAnswers;
      readonly lead: LeadContactData | null;
      readonly recommendation: OpticalRecommendationResult;
    };

export interface CatalogSyncState {
  readonly items: readonly LensCatalogItem[];
  readonly source: 'LIVE_SHEETS' | 'LOCAL_CACHE' | 'STATIC_FALLBACK';
  readonly updatedAtISO: string;
  readonly isLoading: boolean;
  readonly errorMessage: string | null;
}
