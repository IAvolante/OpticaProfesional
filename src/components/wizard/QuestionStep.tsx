import { useEffect, useRef } from 'react';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import {
  motion,
  useReducedMotion,
  type PanInfo,
  type Variants,
} from 'framer-motion';
import { Check } from 'lucide-react';
import type {
  QuestionId,
  QuestionOptionValue,
  UserOpticalAnswers,
  WizardQuestionDefinition,
} from '../../types/optical.types';
import { cn } from '../../utils/cn';
import { triggerHapticFeedback } from '../../utils/formatters';
import { Badge } from '../ui/Badge';
import { Card, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { OpticalOptionDiagram } from './OpticalOptionDiagram';

export interface QuestionStepProps {
  readonly question: WizardQuestionDefinition;
  readonly answers: UserOpticalAnswers;
  readonly onSelectOption: (
    questionId: QuestionId,
    value: QuestionOptionValue
  ) => void;
  readonly onSwipeBack?: () => void;
}

const STEP_PILLS: readonly {
  readonly id: QuestionId;
  readonly code: string;
  readonly shortLabel: string;
}[] = [
  { id: 'visionNeed', code: '01', shortLabel: 'Visión' },
  { id: 'screenExposure', code: '02', shortLabel: 'Pantallas' },
  { id: 'lightSensitivity', code: '03', shortLabel: 'Sol/Luz' },
  { id: 'graduationSeverity', code: '04', shortLabel: 'Receta' },
  { id: 'framePreference', code: '05', shortLabel: 'Armazón' },
];

const BASE_URL = import.meta.env.BASE_URL;

const SHOWCASE_POOL = [
  {
    poolId: 'hero',
    src: `${BASE_URL}videos/optical-hero-flow.mp4`,
    poster: `${BASE_URL}videos/optical-hero-flow-poster.jpg`,
  },
  {
    poolId: 'titanium',
    src: `${BASE_URL}videos/optical-titanium-bluecut-flow.mp4`,
    poster: `${BASE_URL}videos/optical-titanium-bluecut-flow-poster.jpg`,
  },
  {
    poolId: 'photochromic',
    src: `${BASE_URL}videos/optical-photochromic-flow.mp4`,
    poster: `${BASE_URL}videos/optical-photochromic-flow-poster.jpg`,
  },
] as const;

type ShowcasePoolId = (typeof SHOWCASE_POOL)[number]['poolId'];

const QUESTION_VIDEO_SHOWCASE: Record<
  QuestionId,
  {
    readonly poolId: ShowcasePoolId;
    readonly poster: string;
    readonly caption: string;
    readonly code: string;
  }
> = {
  visionNeed: {
    poolId: 'hero',
    poster: `${BASE_URL}videos/optical-hero-flow-poster.jpg`,
    caption: 'Laboratorio Óptico Digital · Salta',
    code: 'OPT-01',
  },
  screenExposure: {
    poolId: 'titanium',
    poster: `${BASE_URL}videos/optical-titanium-bluecut-flow-poster.jpg`,
    caption: 'Tratamiento Blue Cut + Antirreflex HD',
    code: 'OPT-02',
  },
  lightSensitivity: {
    poolId: 'photochromic',
    poster: `${BASE_URL}videos/optical-photochromic-flow-poster.jpg`,
    caption: 'Transición Fotocromática Solar UV400',
    code: 'OPT-03',
  },
  graduationSeverity: {
    poolId: 'hero',
    poster: `${BASE_URL}videos/optical-hero-flow-poster.jpg`,
    caption: 'Cálculo de Índice y Espesor Asférico',
    code: 'OPT-04',
  },
  framePreference: {
    poolId: 'titanium',
    poster: `${BASE_URL}videos/optical-titanium-bluecut-flow-poster.jpg`,
    caption: 'Calibración de Montura y Biselado Digital',
    code: 'OPT-05',
  },
};

const listContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.01,
    },
  },
};

const optionCardVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 420,
      damping: 30,
    },
  },
};

/**
 * Paso 1..5 ('QUESTIONS') con Pool de Video Pre-Cargado Persistente:
 * - La cabecera de video NUNCA se desmonta entre las 5 preguntas (`key` estable),
 *   por lo que los 3 videos quedan decodificados en memoria desde el Paso 1 y cambian
 *   en 0ms mediante crossfade de opacidad + poster instantáneo.
 */
export function QuestionStep({
  question,
  answers,
  onSelectOption,
  onSwipeBack,
}: QuestionStepProps) {
  const prefersReducedMotion = useReducedMotion();
  const videoRefs = useRef<Record<ShowcasePoolId, HTMLVideoElement | null>>({
    hero: null,
    titanium: null,
    photochromic: null,
  });

  const selectedValue = answers[question.id];
  const showcase = QUESTION_VIDEO_SHOWCASE[question.id];

  useEffect(() => {
    for (const item of SHOWCASE_POOL) {
      const el = videoRefs.current[item.poolId];
      if (!el) continue;

      el.defaultMuted = true;
      el.muted = true;

      if (item.poolId === showcase.poolId) {
        void el.play().catch(() => {
          // Ignorar si el navegador difiere la reproducción
        });
      } else {
        el.pause();
      }
    }
  }, [showcase.poolId]);

  const handleDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    if (info.offset.x > 75 && onSwipeBack) {
      triggerHapticFeedback(12);
      onSwipeBack();
    }
  };

  const handleSelect = (value: QuestionOptionValue) => {
    triggerHapticFeedback(12);
    onSelectOption(question.id, value);
  };

  return (
    <div className="space-y-3 pb-8 touch-pan-y">
      {/* 1. Tira Visual de los 5 Pasos del Configurador Óptico (Persistente, 0ms) */}
      <div className="grid grid-cols-5 gap-1.5">
        {STEP_PILLS.map((pill, idx) => {
          const isCurrent = pill.id === question.id;
          const isCompleted = Boolean(answers[pill.id]);
          const isPast = idx + 1 < question.stepNumber;

          return (
            <div
              key={pill.id}
              className={cn(
                'flex flex-col items-center justify-center rounded-xl py-1.5 px-1 border text-center transition-all duration-200',
                isCurrent
                  ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)] text-[var(--brand-primary-foreground)] shadow-2xs'
                  : isCompleted || isPast
                    ? 'border-[var(--brand-accent-border)] bg-[var(--brand-accent)] text-[var(--brand-accent-foreground)]'
                    : 'border-[var(--brand-border)] bg-[var(--brand-surface)]/80 text-[var(--brand-text-muted)]'
              )}
            >
              <span className="font-mono text-[9px] font-bold uppercase tracking-wider leading-none">
                {pill.code}
              </span>
              <span className="text-[10px] font-semibold truncate max-w-full mt-0.5 leading-tight">
                {pill.shortLabel}
              </span>
            </div>
          );
        })}
      </div>

      {/* 2. Cabecera Card con Pool de 3 Videos Persistentes en Memoria (0ms cambio entre pasos) */}
      <Card className="overflow-hidden">
        <div
          className="relative h-28 w-full overflow-hidden bg-slate-900 bg-cover bg-center"
          style={{ backgroundImage: `url(${showcase.poster})` }}
        >
          {SHOWCASE_POOL.map((item) => {
            const isActiveVideo = item.poolId === showcase.poolId;
            return (
              <video
                key={item.poolId}
                ref={(node) => {
                  videoRefs.current[item.poolId] = node;
                }}
                src={item.src}
                poster={item.poster}
                autoPlay={isActiveVideo}
                loop
                muted
                playsInline
                preload="auto"
                className={cn(
                  'absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-200',
                  isActiveVideo ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                )}
              />
            );
          })}
          <div className="absolute inset-0 z-20 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
          <div className="absolute bottom-2.5 left-3.5 right-3.5 z-30 flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-2 rounded-md bg-slate-950/75 backdrop-blur-md border border-white/15 px-2.5 py-1 text-[11px] font-medium text-white">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span>{showcase.caption}</span>
            </span>
            <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-white/80">
              {showcase.code}
            </span>
          </div>
        </div>

        <CardHeader className="p-4 space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[var(--brand-primary)]">
              {question.categoryBadge}
            </span>
            <span className="font-mono text-[10px] font-medium text-[var(--brand-text-muted)]">
              Tocá una opción
            </span>
          </div>

          <CardTitle className="text-[18px] leading-[1.28] font-semibold text-[var(--brand-text)]">
            {question.title}
          </CardTitle>
          <CardDescription className="text-[13px] leading-relaxed text-[var(--brand-text-muted)]">
            {question.subtitle}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* 3. Tarjetas de Opciones con Transición Táctil y Diagramas SVG */}
      <motion.div
        key={question.id}
        drag={prefersReducedMotion ? false : 'x'}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={{ left: 0.05, right: 0.28 }}
        onDragEnd={handleDragEnd}
        initial={prefersReducedMotion ? false : { opacity: 0, x: 14 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 32 }}
      >
        <RadioGroupPrimitive.Root
          value={selectedValue ?? ''}
          onValueChange={(val) => {
            if (val) {
              handleSelect(val as QuestionOptionValue);
            }
          }}
          aria-label={question.title}
          asChild
        >
          <motion.div
            variants={prefersReducedMotion ? undefined : listContainerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-2.5"
          >
            {question.options.map((option) => {
              const isSelected = selectedValue === option.value;

              return (
                <motion.div
                  key={option.value}
                  variants={prefersReducedMotion ? undefined : optionCardVariants}
                >
                  <RadioGroupPrimitive.Item
                    value={option.value}
                    onClick={() => {
                      if (isSelected) {
                        handleSelect(option.value);
                      }
                    }}
                    className={cn(
                      'optical-glass-card group relative w-full text-left rounded-2xl p-3.5 transition-all duration-200 cursor-pointer select-none block',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-ring)]',
                      'active:scale-[0.99]',
                      isSelected
                        ? 'optical-glass-card-active'
                        : 'hover:border-[var(--brand-primary)]/50'
                    )}
                  >
                    <div className="flex items-start gap-3.5">
                      {/* Esquema Óptico SVG a medida */}
                      <OpticalOptionDiagram
                        value={option.value}
                        isSelected={isSelected}
                      />

                      {/* Contenido Técnico Conciso y Escaneable */}
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1 min-w-0">
                            {option.badgeText ? (
                              <Badge variant="brand" className="mb-0.5">
                                {option.badgeText}
                              </Badge>
                            ) : null}
                            <p className="font-brand-heading text-[15px] font-semibold text-[var(--brand-text)] leading-snug">
                              {option.label}
                            </p>
                          </div>

                          {/* Indicador de Selección Táctil */}
                          <div
                            className={cn(
                              'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors',
                              isSelected
                                ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)] text-white'
                                : 'border-[var(--brand-border)] bg-[var(--brand-surface)] group-hover:border-[var(--brand-primary)]'
                            )}
                          >
                            {isSelected ? (
                              <Check className="h-3 w-3 stroke-[3]" />
                            ) : (
                              <span className="h-1.5 w-1.5 rounded-full bg-transparent" />
                            )}
                          </div>
                        </div>

                        <p className="text-[12.5px] text-[var(--brand-text-muted)] leading-relaxed">
                          {option.description}
                        </p>

                        {/* Píldora de Especificación de Laboratorio */}
                        <div className="pt-1 flex items-center gap-1.5">
                          <span className="inline-flex items-center gap-1.5 rounded-md bg-[var(--brand-surface-elevated)]/90 border border-[var(--brand-border)] px-2 py-0.5 font-mono text-[10px] font-semibold text-[var(--brand-primary)]">
                            <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand-primary)]" />
                            {option.clinicalHint}
                          </span>
                        </div>
                      </div>
                    </div>
                  </RadioGroupPrimitive.Item>
                </motion.div>
              );
            })}
          </motion.div>
        </RadioGroupPrimitive.Root>
      </motion.div>
    </div>
  );
}

export default QuestionStep;
