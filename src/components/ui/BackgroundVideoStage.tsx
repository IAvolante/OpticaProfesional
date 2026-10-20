import { useEffect, useRef } from 'react';
import type { QuestionId, WizardStepType } from '../../types/optical.types';
import { cn } from '../../utils/cn';

export interface BackgroundVideoStageProps {
  readonly enabled: boolean;
  readonly isMuted: boolean;
  readonly currentStep: WizardStepType;
  readonly activeQuestionId?: QuestionId;
}

const STAGE_VIDEOS = [
  {
    id: 'hero',
    src: '/videos/optical-hero-flow.mp4',
    poster: '/videos/optical-hero-flow-poster.jpg',
  },
  {
    id: 'photochromic',
    src: '/videos/optical-photochromic-flow.mp4',
    poster: '/videos/optical-photochromic-flow-poster.jpg',
  },
  {
    id: 'titanium',
    src: '/videos/optical-titanium-bluecut-flow.mp4',
    poster: '/videos/optical-titanium-bluecut-flow-poster.jpg',
  },
] as const;

type StageVideoId = (typeof STAGE_VIDEOS)[number]['id'];

function resolveStageVideoId(
  currentStep: WizardStepType,
  activeQuestionId?: QuestionId
): StageVideoId {
  if (currentStep === 'WELCOME') {
    return 'hero';
  }

  if (currentStep === 'QUESTIONS') {
    if (activeQuestionId === 'lightSensitivity') {
      return 'photochromic';
    }
    if (
      activeQuestionId === 'screenExposure' ||
      activeQuestionId === 'framePreference'
    ) {
      return 'titanium';
    }
    return 'hero';
  }

  if (currentStep === 'LEAD_CAPTURE') {
    return 'titanium';
  }

  return 'photochromic';
}

/**
 * Escenario de Video Inmersivo con Pool Persistente (0ms Re-buffering):
 * - En el paso WELCOME reproduce el video principal con audio opcional.
 * - En los pasos internos usa los posters de alta resolución + video pre-cargado
 *   sin destruir ni volver a descargar los archivos en cada paso.
 */
export function BackgroundVideoStage({
  enabled,
  isMuted,
  currentStep,
  activeQuestionId,
}: BackgroundVideoStageProps) {
  const videoRefs = useRef<Record<StageVideoId, HTMLVideoElement | null>>({
    hero: null,
    photochromic: null,
    titanium: null,
  });

  const activeVideoId = resolveStageVideoId(currentStep, activeQuestionId);
  const isWelcomeStep = currentStep === 'WELCOME';

  useEffect(() => {
    if (!enabled) {
      return;
    }

    for (const item of STAGE_VIDEOS) {
      const el = videoRefs.current[item.id];
      if (!el) continue;

      const isCurrent = item.id === activeVideoId;
      el.defaultMuted = isCurrent ? isMuted : true;
      el.muted = isCurrent ? isMuted : true;

      if (isCurrent) {
        const playPromise = el.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            el.muted = true;
            void el.play();
          });
        }
      } else {
        el.pause();
      }
    }
  }, [enabled, isMuted, activeVideoId]);

  if (!enabled) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden flex justify-center bg-[var(--brand-canvas)]"
    >
      {/* Contenedor del video calibrado al viewport móvil con pool persistente */}
      <div className="relative h-full w-full max-w-[430px] overflow-hidden">
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
              muted={isCurrent ? isMuted : true}
              playsInline
              preload="auto"
              className={cn(
                'absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-300 ease-out',
                isCurrent ? 'opacity-100' : 'opacity-0 pointer-events-none',
                isWelcomeStep
                  ? 'scale-100 brightness-[0.98] contrast-[1.04]'
                  : 'scale-105 blur-[1.5px] brightness-[0.92] contrast-[1.02]'
              )}
            />
          );
        })}

        {/* Gradiente suave que deja despejada la parte superior del video y funde hacia el lienzo claro abajo */}
        <div
          className={cn(
            'absolute inset-0 transition-opacity duration-500',
            isWelcomeStep
              ? 'bg-gradient-to-b from-black/15 via-transparent to-[var(--brand-canvas)]/90'
              : 'bg-gradient-to-b from-[var(--brand-canvas)]/35 via-[var(--brand-canvas)]/65 to-[var(--brand-canvas)]/92'
          )}
        />
      </div>
    </div>
  );
}
