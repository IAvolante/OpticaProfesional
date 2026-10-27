import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import {
  motion,
  useReducedMotion,
  type PanInfo,
  type Variants,
} from 'framer-motion';
import { ArrowRight, Camera, Check } from '@phosphor-icons/react';
import type {
  BudgetPreferenceAnswer,
  QuestionId,
  QuestionOptionValue,
  UserOpticalAnswers,
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

export function QuestionStep({
  question,
  answers,
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

        <CardHeader className="relative z-30 flex min-h-[272px] sm:min-h-[292px] flex-col justify-end p-4 sm:p-5">
          <div className="space-y-1.5">
            <CardTitle className="text-[19px] sm:text-[21px] leading-[1.25] font-bold text-white drop-shadow-xs">
              {question.title}
            </CardTitle>
            <CardDescription className="text-[13.5px] leading-snug text-slate-200/95 drop-shadow-2xs">
              {question.subtitle}
            </CardDescription>
          </div>
        </CardHeader>
      </Card>

      {/* 3. Opciones del Paso Actual */}
      <motion.div
        key={question.id}
        drag={canDragBack ? 'x' : false}
        dragDirectionLock
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={{ left: 0.02, right: 0.25 }}
        onDragEnd={handleDragEnd}
        initial={prefersReducedMotion ? false : { opacity: 0, x: 14 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 32 }}
      >
        <motion.div
          variants={prefersReducedMotion ? undefined : listContainerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-2.5"
        >
          {question.options.map((option) => {
            const isSelected = isOptionSelected(option.value);
            const isUploadRxButton =
              question.id === 'prescriptionAttachment' &&
              option.value === 'cargar_foto_receta';

            return (
              <motion.div
                key={option.value}
                variants={prefersReducedMotion ? undefined : optionCardVariants}
              >
                <button
                  type="button"
                  aria-pressed={isSelected}
                  disabled={isProcessingPhoto}
                  onClick={() => handleOptionPress(option.value)}
                  className={cn(
                    'optical-glass-card group relative w-full text-left rounded-2xl p-3.5 transition-all duration-200 cursor-pointer select-none block',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-ring)]',
                    'active:scale-[0.99]',
                    isSelected
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
                          <p className="font-brand-heading text-[15px] font-semibold text-[var(--brand-text)] leading-snug">
                            {isUploadRxButton && isProcessingPhoto
                              ? 'Cargando imagen de tu receta...'
                              : option.label}
                          </p>
                        </div>

                        {/* Indicador de Selección (Checkbox en Paso 4, Radio/Cámara en los demás) */}
                        <div
                          className={cn(
                            'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center border transition-colors',
                            question.isMultiSelect ? 'rounded-md' : 'rounded-full',
                            isSelected
                              ? 'border-[#336699] bg-[#336699] text-white'
                              : 'border-[var(--brand-border)] bg-[var(--brand-surface)] group-hover:border-[#336699]'
                          )}
                        >
                          {isSelected ? (
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

                      <p className="text-[12.5px] text-[var(--brand-text-muted)] leading-relaxed">
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
                              {answers.prescriptionPhotoName ?? 'receta.jpg'}
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
