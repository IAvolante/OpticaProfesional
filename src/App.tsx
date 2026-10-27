import { lazy, Suspense, useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ArrowLeft } from '@phosphor-icons/react';
import {
  FONT_PAIR_STORAGE_KEY,
  isValidFontPairId,
} from './config/brandTheme';
import { ENV_CONFIG } from './config/env';
import { useCatalogPrices } from './hooks/useCatalogPrices';
import { useOpticalWizard } from './hooks/useOpticalWizard';
import type { BrandThemeId, FontPairId } from './types/optical.types';
import {
  initClarityHeatmaps,
  tagClaritySession,
} from './utils/metaPixel.tracker';
import { BackgroundVideoStage } from './components/ui/BackgroundVideoStage';
import { DesignLabSwitcher } from './components/ui/DesignLabSwitcher';
import { OpticalBrandTransition } from './components/ui/OpticalBrandTransition';
import { WizardStepSkeleton } from './components/ui/WizardStepSkeleton';
import { QuestionStep } from './components/wizard/QuestionStep';

const QuoteResultStep = lazy(
  () => import('./components/wizard/QuoteResultStep')
);

const FIXED_LIGHT_THEME: BrandThemeId = 'theme-clinical';

function loadInitialFontPair(): FontPairId {
  if (typeof window === 'undefined') {
    return 'font-logo-match';
  }
  try {
    const stored = window.localStorage.getItem(FONT_PAIR_STORAGE_KEY);
    if (isValidFontPairId(stored)) {
      return stored;
    }
  } catch {
    // Fallback
  }
  return 'font-logo-match';
}

export function App() {
  const [activeFontPair, setActiveFontPair] = useState<FontPairId>(() =>
    loadInitialFontPair()
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', FIXED_LIGHT_THEME);
    initClarityHeatmaps();
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-font-pair', activeFontPair);
    try {
      window.localStorage.setItem(FONT_PAIR_STORAGE_KEY, activeFontPair);
    } catch {
      // Ignore storage error
    }
  }, [activeFontPair]);

  const { catalogState } = useCatalogPrices();

  const {
    wizardState,
    currentQuestion,
    canGoBack,
    isSubmittingLead,
    selectQuestionOption,
    confirmBudgetPreferencesStep,
    attachPrescriptionPhotoAndAdvance,
    goToPreviousStep,
    goToQuestionIndex,
    claimBenefitAndOpenWhatsApp,
    resetWizard,
  } = useOpticalWizard({
    catalogItems: catalogState.items,
    activeTheme: FIXED_LIGHT_THEME,
  });

  const catalogSourceLabel =
    catalogState.source === 'LIVE_SHEETS'
      ? 'Precios actualizados en vivo'
      : catalogState.source === 'LOCAL_CACHE'
        ? 'Precios sincronizados'
        : 'Precios vigentes · Óptica Profesional';

  const activeTransitionKey =
    wizardState.step === 'QUESTIONS'
      ? `QUESTIONS-${currentQuestion.id}`
      : wizardState.step;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    tagClaritySession('wizardStep', activeTransitionKey);
    if (wizardState.lead?.passportCode) {
      tagClaritySession('passportCode', wizardState.lead.passportCode);
    }
  }, [activeTransitionKey, wizardState.lead?.passportCode]);

  return (
    <div className="relative min-h-dvh w-full flex flex-col text-[var(--brand-text)]">
      {/* Escenario de Video Inmersivo Full-Viewport 100% Silencioso */}
      <BackgroundVideoStage
        enabled
        currentStep={wizardState.step}
        activeQuestionId={currentQuestion.id}
      />

      {/* Sello de Agua Sutil con el Isotipo 2026 "op" */}
      <OpticalBrandTransition stepKey={activeTransitionKey} />

      {/* Header Sticky con el Nuevo Logo 2026 (op Optica Profesional) */}
      <header className="sticky top-0 z-30 w-full border-b border-[var(--brand-border)] bg-[var(--brand-header-bg)] backdrop-blur-xl transition-colors duration-200">
        <div className="mx-auto flex h-14 w-full max-w-[480px] items-center justify-between gap-2 px-4">
          <div className="flex items-center gap-2.5 min-w-0">
            {canGoBack ? (
              <button
                type="button"
                onClick={goToPreviousStep}
                aria-label="Volver al paso anterior"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)] text-[var(--brand-accent-foreground)] hover:bg-[var(--brand-surface-elevated)] active:scale-95 transition-all cursor-pointer"
              >
                <ArrowLeft weight="bold" className="h-4 w-4" />
              </button>
            ) : null}

            <img
              src={`${import.meta.env.BASE_URL}logo-optica-profesional.png`}
              alt={ENV_CONFIG.brandNameB2C}
              className="brand-header-logo h-8 w-auto object-contain shrink-0 select-none transition-all duration-200"
            />
          </div>

          {wizardState.step === 'QUOTE_RESULT' ? (
            <span className="font-mono rounded-lg bg-[var(--brand-accent)] px-2.5 py-1 text-[11px] font-semibold tracking-wide text-[var(--brand-accent-foreground)] border border-[var(--brand-accent-border)] shrink-0">
              Tu Resultado
            </span>
          ) : null}
        </div>
      </header>

      {/* Contenedor Responsive Mobile-First (100% en smartphone, 480px centrado en desktop) */}
      <main className="relative z-10 mx-auto w-full max-w-[480px] flex-1 flex flex-col px-4 pt-3.5 pb-16">
        <Suspense fallback={<WizardStepSkeleton />}>
          <AnimatePresence mode="wait">
            {wizardState.step === 'QUESTIONS' && (
              <QuestionStep
                key="step-questions"
                question={currentQuestion}
                answers={wizardState.answers}
                onSelectOption={selectQuestionOption}
                onConfirmBudgetStep={confirmBudgetPreferencesStep}
                onAttachPrescriptionPhoto={attachPrescriptionPhotoAndAdvance}
                onSwipeBack={goToPreviousStep}
                onJumpToStep={goToQuestionIndex}
              />
            )}

            {wizardState.step === 'QUOTE_RESULT' && (
              <QuoteResultStep
                key="step-quote-result"
                lead={wizardState.lead}
                answers={wizardState.answers}
                recommendation={wizardState.recommendation}
                catalogSourceLabel={catalogSourceLabel}
                isSubmitting={isSubmittingLead}
                onClaimBenefit={claimBenefitAndOpenWhatsApp}
                onUpdatePrescriptionPhoto={attachPrescriptionPhotoAndAdvance}
                onResetWizard={resetWizard}
              />
            )}
          </AnimatePresence>
        </Suspense>
      </main>

      {/* Toggle Flotante de 5 Fuentes para evaluación en vivo con Solana */}
      <DesignLabSwitcher
        activeFontPair={activeFontPair}
        onSelectFontPair={setActiveFontPair}
      />
    </div>
  );
}

export default App;
