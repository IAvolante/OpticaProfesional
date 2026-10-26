import { useCallback, useEffect, useMemo, useState } from 'react';
import { OPTICAL_WIZARD_QUESTIONS } from '../data/questions.data';
import { calculateOpticalRecommendation } from '../services/recommendation.engine';
import { submitLeadToGoogleSheets } from '../services/sheets.service';
import type {
  ActivityContextAnswer,
  BrandThemeId,
  BudgetPreferenceAnswer,
  ClientPriorityAnswer,
  CompletedOpticalAnswers,
  ImprovementGoalAnswer,
  LeadContactData,
  LensCatalogItem,
  OpticalRecommendationResult,
  PrescriptionAttachmentAnswer,
  QuestionId,
  QuestionOptionValue,
  UserOpticalAnswers,
  WizardQuestionDefinition,
  WizardStateDiscriminated,
  WizardStepType,
} from '../types/optical.types';
import { generateLeadId } from '../utils/formatters';
import { trackMetaPixelEvent } from '../utils/metaPixel.tracker';
import { buildWhatsAppDeepLink } from '../utils/whatsapp.encoder';

const WIZARD_SESSION_STORAGE_KEY = 'optica_profesional_wizard_state_v4';

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
    typeof answers.improvementGoal === 'string' &&
    typeof answers.activityContext === 'string' &&
    typeof answers.clientPriority === 'string' &&
    Array.isArray(answers.budgetPreferences) &&
    answers.budgetPreferences.length > 0 &&
    typeof answers.prescriptionAttachment === 'string'
  );
}

function loadInitialSnapshot(): PersistedWizardSnapshot {
  if (typeof window === 'undefined') {
    return {
      step: 'QUESTIONS',
      activeQuestionIndex: 0,
      answers: {},
      lead: null,
    };
  }

  try {
    const raw = window.sessionStorage.getItem(WIZARD_SESSION_STORAGE_KEY);
    if (!raw) {
      return {
        step: 'QUESTIONS',
        activeQuestionIndex: 0,
        answers: {},
        lead: null,
      };
    }

    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) {
      return {
        step: 'QUESTIONS',
        activeQuestionIndex: 0,
        answers: {},
        lead: null,
      };
    }

    const snapshot = parsed as Partial<PersistedWizardSnapshot>;
    const validStep: WizardStepType =
      snapshot.step === 'QUESTIONS' || snapshot.step === 'QUOTE_RESULT'
        ? snapshot.step
        : 'QUESTIONS';

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

    if (validStep === 'QUOTE_RESULT' && !isCompletedAnswers(answers)) {
      return {
        step: 'QUESTIONS',
        activeQuestionIndex: 0,
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
      step: 'QUESTIONS',
      activeQuestionIndex: 0,
      answers: {},
      lead: null,
    };
  }
}

export interface ClaimBenefitParams {
  readonly fullName: string;
  readonly whatsapp: string;
  readonly selectedTier: 'PRIMARY' | 'ALTERNATIVE';
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
  readonly selectQuestionOption: (
    questionId: QuestionId,
    value: QuestionOptionValue
  ) => void;
  readonly confirmBudgetPreferencesStep: () => void;
  readonly attachPrescriptionPhotoAndAdvance: (
    fileName: string,
    dataUrl: string
  ) => void;
  readonly goToPreviousStep: () => void;
  readonly goToQuestionIndex: (index: number) => void;
  readonly claimBenefitAndOpenWhatsApp: (
    params: ClaimBenefitParams
  ) => Promise<void>;
  readonly resetWizard: () => void;
}

export function useOpticalWizard({
  catalogItems,
  activeTheme,
}: UseOpticalWizardParams): UseOpticalWizardReturn {
  const [snapshot, setSnapshot] = useState<PersistedWizardSnapshot>(() =>
    loadInitialSnapshot()
  );
  const [isSubmittingLead, setIsSubmittingLead] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      // No persistimos el Base64 de la foto en sessionStorage para no exceder la cuota de 5MB en móviles
      const lightSnapshot: PersistedWizardSnapshot = {
        ...snapshot,
        answers: {
          ...snapshot.answers,
          prescriptionPhotoDataUrl: undefined,
        },
      };
      window.sessionStorage.setItem(
        WIZARD_SESSION_STORAGE_KEY,
        JSON.stringify(lightSnapshot)
      );
    } catch {
      // Ignorar si excede sessionStorage en navegador privado
    }
  }, [snapshot]);

  const totalQuestions = OPTICAL_WIZARD_QUESTIONS.length;

  const currentQuestion: WizardQuestionDefinition = useMemo(() => {
    const found = OPTICAL_WIZARD_QUESTIONS[snapshot.activeQuestionIndex];
    if (found) {
      return found;
    }
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

    return {
      step: 'QUESTIONS',
      activeQuestionIndex: snapshot.activeQuestionIndex,
      answers: snapshot.answers,
      lead: snapshot.lead,
    };
  }, [snapshot, recommendation]);

  const progressPercentage = useMemo(() => {
    if (wizardState.step === 'QUOTE_RESULT') {
      return 100;
    }
    const questionProgress =
      ((wizardState.activeQuestionIndex + 1) / (totalQuestions + 1)) * 92;
    return Math.round(Math.max(16, Math.min(88, questionProgress)));
  }, [wizardState.step, wizardState.activeQuestionIndex, totalQuestions]);

  const canGoBack =
    wizardState.step !== 'QUESTIONS' || wizardState.activeQuestionIndex > 0;

  const selectQuestionOption = useCallback(
    (questionId: QuestionId, value: QuestionOptionValue) => {
      setSnapshot((prev) => {
        // Paso 4: Selección múltiple (se puede elegir más de una opción)
        if (questionId === 'budgetPreferences') {
          const item = value as BudgetPreferenceAnswer;
          const currentList = prev.answers.budgetPreferences ?? [];
          const exists = currentList.includes(item);
          const nextList = exists
            ? currentList.filter((v) => v !== item)
            : [...currentList, item];

          return {
            ...prev,
            answers: {
              ...prev.answers,
              budgetPreferences: nextList,
            },
          };
        }

        const updatedAnswers: UserOpticalAnswers = {
          ...prev.answers,
          ...(questionId === 'improvementGoal'
            ? { improvementGoal: value as ImprovementGoalAnswer }
            : {}),
          ...(questionId === 'activityContext'
            ? { activityContext: value as ActivityContextAnswer }
            : {}),
          ...(questionId === 'clientPriority'
            ? { clientPriority: value as ClientPriorityAnswer }
            : {}),
          ...(questionId === 'prescriptionAttachment'
            ? { prescriptionAttachment: value as PrescriptionAttachmentAnswer }
            : {}),
        };

        // Paso 5: Si elige "Aún no la tengo", pasamos directo al Paso 6 (RESULTADO)
        if (questionId === 'prescriptionAttachment') {
          const ensuredAnswers: UserOpticalAnswers = {
            ...updatedAnswers,
            budgetPreferences:
              updatedAnswers.budgetPreferences &&
              updatedAnswers.budgetPreferences.length > 0
                ? updatedAnswers.budgetPreferences
                : ['soy_particular'],
          };

          if (isCompletedAnswers(ensuredAnswers)) {
            const previewRec = calculateOpticalRecommendation(
              ensuredAnswers,
              catalogItems
            );
            trackMetaPixelEvent('ViewContent', {
              content_name: `Asesor Virtual Resultado: ${previewRec.primaryOption.sku}`,
              content_category: 'OpticalWizardCompleted',
              content_ids: [
                previewRec.primaryOption.sku,
                previewRec.alternativeOption.sku,
              ],
              value: previewRec.primaryOption.priceStockARS,
              currency: 'ARS',
            });

            return {
              ...prev,
              step: 'QUOTE_RESULT',
              answers: ensuredAnswers,
            };
          }
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

  const confirmBudgetPreferencesStep = useCallback(() => {
    setSnapshot((prev) => {
      const currentList = prev.answers.budgetPreferences ?? [];
      const ensuredList: readonly BudgetPreferenceAnswer[] =
        currentList.length > 0 ? currentList : ['soy_particular'];

      return {
        ...prev,
        step: 'QUESTIONS',
        activeQuestionIndex: Math.min(
          prev.activeQuestionIndex + 1,
          totalQuestions - 1
        ),
        answers: {
          ...prev.answers,
          budgetPreferences: ensuredList,
        },
      };
    });
  }, [totalQuestions]);

  const attachPrescriptionPhotoAndAdvance = useCallback(
    (fileName: string, dataUrl: string) => {
      setSnapshot((prev) => {
        const updatedAnswers: UserOpticalAnswers = {
          ...prev.answers,
          budgetPreferences:
            prev.answers.budgetPreferences &&
            prev.answers.budgetPreferences.length > 0
              ? prev.answers.budgetPreferences
              : ['soy_particular'],
          prescriptionAttachment: 'cargar_foto_receta',
          prescriptionPhotoName: fileName,
          prescriptionPhotoDataUrl: dataUrl,
        };

        if (isCompletedAnswers(updatedAnswers) && prev.step !== 'QUOTE_RESULT') {
          const previewRec = calculateOpticalRecommendation(
            updatedAnswers,
            catalogItems
          );
          trackMetaPixelEvent('ViewContent', {
            content_name: `Receta Cargada + Resultado: ${previewRec.primaryOption.sku}`,
            content_category: 'OpticalWizardCompletedWithRx',
            content_ids: [
              previewRec.primaryOption.sku,
              previewRec.alternativeOption.sku,
            ],
            value: previewRec.primaryOption.priceStockARS,
            currency: 'ARS',
          });
        }

        return {
          ...prev,
          step: 'QUOTE_RESULT',
          answers: updatedAnswers,
        };
      });
    },
    [catalogItems]
  );

  const goToPreviousStep = useCallback(() => {
    setSnapshot((prev) => {
      if (prev.step === 'QUOTE_RESULT') {
        return {
          ...prev,
          step: 'QUESTIONS',
          activeQuestionIndex: totalQuestions - 1,
        };
      }

      if (prev.step === 'QUESTIONS' && prev.activeQuestionIndex > 0) {
        return {
          ...prev,
          activeQuestionIndex: prev.activeQuestionIndex - 1,
        };
      }

      return prev;
    });
  }, [totalQuestions]);

  const goToQuestionIndex = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(index, totalQuestions - 1));
      setSnapshot((prev) => ({
        ...prev,
        step: 'QUESTIONS',
        activeQuestionIndex: clamped,
      }));
    },
    [totalQuestions]
  );

  const claimBenefitAndOpenWhatsApp = useCallback(
    async ({ fullName, whatsapp, selectedTier }: ClaimBenefitParams) => {
      if (!isCompletedAnswers(snapshot.answers) || !recommendation) {
        return;
      }

      setIsSubmittingLead(true);
      const leadId = snapshot.lead?.passportCode ?? generateLeadId();
      const chosenOption =
        selectedTier === 'ALTERNATIVE'
          ? recommendation.alternativeOption
          : recommendation.primaryOption;

      trackMetaPixelEvent('Lead', {
        content_name: chosenOption.commercialName,
        content_category: chosenOption.family,
        content_ids: [chosenOption.sku],
        value: chosenOption.priceStockARS,
        currency: 'ARS',
        status: snapshot.answers.prescriptionAttachment,
      });

      const leadData: LeadContactData = {
        fullName,
        whatsapp,
        passportCode: leadId,
        prescriptionPhotoName: snapshot.answers.prescriptionPhotoName,
      };

      const hasPhotoData = Boolean(
        snapshot.answers.prescriptionPhotoDataUrl &&
          snapshot.answers.prescriptionPhotoDataUrl.length > 50
      );

      let uploadedPhotoUrl: string | undefined;

      if (hasPhotoData) {
        // Si el cliente adjuntó foto de su receta, esperamos hasta 4s para guardarla en Google Drive
        // y obtener el link público así viaja tanto en Google Sheets como en el mensaje de WhatsApp
        const submitResult = await submitLeadToGoogleSheets({
          leadId,
          lead: leadData,
          answers: snapshot.answers,
          recommendation,
          selectedTier,
          activeTheme,
        });
        uploadedPhotoUrl = submitResult.uploadedPhotoUrl;
      } else {
        // Si no adjuntó foto, enviamos a Google Sheets en segundo plano y abrimos WhatsApp en el acto
        void submitLeadToGoogleSheets({
          leadId,
          lead: leadData,
          answers: snapshot.answers,
          recommendation,
          selectedTier,
          activeTheme,
        });
      }

      const finalLead: LeadContactData = {
        ...leadData,
        prescriptionPhotoRemoteUrl: uploadedPhotoUrl,
      };

      const finalAnswers: CompletedOpticalAnswers = {
        ...snapshot.answers,
        prescriptionPhotoRemoteUrl: uploadedPhotoUrl,
      };

      setSnapshot((prev) => ({
        ...prev,
        lead: finalLead,
        answers: finalAnswers,
      }));

      const whatsappUrl = buildWhatsAppDeepLink({
        lead: finalLead,
        answers: finalAnswers,
        recommendation,
        selectedLensType: selectedTier,
      });

      setIsSubmittingLead(false);
      window.location.href = whatsappUrl;
    },
    [snapshot.answers, snapshot.lead, recommendation, activeTheme]
  );

  const resetWizard = useCallback(() => {
    setSnapshot({
      step: 'QUESTIONS',
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
    selectQuestionOption,
    confirmBudgetPreferencesStep,
    attachPrescriptionPhotoAndAdvance,
    goToPreviousStep,
    goToQuestionIndex,
    claimBenefitAndOpenWhatsApp,
    resetWizard,
  };
}
