import type { QuestionId, WizardStepType } from '../../types/optical.types';

export interface BackgroundVideoStageProps {
  readonly enabled: boolean;
  readonly currentStep: WizardStepType;
  readonly activeQuestionId?: QuestionId;
}

/**
 * Escenario Clínico Ambiental Ultra-Ligero (Zero-Filter / Zero-Decoder en Fondo).
 * Usa gradientes radiales nativos sin filtros blur de GPU para mantener 60/120fps constantes.
 */
export function BackgroundVideoStage({
  enabled,
}: BackgroundVideoStageProps) {
  if (!enabled) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[var(--brand-canvas)]"
      style={{
        backgroundImage:
          'radial-gradient(520px 340px at 50% 0%, rgba(51, 102, 153, 0.11), transparent 72%), radial-gradient(420px 340px at 95% 95%, rgba(153, 204, 153, 0.15), transparent 72%)',
      }}
    />
  );
}
