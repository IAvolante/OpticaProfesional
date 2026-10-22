import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import {
  motion,
  useReducedMotion,
  type PanInfo,
  type Variants,
} from 'framer-motion';
import { ArrowRight, Camera, Check, ImagePlus } from 'lucide-react';
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

const STEP_PILLS: readonly {
  readonly id: QuestionId;
  readonly code: string;
  readonly shortLabel: string;
}[] = [
  { id: 'improvementGoal', code: '01', shortLabel: 'Material' },
  { id: 'activityContext', code: '02', shortLabel: 'Solución' },
  { id: 'clientPriority', code: '03', shortLabel: 'Prioridad' },
  { id: 'budgetPreferences', code: '04', shortLabel: 'Beneficios' },
  { id: 'prescriptionAttachment', code: '05', shortLabel: 'Receta' },
];

const BASE_URL = import.meta.env.BASE_URL;

const SHOWCASE_POOL = [
  {
    poolId: 'step1',
    src: `${BASE_URL}videos/step1-material-flow.mp4`,
    poster: `${BASE_URL}videos/step1-material-poster.jpg`,
  },
  {
    poolId: 'step2',
    src: `${BASE_URL}videos/step2-activities-flow.mp4`,
    poster: `${BASE_URL}videos/step2-activities-poster.jpg`,
  },
  {
    poolId: 'step3',
    src: `${BASE_URL}videos/step3-priority-flow.mp4`,
    poster: `${BASE_URL}videos/step3-priority-poster.jpg`,
  },
  {
    poolId: 'step4',
    src: `${BASE_URL}videos/step4-budget-flow.mp4`,
    poster: `${BASE_URL}videos/step4-budget-poster.jpg`,
  },
  {
    poolId: 'step5',
    src: `${BASE_URL}videos/step5-prescription-flow.mp4`,
    poster: `${BASE_URL}videos/step5-prescription-poster.jpg`,
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
    poolId: 'step1',
    poster: `${BASE_URL}videos/step1-material-poster.jpg`,
    caption: 'Tecnología en Cristales · Óptica Profesional',
    code: 'PASO 01',
  },
  activityContext: {
    poolId: 'step2',
    poster: `${BASE_URL}videos/step2-activities-poster.jpg`,
    caption: 'Comodidad Visual en tu Rutina Diaria',
    code: 'PASO 02',
  },
  clientPriority: {
    poolId: 'step3',
    poster: `${BASE_URL}videos/step3-priority-poster.jpg`,
    caption: 'Calidad, Tecnología y Mejor Precio',
    code: 'PASO 03',
  },
  budgetPreferences: {
    poolId: 'step4',
    poster: `${BASE_URL}videos/step4-budget-poster.jpg`,
    caption: 'Obras Sociales · Cuotas · Beneficio Contado',
    code: 'PASO 04',
  },
  prescriptionAttachment: {
    poolId: 'step5',
    poster: `${BASE_URL}videos/step5-prescription-poster.jpg`,
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
  onJumpToStep,
}: QuestionStepProps) {
  const prefersReducedMotion = useReducedMotion();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isProcessingPhoto, setIsProcessingPhoto] = useState<boolean>(false);

  const videoRefs = useRef<Record<ShowcasePoolId, HTMLVideoElement | null>>({
    step1: null,
    step2: null,
    step3: null,
    step4: null,
    step5: null,
  });

  const showcase = QUESTION_VIDEO_SHOWCASE[question.id];
  const selectedBudgetList = answers.budgetPreferences ?? [];

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
    if (info.offset.x > 75 && onSwipeBack) {
      triggerHapticFeedback(12);
      onSwipeBack();
    }
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    triggerHapticFeedback(18);
    setIsProcessingPhoto(true);
    try {
      const compressedDataUrl = await compressPrescriptionImageToDataUrl(file);
      onAttachPrescriptionPhoto(file.name, compressedDataUrl);
    } catch {
      onAttachPrescriptionPhoto(file.name, '');
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

    onSelectOption(question.id, value);
  };

  const isOptionSelected = (value: QuestionOptionValue): boolean => {
    if (question.id === 'budgetPreferences') {
      return selectedBudgetList.includes(value as BudgetPreferenceAnswer);
    }
    return answers[question.id] === value;
  };

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

      {/* 1. Tira Visual de los 5 Pasos con paleta Bicolor 2026 (#336699 + #99CC99) */}
      <div className="grid grid-cols-5 gap-1.5">
        {STEP_PILLS.map((pill, idx) => {
          const isCurrent = pill.id === question.id;
          const isCompleted =
            pill.id === 'budgetPreferences'
              ? Boolean(
                  answers.budgetPreferences &&
                    answers.budgetPreferences.length > 0
                )
              : Boolean(answers[pill.id]);
          const isPast = idx + 1 < question.stepNumber;
          const canClickPill = (isCompleted || isPast) && onJumpToStep;

          return (
            <button
              key={pill.id}
              type="button"
              disabled={!canClickPill}
              onClick={() => {
                if (canClickPill) {
                  triggerHapticFeedback(8);
                  onJumpToStep(idx);
                }
              }}
              className={cn(
                'flex flex-col items-center justify-center rounded-xl py-1.5 px-1 border text-center transition-all duration-200',
                canClickPill ? 'cursor-pointer' : 'cursor-default',
                isCurrent
                  ? 'border-[#336699] bg-[#336699] text-white shadow-2xs'
                  : isCompleted || isPast
                    ? 'border-[#99CC99] bg-[#EFF7EF] text-[#264F78]'
                    : 'border-[var(--brand-border)] bg-[var(--brand-surface)]/85 text-[var(--brand-text-muted)]'
              )}
            >
              <span className="font-mono text-[9px] font-bold uppercase tracking-wider leading-none">
                {pill.code}
              </span>
              <span className="text-[10px] font-semibold truncate max-w-full mt-0.5 leading-tight">
                {pill.shortLabel}
              </span>
            </button>
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
                  isActiveVideo
                    ? 'opacity-100 z-10'
                    : 'opacity-0 z-0 pointer-events-none'
                )}
              />
            );
          })}
          <div className="absolute inset-0 z-20 bg-gradient-to-t from-[#102336]/85 via-[#102336]/25 to-transparent" />
          <div className="absolute bottom-2.5 left-3.5 right-3.5 z-30 flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-2 rounded-md bg-[#102336]/80 backdrop-blur-md border border-white/15 px-2.5 py-1 text-[11px] font-medium text-white">
              <span className="h-2 w-2 rounded-full bg-[#99CC99]" />
              <span>{showcase.caption}</span>
            </span>
            <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-[#99CC99]">
              {showcase.code}
            </span>
          </div>
        </div>

        <CardHeader className="p-4 space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[#336699]">
              {question.categoryBadge}
            </span>
            <span className="font-mono text-[10px] font-semibold text-[#2E6F40] bg-[#EFF7EF] border border-[#99CC99]/70 rounded-md px-2 py-0.5">
              {question.isMultiSelect
                ? 'Podés elegir varias'
                : 'Tocá una opción'}
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

      {/* 3. Opciones del Paso Actual */}
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
                  disabled={isProcessingPhoto}
                  onClick={() => handleOptionPress(option.value)}
                  className={cn(
                    'optical-glass-card group relative w-full text-left rounded-2xl p-3.5 transition-all duration-200 cursor-pointer select-none block',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#336699]',
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
                            <Check className="h-3 w-3 stroke-[3]" />
                          ) : isUploadRxButton ? (
                            <Camera className="h-3 w-3 text-[#336699]" />
                          ) : (
                            <span className="h-1.5 w-1.5 rounded-full bg-transparent" />
                          )}
                        </div>
                      </div>

                      <p className="text-[12.5px] text-[var(--brand-text-muted)] leading-relaxed">
                        {option.description}
                      </p>

                      {isUploadRxButton && answers.prescriptionPhotoDataUrl ? (
                        <div className="pt-2 flex items-center gap-2.5 rounded-xl bg-[#EFF7EF] border border-[#99CC99] p-2">
                          <img
                            src={answers.prescriptionPhotoDataUrl}
                            alt="Receta adjunta"
                            className="h-10 w-10 rounded-lg object-cover border border-[#336699]/30 shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-[#183D22]">
                              Receta cargada correctamente
                            </p>
                            <p className="font-mono text-[10px] text-[#4A637C] truncate">
                              {answers.prescriptionPhotoName ?? 'receta.jpg'}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="pt-1 flex items-center gap-1.5">
                          <span className="inline-flex items-center gap-1.5 rounded-md bg-[var(--brand-surface-elevated)]/90 border border-[var(--brand-border)] px-2 py-0.5 font-mono text-[10px] font-semibold text-[#336699]">
                            {isUploadRxButton ? (
                              <ImagePlus className="h-3 w-3 text-[#336699]" />
                            ) : (
                              <span className="h-1.5 w-1.5 rounded-full bg-[#99CC99]" />
                            )}
                            {option.clinicalHint}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.div>

      {/* 4. En el Paso 4 (Selección Múltiple), botón claro para avanzar al Paso 5 */}
      {question.isMultiSelect && (
        <div className="pt-2">
          <Button
            type="button"
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => {
              triggerHapticFeedback(15);
              onConfirmBudgetStep();
            }}
            rightIcon={<ArrowRight className="h-4 w-4" />}
          >
            {selectedBudgetList.length > 0
              ? `Continuar con ${selectedBudgetList.length} ${selectedBudgetList.length === 1 ? 'opción seleccionada' : 'opciones seleccionadas'}`
              : 'Continuar al último paso'}
          </Button>
        </div>
      )}
    </div>
  );
}

export default QuestionStep;
