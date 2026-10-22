import { useEffect, useRef } from 'react';
import type { QuestionId, WizardStepType } from '../../types/optical.types';
import { cn } from '../../utils/cn';

export interface BackgroundVideoStageProps {
  readonly enabled: boolean;
  readonly currentStep: WizardStepType;
  readonly activeQuestionId?: QuestionId;
}

const BASE_URL = import.meta.env.BASE_URL;

const STAGE_VIDEOS = [
  {
    id: 'step1',
    src: `${BASE_URL}videos/step1-material-flow.mp4`,
    poster: `${BASE_URL}videos/step1-material-poster.jpg`,
  },
  {
    id: 'step2',
    src: `${BASE_URL}videos/step2-activities-flow.mp4`,
    poster: `${BASE_URL}videos/step2-activities-poster.jpg`,
  },
  {
    id: 'step3',
    src: `${BASE_URL}videos/step3-priority-flow.mp4`,
    poster: `${BASE_URL}videos/step3-priority-poster.jpg`,
  },
  {
    id: 'step4',
    src: `${BASE_URL}videos/step4-budget-flow.mp4`,
    poster: `${BASE_URL}videos/step4-budget-poster.jpg`,
  },
  {
    id: 'step5',
    src: `${BASE_URL}videos/step5-prescription-flow.mp4`,
    poster: `${BASE_URL}videos/step5-prescription-poster.jpg`,
  },
] as const;

type StageVideoId = (typeof STAGE_VIDEOS)[number]['id'];

function resolveStageVideoId(
  currentStep: WizardStepType,
  activeQuestionId?: QuestionId
): StageVideoId {
  if (currentStep === 'QUESTIONS') {
    switch (activeQuestionId) {
      case 'improvementGoal':
        return 'step1';
      case 'activityContext':
        return 'step2';
      case 'clientPriority':
        return 'step3';
      case 'budgetPreferences':
        return 'step4';
      case 'prescriptionAttachment':
        return 'step5';
      default:
        return 'step1';
    }
  }

  return 'step3';
}

/**
 * Escenario de Video Inmersivo Responsive (Mobile-First + Full Viewport):
 * - 5 videos dedicados (1 por cada paso del flujo de Solana).
 * - 100% silencioso (`muted` permanente, sin controles de audio).
 */
export function BackgroundVideoStage({
  enabled,
  currentStep,
  activeQuestionId,
}: BackgroundVideoStageProps) {
  const videoRefs = useRef<Record<StageVideoId, HTMLVideoElement | null>>({
    step1: null,
    step2: null,
    step3: null,
    step4: null,
    step5: null,
  });

  const activeVideoId = resolveStageVideoId(currentStep, activeQuestionId);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    for (const item of STAGE_VIDEOS) {
      const el = videoRefs.current[item.id];
      if (!el) continue;

      const isCurrent = item.id === activeVideoId;
      el.defaultMuted = true;
      el.muted = true;

      if (isCurrent) {
        const playPromise = el.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // Ignorar si el navegador difiere reproducción automática
          });
        }
      } else {
        el.pause();
      }
    }
  }, [enabled, activeVideoId]);

  if (!enabled) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[var(--brand-canvas)]"
    >
      <div className="relative h-full w-full overflow-hidden">
        {STAGE_VIDEOS.map((item) => {
          const isCurrent = item.id === activeVideoId;
          return (
            <video
              key={item.id}
              ref={(node) => {
                videoRefs.current[item.id] = node;
              }}
              src={item.src}
              poster={item.poster}
              loop
              muted
              playsInline
              preload="auto"
              className={cn(
                'absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-300 ease-out scale-105 blur-[3px] brightness-[0.94] contrast-[1.02]',
                isCurrent ? 'opacity-100' : 'opacity-0 pointer-events-none'
              )}
            />
          );
        })}

        <div className="absolute inset-0 bg-gradient-to-b from-[var(--brand-canvas)]/60 via-[var(--brand-canvas)]/82 to-[var(--brand-canvas)]/96" />
      </div>
    </div>
  );
}
