import { useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowCounterClockwise,
  ArrowRight,
  Camera,
  Check,
  CreditCard,
  DownloadSimple,
  Info,
  MapPin,
  Money,
  Phone,
  ShieldCheck,
  Sparkle,
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
import { downloadQuoteSummaryImage } from '../../utils/quoteImage.generator';
import type { ClaimBenefitParams } from '../../hooks/useOpticalWizard';
import { BankPromoLogos } from '../ui/BankPromoLogos';

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
  tengo_obra_social: '¡Con obra social tenés un armazón sin cargo seleccionado!',
  soy_particular: 'Soy particular',
  interes_cuotas_tarjeta: '12 cuotas Naranja X · 6 cuotas Macro',
  beneficio_pago_contado: 'Consultanos por beneficios de contado a nuestro WhatsApp',
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
 * Paso 6 ('QUOTE_RESULT') — Cierre del Asesor Virtual + Precios de Matriz Oficial `encuesta.xlsx`:
 * - Si el cristal elegido es MONOFOCAL (`hasAnnualReplacementPromo === true`): muestra el Cupón de Garantía de Recambio 12 Meses Gratis.
 * - Si el cristal elegido es OCUPACIONAL, BIFOCAL o MULTIFOCAL (`hasAnnualReplacementPromo === false`):
 *   NO muestra la promo de 12 meses, y en su lugar muestra la Guía de Tips y Características + invitación a tomar mediciones en la óptica + facilidades de pago.
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
  const [isDownloadingCard, setIsDownloadingCard] = useState<boolean>(false);
  const [hasDownloadedCard, setHasDownloadedCard] = useState<boolean>(false);

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

  const isMonofocalWithAnnualPromo =
    activeSelectedLens.hasAnnualReplacementPromo;
  const multiDistanceGuide = activeSelectedLens.multiDistanceGuide;
  const hasAnyNumericStockPrice = displayOptions.some(
    (opt) => opt.lens.priceStockARS > 0 && !opt.lens.pricePrefix
  );

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

  const handleDownloadQuoteImage = async () => {
    if (isDownloadingCard) return;
    triggerHapticFeedback(15);
    setIsDownloadingCard(true);
    try {
      const ok = await downloadQuoteSummaryImage({
        answers,
        recommendation,
        selectedOptionNumber: activeCardItem.optionNumber,
        fullName,
        whatsapp,
        lead,
      });
      if (ok) {
        setHasDownloadedCard(true);
      }
    } finally {
      setIsDownloadingCard(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = fullName.trim();
    const cleanDigits = sanitizeArgentinePhone(whatsapp);

    let firstInvalidInput: HTMLInputElement | null = null;

    if (trimmedName.length < 2) {
      setNameError(
        isMonofocalWithAnnualPromo
          ? 'Completá tu nombre para emitir tu certificado de 12 meses.'
          : 'Completá tu nombre para recibir tu asesoramiento personalizado.'
      );
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
      initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
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
       * 1. TARJETA DEL ASESOR VIRTUAL + OPCIONES CON PRECIOS EN VIVO
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
                  'group relative flex flex-col justify-between rounded-2xl p-3.5 text-left transition-[background-color,border-color,box-shadow,transform] duration-150 cursor-pointer border active:scale-[0.985]',
                  isOddLastCard && 'col-span-2',
                  isSelected
                    ? 'optical-glass-card-active'
                    : 'border-[var(--brand-border)] bg-[var(--brand-surface)]/95 hover:border-[#336699]/60'
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
                        : 'text-[13px] sm:text-[15px] leading-snug text-[var(--brand-accent-foreground)]'
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

        {/* Aclaración clínica sutil sobre precios de Stock vs. Rango/Laboratorio acordada con Solana */}
        {hasAnyNumericStockPrice ? (
          <p className="flex items-center gap-1.5 text-[11px] text-[var(--brand-text-muted)] leading-snug">
            <Info
              weight="duotone"
              className="h-3.5 w-3.5 shrink-0 text-[var(--brand-icon-primary)]"
            />
            <span>
              Valores de referencia para graduaciones de stock. Pueden variar
              según el rango de tu receta o tratamientos de laboratorio.
            </span>
          </p>
        ) : null}

        {/* Resumen compacto de lo elegido en el Paso 4 + Logos Bancarios + Foto de Receta del Paso 5 */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex flex-col gap-2 w-full">
            <div className="flex flex-wrap gap-1.5">
              {answers.budgetPreferences.map((pref) => (
                <span
                  key={pref}
                  className="inline-flex items-center gap-1 rounded-lg bg-[var(--brand-surface-elevated)] border border-[var(--brand-border)] px-2.5 py-1 text-[11px] font-medium text-[var(--brand-accent-foreground)]"
                >
                  <ShieldCheck
                    weight="duotone"
                    className="h-3.5 w-3.5 shrink-0 text-[var(--brand-icon-primary)]"
                  />
                  <span>{BUDGET_BADGE_LABELS[pref]}</span>
                </span>
              ))}
            </div>

            {answers.budgetPreferences.includes('interes_cuotas_tarjeta') ? (
              <BankPromoLogos variant="light" className="pt-0" />
            ) : null}
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
                      Foto de receta lista (
                      {answers.prescriptionPhotoName ?? 'receta.jpg'})
                    </p>
                    <p className="text-[11px] text-[var(--brand-text-muted)] leading-snug">
                      Al abrirse WhatsApp podés enviarla directamente en el
                      chat.
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

        {/* Botón directo para descargar la ficha en imagen y traerla a la óptica (pedido de Solana y su papá) */}
        <div className="pt-1 border-t border-[var(--brand-border)]/80">
          <button
            type="button"
            disabled={isDownloadingCard}
            onClick={() => void handleDownloadQuoteImage()}
            className={cn(
              'flex min-h-[46px] w-full items-center justify-center gap-2 rounded-2xl border px-4 py-2.5 text-xs sm:text-[13px] font-bold transition-all active:scale-[0.99] cursor-pointer shadow-2xs',
              hasDownloadedCard
                ? 'border-[#3B693B]/50 bg-[#EFF7EF] text-[#234723]'
                : 'border-[#336699]/45 bg-[#336699]/10 text-[var(--brand-accent-foreground)] hover:bg-[#336699]/15'
            )}
          >
            {hasDownloadedCard ? (
              <>
                <Check weight="bold" className="h-4 w-4 shrink-0 text-[#2E6B2E]" />
                <span>
                  ¡Ficha descargada! Tocá si querés volver a guardarla
                </span>
              </>
            ) : (
              <>
                <DownloadSimple weight="bold" className="h-4 w-4 shrink-0" />
                <span>
                  {isDownloadingCard
                    ? 'Generando tu ficha de presupuesto...'
                    : 'Descargar mi presupuesto en imagen (Para mostrar en la óptica)'}
                </span>
              </>
            )}
          </button>
          <p className="mt-1 text-center text-[10.5px] text-[var(--brand-text-muted)]">
            Guardá una imagen con tus precios, opciones y respuestas para tenerla a mano cuando nos visites.
          </p>
        </div>
      </div>

      {/* =====================================================================
       * 2. BLOQUE DINÁMICO SEGÚN TIPO DE CRISTAL (REGLA DE SOLANA 30/10):
       *    - MONOFOCAL -> Cupón ¡RENOVÁ TUS CRISTALES GRATIS! (12 meses)
       *    - OCUPACIONAL / BIFOCAL / MULTIFOCAL -> Tips y Características + Medición en Óptica + Beneficios de Pago
       * ===================================================================== */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#0E2033] via-[#0B1929] to-[#081320] text-white p-5 sm:p-6 shadow-xl border border-[#336699]/40">
        {/* Halo luminoso verde salvia libre de filtros GPU */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-40"
          style={{
            background:
              'radial-gradient(ellipse 68% 85% at 50% 0%, rgba(153, 204, 153, 0.22) 0%, transparent 75%)',
          }}
        />

        <div className="relative z-10 space-y-4">
          {isMonofocalWithAnnualPromo ? (
            /* ---------------------------------------------------------------
             * CASO A: CRISTAL MONOFOCAL -> CERTIFICADO 12 MESES GRATIS
             * --------------------------------------------------------------- */
            <div className="space-y-4 text-center">
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
                  Comprá hoy y tenés un recambio sin cargo durante los próximos
                  12 meses.
                </p>
              </div>

              <div className="space-y-2 text-xs leading-relaxed text-slate-300 max-w-[410px] mx-auto">
                <p>
                  Con la compra de tus anteojos con cristales monofocales
                  incluidos, te llevás un certificado para realizar un recambio
                  de cristales de la misma categoría y características, por
                  única vez, dentro de los 12 meses posteriores a tu compra.
                </p>
                <p className="text-[11px] text-slate-400">
                  Beneficio personal, no transferible, exclusivo para cristales
                  monofocales. Sujeto a las condiciones del certificado.
                </p>
              </div>
            </div>
          ) : (
            /* ---------------------------------------------------------------
             * CASO B: OCUPACIONAL / BIFOCAL / MULTIFOCAL -> TIPS + MEDICIÓN EN ÓPTICA
             * --------------------------------------------------------------- */
            <div className="space-y-3.5 text-left">
              <div className="flex justify-center">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#99CC99]/20 border border-[#99CC99]/60 px-3.5 py-1 font-mono text-[10.5px] font-bold uppercase tracking-wider text-[#99CC99]">
                  <Sparkle weight="fill" className="h-3 w-3" />
                  <span>
                    {multiDistanceGuide?.badgeLabel ??
                      'TIPS Y CARACTERÍSTICAS · CRISTAL A MEDIDA'}
                  </span>
                </span>
              </div>

              <div className="space-y-1.5 text-center">
                <h2 className="font-brand-heading text-lg sm:text-xl font-extrabold tracking-tight text-white">
                  {multiDistanceGuide?.headline ??
                    `TIPS PARA ELEGIR TUS ${activeSelectedLens.commercialName.toUpperCase()}`}
                </h2>
                <p className="text-xs sm:text-[13.5px] font-semibold text-[#99CC99] leading-snug">
                  {multiDistanceGuide?.subheadline ??
                    activeSelectedLens.idealForSummary}
                </p>
              </div>

              <p className="text-xs leading-relaxed text-slate-200/95">
                {multiDistanceGuide?.explanation ??
                  activeSelectedLens.materialDescription}
              </p>

              {/* Lista de Tips específicos del cristal (Ocupacional / Bifocal / Multifocal) */}
              {multiDistanceGuide?.tips && multiDistanceGuide.tips.length > 0 ? (
                <ul className="space-y-2 rounded-2xl bg-white/[0.06] border border-white/12 p-3.5 text-xs text-slate-200">
                  {multiDistanceGuide.tips.map((tip) => (
                    <li key={tip} className="flex items-start gap-2">
                      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#99CC99]/25 text-[#99CC99]">
                        <Check weight="bold" className="h-2.5 w-2.5" />
                      </span>
                      <span className="leading-snug">{tip}</span>
                    </li>
                  ))}
                </ul>
              ) : null}

              {/* Invitación a pasar por la óptica + facilidades de pago (cuotas / contado) */}
              <div className="rounded-2xl bg-[#336699]/25 border border-[#99CC99]/35 p-3 space-y-2">
                <div className="flex items-start gap-2 text-xs text-slate-100">
                  <MapPin
                    weight="duotone"
                    className="h-4 w-4 shrink-0 text-[#99CC99] mt-0.5"
                  />
                  <p className="leading-snug">
                    {multiDistanceGuide?.measurementNotice ??
                      'Para asesorarte mejor en este tipo de cristal y tomar las mediciones de tus ojos, te invitamos a visitarnos en la óptica.'}
                  </p>
                </div>

                <BankPromoLogos variant="dark" className="pt-0.5" />

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-2.5 py-1 text-[10.5px] font-semibold text-[#99CC99]">
                    <CreditCard weight="duotone" className="h-3.5 w-3.5 shrink-0" />
                    <span>12 cuotas con Naranja X y 6 con Macro</span>
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-2.5 py-1 text-[10.5px] font-semibold text-[#99CC99]">
                    <Money weight="duotone" className="h-3.5 w-3.5 shrink-0" />
                    <span>Efectivo: consultanos por beneficios de contado a nuestro WhatsApp</span>
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Separador tipo línea de troquel */}
          <div className="border-t border-dashed border-white/20 my-2" />

          {/* Registro de Nombre y WhatsApp en el último paso */}
          <form
            onSubmit={(e) => void handleSubmit(e)}
            noValidate
            className="space-y-3 text-left pt-1"
          >
            {/* Resumen dinámico de la opción seleccionada arriba */}
            <div className="rounded-xl bg-white/[0.07] border border-white/15 px-3 py-2 text-center">
              <p className="text-[11.5px] text-slate-300">
                {isMonofocalWithAnnualPromo
                  ? 'Activando certificado para: '
                  : 'Solicitando asesoramiento para: '}
                <span className="font-semibold text-[#99CC99]">
                  {activeOptionLabel} — {activeSelectedLens.commercialName} (
                  {formatLensPriceARS(activeSelectedLens)})
                </span>
              </p>
            </div>

            <p className="text-xs font-semibold text-center text-slate-200">
              {isMonofocalWithAnnualPromo
                ? 'Completá tu nombre y WhatsApp para activar tu certificado:'
                : 'Completá tu nombre y WhatsApp para recibir tu cotización a medida:'}
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
                    aria-describedby={
                      nameError ? 'coupon-fullname-error' : undefined
                    }
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (nameError) setNameError('');
                    }}
                    placeholder="Ej: Mariana Gómez"
                    autoComplete="name"
                    enterKeyHint="next"
                    className={cn(
                      'min-h-[46px] w-full rounded-xl bg-white/10 pl-10 pr-10 py-2.5 text-base text-white placeholder:text-slate-400 transition-[background-color,border-color] duration-150 focus:outline-none',
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
                    aria-describedby={
                      phoneError ? 'coupon-whatsapp-error' : undefined
                    }
                    value={whatsapp}
                    onChange={(e) => {
                      setWhatsapp(e.target.value);
                      if (phoneError) setPhoneError('');
                    }}
                    placeholder="Ej: 387 5123456"
                    autoComplete="tel"
                    enterKeyHint="done"
                    className={cn(
                      'min-h-[46px] w-full rounded-xl bg-white/10 pl-10 pr-10 py-2.5 text-base text-white placeholder:text-slate-400 transition-[background-color,border-color] duration-150 focus:outline-none',
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

            {/* Botón píldora destacado + botón secundario de descarga de ficha */}
            <div className="pt-2 space-y-2.5">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-[15px] font-bold text-[#0E2033] shadow-lg hover:bg-[#EFF7EF] active:scale-[0.985] transition-[background-color,transform] duration-150 cursor-pointer disabled:opacity-60"
              >
                <span>
                  {isSubmitting
                    ? 'Abriendo WhatsApp...'
                    : isMonofocalWithAnnualPromo
                      ? 'Quiero aprovechar mi beneficio'
                      : (multiDistanceGuide?.ctaButtonText ??
                        'Quiero recibir asesoramiento por WhatsApp')}
                </span>
                <ArrowRight weight="bold" className="h-4 w-4 text-[#336699]" />
              </button>

              <button
                type="button"
                disabled={isDownloadingCard}
                onClick={() => void handleDownloadQuoteImage()}
                className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full border border-[#99CC99]/50 bg-white/[0.08] px-5 py-2.5 text-xs sm:text-[13px] font-semibold text-[#99CC99] hover:bg-white/[0.14] active:scale-[0.985] transition-[background-color,transform] duration-150 cursor-pointer"
              >
                <DownloadSimple weight="bold" className="h-4 w-4 shrink-0" />
                <span>
                  {hasDownloadedCard
                    ? 'Ficha descargada en tu celular · Volver a descargar'
                    : 'Descargar ficha de presupuesto para llevar a la óptica'}
                </span>
              </button>

              <p className="text-center text-[11px] text-slate-400">
                Sin compromiso de compra · Atención directa por WhatsApp o en el local
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
