import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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

const WIZARD_SESSION_STORAGE_KEY = 'optica_profesional_wizard_state_v5';

interface PersistedWizardSnapshot {
  readonly step: WizardStepType;
  readonly activeQuestionIndex: number;
  readonly answers: UserOpticalAnswers;
  readonly lead: LeadContactData | null;
}

function isCompletedAnswers(
  answers: UserOpticalAnswers
): answers is CompletedOpticalAnswers {
  const hasP1 =
    typeof answers.improvementGoal === 'string' ||
    (Array.isArray(answers.improvementGoals) &&
      answers.improvementGoals.length > 0);
  const hasP2 =
    typeof answers.activityContext === 'string' ||
    (Array.isArray(answers.activityContexts) &&
      answers.activityContexts.length > 0);
  const hasP3 =
    typeof answers.clientPriority === 'string' ||
    (Array.isArray(answers.clientPriorities) &&
      answers.clientPriorities.length > 0);

  return (
    hasP1 &&
    hasP2 &&
    hasP3 &&
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
  readonly selectedOptionNumber?: number;
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
  const trackedQuoteKeyRef = useRef<string | null>(null);

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
        // Paso 1: Selección de hasta 2 opciones (`improvementGoals`)
        if (questionId === 'improvementGoal') {
          const item = value as ImprovementGoalAnswer;
          const currentList =
            prev.answers.improvementGoals &&
            prev.answers.improvementGoals.length > 0
              ? prev.answers.improvementGoals
              : prev.answers.improvementGoal
                ? [prev.answers.improvementGoal]
                : [];
          const exists = currentList.includes(item);
          let nextList: readonly ImprovementGoalAnswer[];
          if (exists) {
            nextList = currentList.filter((v) => v !== item);
          } else if (currentList.length >= 2) {
            // Si ya había 2 seleccionadas y toca una tercera, reemplazamos la segunda por la nueva
            nextList = [currentList[0]!, item];
          } else {
            nextList = [...currentList, item];
          }

          return {
            ...prev,
            answers: {
              ...prev.answers,
              improvementGoal: nextList[0],
              improvementGoals: nextList,
            },
          };
        }

        // Paso 2: Selección de hasta 2 opciones (`activityContexts`)
        if (questionId === 'activityContext') {
          const item = value as ActivityContextAnswer;
          const currentList =
            prev.answers.activityContexts &&
            prev.answers.activityContexts.length > 0
              ? prev.answers.activityContexts
              : prev.answers.activityContext
                ? [prev.answers.activityContext]
                : [];
          const exists = currentList.includes(item);
          let nextList: readonly ActivityContextAnswer[];
          if (exists) {
            nextList = currentList.filter((v) => v !== item);
          } else if (currentList.length >= 2) {
            nextList = [currentList[0]!, item];
          } else {
            nextList = [...currentList, item];
          }

          return {
            ...prev,
            answers: {
              ...prev.answers,
              activityContext: nextList[0],
              activityContexts: nextList,
            },
          };
        }

        // Paso 3: Selección de hasta 2 opciones (`clientPriorities`)
        if (questionId === 'clientPriority') {
          const item = value as ClientPriorityAnswer;
          const currentList =
            prev.answers.clientPriorities &&
            prev.answers.clientPriorities.length > 0
              ? prev.answers.clientPriorities
              : prev.answers.clientPriority
                ? [prev.answers.clientPriority]
                : [];
          const exists = currentList.includes(item);
          let nextList: readonly ClientPriorityAnswer[];
          if (exists) {
            nextList = currentList.filter((v) => v !== item);
          } else if (currentList.length >= 2) {
            nextList = [currentList[0]!, item];
          } else {
            nextList = [...currentList, item];
          }

          return {
            ...prev,
            answers: {
              ...prev.answers,
              clientPriority: nextList[0],
              clientPriorities: nextList,
            },
          };
        }

        // Paso 4: Selección múltiple sin límite (`budgetPreferences`)
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

            const sessionPassportCode =
              prev.lead?.passportCode ?? generateLeadId();

            return {
              ...prev,
              step: 'QUOTE_RESULT',
              answers: ensuredAnswers,
              lead: prev.lead
                ? { ...prev.lead, passportCode: sessionPassportCode }
                : {
                    fullName: '',
                    whatsapp: '',
                    passportCode: sessionPassportCode,
                  },
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
      const currentQ = OPTICAL_WIZARD_QUESTIONS[prev.activeQuestionIndex];

      // Si estamos en el Paso 4 (presupuesto), aseguramos al menos 'soy_particular' si no marcó nada
      if (currentQ?.id === 'budgetPreferences') {
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
      }

      // En los Pasos 1, 2 y 3 (selección de hasta 2 opciones), avanzamos al siguiente paso
      return {
        ...prev,
        step: 'QUESTIONS',
        activeQuestionIndex: Math.min(
          prev.activeQuestionIndex + 1,
          totalQuestions - 1
        ),
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
          prescriptionPhotoRemoteUrl: undefined,
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

        const sessionPassportCode =
          prev.lead?.passportCode ?? generateLeadId();

        return {
          ...prev,
          step: 'QUOTE_RESULT',
          answers: updatedAnswers,
          lead: prev.lead
            ? {
                ...prev.lead,
                passportCode: sessionPassportCode,
                prescriptionPhotoName: fileName,
                prescriptionPhotoRemoteUrl: undefined,
              }
            : {
                fullName: '',
                whatsapp: '',
                passportCode: sessionPassportCode,
                prescriptionPhotoName: fileName,
              },
        };
      });
    },
    [catalogItems]
  );

  // Registro automático en Google Sheets apenas el usuario termina las 5 preguntas y llega al Paso 6 (viendo precios),
  // incluso si luego abandona la página sin completar su Nombre y WhatsApp.
  useEffect(() => {
    if (
      snapshot.step !== 'QUOTE_RESULT' ||
      !isCompletedAnswers(snapshot.answers) ||
      !recommendation
    ) {
      return;
    }

    // Si ya completó su WhatsApp en esta sesión, no enviamos el estado preliminar
    if (snapshot.lead?.whatsapp && snapshot.lead.whatsapp.trim().length > 0) {
      return;
    }

    const sessionPassportCode =
      snapshot.lead?.passportCode ?? generateLeadId();
    const photoSignature = snapshot.answers.prescriptionPhotoName ?? 'no-rx';
    const quoteTrackingKey = `${sessionPassportCode}::${photoSignature}`;

    if (trackedQuoteKeyRef.current === quoteTrackingKey) {
      return;
    }
    trackedQuoteKeyRef.current = quoteTrackingKey;

    const previewLead: LeadContactData = {
      fullName: snapshot.lead?.fullName ?? '',
      whatsapp: snapshot.lead?.whatsapp ?? '',
      passportCode: sessionPassportCode,
      prescriptionPhotoName: snapshot.answers.prescriptionPhotoName,
      prescriptionPhotoRemoteUrl: snapshot.answers.prescriptionPhotoRemoteUrl,
    };

    void submitLeadToGoogleSheets({
      stage: 'QUOTE_VIEWED',
      leadId: sessionPassportCode,
      lead: previewLead,
      answers: snapshot.answers,
      recommendation,
      selectedTier: 'PRIMARY',
      activeTheme,
    }).then((result) => {
      if (result.uploadedPhotoUrl) {
        setSnapshot((prev) => ({
          ...prev,
          lead: prev.lead
            ? {
                ...prev.lead,
                passportCode: sessionPassportCode,
                prescriptionPhotoRemoteUrl: result.uploadedPhotoUrl,
              }
            : {
                fullName: '',
                whatsapp: '',
                passportCode: sessionPassportCode,
                prescriptionPhotoRemoteUrl: result.uploadedPhotoUrl,
              },
          answers: {
            ...prev.answers,
            prescriptionPhotoRemoteUrl: result.uploadedPhotoUrl,
          },
        }));
      }
    });
  }, [
    snapshot.step,
    snapshot.answers,
    snapshot.lead,
    recommendation,
    activeTheme,
  ]);

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
    async ({
      fullName,
      whatsapp,
      selectedTier,
      selectedOptionNumber,
    }: ClaimBenefitParams) => {
      if (!isCompletedAnswers(snapshot.answers) || !recommendation) {
        return;
      }

      setIsSubmittingLead(true);
      const leadId = snapshot.lead?.passportCode ?? generateLeadId();
      const activeOptionNumber =
        selectedOptionNumber ?? (selectedTier === 'ALTERNATIVE' ? 2 : 1);
      const matchedItem = recommendation.allMatchedOptions?.find(
        (item) => item.optionNumber === activeOptionNumber
      );
      const chosenOption =
        matchedItem?.lens ??
        (selectedTier === 'ALTERNATIVE'
          ? recommendation.alternativeOption
          : recommendation.primaryOption);

      trackMetaPixelEvent('Lead', {
        content_name: chosenOption.commercialName,
        content_category: chosenOption.family,
        content_ids: [chosenOption.sku],
        value: chosenOption.priceStockARS,
        currency: 'ARS',
        status: snapshot.answers.prescriptionAttachment,
      });

      const alreadyUploadedUrl =
        snapshot.answers.prescriptionPhotoRemoteUrl ??
        snapshot.lead?.prescriptionPhotoRemoteUrl;

      const leadData: LeadContactData = {
        fullName,
        whatsapp,
        passportCode: leadId,
        prescriptionPhotoName: snapshot.answers.prescriptionPhotoName,
        prescriptionPhotoRemoteUrl: alreadyUploadedUrl,
      };

      const hasUnuploadedPhotoData = Boolean(
        !alreadyUploadedUrl &&
          snapshot.answers.prescriptionPhotoDataUrl &&
          snapshot.answers.prescriptionPhotoDataUrl.length > 50
      );

      let uploadedPhotoUrl: string | undefined = alreadyUploadedUrl;

      if (hasUnuploadedPhotoData) {
        // Si la foto aún no terminó de subirse en segundo plano, esperamos hasta 4s para obtener el link
        const submitResult = await submitLeadToGoogleSheets({
          stage: 'LEAD_SUBMITTED',
          leadId,
          lead: leadData,
          answers: snapshot.answers,
          recommendation,
          selectedTier,
          selectedOptionNumber: activeOptionNumber,
          activeTheme,
        });
        uploadedPhotoUrl = submitResult.uploadedPhotoUrl ?? alreadyUploadedUrl;
      } else {
        // Enviamos los datos finales del cliente (Nombre, WhatsApp y Opción elegida) en segundo plano y abrimos WhatsApp en el acto
        void submitLeadToGoogleSheets({
          stage: 'LEAD_SUBMITTED',
          leadId,
          lead: leadData,
          answers: snapshot.answers,
          recommendation,
          selectedTier,
          selectedOptionNumber: activeOptionNumber,
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
        selectedOptionNumber: activeOptionNumber,
      });

      setIsSubmittingLead(false);
      window.location.href = whatsappUrl;
    },
    [snapshot.answers, snapshot.lead, recommendation, activeTheme]
  );

  const resetWizard = useCallback(() => {
    trackedQuoteKeyRef.current = null;
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
