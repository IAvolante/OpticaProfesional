/**
 * ============================================================================
 * CONTRATOS DE DOMINIO ESTRICTOS — ÓPTICA PROFESIONAL (B2C) & SMART OPTICAL (B2B)
 * ============================================================================
 * Tipado estricto (strict: true, noUncheckedIndexedAccess: true, cero any).
 */

/**
 * Presets del Sistema de Diseño Semántico para la sesión de Discovery con Solana.
 */
export type BrandThemeId = 'theme-neutral' | 'theme-boutique' | 'theme-clinical';

/**
 * Unidad de negocio dentro del ecosistema en Salta.
 */
export type BusinessUnit = 'B2C_OPTICA_PROFESIONAL' | 'B2B_SMART_OPTICAL';

/**
 * Identificadores estrictos de las preguntas del Wizard.
 */
export type QuestionId =
  | 'visionNeed'
  | 'screenExposure'
  | 'lightSensitivity'
  | 'graduationSeverity'
  | 'framePreference';

/**
 * Respuestas literales para la Pregunta 1: Necesidad / Distancia Visual.
 */
export type VisionNeedAnswer =
  | 'single_distance' // Visión Sencilla (Lejos o Cerca por separado)
  | 'near_and_far' // Multifocal / Progresivo o Bifocal (Lejos y Cerca a la vez)
  | 'visual_rest'; // Descanso visual / Sin aumento previo

/**
 * Respuestas literales para la Pregunta 2: Exposición diaria a pantallas.
 */
export type ScreenExposureAnswer =
  | 'low_under_3h' // Menos de 3 horas diarias
  | 'moderate_3_to_6h' // De 3 a 6 horas diarias (Oficina / Estudio)
  | 'intensive_6h_plus'; // Más de 6 horas diarias (Uso intensivo digital)

/**
 * Respuestas literales para la Pregunta 3: Exposición al sol y conducción en Salta.
 */
export type LightSensitivityAnswer =
  | 'mostly_indoors' // Mayormente en interiores
  | 'outdoor_commute' // Salidas frecuentes al sol / Molestia al caminar al aire libre
  | 'day_night_driving'; // Conducción frecuente de día (sol fuerte) y noche (encandilamiento)

/**
 * Respuestas literales para la Pregunta 4: Magnitud de graduación estimada / espesor.
 */
export type GraduationSeverityAnswer =
  | 'neutral_or_low' // Sin aumento o graduación baja (Esf hasta ±2.00 D)
  | 'moderate_up_to_4' // Graduación intermedia (Esf entre ±2.25 y ±4.00 D)
  | 'high_plus_4' // Graduación alta (Mayor a ±4.00 D o astigmatismo alto > -2.00 D)
  | 'unknown_recipe'; // Tengo mi receta pero no sé leer los números

/**
 * Respuestas literales para la Pregunta 5: Necesidad de Armazón / Montura (Calificación Ventas).
 */
export type FramePreferenceAnswer =
  | 'need_new_frame' // Busco armazón nuevo + cristales
  | 'need_clip_on' // Busco armazón con Clip-On magnético (Sol + Receta)
  | 'own_frame' // Ya tengo mi propio armazón (solo cristales)
  | 'undecided_frame'; // Quiero ver opciones de armazones con el asesor

/**
 * Mapa tipado de respuestas del usuario durante el flujo de preguntas.
 */
export interface UserOpticalAnswers {
  readonly visionNeed?: VisionNeedAnswer;
  readonly screenExposure?: ScreenExposureAnswer;
  readonly lightSensitivity?: LightSensitivityAnswer;
  readonly graduationSeverity?: GraduationSeverityAnswer;
  readonly framePreference?: FramePreferenceAnswer;
}

/**
 * Respuestas completas validadas (requeridas para ejecutar el motor determinístico).
 */
export interface CompletedOpticalAnswers {
  readonly visionNeed: VisionNeedAnswer;
  readonly screenExposure: ScreenExposureAnswer;
  readonly lightSensitivity: LightSensitivityAnswer;
  readonly graduationSeverity: GraduationSeverityAnswer;
  readonly framePreference: FramePreferenceAnswer;
}

/**
 * Valor literal válido de cualquier opción de pregunta.
 */
export type QuestionOptionValue =
  | VisionNeedAnswer
  | ScreenExposureAnswer
  | LightSensitivityAnswer
  | GraduationSeverityAnswer
  | FramePreferenceAnswer;

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
  readonly options: readonly WizardQuestionOption[];
}

/**
 * Familias de cristales ópticos comercializados.
 */
export type LensFamily = 'DESCANSO' | 'MONOFOCAL' | 'BIFOCAL' | 'MULTIFOCAL';

/**
 * Índices de refracción estándar del catálogo óptico.
 */
export type RefractiveIndex = '1.50' | '1.56' | '1.59' | '1.67';

/**
 * Estructura dual de precios (Rango Stock vs. Rango Laboratorio) para cada cristal.
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

/**
 * Etiqueta clínica de justificación mostrada en la cotización.
 */
export interface ClinicalTag {
  readonly id: string;
  readonly label: string;
  readonly category: 'protection' | 'material' | 'optics' | 'range';
}

/**
 * Salida determinística del motor `calculateOpticalRecommendation()`.
 */
export interface OpticalRecommendationResult {
  readonly primaryOption: LensCatalogItem;
  readonly alternativeOption: LensCatalogItem;
  readonly alternativeUpgradeReason: string;
  readonly personalizedReasoning: readonly string[];
  readonly clinicalTags: readonly ClinicalTag[];
  readonly requiresLabRangeWarning: boolean;
  readonly estimatedRangeNote: string;
}

/**
 * Estado de la receta médica del paciente.
 */
export type PrescriptionStatus = 'HAS_RECENT_RX' | 'NEEDS_CHECKUP' | 'REST_NO_RX';

/**
 * Modalidad de pago o cobertura seleccionada en el simulador de ahorro en vivo.
 */
export type PaymentBenefitMode = 'CASH_TRANSFER' | 'LIST_INSTALLMENTS' | 'HEALTH_INSURANCE';

/**
 * Datos de contacto y calificación comercial/clínica capturados para transferir a Ventas.
 */
export interface LeadContactData {
  readonly fullName: string;
  readonly whatsapp: string;
  readonly locality: string;
  readonly prescriptionStatus: PrescriptionStatus;
  readonly preferredPayment?: PaymentBenefitMode;
  readonly healthInsuranceName?: string;
  readonly clinicalNotes?: string;
  readonly prescriptionPhotoName?: string;
  readonly passportCode?: string;
}

/**
 * Unión discriminada estricta para los 4 estados del Wizard.
 */
export type WizardStepType = 'WELCOME' | 'QUESTIONS' | 'LEAD_CAPTURE' | 'QUOTE_RESULT';

export type WizardStateDiscriminated =
  | {
      readonly step: 'WELCOME';
      readonly activeQuestionIndex: 0;
      readonly answers: UserOpticalAnswers;
      readonly lead: LeadContactData | null;
    }
  | {
      readonly step: 'QUESTIONS';
      readonly activeQuestionIndex: number;
      readonly answers: UserOpticalAnswers;
      readonly lead: LeadContactData | null;
    }
  | {
      readonly step: 'LEAD_CAPTURE';
      readonly activeQuestionIndex: number;
      readonly answers: CompletedOpticalAnswers;
      readonly lead: LeadContactData | null;
    }
  | {
      readonly step: 'QUOTE_RESULT';
      readonly activeQuestionIndex: number;
      readonly answers: CompletedOpticalAnswers;
      readonly lead: LeadContactData;
      readonly recommendation: OpticalRecommendationResult;
    };

/**
 * Estado de sincronización del catálogo de precios (Google Sheets + Cache + Fallback).
 */
export interface CatalogSyncState {
  readonly items: readonly LensCatalogItem[];
  readonly source: 'LIVE_SHEETS' | 'LOCAL_CACHE' | 'STATIC_FALLBACK';
  readonly updatedAtISO: string;
  readonly isLoading: boolean;
  readonly errorMessage: string | null;
}
