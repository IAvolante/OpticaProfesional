import { lazy, Suspense, useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ArrowLeft, Volume2, VolumeX } from 'lucide-react';
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
import { ThemeSwitcherDev } from './components/ui/ThemeSwitcherDev';
import { WizardStepSkeleton } from './components/ui/WizardStepSkeleton';
import { WelcomeStep } from './components/wizard/WelcomeStep';

// Lazy UI Code-Splitting: Los pasos posteriores se cargan bajo demanda con Suspense
const QuestionStep = lazy(() => import('./components/wizard/QuestionStep'));
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
  const [activeTheme, setActiveTheme] = useState<BrandThemeId>(() =>
    loadInitialBrandTheme()
  );
  const [videoEnabled, setVideoEnabled] = useState<boolean>(true);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(true);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', activeTheme);
    try {
      window.localStorage.setItem(BRAND_THEME_STORAGE_KEY, activeTheme);
    } catch {
      // Ignorar errores de almacenamiento
    }
  }, [activeTheme]);

  const { catalogState } = useCatalogPrices();

  const {
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
    wizardState.step === 'WELCOME'
      ? 'INICIO'
      : wizardState.step === 'QUESTIONS'
        ? `0${wizardState.activeQuestionIndex + 1} / 0${totalQuestions}`
        : wizardState.step === 'LEAD_CAPTURE'
          ? 'FICHA'
          : 'COTIZACIÓN';

  const activeTransitionKey =
    wizardState.step === 'QUESTIONS'
      ? `QUESTIONS-${currentQuestion.id}`
      : wizardState.step;

  return (
    <div className="relative min-h-dvh flex flex-col text-[var(--brand-text)]">
      {/* Escenario de Video 9:16 de Google Flow con cambio dinámico según la pregunta */}
      <BackgroundVideoStage
        enabled={videoEnabled}
        isMuted={isAudioMuted}
        currentStep={wizardState.step}
        activeQuestionId={currentQuestion.id}
      />

      {/* Revelado del Logo de Óptica Profesional Difuminado entre Paso y Paso */}
      <OpticalBrandTransition stepKey={activeTransitionKey} />

      {/* Barra Superior de Desarrollo para Discovery con Solana */}
      <ThemeSwitcherDev
        activeTheme={activeTheme}
        onSelectTheme={setActiveTheme}
        catalogSourceLabel={catalogSourceLabel}
        videoEnabled={videoEnabled}
        onToggleVideo={() => setVideoEnabled((prev) => !prev)}
      />

      {/* Contenedor Mobile-First Nativo (100% pantalla en smartphones, columna 430px en desktop) */}
      <div className="relative z-10 mx-auto flex w-full max-w-[430px] flex-1 flex-col">
        {/* App Bar Móvil HeroUI Dark-Glass con Cápsula Luminosa para el Logo Oficial */}
        <header className="sticky top-[37px] z-30 border-b border-[var(--brand-border)] bg-[var(--brand-surface)]/90 backdrop-blur-xl">
          <div className="flex h-14 items-center justify-between gap-2 px-3.5">
            <div className="flex items-center gap-2 min-w-0">
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

              <button
                type="button"
                onClick={resetWizard}
                className="flex items-center gap-2 text-left truncate cursor-pointer focus-visible:outline-none"
              >
                <img
                  src="/logo-optica-profesional.png"
                  alt={ENV_CONFIG.brandNameB2C}
                  className="h-8 w-auto object-contain shrink-0"
                />
              </button>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {videoEnabled && (
                <button
                  type="button"
                  onClick={() => setIsAudioMuted((prev) => !prev)}
                  aria-label={
                    isAudioMuted
                      ? 'Activar sonido ambiente del video'
                      : 'Silenciar sonido ambiente'
                  }
                  title={
                    isAudioMuted
                      ? 'Activar piano ambiente'
                      : 'Silenciar audio'
                  }
                  className="flex h-8 w-8 items-center justify-center rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface-elevated)]/85 text-[var(--brand-text-muted)] hover:text-[var(--brand-primary)] active:scale-95 transition-all cursor-pointer"
                >
                  {isAudioMuted ? (
                    <VolumeX className="h-3.5 w-3.5" />
                  ) : (
                    <Volume2 className="h-3.5 w-3.5 text-[var(--brand-primary)]" />
                  )}
                </button>
              )}

              <span className="font-mono rounded-lg bg-[var(--brand-accent)] px-2.5 py-1 text-[11px] font-semibold tracking-wider text-[var(--brand-accent-foreground)] border border-[var(--brand-accent-border)]">
                {stepIndicatorLabel}
              </span>
            </div>
          </div>

          {/* Barra de Progreso Radix UI Integrada al Borde del Header Móvil */}
          <ProgressBar
            percentage={progressPercentage}
            label="Progreso del cotizador óptico"
            slim
          />
        </header>

        {/* Cuerpo Principal Mobile-First con Lazy UI (Suspense + AnimatePresence) */}
        <main className="w-full flex-1 flex flex-col px-3.5 pt-3.5 pb-6">
          <Suspense fallback={<WizardStepSkeleton />}>
            <AnimatePresence mode="wait">
              {wizardState.step === 'WELCOME' && (
                <WelcomeStep
                  key="step-welcome"
                  onStartWizard={startWizard}
                  videoEnabled={videoEnabled}
                />
              )}

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
    </div>
  );
}

export default App;
