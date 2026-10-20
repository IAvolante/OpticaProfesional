import { useState } from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { motion, useReducedMotion } from 'framer-motion';
import {
  AlertCircle,
  Check,
  ClipboardCheck,
  Clock,
  Copy,
  CreditCard,
  FileSearch,
  HeartHandshake,
  Info,
  MessageCircle,
  QrCode,
  RotateCcw,
  ShieldCheck,
  Wallet,
} from 'lucide-react';
import type {
  CompletedOpticalAnswers,
  LeadContactData,
  LensCatalogItem,
  OpticalRecommendationResult,
  PaymentBenefitMode,
} from '../../types/optical.types';
import { cn } from '../../utils/cn';
import { formatCurrencyARS, triggerHapticFeedback } from '../../utils/formatters';
import {
  buildWhatsAppDeepLink,
  buildWhatsAppQuoteMessage,
} from '../../utils/whatsapp.encoder';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/Card';
import { MobileSheet } from '../ui/MobileSheet';
import { Separator } from '../ui/Separator';
import { LensVisualSimulator } from './LensVisualSimulator';

export interface QuoteResultStepProps {
  readonly lead: LeadContactData;
  readonly answers: CompletedOpticalAnswers;
  readonly recommendation: OpticalRecommendationResult;
  readonly catalogSourceLabel: string;
  readonly onResetWizard: () => void;
  readonly onWhatsAppClick: (selectedTier: 'PRIMARY' | 'ALTERNATIVE') => void;
}

interface LensDualPriceBreakdownProps {
  readonly lens: LensCatalogItem;
  readonly highlightLabWarning: boolean;
  readonly paymentMode: PaymentBenefitMode;
}

/**
 * Grilla comparativa lado a lado (2 columnas en móvil) con cálculo en tiempo real
 * y tipografía monoespaciada tabular (`JetBrains Mono`) para precios y rangos.
 */
function LensDualPriceBreakdown({
  lens,
  highlightLabWarning,
  paymentMode,
}: LensDualPriceBreakdownProps) {
  const isCashDiscount = paymentMode === 'CASH_TRANSFER';
  const stockDisplayPrice = isCashDiscount
    ? Math.round(lens.priceStockARS * 0.85)
    : lens.priceStockARS;
  const labDisplayPrice = isCashDiscount
    ? Math.round(lens.priceLabARS * 0.85)
    : lens.priceLabARS;

  const stockSavings = lens.priceStockARS - stockDisplayPrice;

  return (
    <div className="space-y-2.5 pt-1">
      <div className="grid grid-cols-2 gap-2.5">
        {/* Columna 1: Rango Stock */}
        <div
          className={cn(
            'rounded-xl p-3 border flex flex-col justify-between transition-colors',
            !highlightLabWarning
              ? 'border-emerald-600/40 bg-[var(--brand-badge-stock-bg)]/85'
              : 'border-[var(--brand-border)] bg-[var(--brand-surface)]'
          )}
        >
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-1">
              <Badge variant="stock">Rango Stock</Badge>
              {isCashDiscount && (
                <span className="font-mono text-[10px] font-bold text-emerald-700">
                  -15%
                </span>
              )}
            </div>

            {isCashDiscount && (
              <p className="font-mono text-[11px] line-through text-[var(--brand-text-muted)] leading-none pt-1">
                {formatCurrencyARS(lens.priceStockARS)}
              </p>
            )}

            <p className="font-mono tabular-nums text-xl font-bold tracking-tight text-[var(--brand-text)]">
              {formatCurrencyARS(stockDisplayPrice)}
            </p>
            <p className="text-[11px] font-medium text-[var(--brand-text)] leading-snug">
              {lens.stockRangeDescription}
            </p>
          </div>

          <p className="mt-2.5 inline-flex items-center gap-1 text-[10px] text-[var(--brand-text-muted)]">
            <Clock className="h-3 w-3 shrink-0 text-[var(--brand-primary)]" />
            <span className="truncate">{lens.deliveryTimeStock}</span>
          </p>
        </div>

        {/* Columna 2: Rango Laboratorio */}
        <div
          className={cn(
            'rounded-xl p-3 border flex flex-col justify-between transition-colors',
            highlightLabWarning
              ? 'border-amber-500/60 bg-[var(--brand-badge-lab-bg)]/90'
              : 'border-[var(--brand-border)] bg-[var(--brand-surface)]'
          )}
        >
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-1">
              <Badge variant="lab">Rango Lab</Badge>
              {isCashDiscount && (
                <span className="font-mono text-[10px] font-bold text-emerald-700">
                  -15%
                </span>
              )}
            </div>

            {isCashDiscount && (
              <p className="font-mono text-[11px] line-through text-[var(--brand-text-muted)] leading-none pt-1">
                {formatCurrencyARS(lens.priceLabARS)}
              </p>
            )}

            <p className="font-mono tabular-nums text-xl font-bold tracking-tight text-[var(--brand-text)]">
              {formatCurrencyARS(labDisplayPrice)}
            </p>
            <p className="text-[11px] font-medium text-[var(--brand-text)] leading-snug">
              {lens.labRangeDescription}
            </p>
          </div>

          <p className="mt-2.5 inline-flex items-center gap-1 text-[10px] text-[var(--brand-text-muted)]">
            <Clock className="h-3 w-3 shrink-0 text-[var(--brand-primary)]" />
            <span className="truncate">{lens.deliveryTimeLab}</span>
          </p>
        </div>
      </div>

      {/* Cinta informativa dinámica según el medio de pago / cobertura elegido */}
      {paymentMode === 'CASH_TRANSFER' && (
        <div className="rounded-lg bg-emerald-500/12 border border-emerald-600/25 px-3 py-2 flex items-center justify-between text-xs font-medium text-emerald-950">
          <span>Bonificación Contado / Transferencia:</span>
          <span className="font-mono font-bold text-emerald-800">
            -{formatCurrencyARS(stockSavings)}
          </span>
        </div>
      )}

      {paymentMode === 'HEALTH_INSURANCE' && (
        <div className="rounded-lg bg-[var(--brand-accent)] border border-[var(--brand-accent-border)] px-3 py-2 text-xs font-medium text-[var(--brand-accent-foreground)]">
          Convenios activos en Salta (Obras Sociales, Mutuales y Coseguro). Enviá tu carnet por WhatsApp para descontar tu cobertura.
        </div>
      )}
    </div>
  );
}

/**
 * Paso Final ('QUOTE_RESULT') construido con primitivas shadcn/ui (`Card`, `TabsPrimitive`, `Separator`, `MobileSheet`):
 * - Cero iconos artificiales de IA ni emotes.
 * - Tipografía clínica Inter + DM Sans + JetBrains Mono.
 */
export function QuoteResultStep({
  lead,
  answers,
  recommendation,
  catalogSourceLabel,
  onResetWizard,
  onWhatsAppClick,
}: QuoteResultStepProps) {
  const prefersReducedMotion = useReducedMotion();
  const [selectedTier, setSelectedTier] = useState<'PRIMARY' | 'ALTERNATIVE'>(
    'PRIMARY'
  );
  const [paymentMode, setPaymentMode] = useState<PaymentBenefitMode>(
    lead.preferredPayment ?? 'CASH_TRANSFER'
  );
  const [copiedFicha, setCopiedFicha] = useState<boolean>(false);

  const {
    primaryOption,
    alternativeOption,
    alternativeUpgradeReason,
    personalizedReasoning,
    clinicalTags,
    requiresLabRangeWarning,
    estimatedRangeNote,
  } = recommendation;

  const activeLens =
    selectedTier === 'ALTERNATIVE' ? alternativeOption : primaryOption;

  const activeDisplayPriceStock =
    paymentMode === 'CASH_TRANSFER'
      ? Math.round(activeLens.priceStockARS * 0.85)
      : activeLens.priceStockARS;

  const passportCode = lead.passportCode ?? 'OP-SALTA';
  const hasPhotochromic =
    activeLens.sku.includes('PHOTO') ||
    answers.lightSensitivity === 'outdoor_commute';

  const whatsappUrl = buildWhatsAppDeepLink({
    lead,
    answers,
    recommendation,
    selectedLensType: selectedTier,
    paymentMode,
  });

  const whatsappPreviewText = buildWhatsAppQuoteMessage({
    lead,
    answers,
    recommendation,
    selectedLensType: selectedTier,
    paymentMode,
  });

  const handleCopyFicha = async () => {
    triggerHapticFeedback(12);
    try {
      await navigator.clipboard.writeText(whatsappPreviewText);
      setCopiedFicha(true);
      window.setTimeout(() => setCopiedFicha(false), 2500);
    } catch {
      // Ignorar si clipboard no está disponible
    }
  };

  return (
    <>
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 360, damping: 28 }}
        className="space-y-3.5 pb-36"
      >
        {/* 1. CREDENCIAL DE ORDEN Y PASAPORTE ÓPTICO */}
        <div className="rounded-2xl bg-slate-950 text-white p-4 shadow-md border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <QrCode className="h-4 w-4" />
              </div>
              <div>
                <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-emerald-400">
                  Pasaporte Óptico · Salta
                </p>
                <p className="text-[13px] font-semibold tracking-tight text-white">
                  Titular: {lead.fullName}
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-block rounded-md bg-slate-900 px-2.5 py-0.5 font-mono text-xs font-semibold text-white border border-slate-700">
                #{passportCode}
              </span>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Reserva 7 días
              </p>
            </div>
          </div>

          {lead.prescriptionPhotoName ? (
            <div className="flex items-center justify-between rounded-lg bg-emerald-950/80 border border-emerald-700/50 px-3 py-1.5 text-xs text-emerald-200">
              <span className="font-medium">
                Receta vinculada para adjuntar en WhatsApp
              </span>
              <span className="font-mono text-[10px] truncate max-w-[120px]">
                {lead.prescriptionPhotoName}
              </span>
            </div>
          ) : null}
        </div>

        {/* 2. CONMUTADOR DE BENEFICIO EN VIVO */}
        <Card className="p-2.5">
          <p className="px-1 pb-2 font-mono text-[10px] font-semibold uppercase tracking-wider text-[var(--brand-text-muted)]">
            Modalidad de pago o cobertura aplicada:
          </p>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => {
                triggerHapticFeedback(10);
                setPaymentMode('CASH_TRANSFER');
              }}
              className={cn(
                'flex flex-col items-center justify-center rounded-xl py-2 px-1.5 text-center transition-all cursor-pointer border',
                paymentMode === 'CASH_TRANSFER'
                  ? 'bg-[var(--brand-primary)] text-[var(--brand-primary-foreground)] border-[var(--brand-primary)] shadow-2xs'
                  : 'bg-[var(--brand-surface)] text-[var(--brand-text-muted)] border-[var(--brand-border)]'
              )}
            >
              <Wallet className="h-3.5 w-3.5 mb-1" />
              <span className="text-[11px] font-semibold leading-tight">
                Transf. / Efvo
              </span>
              <span className="font-mono text-[10px] opacity-90">-15% OFF</span>
            </button>

            <button
              type="button"
              onClick={() => {
                triggerHapticFeedback(10);
                setPaymentMode('LIST_INSTALLMENTS');
              }}
              className={cn(
                'flex flex-col items-center justify-center rounded-xl py-2 px-1.5 text-center transition-all cursor-pointer border',
                paymentMode === 'LIST_INSTALLMENTS'
                  ? 'bg-[var(--brand-primary)] text-[var(--brand-primary-foreground)] border-[var(--brand-primary)] shadow-2xs'
                  : 'bg-[var(--brand-surface)] text-[var(--brand-text-muted)] border-[var(--brand-border)]'
              )}
            >
              <CreditCard className="h-3.5 w-3.5 mb-1" />
              <span className="text-[11px] font-semibold leading-tight">
                Lista / Tarjeta
              </span>
              <span className="font-mono text-[10px] opacity-90">Cuotas</span>
            </button>

            <button
              type="button"
              onClick={() => {
                triggerHapticFeedback(10);
                setPaymentMode('HEALTH_INSURANCE');
              }}
              className={cn(
                'flex flex-col items-center justify-center rounded-xl py-2 px-1.5 text-center transition-all cursor-pointer border',
                paymentMode === 'HEALTH_INSURANCE'
                  ? 'bg-[var(--brand-primary)] text-[var(--brand-primary-foreground)] border-[var(--brand-primary)] shadow-2xs'
                  : 'bg-[var(--brand-surface)] text-[var(--brand-text-muted)] border-[var(--brand-border)]'
              )}
            >
              <HeartHandshake className="h-3.5 w-3.5 mb-1" />
              <span className="text-[11px] font-semibold leading-tight">
                Obra Social
              </span>
              <span className="font-mono text-[10px] opacity-90">Convenios</span>
            </button>
          </div>
        </Card>

        {/* 3. RADIX TABS ENTRE 1ª OPCIÓN Y 2ª OPCIÓN */}
        <TabsPrimitive.Root
          value={selectedTier}
          onValueChange={(val) => {
            if (val === 'PRIMARY' || val === 'ALTERNATIVE') {
              triggerHapticFeedback(12);
              setSelectedTier(val);
            }
          }}
          className="space-y-3"
        >
          <TabsPrimitive.List
            aria-label="Opciones de cristales recomendados"
            className="optical-glass-card relative grid grid-cols-2 gap-1.5 rounded-xl p-1.5"
          >
            {(['PRIMARY', 'ALTERNATIVE'] as const).map((tier) => {
              const isSelected = selectedTier === tier;
              const lens =
                tier === 'PRIMARY' ? primaryOption : alternativeOption;
              const displayPrice =
                paymentMode === 'CASH_TRANSFER'
                  ? Math.round(lens.priceStockARS * 0.85)
                  : lens.priceStockARS;
              const title =
                tier === 'PRIMARY'
                  ? '01 · Opción Principal'
                  : '02 · Alternativa';

              return (
                <TabsPrimitive.Trigger
                  key={tier}
                  value={tier}
                  className={cn(
                    'relative z-10 min-h-[46px] rounded-lg px-3 py-2 text-left transition-colors cursor-pointer focus-visible:outline-none',
                    isSelected
                      ? 'text-[var(--brand-primary-foreground)]'
                      : 'text-[var(--brand-text-muted)] hover:text-[var(--brand-text)]'
                  )}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="active-quote-tab-pill"
                      transition={{
                        type: 'spring',
                        stiffness: 420,
                        damping: 32,
                      }}
                      className="absolute inset-0 -z-10 rounded-lg bg-[var(--brand-primary)] shadow-xs"
                    />
                  )}
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-wider opacity-85">
                    {title}
                  </p>
                  <p className="font-mono tabular-nums text-xs font-bold truncate">
                    {formatCurrencyARS(displayPrice)}
                  </p>
                </TabsPrimitive.Trigger>
              );
            })}
          </TabsPrimitive.List>

          {/* Tarjeta del Cristal Seleccionado */}
          <Card variant="highlighted">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-2 pb-1">
                <Badge variant="brand">
                  {selectedTier === 'PRIMARY'
                    ? 'Recomendación Clínica Principal'
                    : 'Alternativa Comparativa'}
                </Badge>
                <span className="font-mono text-[11px] font-medium text-[var(--brand-text-muted)]">
                  {activeLens.sku}
                </span>
              </div>

              <CardTitle className="text-lg">
                {activeLens.commercialName}
              </CardTitle>
              <CardDescription>
                {selectedTier === 'ALTERNATIVE'
                  ? alternativeUpgradeReason
                  : `${activeLens.materialDescription} · Índice ${activeLens.refractiveIndex}`}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3">
              {/* Desglose Lado a Lado Stock vs Laboratorio */}
              <LensDualPriceBreakdown
                lens={activeLens}
                highlightLabWarning={requiresLabRangeWarning}
                paymentMode={paymentMode}
              />

              <Separator />

              {/* Tratamientos incluidos */}
              <div className="space-y-2">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[var(--brand-text-muted)]">
                  Tratamientos certificados incluidos:
                </p>
                <div className="grid grid-cols-1 gap-1.5">
                  {activeLens.treatments.map((treatment) => (
                    <div
                      key={treatment}
                      className="flex items-center gap-2 text-xs text-[var(--brand-text)]"
                    >
                      <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-[var(--brand-primary)]" />
                      <span>{treatment}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsPrimitive.Root>

        {/* 4. LABORATORIO VISUAL INTERACTIVO */}
        <LensVisualSimulator
          refractiveIndex={activeLens.refractiveIndex}
          hasPhotochromic={hasPhotochromic}
          commercialName={activeLens.commercialName}
        />

        {/* 5. FICHA DE DERIVACIÓN A VENTAS (Visible en pantalla + Copiar o Abrir Sheet) */}
        <Card className="border-l-4 border-l-[var(--brand-primary)] p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2">
              {requiresLabRangeWarning ? (
                <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
              ) : (
                <Info className="h-4 w-4 shrink-0 text-[var(--brand-primary)] mt-0.5" />
              )}
              <div className="space-y-1">
                <p className="text-[13px] font-semibold text-[var(--brand-text)]">
                  Ficha Técnica Lista para Transferir a Ventas
                </p>
                <p className="text-xs text-[var(--brand-text-muted)] leading-relaxed">
                  {estimatedRangeNote}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => void handleCopyFicha()}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface)] px-2.5 py-1.5 text-xs font-semibold text-[var(--brand-primary)] active:scale-95 transition-transform cursor-pointer"
            >
              {copiedFicha ? (
                <>
                  <ClipboardCheck className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copiada</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copiar Ficha</span>
                </>
              )}
            </button>
          </div>

          {/* Vista previa directa de la Ficha que recibe Ventas en WhatsApp */}
          <div className="rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)] p-3">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[var(--brand-primary)] mb-1.5">
              Dossier comercial que recibe el asesor en WhatsApp:
            </p>
            <pre className="max-h-40 overflow-y-auto whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-[var(--brand-text)]">
              {whatsappPreviewText}
            </pre>
          </div>

          <MobileSheet
            title="Ficha Clínica & Dossier para Ventas"
            description="Relevamiento completo que se transfiere al mostrador de Óptica Profesional"
            trigger={
              <button
                type="button"
                onClick={() => triggerHapticFeedback(10)}
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)] px-3 py-2.5 text-xs font-semibold text-[var(--brand-primary)] active:scale-[0.99] transition-transform cursor-pointer"
              >
                <FileSearch className="h-3.5 w-3.5" />
                <span>Ampliar Justificación Clínica y Ficha Completa</span>
              </button>
            }
          >
            <div className="space-y-4 text-xs">
              <div className="space-y-2">
                <p className="font-mono font-semibold uppercase tracking-wider text-[var(--brand-primary)]">
                  Criterio Clínico Aplicado:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {clinicalTags.map((tag) => (
                    <Badge
                      key={tag.id}
                      variant={tag.category === 'range' ? 'neutral' : 'brand'}
                    >
                      {tag.label}
                    </Badge>
                  ))}
                </div>
                <ul className="space-y-1.5 text-[var(--brand-text)] pt-1">
                  {personalizedReasoning.map((reason, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="h-3.5 w-3.5 shrink-0 text-[var(--brand-primary)] mt-0.5" />
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-1.5 border-t border-[var(--brand-border)] pt-3">
                <p className="font-mono font-semibold uppercase tracking-wider text-[var(--brand-text-muted)]">
                  Ficha Completa de Derivación a Ventas:
                </p>
                <pre className="whitespace-pre-wrap rounded-xl border border-[var(--brand-border)] bg-[var(--brand-canvas)] p-3 font-mono text-[11px] leading-relaxed text-[var(--brand-text)]">
                  {whatsappPreviewText}
                </pre>
              </div>
            </div>
          </MobileSheet>
        </Card>

        {/* Pie compacto de reinicio */}
        <Card className="px-4 py-2.5 flex items-center justify-between">
          <span className="font-mono text-[11px] text-[var(--brand-text-muted)]">
            {catalogSourceLabel}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onResetWizard}
            leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
          >
            Nueva consulta
          </Button>
        </Card>
      </motion.div>

      {/* Barra Inferior Fija de Conversión a WhatsApp (Thumb-Zone) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--brand-border)] bg-[var(--brand-surface)]/95 backdrop-blur-xl px-4 pt-2.5 pb-safe-bottom shadow-xl">
        <div className="mx-auto max-w-[480px] space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono font-medium text-[var(--brand-text)] truncate max-w-[215px]">
              #{passportCode} · {activeLens.sku}
            </span>
            <span className="font-mono tabular-nums font-bold text-[var(--brand-primary)]">
              Stock {formatCurrencyARS(activeDisplayPriceStock)}
            </span>
          </div>

          <Button
            asChild
            variant="whatsapp"
            size="lg"
            fullWidth
            onClick={() => {
              triggerHapticFeedback(18);
              onWhatsAppClick(selectedTier);
            }}
          >
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-4 w-4 shrink-0" />
              <span>Transferir Ficha Completa a Ventas (WhatsApp)</span>
            </a>
          </Button>
        </div>
      </div>
    </>
  );
}

export default QuoteResultStep;
