import { useCallback, useEffect, useMemo, useState } from 'react';
import { OPTICAL_WIZARD_QUESTIONS } from '../data/questions.data';
import { calculateOpticalRecommendation } from '../services/recommendation.engine';
import { submitLeadToGoogleSheets } from '../services/sheets.service';
import type {
  BrandThemeId,
  CompletedOpticalAnswers,
  FramePreferenceAnswer,
  GraduationSeverityAnswer,
  LeadContactData,
  LensCatalogItem,
  LightSensitivityAnswer,
  OpticalRecommendationResult,
  QuestionId,
  QuestionOptionValue,
  ScreenExposureAnswer,
  UserOpticalAnswers,
  VisionNeedAnswer,
  WizardQuestionDefinition,
  WizardStateDiscriminated,
  WizardStepType,
} from '../types/optical.types';
import { generateLeadId } from '../utils/formatters';
import { trackMetaPixelEvent } from '../utils/metaPixel.tracker';

const WIZARD_SESSION_STORAGE_KEY = 'optica_profesional_wizard_state_v2';

interface PersistedWizardSnapshot {
  readonly step: WizardStepType;
  readonly activeQuestionIndex: number;
  readonly answers: UserOpticalAnswers;
  readonly lead: LeadContactData | null;
}

function isCompletedAnswers(
  answers: UserOpticalAnswers
): answers is CompletedOpticalAnswers {
  return (
    typeof answers.visionNeed === 'string' &&
    typeof answers.screenExposure === 'string' &&
    typeof answers.lightSensitivity === 'string' &&
    typeof answers.graduationSeverity === 'string' &&
    typeof answers.framePreference === 'string'
  );
}

function loadInitialSnapshot(): PersistedWizardSnapshot {
  if (typeof window === 'undefined') {
    return {
      step: 'WELCOME',
      activeQuestionIndex: 0,
      answers: {},
      lead: null,
    };
  }

  try {
    const raw = window.sessionStorage.getItem(WIZARD_SESSION_STORAGE_KEY);
    if (!raw) {
      return {
        step: 'WELCOME',
        activeQuestionIndex: 0,
        answers: {},
        lead: null,
      };
    }

    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) {
      return {
        step: 'WELCOME',
        activeQuestionIndex: 0,
        answers: {},
        lead: null,
      };
    }

    const snapshot = parsed as Partial<PersistedWizardSnapshot>;
    const validStep: WizardStepType =
      snapshot.step === 'WELCOME' ||
      snapshot.step === 'QUESTIONS' ||
      snapshot.step === 'LEAD_CAPTURE' ||
      snapshot.step === 'QUOTE_RESULT'
        ? snapshot.step
        : 'WELCOME';

    const rawIndex =
      typeof snapshot.activeQuestionIndex === 'number'
        ? snapshot.activeQuestionIndex
        : 0;
    const clampedIndex = Math.max(
      0,
      Math.min(rawIndex, OPTICAL_WIZARD_QUESTIONS.length - 1)
    );

    const answers: UserOpticalAnswers =
      typeof snapshot.answers === 'object' && snapshot.answers !== null
        ? snapshot.answers
        : {};

    const lead: LeadContactData | null =
      typeof snapshot.lead === 'object' && snapshot.lead !== null
        ? (snapshot.lead as LeadContactData)
        : null;

    if (
      (validStep === 'LEAD_CAPTURE' || validStep === 'QUOTE_RESULT') &&
      !isCompletedAnswers(answers)
    ) {
      return {
        step: 'QUESTIONS',
        activeQuestionIndex: 0,
        answers,
        lead: null,
      };
    }

    if (validStep === 'QUOTE_RESULT' && !lead) {
      return {
        step: 'LEAD_CAPTURE',
        activeQuestionIndex: OPTICAL_WIZARD_QUESTIONS.length - 1,
        answers,
        lead: null,
      };
    }

    return {
      step: validStep,
      activeQuestionIndex: clampedIndex,
      answers,
      lead,
    };
  } catch {
    return {
      step: 'WELCOME',
      activeQuestionIndex: 0,
      answers: {},
      lead: null,
    };
  }
}

export interface UseOpticalWizardParams {
  readonly catalogItems: readonly LensCatalogItem[];
  readonly activeTheme: BrandThemeId;
}

export interface UseOpticalWizardReturn {
  readonly wizardState: WizardStateDiscriminated;
  readonly currentQuestion: WizardQuestionDefinition;
  readonly totalQuestions: number;
  readonly progressPercentage: number;
  readonly canGoBack: boolean;
  readonly isSubmittingLead: boolean;
  readonly startWizard: () => void;
  readonly selectQuestionOption: (
    questionId: QuestionId,
    value: QuestionOptionValue
  ) => void;
  readonly goToPreviousStep: () => void;
  readonly submitLeadAndGenerateQuote: (leadData: LeadContactData) => Promise<void>;
  readonly resetWizard: () => void;
  readonly registerWhatsAppContactConversion: (
    selectedTier: 'PRIMARY' | 'ALTERNATIVE'
  ) => void;
}

/**
 * Máquina de estados del Cotizador Óptico:
 * - Gestiona el paso actual ('WELCOME' | 'QUESTIONS' | 'LEAD_CAPTURE' | 'QUOTE_RESULT').
 * - Calcula el porcentaje de avance del flujo.
 * - Persiste automáticamente en `sessionStorage` para resistir recargas en navegadores móviles (Instagram in-app browser).
 * - Dispara los eventos de conversión `ViewContent`, `Lead` y `Contact` hacia Meta Pixel.
 */
export function useOpticalWizard({
  catalogItems,
  activeTheme,
}: UseOpticalWizardParams): UseOpticalWizardReturn {
  const [snapshot, setSnapshot] = useState<PersistedWizardSnapshot>(() =>
    loadInitialSnapshot()
  );
  const [isSubmittingLead, setIsSubmittingLead] = useState<boolean>(false);

  // Persistencia en sessionStorage en cada transición
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      window.sessionStorage.setItem(
        WIZARD_SESSION_STORAGE_KEY,
        JSON.stringify(snapshot)
      );
    } catch {
      // Ignorar restricciones de sessionStorage en webviews privados
    }
  }, [snapshot]);

  const totalQuestions = OPTICAL_WIZARD_QUESTIONS.length;

  const currentQuestion: WizardQuestionDefinition = useMemo(() => {
    const found = OPTICAL_WIZARD_QUESTIONS[snapshot.activeQuestionIndex];
    if (found) {
      return found;
    }
    // Fallback garantizado a la primera pregunta
    return OPTICAL_WIZARD_QUESTIONS[0] as WizardQuestionDefinition;
  }, [snapshot.activeQuestionIndex]);

  const recommendation: OpticalRecommendationResult | null = useMemo(() => {
    if (!isCompletedAnswers(snapshot.answers)) {
      return null;
    }
    return calculateOpticalRecommendation(snapshot.answers, catalogItems);
  }, [snapshot.answers, catalogItems]);

  const wizardState: WizardStateDiscriminated = useMemo(() => {
    if (
      snapshot.step === 'QUOTE_RESULT' &&
      isCompletedAnswers(snapshot.answers) &&
      snapshot.lead &&
      recommendation
    ) {
      return {
        step: 'QUOTE_RESULT',
        activeQuestionIndex: snapshot.activeQuestionIndex,
        answers: snapshot.answers,
        lead: snapshot.lead,
        recommendation,
      };
    }

    if (
      snapshot.step === 'LEAD_CAPTURE' &&
      isCompletedAnswers(snapshot.answers)
    ) {
      return {
        step: 'LEAD_CAPTURE',
        activeQuestionIndex: snapshot.activeQuestionIndex,
        answers: snapshot.answers,
        lead: snapshot.lead,
      };
    }

    if (snapshot.step === 'QUESTIONS') {
      return {
        step: 'QUESTIONS',
        activeQuestionIndex: snapshot.activeQuestionIndex,
        answers: snapshot.answers,
        lead: snapshot.lead,
      };
    }

    return {
      step: 'WELCOME',
      activeQuestionIndex: 0,
      answers: snapshot.answers,
      lead: snapshot.lead,
    };
  }, [snapshot, recommendation]);

  const progressPercentage = useMemo(() => {
    switch (wizardState.step) {
      case 'WELCOME':
        return 8;
      case 'QUESTIONS': {
        const questionProgress =
          ((wizardState.activeQuestionIndex + 1) / (totalQuestions + 1)) * 85;
        return Math.round(Math.max(18, Math.min(82, questionProgress)));
      }
      case 'LEAD_CAPTURE':
        return 90;
      case 'QUOTE_RESULT':
        return 100;
    }
  }, [wizardState.step, wizardState.activeQuestionIndex, totalQuestions]);

  const canGoBack = wizardState.step !== 'WELCOME';

  const startWizard = useCallback(() => {
    trackMetaPixelEvent('ViewContent', {
      content_name: 'Inicio Diagnóstico Cotizador Óptico',
      content_category: 'OpticalWizard',
      status: 'started',
    });

    setSnapshot((prev) => ({
      ...prev,
      step: 'QUESTIONS',
      activeQuestionIndex: 0,
    }));
  }, []);

  const selectQuestionOption = useCallback(
    (questionId: QuestionId, value: QuestionOptionValue) => {
      setSnapshot((prev) => {
        const updatedAnswers: UserOpticalAnswers = {
          ...prev.answers,
          ...(questionId === 'visionNeed'
            ? { visionNeed: value as VisionNeedAnswer }
            : {}),
          ...(questionId === 'screenExposure'
            ? { screenExposure: value as ScreenExposureAnswer }
            : {}),
          ...(questionId === 'lightSensitivity'
            ? { lightSensitivity: value as LightSensitivityAnswer }
            : {}),
          ...(questionId === 'graduationSeverity'
            ? { graduationSeverity: value as GraduationSeverityAnswer }
            : {}),
          ...(questionId === 'framePreference'
            ? { framePreference: value as FramePreferenceAnswer }
            : {}),
        };

        const isLastQuestion = prev.activeQuestionIndex >= totalQuestions - 1;

        if (isLastQuestion && isCompletedAnswers(updatedAnswers)) {
          const previewRec = calculateOpticalRecommendation(
            updatedAnswers,
            catalogItems
          );

          trackMetaPixelEvent('ViewContent', {
            content_name: `Pre-Diagnóstico Completado: ${previewRec.primaryOption.sku}`,
            content_category: 'OpticalWizardQuestionsCompleted',
            content_ids: [previewRec.primaryOption.sku],
            value: previewRec.primaryOption.priceStockARS,
            currency: 'ARS',
          });

          return {
            ...prev,
            step: 'LEAD_CAPTURE',
            answers: updatedAnswers,
          };
        }

        return {
          ...prev,
          step: 'QUESTIONS',
          activeQuestionIndex: Math.min(
            prev.activeQuestionIndex + 1,
            totalQuestions - 1
          ),
          answers: updatedAnswers,
        };
      });
    },
    [totalQuestions, catalogItems]
  );

  const goToPreviousStep = useCallback(() => {
    setSnapshot((prev) => {
      if (prev.step === 'QUOTE_RESULT') {
        return {
          ...prev,
          step: 'LEAD_CAPTURE',
        };
      }

      if (prev.step === 'LEAD_CAPTURE') {
        return {
          ...prev,
          step: 'QUESTIONS',
          activeQuestionIndex: totalQuestions - 1,
        };
      }

      if (prev.step === 'QUESTIONS') {
        if (prev.activeQuestionIndex > 0) {
          return {
            ...prev,
            activeQuestionIndex: prev.activeQuestionIndex - 1,
          };
        }
        return {
          ...prev,
          step: 'WELCOME',
          activeQuestionIndex: 0,
        };
      }

      return prev;
    });
  }, [totalQuestions]);

  const submitLeadAndGenerateQuote = useCallback(
    async (leadData: LeadContactData) => {
      if (!isCompletedAnswers(snapshot.answers)) {
        return;
      }

      setIsSubmittingLead(true);
      const computedRec = calculateOpticalRecommendation(
        snapshot.answers,
        catalogItems
      );
      const leadId = generateLeadId();

      trackMetaPixelEvent('Lead', {
        content_name: computedRec.primaryOption.commercialName,
        content_category: computedRec.primaryOption.family,
        content_ids: [
          computedRec.primaryOption.sku,
          computedRec.alternativeOption.sku,
        ],
        value: computedRec.primaryOption.priceStockARS,
        currency: 'ARS',
        status: leadData.prescriptionStatus,
      });

      // Envío resiliente a Google Sheets (no bloquea el resultado si la red tarda)
      await submitLeadToGoogleSheets({
        leadId,
        lead: leadData,
        answers: snapshot.answers,
        recommendation: computedRec,
        activeTheme,
      });

      setIsSubmittingLead(false);

      setSnapshot((prev) => ({
        ...prev,
        step: 'QUOTE_RESULT',
        lead: leadData,
      }));
    },
    [snapshot.answers, catalogItems, activeTheme]
  );

  const registerWhatsAppContactConversion = useCallback(
    (selectedTier: 'PRIMARY' | 'ALTERNATIVE') => {
      if (!recommendation) {
        return;
      }
      const chosen =
        selectedTier === 'ALTERNATIVE'
          ? recommendation.alternativeOption
          : recommendation.primaryOption;

      trackMetaPixelEvent('Contact', {
        content_name: `WhatsApp Cierre: ${chosen.commercialName}`,
        content_category: chosen.family,
        content_ids: [chosen.sku],
        value: chosen.priceStockARS,
        currency: 'ARS',
        status: selectedTier,
      });
    },
    [recommendation]
  );

  const resetWizard = useCallback(() => {
    setSnapshot({
      step: 'WELCOME',
      activeQuestionIndex: 0,
      answers: {},
      lead: null,
    });
    if (typeof window !== 'undefined') {
      try {
        window.sessionStorage.removeItem(WIZARD_SESSION_STORAGE_KEY);
      } catch {
        // Ignorar
      }
    }
  }, []);

  return {
    wizardState,
    currentQuestion,
    totalQuestions,
    progressPercentage,
    canGoBack,
    isSubmittingLead,
    startWizard,
    selectQuestionOption,
    goToPreviousStep,
    submitLeadAndGenerateQuote,
    resetWizard,
    registerWhatsAppContactConversion,
  };
}
