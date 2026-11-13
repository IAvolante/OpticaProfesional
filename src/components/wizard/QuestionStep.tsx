import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import {
  AnimatePresence,
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
  ActivityContextAnswer,
  BudgetPreferenceAnswer,
  ClientPriorityAnswer,
  DesignLabConfig,
  FontScaleId,
  ImprovementGoalAnswer,
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
import { Button } from '../ui/Button';
import { BankPromoLogos } from '../ui/BankPromoLogos';
import { Card, CardHeader, CardTitle } from '../ui/Card';
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

interface NetworkInformationLike {
  readonly saveData?: boolean;
  readonly effectiveType?: string;
}

function shouldConserveMobileBandwidth(): boolean {
  if (typeof navigator === 'undefined') {
    return false;
  }
  const nav = navigator as Navigator & {
    readonly connection?: NetworkInformationLike;
  };
  const conn = nav.connection;
  if (!conn) {
    return false;
  }
  if (conn.saveData === true) {
    return true;
  }
  return conn.effectiveType === 'slow-2g' || conn.effectiveType === '2g';
}

const NEXT_POOL_TO_PREWARM: Record<QuestionId, ShowcasePoolId | null> = {
  improvementGoal: 'titanium',
  activityContext: 'photochromic',
  clientPriority: 'titanium',
  budgetPreferences: 'hero',
  prescriptionAttachment: null,
};

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
  const multiAdvanceTimerRef = useRef<number | null>(null);
  const [isProcessingPhoto, setIsProcessingPhoto] = useState<boolean>(false);
  const [photoError, setPhotoError] = useState<string>('');
  const [pendingOption, setPendingOption] =
    useState<QuestionOptionValue | null>(null);
  const [autoAdvancingStepId, setAutoAdvancingStepId] =
    useState<QuestionId | null>(null);
  const isAutoAdvancing = autoAdvancingStepId === question.id;

  const activeVideoBoxSize: VideoBoxSizeId =
    designLabConfig?.videoBoxSize ?? 'balanced';
  const activeFontScale: FontScaleId =
    designLabConfig?.fontScale ?? 'scale-sm';
  const activeTransitionStyle: TransitionStyleId =
    designLabConfig?.transitionStyle ?? 'transition-cascade';
  const scaleClasses = FONT_SCALE_CLASSES[activeFontScale];

  const videoRefs = useRef<Record<ShowcasePoolId, HTMLVideoElement | null>>({
    hero: null,
    titanium: null,
    photochromic: null,
  });

  const showcase = QUESTION_VIDEO_SHOWCASE[question.id];
  const nextPoolToPrewarm = NEXT_POOL_TO_PREWARM[question.id];
  const [isLowBandwidth] = useState<boolean>(() =>
    shouldConserveMobileBandwidth()
  );
  const shouldDisableVideo = Boolean(prefersReducedMotion) || isLowBandwidth;

  const [hydratedPools, setHydratedPools] = useState<
    Record<ShowcasePoolId, boolean>
  >(() => ({
    hero: showcase.poolId === 'hero',
    titanium: showcase.poolId === 'titanium',
    photochromic: showcase.poolId === 'photochromic',
  }));
  const [readyPools, setReadyPools] = useState<Record<ShowcasePoolId, boolean>>(
    {
      hero: false,
      titanium: false,
      photochromic: false,
    }
  );

  const markPoolReady = (poolId: ShowcasePoolId) => {
    setReadyPools((prev) =>
      prev[poolId] ? prev : { ...prev, [poolId]: true }
    );
    if (poolId === showcase.poolId && nextPoolToPrewarm) {
      setHydratedPools((prev) =>
        prev[nextPoolToPrewarm] ? prev : { ...prev, [nextPoolToPrewarm]: true }
      );
    }
  };

  const selectedBudgetList = answers.budgetPreferences ?? [];

  const currentMultiSelectedList: readonly QuestionOptionValue[] =
    question.id === 'improvementGoal'
      ? answers.improvementGoals && answers.improvementGoals.length > 0
        ? answers.improvementGoals
        : answers.improvementGoal
          ? [answers.improvementGoal]
          : []
      : question.id === 'activityContext'
        ? answers.activityContexts && answers.activityContexts.length > 0
          ? answers.activityContexts
          : answers.activityContext
            ? [answers.activityContext]
            : []
        : question.id === 'clientPriority'
          ? answers.clientPriorities && answers.clientPriorities.length > 0
            ? answers.clientPriorities
            : answers.clientPriority
              ? [answers.clientPriority]
              : []
          : question.id === 'budgetPreferences'
            ? selectedBudgetList
            : [];

  useEffect(() => {
    setPendingOption(null);
    setPhotoError('');
    return () => {
      if (advanceTimerRef.current !== null) {
        window.clearTimeout(advanceTimerRef.current);
      }
      if (multiAdvanceTimerRef.current !== null) {
        window.clearTimeout(multiAdvanceTimerRef.current);
      }
    };
  }, [question.id]);

  useEffect(() => {
    if (shouldDisableVideo) {
      return;
    }

    const syncPlayback = () => {
      const isHidden = typeof document !== 'undefined' && document.hidden;
      for (const item of SHOWCASE_POOL) {
        const el = videoRefs.current[item.poolId];
        if (!el) continue;

        el.defaultMuted = true;
        el.muted = true;

        if (!isHidden && item.poolId === showcase.poolId) {
          void el.play().catch(() => {
            // Ignorar si el navegador difiere reproducción
          });
        } else {
          el.pause();
        }
      }
    };

    syncPlayback();

    const prewarmTimer = nextPoolToPrewarm
      ? window.setTimeout(() => {
          setHydratedPools((prev) =>
            prev[nextPoolToPrewarm]
              ? prev
              : { ...prev, [nextPoolToPrewarm]: true }
          );
        }, 900)
      : null;

    document.addEventListener('visibilitychange', syncPlayback);
    return () => {
      if (prewarmTimer !== null) {
        window.clearTimeout(prewarmTimer);
      }
      document.removeEventListener('visibilitychange', syncPlayback);
    };
  }, [showcase.poolId, nextPoolToPrewarm, shouldDisableVideo, hydratedPools]);

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

  const handleManualConfirmStep = () => {
    if (multiAdvanceTimerRef.current !== null) {
      window.clearTimeout(multiAdvanceTimerRef.current);
      multiAdvanceTimerRef.current = null;
    }
    setAutoAdvancingStepId(null);
    triggerHapticFeedback(15);
    onConfirmBudgetStep();
  };

  const handleOptionPress = (value: QuestionOptionValue) => {
    triggerHapticFeedback(12);

    if (multiAdvanceTimerRef.current !== null) {
      window.clearTimeout(multiAdvanceTimerRef.current);
      multiAdvanceTimerRef.current = null;
    }
    setAutoAdvancingStepId(null);

    // En el Paso 5, tocar "Cargar la foto de la receta" abre directamente la cámara/galería
    if (
      question.id === 'prescriptionAttachment' &&
      value === 'cargar_foto_receta'
    ) {
      fileInputRef.current?.click();
      return;
    }

    // En pasos de selección múltiple (Pasos 1-3 con máx 2; Paso 4 libre)
    if (question.isMultiSelect) {
      const alreadySelected = currentMultiSelectedList.includes(value);
      const willCompleteMaxSlots =
        typeof question.maxSelections === 'number' &&
        !alreadySelected &&
        currentMultiSelectedList.length === question.maxSelections - 1;

      onSelectOption(question.id, value);

      // Si acaba de completar el cupo máximo (ej. 2 de 2 opciones en Pasos 1, 2 o 3),
      // damos 380ms de confirmación visual y avanzamos solos sin obligar a otro clic.
      if (willCompleteMaxSlots) {
        triggerHapticFeedback(18);
        const stepIdAtTap = question.id;
        setAutoAdvancingStepId(stepIdAtTap);
        multiAdvanceTimerRef.current = window.setTimeout(() => {
          multiAdvanceTimerRef.current = null;
          setAutoAdvancingStepId(null);
          onConfirmBudgetStep();
        }, 380);
      }
      return;
    }

    // En el Paso 5 ("Aún no la tengo"), iluminamos la tarjeta 150ms antes de avanzar
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
    if (!question.isMultiSelect && pendingOption !== null) {
      return pendingOption === value;
    }
    if (question.id === 'improvementGoal') {
      return (
        answers.improvementGoals?.includes(value as ImprovementGoalAnswer) ??
        answers.improvementGoal === value
      );
    }
    if (question.id === 'activityContext') {
      return (
        answers.activityContexts?.includes(value as ActivityContextAnswer) ??
        answers.activityContext === value
      );
    }
    if (question.id === 'clientPriority') {
      return (
        answers.clientPriorities?.includes(value as ClientPriorityAnswer) ??
        answers.clientPriority === value
      );
    }
    if (question.id === 'budgetPreferences') {
      return selectedBudgetList.includes(value as BudgetPreferenceAnswer);
    }
    return answers[question.id] === value;
  };

  const canDragBack =
    !prefersReducedMotion && question.stepNumber > 1 && Boolean(onSwipeBack);

  const showFloatingContinuePill =
    question.isMultiSelect === true && currentMultiSelectedList.length > 0;

  return (
    <div
      className={cn(
        'space-y-3 touch-pan-y',
        question.isMultiSelect ? 'pb-20' : 'pb-10'
      )}
    >
      {/* Input oculto para carga directa de foto de receta en el Paso 5 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => void handleFileChange(e)}
        className="hidden"
      />

      {/* Barra visual de avance en 5 tramos para dar ritmo y sensación de cercanía al resultado */}
      <div className="space-y-1.5 px-0.5">
        <div className="flex items-center justify-between text-[11px] font-semibold">
          <span className="text-[var(--brand-accent-foreground)]">
            Paso {question.stepNumber} de 5
          </span>
          <span className="text-[var(--brand-text-muted)]">
            {question.stepNumber === 5
              ? '¡Último toque para ver precios!'
              : question.maxSelections
                ? `Elegí 1 o ${question.maxSelections} opciones`
                : 'Opcional · Podés marcar varias'}
          </span>
        </div>
        <div
          aria-hidden="true"
          className="grid grid-cols-5 gap-1.5"
        >
          {[1, 2, 3, 4, 5].map((stepIdx) => {
            const isDone = stepIdx < question.stepNumber;
            const isCurrent = stepIdx === question.stepNumber;
            return (
              <div
                key={stepIdx}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-300',
                  isCurrent
                    ? 'bg-[#336699]'
                    : isDone
                      ? 'bg-[#99CC99]'
                      : 'bg-[var(--brand-border)]/80'
                )}
              />
            );
          })}
        </div>
      </div>

      {/* 1. Cabecera Card Full-Video al DOBLE de altura (2x) con la Pregunta superpuesta encima del video */}
      <Card className="relative overflow-hidden border-[#336699]/35 bg-[#0B1929] shadow-md">
        <div
          className="absolute inset-0 bg-slate-900 bg-cover bg-center"
          style={{ backgroundImage: `url(${showcase.poster})` }}
        >
          {!shouldDisableVideo &&
            SHOWCASE_POOL.map((item) => {
              const isActiveVideo = item.poolId === showcase.poolId;
              const isMounted = isActiveVideo || hydratedPools[item.poolId];
              if (!isMounted) {
                return null;
              }
              const isVisible = isActiveVideo && readyPools[item.poolId];

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
                  disablePictureInPicture
                  disableRemotePlayback
                  preload="auto"
                  onLoadedData={() => markPoolReady(item.poolId)}
                  onPlaying={() => markPoolReady(item.poolId)}
                  className={cn(
                    'absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-300',
                    isVisible
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
          >
            <CardTitle
              className={cn(
                'leading-[1.24] font-bold text-white drop-shadow-xs transition-all duration-200',
                scaleClasses.questionTitle
              )}
            >
              {question.title}
            </CardTitle>
          </motion.div>
        </CardHeader>
      </Card>

      {/* 2. Opciones del Paso Actual */}
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
                        <div className="min-w-0">
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

                      {option.value === 'interes_cuotas_tarjeta' ? (
                        <BankPromoLogos variant="light" />
                      ) : null}

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

      {/* 3. Pequeño botón cápsula flotante que aparece en un solo movimiento limpio al marcar la 1ra opción */}
      <AnimatePresence>
        {showFloatingContinuePill && (
          <motion.div
            key={`floating-pill-${question.id}`}
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 14 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-none fixed inset-x-0 bottom-[max(1.15rem,env(safe-area-inset-bottom))] z-40 flex justify-center px-4 will-change-transform"
          >
            <button
              type="button"
              onClick={handleManualConfirmStep}
              className="pointer-events-auto inline-flex h-11 items-center gap-2.5 rounded-full border border-white/25 bg-[#336699] pl-5 pr-3.5 font-brand-heading text-[14px] font-semibold text-white shadow-[0_10px_28px_-4px_rgba(22,50,79,0.52)] ring-2 ring-[#99CC99]/45 backdrop-blur-md transition-colors duration-150 hover:bg-[#265077] cursor-pointer"
            >
              <span>Siguiente</span>
              <span className="inline-flex h-6 min-w-7 items-center justify-center rounded-full bg-white/18 px-2 font-mono tabular-nums text-[11px] font-bold text-[#CBE6CB]">
                {question.maxSelections
                  ? `${currentMultiSelectedList.length}/${question.maxSelections}`
                  : currentMultiSelectedList.length}
              </span>
              {isAutoAdvancing ? (
                <CircleNotch
                  weight="bold"
                  className="h-4 w-4 animate-spin text-[#99CC99]"
                />
              ) : (
                <ArrowRight
                  weight="bold"
                  className="h-4 w-4 text-[#99CC99]"
                />
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default QuestionStep;
