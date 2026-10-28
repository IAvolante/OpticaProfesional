import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import {
  motion,
  useReducedMotion,
  type PanInfo,
  type Variants,
} from 'framer-motion';
import {
  ArrowRight,
  Camera,
  Check,
  CircleNotch,
} from '@phosphor-icons/react';
import type {
  BudgetPreferenceAnswer,
  DesignLabConfig,
  FontScaleId,
  QuestionId,
  QuestionOptionValue,
  TransitionStyleId,
  UserOpticalAnswers,
  VideoBoxSizeId,
  WizardQuestionDefinition,
} from '../../types/optical.types';
import { cn } from '../../utils/cn';
import {
  compressPrescriptionImageToDataUrl,
  triggerHapticFeedback,
} from '../../utils/formatters';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { OpticalOptionDiagram } from './OpticalOptionDiagram';

export interface QuestionStepProps {
  readonly question: WizardQuestionDefinition;
  readonly answers: UserOpticalAnswers;
  readonly designLabConfig?: DesignLabConfig;
  readonly onSelectOption: (
    questionId: QuestionId,
    value: QuestionOptionValue
  ) => void;
  readonly onConfirmBudgetStep: () => void;
  readonly onAttachPrescriptionPhoto: (
    fileName: string,
    dataUrl: string
  ) => void;
  readonly onSwipeBack?: () => void;
  readonly onJumpToStep?: (index: number) => void;
}

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
  improvementGoal: {
    poolId: 'hero',
    poster: `${BASE_URL}videos/optical-hero-flow-poster.jpg`,
    caption: 'Tecnología en Cristales · Óptica Profesional',
    code: 'PASO 01',
  },
  activityContext: {
    poolId: 'titanium',
    poster: `${BASE_URL}videos/optical-titanium-bluecut-flow-poster.jpg`,
    caption: 'Comodidad Visual en tu Rutina Diaria',
    code: 'PASO 02',
  },
  clientPriority: {
    poolId: 'photochromic',
    poster: `${BASE_URL}videos/optical-photochromic-flow-poster.jpg`,
    caption: 'Calidad, Tecnología y Mejor Precio',
    code: 'PASO 03',
  },
  budgetPreferences: {
    poolId: 'titanium',
    poster: `${BASE_URL}videos/optical-titanium-bluecut-flow-poster.jpg`,
    caption: 'Obras Sociales · Cuotas · Beneficio Contado',
    code: 'PASO 04',
  },
  prescriptionAttachment: {
    poolId: 'hero',
    poster: `${BASE_URL}videos/optical-hero-flow-poster.jpg`,
    caption: 'Adjuntá tu Receta en 1 Toque',
    code: 'PASO 05',
  },
};

const VIDEO_BOX_HEIGHT_CLASSES: Record<VideoBoxSizeId, string> = {
  compact: 'min-h-[148px] sm:min-h-[164px]',
  balanced: 'min-h-[188px] sm:min-h-[216px]',
  cinematic: 'min-h-[268px] sm:min-h-[288px]',
};

const FONT_SCALE_CLASSES: Record<
  FontScaleId,
  {
    readonly questionTitle: string;
    readonly questionSubtitle: string;
    readonly optionLabel: string;
    readonly optionDescription: string;
  }
> = {
  'scale-sm': {
    questionTitle: 'text-[17px] sm:text-[18.5px]',
    questionSubtitle: 'text-[12.5px]',
    optionLabel: 'text-[14px]',
    optionDescription: 'text-[12px]',
  },
  'scale-md': {
    questionTitle: 'text-[19px] sm:text-[21px]',
    questionSubtitle: 'text-[13.5px]',
    optionLabel: 'text-[15px]',
    optionDescription: 'text-[12.5px]',
  },
  'scale-lg': {
    questionTitle: 'text-[21px] sm:text-[23px]',
    questionSubtitle: 'text-[14.5px]',
    optionLabel: 'text-[16.5px]',
    optionDescription: 'text-[13.5px]',
  },
};

const CONTAINER_VARIANTS_BY_STYLE: Record<TransitionStyleId, Variants> = {
  'transition-slide': {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.04, delayChildren: 0.01 },
    },
  },
  'transition-lens': {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.055, delayChildren: 0.02 },
    },
  },
  'transition-cascade': {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.075, delayChildren: 0.02 },
    },
  },
};

const CARD_VARIANTS_BY_STYLE: Record<TransitionStyleId, Variants> = {
  'transition-slide': {
    hidden: { opacity: 0, x: 18 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { type: 'spring', stiffness: 420, damping: 30 },
    },
  },
  'transition-lens': {
    hidden: { opacity: 0, scale: 0.94, filter: 'blur(6px)' },
    visible: {
      opacity: 1,
      scale: 1,
      filter: 'blur(0px)',
      transition: { duration: 0.34, ease: [0.22, 1, 0.36, 1] },
    },
  },
  'transition-cascade': {
    hidden: { opacity: 0, y: 24, scale: 0.96 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: 'spring', stiffness: 280, damping: 20 },
    },
  },
};

export function QuestionStep({
  question,
  answers,
  designLabConfig,
  onSelectOption,
  onConfirmBudgetStep,
  onAttachPrescriptionPhoto,
  onSwipeBack,
}: QuestionStepProps) {
  const prefersReducedMotion = useReducedMotion();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const advanceTimerRef = useRef<number | null>(null);
  const [isProcessingPhoto, setIsProcessingPhoto] = useState<boolean>(false);
  const [photoError, setPhotoError] = useState<string>('');
  const [pendingOption, setPendingOption] =
    useState<QuestionOptionValue | null>(null);

  const activeVideoBoxSize: VideoBoxSizeId =
    designLabConfig?.videoBoxSize ?? 'balanced';
  const activeFontScale: FontScaleId =
    designLabConfig?.fontScale ?? 'scale-md';
  const activeTransitionStyle: TransitionStyleId =
    designLabConfig?.transitionStyle ?? 'transition-slide';
  const scaleClasses = FONT_SCALE_CLASSES[activeFontScale];

  const videoRefs = useRef<Record<ShowcasePoolId, HTMLVideoElement | null>>({
    hero: null,
    titanium: null,
    photochromic: null,
  });

  const showcase = QUESTION_VIDEO_SHOWCASE[question.id];
  const selectedBudgetList = answers.budgetPreferences ?? [];

  useEffect(() => {
    setPendingOption(null);
    setPhotoError('');
    return () => {
      if (advanceTimerRef.current !== null) {
        window.clearTimeout(advanceTimerRef.current);
      }
    };
  }, [question.id]);

  useEffect(() => {
    for (const item of SHOWCASE_POOL) {
      const el = videoRefs.current[item.poolId];
      if (!el) continue;

      el.defaultMuted = true;
      el.muted = true;

      if (item.poolId === showcase.poolId) {
        void el.play().catch(() => {
          // Ignorar si el navegador difiere reproducción
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
    if (
      question.stepNumber > 1 &&
      info.offset.x > 85 &&
      Math.abs(info.offset.y) < 45 &&
      onSwipeBack
    ) {
      triggerHapticFeedback(12);
      onSwipeBack();
    }
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) {
      return;
    }

    triggerHapticFeedback(18);
    setPhotoError('');
    setIsProcessingPhoto(true);
    try {
      const compressedDataUrl = await compressPrescriptionImageToDataUrl(file);
      onAttachPrescriptionPhoto(file.name, compressedDataUrl);
    } catch {
      setPhotoError(
        'No pudimos leer esa imagen. Probá con otra foto o continuá sin receta.'
      );
    } finally {
      setIsProcessingPhoto(false);
    }
  };

  const handleOptionPress = (value: QuestionOptionValue) => {
    triggerHapticFeedback(12);

    // En el Paso 5, tocar "Cargar la foto de la receta" abre directamente la cámara/galería
    if (
      question.id === 'prescriptionAttachment' &&
      value === 'cargar_foto_receta'
    ) {
      fileInputRef.current?.click();
      return;
    }

    // En el Paso 4 (selección múltiple), marca/desmarca al instante sin avanzar
    if (question.isMultiSelect) {
      onSelectOption(question.id, value);
      return;
    }

    // En los Pasos 1, 2, 3 y 5 ("Aún no la tengo"), iluminamos la tarjeta 150ms antes de avanzar
    setPendingOption(value);
    if (advanceTimerRef.current !== null) {
      window.clearTimeout(advanceTimerRef.current);
    }
    advanceTimerRef.current = window.setTimeout(() => {
      setPendingOption(null);
      onSelectOption(question.id, value);
    }, 150);
  };

  const isOptionSelected = (value: QuestionOptionValue): boolean => {
    if (pendingOption === value) {
      return true;
    }
    if (question.id === 'budgetPreferences') {
      return selectedBudgetList.includes(value as BudgetPreferenceAnswer);
    }
    return answers[question.id] === value;
  };

  const canDragBack =
    !prefersReducedMotion && question.stepNumber > 1 && Boolean(onSwipeBack);

  return (
    <div className="space-y-3 pb-10 touch-pan-y">
      {/* Input oculto para carga directa de foto de receta en el Paso 5 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => void handleFileChange(e)}
        className="hidden"
      />

      {/* 1. Cabecera Card Full-Video al DOBLE de altura (2x) con la Pregunta superpuesta encima del video */}
      <Card className="relative overflow-hidden border-[#336699]/35 bg-[#0B1929] shadow-md">
        <div
          className="absolute inset-0 bg-slate-900 bg-cover bg-center"
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
                preload={isActiveVideo ? 'auto' : 'metadata'}
                className={cn(
                  'absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-200',
                  isActiveVideo
                    ? 'opacity-100 z-10'
                    : 'opacity-0 z-0 pointer-events-none'
                )}
              />
            );
          })}
          {/* Velo clínico de 3 fases: parte superior luminosa para lucir el video y base oscura para contraste perfecto de la pregunta */}
          <div className="absolute inset-0 z-20 bg-gradient-to-t from-[#091524] via-[#091524]/40 via-45% to-transparent pointer-events-none" />
        </div>

        <CardHeader
          className={cn(
            'relative z-30 flex flex-col justify-end p-4 sm:p-5 transition-all duration-300',
            VIDEO_BOX_HEIGHT_CLASSES[activeVideoBoxSize]
          )}
        >
          <motion.div
            key={`header-${question.id}-${activeTransitionStyle}`}
            initial={
              prefersReducedMotion
                ? false
                : activeTransitionStyle === 'transition-lens'
                  ? { opacity: 0, scale: 0.95, filter: 'blur(6px)' }
                  : activeTransitionStyle === 'transition-cascade'
                    ? { opacity: 0, y: 16 }
                    : { opacity: 0, x: 14 }
            }
            animate={{ opacity: 1, scale: 1, x: 0, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-1.5"
          >
            <CardTitle
              className={cn(
                'leading-[1.24] font-bold text-white drop-shadow-xs transition-all duration-200',
                scaleClasses.questionTitle
              )}
            >
              {question.title}
            </CardTitle>
            <CardDescription
              className={cn(
                'leading-snug text-slate-200/95 drop-shadow-2xs transition-all duration-200',
                scaleClasses.questionSubtitle
              )}
            >
              {question.subtitle}
            </CardDescription>
          </motion.div>
        </CardHeader>
      </Card>

      {/* 3. Opciones del Paso Actual */}
      <motion.div
        key={`${question.id}-${activeTransitionStyle}`}
        drag={canDragBack ? 'x' : false}
        dragDirectionLock
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={{ left: 0.02, right: 0.25 }}
        onDragEnd={handleDragEnd}
        initial={
          prefersReducedMotion
            ? false
            : activeTransitionStyle === 'transition-lens'
              ? { opacity: 0, scale: 0.96, filter: 'blur(8px)' }
              : activeTransitionStyle === 'transition-cascade'
                ? { opacity: 0, y: 20 }
                : { opacity: 0, x: 18 }
        }
        animate={{ opacity: 1, scale: 1, x: 0, y: 0, filter: 'blur(0px)' }}
        transition={
          activeTransitionStyle === 'transition-lens'
            ? { duration: 0.35, ease: [0.22, 1, 0.36, 1] }
            : { type: 'spring', stiffness: 360, damping: 28 }
        }
      >
        <motion.div
          variants={
            prefersReducedMotion
              ? undefined
              : CONTAINER_VARIANTS_BY_STYLE[activeTransitionStyle]
          }
          initial="hidden"
          animate="visible"
          className={
            question.options.length >= 5 ? 'space-y-2' : 'space-y-2.5'
          }
        >
          {question.options.map((option) => {
            const isSelected = isOptionSelected(option.value);
            const isUploadRxButton =
              question.id === 'prescriptionAttachment' &&
              option.value === 'cargar_foto_receta';

            return (
              <motion.div
                key={option.value}
                variants={
                  prefersReducedMotion
                    ? undefined
                    : CARD_VARIANTS_BY_STYLE[activeTransitionStyle]
                }
              >
                <button
                  type="button"
                  aria-pressed={isSelected}
                  disabled={isProcessingPhoto}
                  onClick={() => handleOptionPress(option.value)}
                  className={cn(
                    'optical-glass-card group relative w-full text-left rounded-2xl transition-all duration-200 cursor-pointer select-none block',
                    question.options.length >= 5 ? 'p-3 sm:p-3.5' : 'p-3.5',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-ring)]',
                    'active:scale-[0.99]',
                    isSelected || (isUploadRxButton && isProcessingPhoto)
                      ? 'optical-glass-card-active'
                      : 'hover:border-[#336699]/50'
                  )}
                >
                  <div className="flex items-start gap-3.5">
                    <OpticalOptionDiagram
                      value={option.value}
                      isSelected={isSelected}
                    />

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1 min-w-0">
                          {option.badgeText ? (
                            <Badge variant="brand" className="mb-0.5">
                              {option.badgeText}
                            </Badge>
                          ) : null}
                          <p
                            className={cn(
                              'font-brand-heading font-semibold text-[var(--brand-text)] leading-snug transition-all duration-200',
                              scaleClasses.optionLabel
                            )}
                          >
                            {isUploadRxButton && isProcessingPhoto
                              ? 'Optimizando imagen de tu receta...'
                              : option.label}
                          </p>
                        </div>

                        {/* Indicador de Selección (Checkbox en Paso 4, Spinner/Radio/Cámara en los demás) */}
                        <div
                          className={cn(
                            'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center border transition-colors',
                            question.isMultiSelect ? 'rounded-md' : 'rounded-full',
                            isSelected || (isUploadRxButton && isProcessingPhoto)
                              ? 'border-[#336699] bg-[#336699] text-white'
                              : 'border-[var(--brand-border)] bg-[var(--brand-surface)] group-hover:border-[#336699]'
                          )}
                        >
                          {isUploadRxButton && isProcessingPhoto ? (
                            <CircleNotch
                              weight="bold"
                              className="h-3.5 w-3.5 animate-spin"
                            />
                          ) : isSelected ? (
                            <Check weight="bold" className="h-3 w-3" />
                          ) : isUploadRxButton ? (
                            <Camera
                              weight="duotone"
                              className="h-3.5 w-3.5 text-[var(--brand-icon-primary)]"
                            />
                          ) : (
                            <span className="h-1.5 w-1.5 rounded-full bg-transparent" />
                          )}
                        </div>
                      </div>

                      <p
                        className={cn(
                          'text-[var(--brand-text-muted)] leading-relaxed transition-all duration-200',
                          scaleClasses.optionDescription
                        )}
                      >
                        {option.description}
                      </p>

                      {isUploadRxButton && photoError ? (
                        <p
                          role="alert"
                          className="pt-1 text-xs font-medium text-rose-500"
                        >
                          {photoError}
                        </p>
                      ) : null}

                      {isUploadRxButton && answers.prescriptionPhotoDataUrl ? (
                        <div className="pt-2 flex items-center gap-2.5 rounded-xl bg-[var(--brand-accent)] border border-[var(--brand-accent-border)] p-2">
                          <img
                            src={answers.prescriptionPhotoDataUrl}
                            alt="Receta adjunta"
                            className="h-10 w-10 rounded-lg object-cover border border-[#336699]/30 shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-[var(--brand-text)]">
                              Receta cargada correctamente
                            </p>
                            <p className="font-mono text-[10px] text-[var(--brand-text-muted)] truncate">
                              {answers.prescriptionPhotoName ?? 'receta.jpg'} — Tocá para cambiar foto
                            </p>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </button>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.div>

      {/* Si el usuario volvió al Paso 5 y ya tenía una foto cargada, permitirle avanzar en 1 toque sin re-subirla */}
      {question.id === 'prescriptionAttachment' &&
        answers.prescriptionPhotoDataUrl && (
          <div className="pt-1">
            <Button
              type="button"
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => {
                triggerHapticFeedback(15);
                onAttachPrescriptionPhoto(
                  answers.prescriptionPhotoName ?? 'receta.jpg',
                  answers.prescriptionPhotoDataUrl!
                );
              }}
              rightIcon={<ArrowRight weight="bold" className="h-4 w-4" />}
            >
              Continuar con mi receta cargada
            </Button>
          </div>
        )}

      {/* 4. En el Paso 4 (Selección Múltiple), barra Sticky inferior para avanzar siempre visible */}
      {question.isMultiSelect && (
        <div className="sticky bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-30 pt-2">
          <div className="rounded-2xl bg-[var(--brand-canvas)]/85 p-1.5 backdrop-blur-md shadow-lg border border-[var(--brand-border)]">
            <Button
              type="button"
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => {
                triggerHapticFeedback(15);
                onConfirmBudgetStep();
              }}
              rightIcon={<ArrowRight weight="bold" className="h-4 w-4" />}
            >
              {selectedBudgetList.length > 0
                ? `Continuar con ${selectedBudgetList.length} ${selectedBudgetList.length === 1 ? 'opción seleccionada' : 'opciones seleccionadas'}`
                : 'Continuar al último paso'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default QuestionStep;
