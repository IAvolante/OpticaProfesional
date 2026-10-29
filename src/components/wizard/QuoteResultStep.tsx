import { useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowCounterClockwise,
  ArrowRight,
  Camera,
  Check,
  Phone,
  ShieldCheck,
  User,
} from '@phosphor-icons/react';
import type {
  BudgetPreferenceAnswer,
  CompletedOpticalAnswers,
  LeadContactData,
  OpticalRecommendationResult,
} from '../../types/optical.types';
import { cn } from '../../utils/cn';
import {
  compressPrescriptionImageToDataUrl,
  formatLensPriceARS,
  sanitizeArgentinePhone,
  triggerHapticFeedback,
} from '../../utils/formatters';
import type { ClaimBenefitParams } from '../../hooks/useOpticalWizard';

export interface QuoteResultStepProps {
  readonly lead: LeadContactData | null;
  readonly answers: CompletedOpticalAnswers;
  readonly recommendation: OpticalRecommendationResult;
  readonly catalogSourceLabel: string;
  readonly isSubmitting: boolean;
  readonly onClaimBenefit: (params: ClaimBenefitParams) => Promise<void>;
  readonly onUpdatePrescriptionPhoto: (
    fileName: string,
    dataUrl: string
  ) => void;
  readonly onResetWizard: () => void;
}

const BUDGET_BADGE_LABELS: Record<BudgetPreferenceAnswer, string> = {
  tengo_obra_social: 'Tengo obra social',
  soy_particular: 'Soy particular',
  interes_cuotas_tarjeta: 'Cuotas con tarjeta',
  beneficio_pago_contado: 'Beneficio pago contado',
};

function resolveDefaultSelectedOptionNumber(
  answers: CompletedOpticalAnswers,
  recommendation: OpticalRecommendationResult
): number {
  const options = recommendation.allMatchedOptions;
  if (!options || options.length < 2) {
    return 1;
  }

  // Si el usuario eligió pantallas o prioridad tecnología/moda, preseleccionar la opción que más preguntas haya sumado (o Opción 2 cuando hay upgrade de filtro)
  const highestMatch = [...options].sort(
    (a, b) => b.matchedQuestions.length - a.matchedQuestions.length
  )[0];
  if (highestMatch && highestMatch.matchedQuestions.length >= 2) {
    return highestMatch.optionNumber;
  }

  if (
    answers.improvementGoal === 'organico_blue_ar' ||
    answers.activityContext === 'computadora_celular' ||
    answers.clientPriority === 'tecnologia' ||
    answers.clientPriority === 'moda'
  ) {
    return 2;
  }
  return 1;
}

/**
 * Paso 6 ('QUOTE_RESULT') — Cierre del Asesor Virtual + Precios de Matriz Oficial `encuesta.xlsx`
 * + Cupón de Garantía de Recambio 12 Meses Gratis + Registro de Nombre y Teléfono.
 * Respeta fielmente el Ejemplo de Cierre de la página 2 de PREGUNTAS .pdf y la matriz `encuesta.xlsx`.
 */
export function QuoteResultStep({
  lead,
  answers,
  recommendation,
  catalogSourceLabel,
  isSubmitting,
  onClaimBenefit,
  onUpdatePrescriptionPhoto,
  onResetWizard,
}: QuoteResultStepProps) {
  const prefersReducedMotion = useReducedMotion();
  const nameInputRef = useRef<HTMLInputElement | null>(null);
  const phoneInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [selectedOptionNumber, setSelectedOptionNumber] = useState<number>(() =>
    resolveDefaultSelectedOptionNumber(answers, recommendation)
  );
  const [fullName, setFullName] = useState<string>(lead?.fullName ?? '');
  const [whatsapp, setWhatsapp] = useState<string>(lead?.whatsapp ?? '');
  const [nameError, setNameError] = useState<string>('');
  const [phoneError, setPhoneError] = useState<string>('');

  const {
    primaryOption,
    primaryCardTagline,
    alternativeOption,
    alternativeCardTagline,
    allMatchedOptions,
    advisorObservationParagraph,
    advisorClosingParagraph,
  } = recommendation;

  const displayOptions =
    allMatchedOptions && allMatchedOptions.length >= 2
      ? allMatchedOptions
      : [
          {
            optionNumber: 1,
            lens: primaryOption,
            tagline: primaryCardTagline,
            matchedQuestions: ['P1'] as const,
          },
          {
            optionNumber: 2,
            lens: alternativeOption,
            tagline: alternativeCardTagline,
            matchedQuestions: ['P2'] as const,
          },
        ];

  const isNameValid = fullName.trim().length >= 2;
  const isPhoneValid = sanitizeArgentinePhone(whatsapp).length >= 8;

  const activeCardItem =
    displayOptions.find((item) => item.optionNumber === selectedOptionNumber) ??
    displayOptions[0]!;
  const activeSelectedLens = activeCardItem.lens;
  const activeOptionLabel = `Opción ${activeCardItem.optionNumber}`;
  const selectedTier: 'PRIMARY' | 'ALTERNATIVE' =
    activeCardItem.optionNumber === 1 ? 'PRIMARY' : 'ALTERNATIVE';

  const handleInputFocusScroll = (inputEl: HTMLInputElement | null) => {
    if (!inputEl) return;
    window.setTimeout(() => {
      inputEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 180);
  };

  const handlePhotoChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    triggerHapticFeedback(15);
    try {
      const dataUrl = await compressPrescriptionImageToDataUrl(file);
      onUpdatePrescriptionPhoto(file.name, dataUrl);
    } catch {
      // Ignorar error de lectura
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = fullName.trim();
    const cleanDigits = sanitizeArgentinePhone(whatsapp);

    let firstInvalidInput: HTMLInputElement | null = null;

    if (trimmedName.length < 2) {
      setNameError('Completá tu nombre para emitir tu certificado de 12 meses.');
      firstInvalidInput = nameInputRef.current;
    } else {
      setNameError('');
    }

    if (cleanDigits.length < 8) {
      setPhoneError(
        'Completá tu número de WhatsApp con característica (ej: 3875123456).'
      );
      if (!firstInvalidInput) {
        firstInvalidInput = phoneInputRef.current;
      }
    } else {
      setPhoneError('');
    }

    if (firstInvalidInput) {
      triggerHapticFeedback(25);
      firstInvalidInput.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
      window.setTimeout(() => {
        firstInvalidInput?.focus({ preventScroll: true });
      }, 280);
      return;
    }

    triggerHapticFeedback(18);
    await onClaimBenefit({
      fullName: trimmedName,
      whatsapp: cleanDigits,
      selectedTier,
      selectedOptionNumber: activeCardItem.optionNumber,
    });
  };

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 360, damping: 28 }}
      className="space-y-4 pb-10"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => void handlePhotoChange(e)}
        className="hidden"
      />

      {/* =====================================================================
       * 1. TARJETA DEL ASESOR VIRTUAL + LAS 2 OPCIONES CON PRECIOS EN VIVO
       * ===================================================================== */}
      <div className="optical-glass-card rounded-3xl p-4 sm:p-5 space-y-4 border border-[var(--brand-border)]">
        {/* Encabezado con el Nuevo Logo 2026 */}
        <div className="flex items-center justify-between gap-2 border-b border-[var(--brand-border)] pb-3">
          <div className="flex items-center gap-2.5">
            <img
              src={`${import.meta.env.BASE_URL}logo-op-icon.png`}
              alt="Óptica Profesional"
              className="h-7 w-auto object-contain select-none"
            />
            <span className="font-brand-heading text-base tracking-tight text-[var(--brand-text)]">
              <span className="font-normal text-[var(--brand-optica-word)]">
                Optica{' '}
              </span>
              <span className="font-semibold text-[var(--brand-accent-foreground)]">
                Profesional
              </span>
            </span>
          </div>

          <span className="rounded-full bg-[var(--brand-accent)] border border-[var(--brand-accent-border)] px-2.5 py-0.5 font-mono text-[10px] font-semibold text-[var(--brand-accent-foreground)]">
            Asesor Virtual
          </span>
        </div>

        {/* Devolución personalizada tal cual el PDF de Solana */}
        <div className="space-y-2 text-[13.5px] leading-relaxed text-[var(--brand-text)]">
          <p>{advisorObservationParagraph}</p>
          <p className="text-[var(--brand-text-muted)]">
            {advisorClosingParagraph}
          </p>
        </div>

        {/* Grilla de Opciones según la Matriz Oficial `encuesta.xlsx` */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          {displayOptions.map(({ optionNumber, lens, tagline }, idx) => {
            const isSelected = activeCardItem.optionNumber === optionNumber;
            const isOddLastCard =
              displayOptions.length % 2 === 1 &&
              idx === displayOptions.length - 1;
            const formattedPrice = formatLensPriceARS(lens);
            const isNumericPrice = lens.priceStockARS > 0 && !lens.pricePrefix;

            return (
              <button
                key={`${lens.sku}-${optionNumber}`}
                type="button"
                aria-pressed={isSelected}
                onClick={() => {
                  triggerHapticFeedback(10);
                  setSelectedOptionNumber(optionNumber);
                }}
                className={cn(
                  'group relative flex flex-col justify-between rounded-2xl p-3.5 text-left transition-all duration-200 cursor-pointer border active:scale-[0.99]',
                  isOddLastCard && 'col-span-2',
                  isSelected
                    ? 'optical-glass-card-active'
                    : 'border-[var(--brand-border)] bg-[var(--brand-surface)]/85 hover:border-[#336699]/60'
                )}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--brand-accent-foreground)]">
                      Opción {optionNumber}
                    </span>
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold transition-colors',
                        isSelected
                          ? 'bg-[#336699] text-white'
                          : 'bg-[var(--brand-surface-elevated)] text-[var(--brand-text-muted)] border border-[var(--brand-border)]'
                      )}
                    >
                      {isSelected ? (
                        <>
                          <Check weight="bold" className="h-2.5 w-2.5" />
                          <span>Elegida</span>
                        </>
                      ) : (
                        <span>Elegir</span>
                      )}
                    </span>
                  </div>

                  <p className="font-brand-heading min-h-[36px] line-clamp-2 text-[13.5px] sm:text-[14.5px] font-semibold text-[var(--brand-text)] leading-snug">
                    {lens.commercialName}
                  </p>

                  <p
                    className={cn(
                      'font-brand-price tabular-nums font-bold tracking-tight text-[var(--brand-text)] pt-0.5',
                      isNumericPrice
                        ? 'text-[19px] sm:text-2xl leading-none'
                        : 'text-[15px] sm:text-[17px] leading-snug text-[var(--brand-accent-foreground)]'
                    )}
                  >
                    {formattedPrice}
                  </p>
                </div>

                <div className="mt-2.5 pt-2 border-t border-[var(--brand-border)]/70 flex items-center justify-between gap-1">
                  <span className="text-[11px] font-medium text-[var(--brand-text-muted)] leading-tight">
                    {tagline}
                  </span>
                  <span
                    className={cn(
                      'h-2 w-2 rounded-full shrink-0 transition-colors',
                      isSelected ? 'bg-[#336699]' : 'bg-[#99CC99]'
                    )}
                  />
                </div>
              </button>
            );
          })}
        </div>

        {/* Resumen compacto de lo elegido en el Paso 4 + Foto de Receta del Paso 5 */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex flex-wrap gap-1.5">
            {answers.budgetPreferences.map((pref) => (
              <span
                key={pref}
                className="inline-flex items-center gap-1 rounded-lg bg-[var(--brand-surface-elevated)] border border-[var(--brand-border)] px-2.5 py-1 text-[11px] font-medium text-[var(--brand-accent-foreground)]"
              >
                <ShieldCheck
                  weight="duotone"
                  className="h-3.5 w-3.5 text-[var(--brand-icon-primary)]"
                />
                {BUDGET_BADGE_LABELS[pref]}
              </span>
            ))}
          </div>

          {answers.prescriptionPhotoDataUrl || answers.prescriptionPhotoName ? (
            <div className="flex flex-col gap-1.5 rounded-xl bg-[var(--brand-accent)] border border-[var(--brand-accent-border)] p-2.5 w-full">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  {answers.prescriptionPhotoDataUrl ? (
                    <img
                      src={answers.prescriptionPhotoDataUrl}
                      alt="Receta adjunta"
                      className="h-9 w-9 rounded-md object-cover border border-[#336699]/30 shrink-0"
                    />
                  ) : null}
                  <div className="min-w-0">
                    <p className="text-[11.5px] font-semibold text-[var(--brand-text)]">
                      Foto de receta lista ({answers.prescriptionPhotoName ?? 'receta.jpg'})
                    </p>
                    <p className="text-[11px] text-[var(--brand-text-muted)] leading-snug">
                      Al abrirse WhatsApp podés enviarla directamente en el chat.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="min-h-[36px] px-2 text-[11px] font-semibold text-[var(--brand-accent-foreground)] underline cursor-pointer shrink-0"
                >
                  Cambiar
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-dashed border-[#336699]/60 bg-[var(--brand-surface)] px-3 py-1.5 text-[11px] font-semibold text-[var(--brand-accent-foreground)] hover:bg-[var(--brand-surface-elevated)] transition-colors cursor-pointer"
            >
              <Camera weight="duotone" className="h-4 w-4" />
              <span>¿Querés sumar foto de tu receta?</span>
            </button>
          )}
        </div>
      </div>

      {/* =====================================================================
       * 2. CUPÓN / CERTIFICADO EXCLUSIVO 12 MESES GRATIS + REGISTRO Y CIERRE
       * ===================================================================== */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#0E2033] via-[#0B1929] to-[#081320] text-white p-5 sm:p-6 shadow-xl border border-[#336699]/40">
        {/* Halo luminoso verde salvia y azul profesional detrás del cupón */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 h-36 w-72 rounded-full bg-[#99CC99]/20 blur-3xl"
        />

        <div className="relative z-10 space-y-4 text-center">
          {/* Píldora BENEFICIO EXCLUSIVO idéntica al PDF de Solana */}
          <div className="flex justify-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#99CC99]/20 border border-[#99CC99]/60 px-3.5 py-1 font-mono text-[11px] font-bold uppercase tracking-widest text-[#99CC99]">
              BENEFICIO EXCLUSIVO
            </span>
          </div>

          <div className="space-y-1.5">
            <h2 className="font-brand-heading text-xl sm:text-2xl font-extrabold tracking-tight text-white">
              ¡RENOVÁ TUS CRISTALES GRATIS!
            </h2>
            <p className="text-sm sm:text-[15px] font-semibold text-[#99CC99]">
              Comprá hoy y tenés un recambio sin cargo durante los próximos 12
              meses.
            </p>
          </div>

          <div className="space-y-2 text-xs leading-relaxed text-slate-300 max-w-[410px] mx-auto">
            <p>
              Con la compra de tus anteojos con cristales incluidos, te llevás
              un certificado para realizar un recambio de cristales de la misma
              categoría y características, por única vez, dentro de los 12 meses
              posteriores a tu compra.
            </p>
            <p className="text-[11px] text-slate-400">
              Beneficio personal, no transferible. Sujeto a las condiciones del
              certificado.
            </p>
          </div>

          {/* Separador tipo línea de troquel de cupón */}
          <div className="border-t border-dashed border-white/20 my-2" />

          {/* Registro de Nombre y WhatsApp en el último paso para emitir el cupón */}
          <form
            onSubmit={(e) => void handleSubmit(e)}
            noValidate
            className="space-y-3 text-left pt-1"
          >
            {/* Resumen dinámico de la opción seleccionada arriba */}
            <div className="rounded-xl bg-white/[0.07] border border-white/15 px-3 py-2 text-center">
              <p className="text-[11.5px] text-slate-300">
                Activando certificado para:{' '}
                <span className="font-semibold text-[#99CC99]">
                  {activeOptionLabel} — {activeSelectedLens.commercialName} (
                  {formatLensPriceARS(activeSelectedLens)})
                </span>
              </p>
            </div>

            <p className="text-xs font-semibold text-center text-slate-200">
              Completá tu nombre y WhatsApp para activar tu certificado:
            </p>

            <div className="space-y-2.5">
              <div className="scroll-mt-24">
                <label
                  htmlFor="coupon-fullname"
                  className={cn(
                    'block text-[11px] font-semibold mb-1',
                    nameError ? 'text-rose-300' : 'text-slate-300'
                  )}
                >
                  Tu Nombre y Apellido *
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <User weight="duotone" className="h-4 w-4" />
                  </div>
                  <input
                    ref={nameInputRef}
                    id="coupon-fullname"
                    type="text"
                    aria-invalid={Boolean(nameError)}
                    aria-describedby={nameError ? 'coupon-fullname-error' : undefined}
                    value={fullName}
                    onFocus={() => handleInputFocusScroll(nameInputRef.current)}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (nameError) setNameError('');
                    }}
                    placeholder="Ej: Mariana Gómez"
                    autoComplete="name"
                    enterKeyHint="next"
                    className={cn(
                      'min-h-[46px] w-full rounded-xl bg-white/10 pl-10 pr-10 py-2.5 text-base text-white placeholder:text-slate-400 transition-all focus:outline-none',
                      nameError
                        ? 'border-2 border-rose-400 bg-rose-950/40'
                        : isNameValid
                          ? 'border border-[#99CC99]/70 bg-white/15 focus:border-[#99CC99]'
                          : 'border border-white/20 focus:border-[#99CC99] focus:bg-white/15'
                    )}
                  />
                  {isNameValid && !nameError ? (
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-[#99CC99]">
                      <Check weight="bold" className="h-4 w-4" />
                    </div>
                  ) : null}
                </div>
                {nameError ? (
                  <p
                    id="coupon-fullname-error"
                    role="alert"
                    className="mt-1 rounded-lg bg-rose-500/20 border border-rose-400/50 px-2.5 py-1 text-xs font-medium text-rose-200"
                  >
                    {nameError}
                  </p>
                ) : null}
              </div>

              <div className="scroll-mt-24">
                <label
                  htmlFor="coupon-whatsapp"
                  className={cn(
                    'block text-[11px] font-semibold mb-1',
                    phoneError ? 'text-rose-300' : 'text-slate-300'
                  )}
                >
                  Tu Número de WhatsApp *
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <Phone weight="duotone" className="h-4 w-4" />
                  </div>
                  <input
                    ref={phoneInputRef}
                    id="coupon-whatsapp"
                    type="tel"
                    inputMode="tel"
                    aria-invalid={Boolean(phoneError)}
                    aria-describedby={phoneError ? 'coupon-whatsapp-error' : undefined}
                    value={whatsapp}
                    onFocus={() => handleInputFocusScroll(phoneInputRef.current)}
                    onChange={(e) => {
                      setWhatsapp(e.target.value);
                      if (phoneError) setPhoneError('');
                    }}
                    placeholder="Ej: 387 5123456"
                    autoComplete="tel"
                    enterKeyHint="done"
                    className={cn(
                      'min-h-[46px] w-full rounded-xl bg-white/10 pl-10 pr-10 py-2.5 text-base text-white placeholder:text-slate-400 transition-all focus:outline-none',
                      phoneError
                        ? 'border-2 border-rose-400 bg-rose-950/40'
                        : isPhoneValid
                          ? 'border border-[#99CC99]/70 bg-white/15 focus:border-[#99CC99]'
                          : 'border border-white/20 focus:border-[#99CC99] focus:bg-white/15'
                    )}
                  />
                  {isPhoneValid && !phoneError ? (
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-[#99CC99]">
                      <Check weight="bold" className="h-4 w-4" />
                    </div>
                  ) : null}
                </div>
                {phoneError ? (
                  <p
                    id="coupon-whatsapp-error"
                    role="alert"
                    className="mt-1 rounded-lg bg-rose-500/20 border border-rose-400/50 px-2.5 py-1 text-xs font-medium text-rose-200"
                  >
                    {phoneError}
                  </p>
                ) : null}
              </div>
            </div>

            {/* Botón píldora blanco exacto al diseño del PDF de Solana */}
            <div className="pt-2 space-y-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-[15px] font-bold text-[#0E2033] shadow-lg hover:bg-[#EFF7EF] active:scale-[0.99] transition-all cursor-pointer disabled:opacity-60"
              >
                <span>
                  {isSubmitting
                    ? 'Activando tu certificado...'
                    : 'Quiero aprovechar mi beneficio'}
                </span>
                <ArrowRight weight="bold" className="h-4 w-4 text-[#336699]" />
              </button>
              <p className="text-center text-[11px] text-slate-400">
                Sin compromiso de compra · Atención directa por WhatsApp
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* Pie discreto para volver a consultar */}
      <div className="flex items-center justify-between px-2 pt-1 text-xs text-[var(--brand-text-muted)]">
        <span className="font-mono text-[11px]">{catalogSourceLabel}</span>
        <button
          type="button"
          onClick={onResetWizard}
          className="inline-flex min-h-[38px] items-center gap-1.5 px-2 font-semibold text-[var(--brand-icon-primary)] hover:underline cursor-pointer"
        >
          <ArrowCounterClockwise weight="bold" className="h-3.5 w-3.5" />
          <span>Volver a empezar</span>
        </button>
      </div>
    </motion.div>
  );
}

export default QuoteResultStep;
