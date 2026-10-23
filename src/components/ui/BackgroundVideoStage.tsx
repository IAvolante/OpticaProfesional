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
    id: 'hero',
    src: `${BASE_URL}videos/optical-hero-flow.mp4`,
    poster: `${BASE_URL}videos/optical-hero-flow-poster.jpg`,
  },
  {
    id: 'photochromic',
    src: `${BASE_URL}videos/optical-photochromic-flow.mp4`,
    poster: `${BASE_URL}videos/optical-photochromic-flow-poster.jpg`,
  },
  {
    id: 'titanium',
    src: `${BASE_URL}videos/optical-titanium-bluecut-flow.mp4`,
    poster: `${BASE_URL}videos/optical-titanium-bluecut-flow-poster.jpg`,
  },
] as const;

type StageVideoId = (typeof STAGE_VIDEOS)[number]['id'];

function resolveStageVideoId(
  currentStep: WizardStepType,
  activeQuestionId?: QuestionId
): StageVideoId {
  if (currentStep === 'QUESTIONS') {
    if (activeQuestionId === 'activityContext') {
      return 'photochromic';
    }
    if (
      activeQuestionId === 'clientPriority' ||
      activeQuestionId === 'budgetPreferences'
    ) {
      return 'titanium';
    }
    return 'hero';
  }

  return 'photochromic';
}

export function BackgroundVideoStage({
  enabled,
  currentStep,
  activeQuestionId,
}: BackgroundVideoStageProps) {
  const videoRefs = useRef<Record<StageVideoId, HTMLVideoElement | null>>({
    hero: null,
    photochromic: null,
    titanium: null,
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
              preload={isCurrent ? 'auto' : 'metadata'}
              className={cn(
                'absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-300 ease-out scale-105 brightness-[0.94] contrast-[1.02]',
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
