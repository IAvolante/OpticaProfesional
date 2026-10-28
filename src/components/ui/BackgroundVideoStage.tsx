import type { QuestionId, WizardStepType } from '../../types/optical.types';
import { cn } from '../../utils/cn';

export interface BackgroundVideoStageProps {
  readonly enabled: boolean;
  readonly currentStep: WizardStepType;
  readonly activeQuestionId?: QuestionId;
}

/**
 * Escenario Clínico Ambiental Ultra-Ligero (Zero-Decoder en Fondo).
 * Libera el 100% del decodificador de video del teléfono para el Box Hero
 * principal de cada pregunta (QuestionStep), evitando doble decodificación MP4
 * en los WebViews de Instagram/Meta Ads.
 */
export function BackgroundVideoStage({
  enabled,
  currentStep,
  activeQuestionId,
}: BackgroundVideoStageProps) {
  if (!enabled) {
    return null;
  }

  const isQuoteStep = currentStep === 'QUOTE_RESULT';
  const isMidStep =
    activeQuestionId === 'activityContext' ||
    activeQuestionId === 'clientPriority';

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[var(--brand-canvas)]"
    >
      <div className="relative h-full w-full overflow-hidden">
        {/* Halo superior Azul Profesional (#336699) */}
        <div
          className={cn(
            'absolute -top-28 left-1/2 -translate-x-1/2 h-[360px] w-[520px] rounded-full bg-[#336699]/10 blur-3xl transition-transform duration-700 ease-out',
            isMidStep && 'translate-x-[-42%] scale-105',
            isQuoteStep && 'scale-110 bg-[#336699]/14'
          )}
        />

        {/* Halo lateral Verde Salvia (#99CC99) */}
        <div
          className={cn(
            'absolute bottom-[-120px] right-[-80px] h-[320px] w-[380px] rounded-full bg-[#99CC99]/15 blur-3xl transition-transform duration-700 ease-out',
            isMidStep && 'translate-y-[-24px]',
            isQuoteStep && 'scale-110 bg-[#99CC99]/20'
          )}
        />

        {/* Gradiente clínico de unificación sobre el lienzo */}
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--brand-canvas)]/40 via-[var(--brand-canvas)]/80 to-[var(--brand-canvas)]" />
      </div>
    </div>
  );
}
