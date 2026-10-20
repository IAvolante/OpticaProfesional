import { lazy, Suspense, useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import {
  BRAND_THEME_STORAGE_KEY,
  isValidBrandThemeId,
} from './config/brandTheme';
import { ENV_CONFIG } from './config/env';
import { useCatalogPrices } from './hooks/useCatalogPrices';
import { useOpticalWizard } from './hooks/useOpticalWizard';
import type { BrandThemeId } from './types/optical.types';
import { BackgroundVideoStage } from './components/ui/BackgroundVideoStage';
import { OpticalBrandTransition } from './components/ui/OpticalBrandTransition';
import { ProgressBar } from './components/ui/ProgressBar';
import { WizardStepSkeleton } from './components/ui/WizardStepSkeleton';
import { QuestionStep } from './components/wizard/QuestionStep';

// Lazy UI Code-Splitting: Los pasos posteriores se cargan bajo demanda con Suspense
const LeadCaptureStep = lazy(
  () => import('./components/wizard/LeadCaptureStep')
);
const QuoteResultStep = lazy(
  () => import('./components/wizard/QuoteResultStep')
);

function loadInitialBrandTheme(): BrandThemeId {
  if (typeof window === 'undefined') {
    return 'theme-clinical';
  }
  try {
    const stored = window.localStorage.getItem(BRAND_THEME_STORAGE_KEY);
    if (isValidBrandThemeId(stored)) {
      return stored;
    }
  } catch {
    // Fallback
  }
  return 'theme-clinical';
}

export function App() {
  const [activeTheme] = useState<BrandThemeId>(() => loadInitialBrandTheme());

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', activeTheme);
  }, [activeTheme]);

  const { catalogState } = useCatalogPrices();

  const {
    wizardState,
    currentQuestion,
    totalQuestions,
    progressPercentage,
    canGoBack,
    isSubmittingLead,
    selectQuestionOption,
    goToPreviousStep,
    submitLeadAndGenerateQuote,
    resetWizard,
    registerWhatsAppContactConversion,
  } = useOpticalWizard({
    catalogItems: catalogState.items,
    activeTheme,
  });

  const catalogSourceLabel =
    catalogState.source === 'LIVE_SHEETS'
      ? 'Google Sheets en vivo'
      : catalogState.source === 'LOCAL_CACHE'
        ? 'Caché sincronizado'
        : 'Catálogo Base Punto 0';

  const stepIndicatorLabel =
    wizardState.step === 'QUESTIONS'
      ? `Paso ${wizardState.activeQuestionIndex + 1} de ${totalQuestions}`
      : wizardState.step === 'LEAD_CAPTURE'
        ? 'Tus Datos'
        : 'Tu Cotización';

  const activeTransitionKey =
    wizardState.step === 'QUESTIONS'
      ? `QUESTIONS-${currentQuestion.id}`
      : wizardState.step;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTransitionKey]);

  return (
    <div className="relative min-h-dvh w-full flex flex-col text-[var(--brand-text)]">
      {/* Escenario de Video Inmersivo Full-Viewport 100% Silencioso */}
      <BackgroundVideoStage
        enabled
        currentStep={wizardState.step}
        activeQuestionId={currentQuestion.id}
      />

      {/* Sello de Agua Sutil en el Fondo */}
      <OpticalBrandTransition stepKey={activeTransitionKey} />

      {/* Header Sticky Nativo (Pegado al tope `top-0`, sin botón de Inicio ni botón de Volumen) */}
      <header className="sticky top-0 z-30 w-full border-b border-[var(--brand-border)]/80 bg-[var(--brand-surface)]/88 backdrop-blur-xl">
        <div className="mx-auto flex h-14 w-full max-w-[480px] items-center justify-between gap-2 px-4">
          <div className="flex items-center gap-2.5 min-w-0">
            {canGoBack ? (
              <button
                type="button"
                onClick={goToPreviousStep}
                aria-label="Volver al paso anterior"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)] text-[var(--brand-text)] hover:bg-[var(--brand-surface-elevated)] active:scale-95 transition-all cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            ) : null}

            <img
              src={`${import.meta.env.BASE_URL}logo-optica-profesional.png`}
              alt={ENV_CONFIG.brandNameB2C}
              className="h-8 w-auto object-contain shrink-0 select-none"
            />
          </div>

          <span className="font-mono rounded-lg bg-[var(--brand-accent)] px-2.5 py-1 text-[11px] font-semibold tracking-wide text-[var(--brand-accent-foreground)] border border-[var(--brand-accent-border)] shrink-0">
            {stepIndicatorLabel}
          </span>
        </div>

        <div className="mx-auto w-full max-w-[480px]">
          <ProgressBar
            percentage={progressPercentage}
            label="Progreso del cotizador óptico"
            slim
          />
        </div>
      </header>

      {/* Contenedor Responsive Mobile-First (100% en smartphone, 480px centrado en pantallas grandes) */}
      <main className="relative z-10 mx-auto w-full max-w-[480px] flex-1 flex flex-col px-4 pt-3.5 pb-6">
        <Suspense fallback={<WizardStepSkeleton />}>
          <AnimatePresence mode="wait">
            {wizardState.step === 'QUESTIONS' && (
              <QuestionStep
                key="step-questions"
                question={currentQuestion}
                answers={wizardState.answers}
                onSelectOption={selectQuestionOption}
                onSwipeBack={goToPreviousStep}
              />
            )}

            {wizardState.step === 'LEAD_CAPTURE' && (
              <LeadCaptureStep
                key="step-lead-capture"
                initialLead={wizardState.lead}
                isSubmitting={isSubmittingLead}
                onSubmitLead={submitLeadAndGenerateQuote}
              />
            )}

            {wizardState.step === 'QUOTE_RESULT' && (
              <QuoteResultStep
                key="step-quote-result"
                lead={wizardState.lead}
                answers={wizardState.answers}
                recommendation={wizardState.recommendation}
                catalogSourceLabel={catalogSourceLabel}
                onResetWizard={resetWizard}
                onWhatsAppClick={registerWhatsAppContactConversion}
              />
            )}
          </AnimatePresence>
        </Suspense>
      </main>
    </div>
  );
}

export default App;
