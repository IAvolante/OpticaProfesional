import { lazy, Suspense, useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ArrowLeft } from '@phosphor-icons/react';
import { ENV_CONFIG } from './config/env';
import { useCatalogPrices } from './hooks/useCatalogPrices';
import { useOpticalWizard } from './hooks/useOpticalWizard';
import type {
  BrandThemeId,
  DesignLabConfig,
  FontPairId,
} from './types/optical.types';
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
// Fuente #4 seleccionada por el cliente: Sora + DM Sans ('font-modern-atelier')
const SELECTED_FONT_PAIR_4: FontPairId = 'font-modern-atelier';
const DESIGN_LAB_STORAGE_KEY = 'optica_profesional_design_lab_v1';

const DEFAULT_DESIGN_LAB_CONFIG: DesignLabConfig = {
  videoBoxSize: 'balanced',
  fontScale: 'scale-md',
  transitionStyle: 'transition-slide',
};

function loadInitialDesignLabConfig(): DesignLabConfig {
  if (typeof window === 'undefined') {
    return DEFAULT_DESIGN_LAB_CONFIG;
  }
  try {
    const raw = window.localStorage.getItem(DESIGN_LAB_STORAGE_KEY);
    if (!raw) return DEFAULT_DESIGN_LAB_CONFIG;
    const parsed = JSON.parse(raw) as Partial<DesignLabConfig>;
    const videoBoxSize =
      parsed.videoBoxSize === 'compact' ||
      parsed.videoBoxSize === 'balanced' ||
      parsed.videoBoxSize === 'cinematic'
        ? parsed.videoBoxSize
        : 'balanced';
    const fontScale =
      parsed.fontScale === 'scale-sm' ||
      parsed.fontScale === 'scale-md' ||
      parsed.fontScale === 'scale-lg'
        ? parsed.fontScale
        : 'scale-md';
    const transitionStyle =
      parsed.transitionStyle === 'transition-slide' ||
      parsed.transitionStyle === 'transition-lens' ||
      parsed.transitionStyle === 'transition-cascade'
        ? parsed.transitionStyle
        : 'transition-slide';

    return { videoBoxSize, fontScale, transitionStyle };
  } catch {
    return DEFAULT_DESIGN_LAB_CONFIG;
  }
}

export function App() {
  const [designLabConfig, setDesignLabConfig] = useState<DesignLabConfig>(() =>
    loadInitialDesignLabConfig()
  );
  const [isDesignLabEnabled, setIsDesignLabEnabled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(window.location.search);
    return params.get('lab') === '1';
  });
  const [, setSecretTapCount] = useState<number>(0);

  const handleStepBadgeSecretTap = () => {
    setSecretTapCount((prev) => {
      const next = prev + 1;
      if (next >= 3) {
        setIsDesignLabEnabled((enabled) => !enabled);
        return 0;
      }
      return next;
    });
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', FIXED_LIGHT_THEME);
    document.documentElement.setAttribute(
      'data-font-pair',
      SELECTED_FONT_PAIR_4
    );
    initClarityHeatmaps();
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        DESIGN_LAB_STORAGE_KEY,
        JSON.stringify(designLabConfig)
      );
    } catch {
      // Ignorar errores de almacenamiento
    }
  }, [designLabConfig]);

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

      {/* Header Sticky con Logo 2026 siempre centrado matemáticamente */}
      <header className="sticky top-0 z-30 w-full border-b border-[var(--brand-border)] bg-[var(--brand-header-bg)] backdrop-blur-xl transition-colors duration-200">
        <div className="relative mx-auto flex h-14 w-full max-w-[480px] items-center justify-between px-4">
          {/* Slot Izquierdo: Botón Volver con ancho fijo w-10 (nunca desplaza al logo) */}
          <div className="flex w-10 items-center justify-start shrink-0 z-10">
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
          </div>

          {/* Slot Central: Logo Oficial Óptica Profesional fijo en el centro exacto (no clickeable) */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
            <img
              src={`${import.meta.env.BASE_URL}logo-optica-profesional.png`}
              alt={ENV_CONFIG.brandNameB2C}
              draggable={false}
              className="brand-header-logo h-8 w-auto object-contain select-none pointer-events-none transition-all duration-200"
            />
          </div>

          {/* Slot Derecho: Indicador del paso actual sin anticipar cuántos pasos hay (3 toques desbloquean el Modo Laboratorio) */}
          <div className="flex min-w-10 items-center justify-end shrink-0 z-10">
            {wizardState.step === 'QUESTIONS' ? (
              <button
                type="button"
                onClick={handleStepBadgeSecretTap}
                className="flex items-center gap-1.5 rounded-full border border-[var(--brand-accent-border)] bg-[var(--brand-accent)] px-2.5 py-1 text-[var(--brand-accent-foreground)] shadow-2xs select-none cursor-default"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand-secondary)]" />
                <span className="font-mono text-[11px] font-bold tracking-tight text-[var(--brand-primary)]">
                  PASO {currentQuestion.stepNumber.toString().padStart(2, '0')}
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStepBadgeSecretTap}
                className="font-mono rounded-full bg-[var(--brand-accent)] px-2.5 py-1 text-[11px] font-semibold tracking-wide text-[var(--brand-accent-foreground)] border border-[var(--brand-accent-border)] shrink-0 select-none cursor-default"
              >
                Tu Resultado
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Contenedor Responsive Mobile-First (100% en smartphone, 480px centrado en desktop) */}
      <main
        className={`relative z-10 mx-auto w-full max-w-[480px] flex-1 flex flex-col px-4 pt-3.5 ${
          isDesignLabEnabled ? 'pb-16' : 'pb-8'
        }`}
      >
        <Suspense fallback={<WizardStepSkeleton />}>
          <AnimatePresence mode="wait">
            {wizardState.step === 'QUESTIONS' && (
              <QuestionStep
                key="step-questions"
                question={currentQuestion}
                answers={wizardState.answers}
                designLabConfig={designLabConfig}
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

      {/* Panel Flotante de Laboratorio (oculto al público; se activa con ?lab=1 o tocando 3 veces PASO 0X) */}
      {isDesignLabEnabled && (
        <DesignLabSwitcher
          config={designLabConfig}
          onChangeConfig={setDesignLabConfig}
        />
      )}
    </div>
  );
}

export default App;
