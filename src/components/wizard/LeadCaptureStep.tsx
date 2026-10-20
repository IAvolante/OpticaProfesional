import { useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowRight,
  Camera,
  Lock,
  MapPin,
  Phone,
  Trash2,
  User,
} from 'lucide-react';
import type {
  LeadContactData,
  PaymentBenefitMode,
  PrescriptionStatus,
} from '../../types/optical.types';
import { cn } from '../../utils/cn';
import {
  generateLeadId,
  sanitizeArgentinePhone,
  triggerHapticFeedback,
} from '../../utils/formatters';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/Card';
import { InputField } from '../ui/InputField';
import { Label } from '../ui/Label';
import { Separator } from '../ui/Separator';

export interface LeadCaptureStepProps {
  readonly initialLead: LeadContactData | null;
  readonly isSubmitting: boolean;
  readonly onSubmitLead: (lead: LeadContactData) => Promise<void>;
}

const PRESCRIPTION_OPTIONS: readonly {
  readonly value: PrescriptionStatus;
  readonly label: string;
  readonly sublabel: string;
}[] = [
  {
    value: 'HAS_RECENT_RX',
    label: 'Sí, tengo mi receta médica',
    sublabel: 'Podés sacarle una foto abajo o adjuntarla al pasar a WhatsApp',
  },
  {
    value: 'NEEDS_CHECKUP',
    label: 'Todavía no tengo receta o está vencida',
    sublabel: 'Quiero ver el presupuesto estimado y recibir asesoramiento',
  },
  {
    value: 'REST_NO_RX',
    label: 'Busco cristales de descanso sin aumento',
    sublabel: 'Para protección frente a pantallas, oficina o conducción',
  },
];

const PAYMENT_OPTIONS: readonly {
  readonly value: PaymentBenefitMode;
  readonly label: string;
  readonly badge: string;
}[] = [
  {
    value: 'CASH_TRANSFER',
    label: 'Transf. / Efectivo',
    badge: '-15% OFF',
  },
  {
    value: 'LIST_INSTALLMENTS',
    label: 'Tarjeta / Cuotas',
    badge: 'Financiación',
  },
  {
    value: 'HEALTH_INSURANCE',
    label: 'Obra Social',
    badge: 'Convenios',
  },
];

const SALTA_HEALTH_INSURANCE_PRESETS: readonly string[] = [
  'IPS Salta',
  'PAMI',
  'OSUNSa',
  'OSPe',
  'Medifé',
  'Swiss Medical',
  'Galeno',
  'Otra Cobertura',
];

const SALTA_LOCALITY_PRESETS: readonly string[] = [
  'Salta Capital',
  'San Lorenzo',
  'Cerrillos',
  'Vaqueros',
  'Interior de Salta',
];

/**
 * Paso de Recepción Comercial y Clínica ('LEAD_CAPTURE') construido con primitivas shadcn/ui:
 * - Cero iconos artificiales de IA ni emotes.
 * - Tipografía profesional Inter + DM Sans + JetBrains Mono.
 * - Barra fija inferior desacoplada fuera de `motion.div` para scroll fluido en iOS Safari.
 */
export function LeadCaptureStep({
  initialLead,
  isSubmitting,
  onSubmitLead,
}: LeadCaptureStepProps) {
  const prefersReducedMotion = useReducedMotion();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [fullName, setFullName] = useState<string>(
    initialLead?.fullName ?? ''
  );
  const [whatsapp, setWhatsapp] = useState<string>(
    initialLead?.whatsapp ?? ''
  );
  const [locality, setLocality] = useState<string>(
    initialLead?.locality ?? 'Salta Capital'
  );
  const [preferredPayment, setPreferredPayment] = useState<PaymentBenefitMode>(
    initialLead?.preferredPayment ?? 'CASH_TRANSFER'
  );
  const [healthInsuranceName, setHealthInsuranceName] = useState<string>(
    initialLead?.healthInsuranceName ?? ''
  );
  const [prescriptionStatus, setPrescriptionStatus] =
    useState<PrescriptionStatus>(
      initialLead?.prescriptionStatus ?? 'HAS_RECENT_RX'
    );
  const [clinicalNotes, setClinicalNotes] = useState<string>(
    initialLead?.clinicalNotes ?? ''
  );
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [photoFileName, setPhotoFileName] = useState<string | undefined>(
    initialLead?.prescriptionPhotoName
  );

  const [nameError, setNameError] = useState<string>('');
  const [phoneError, setPhoneError] = useState<string>('');

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    triggerHapticFeedback(15);
    setPhotoFileName(file.name);
    setPrescriptionStatus('HAS_RECENT_RX');

    const objectUrl = URL.createObjectURL(file);
    setPhotoPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return objectUrl;
    });
  };

  const handleRemovePhoto = () => {
    triggerHapticFeedback(10);
    setPhotoFileName(undefined);
    if (photoPreviewUrl) {
      URL.revokeObjectURL(photoPreviewUrl);
      setPhotoPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = fullName.trim();
    const cleanDigits = sanitizeArgentinePhone(whatsapp);

    let hasValidationError = false;

    if (trimmedName.length < 2) {
      setNameError('Ingresá tu nombre para emitir tu Ficha y Pasaporte Óptico.');
      hasValidationError = true;
    } else {
      setNameError('');
    }

    if (cleanDigits.length < 8) {
      setPhoneError('Ingresá tu WhatsApp sin 0 ni 15 (ej. 3875123456).');
      hasValidationError = true;
    } else {
      setPhoneError('');
    }

    if (hasValidationError) {
      triggerHapticFeedback(25);
      return;
    }

    triggerHapticFeedback(15);

    const cleanInsurance =
      preferredPayment === 'HEALTH_INSURANCE'
        ? healthInsuranceName.trim() || 'Convenio Obra Social / Mutual'
        : undefined;

    const cleanNotes = clinicalNotes.trim() || undefined;

    await onSubmitLead({
      fullName: trimmedName,
      whatsapp: cleanDigits,
      locality: locality.trim() || 'Salta Capital',
      prescriptionStatus,
      preferredPayment,
      healthInsuranceName: cleanInsurance,
      clinicalNotes: cleanNotes,
      prescriptionPhotoName: photoFileName,
      passportCode: initialLead?.passportCode ?? generateLeadId(),
    });
  };

  return (
    <>
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={prefersReducedMotion ? undefined : { opacity: 0, y: -12 }}
        transition={{ type: 'spring', stiffness: 360, damping: 28 }}
        className="w-full pb-36"
      >
        <Card variant="elevated" className="w-full overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-2 pb-1">
              <Badge variant="brand">Ficha de Recepción y Cotización</Badge>
              <span className="inline-flex items-center gap-1 font-mono text-[11px] text-[var(--brand-text-muted)] shrink-0">
                <Lock className="h-3 w-3 text-[var(--brand-primary)]" />
                CONFIDENCIAL
              </span>
            </div>

            <CardTitle className="text-[19px]">
              Completá tu ficha para emitir el presupuesto y derivar a Ventas
            </CardTitle>
            <CardDescription>
              Con estos datos emitimos tu <strong>Pasaporte Óptico</strong> con
              valores en <strong>Rango Stock</strong> y{' '}
              <strong>Rango Laboratorio</strong> y preparamos tu orden técnica.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form
              id="lead-capture-form"
              onSubmit={(e) => void handleSubmit(e)}
              noValidate
              className="space-y-4"
            >
              {/* 1. Datos de Contacto */}
              <div className="space-y-3">
                <InputField
                  label="Nombre y Apellido"
                  placeholder="Ej: Mariana Gómez"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (nameError) setNameError('');
                  }}
                  errorText={nameError}
                  leftIcon={<User className="h-4 w-4" />}
                  autoComplete="name"
                  enterKeyHint="next"
                  required
                />

                <InputField
                  label="WhatsApp de Contacto (Salta / NOA)"
                  type="tel"
                  inputMode="tel"
                  placeholder="Ej: 387 5123456"
                  value={whatsapp}
                  onChange={(e) => {
                    setWhatsapp(e.target.value);
                    if (phoneError) setPhoneError('');
                  }}
                  errorText={phoneError}
                  helperText="Sin 0 ni 15. Para reservar tu cotización por 7 días."
                  leftIcon={<Phone className="h-4 w-4" />}
                  autoComplete="tel"
                  enterKeyHint="next"
                  required
                />

                <div className="space-y-2">
                  <InputField
                    label="Localidad"
                    placeholder="Salta Capital, San Lorenzo, Cerrillos..."
                    value={locality}
                    onChange={(e) => setLocality(e.target.value)}
                    leftIcon={<MapPin className="h-4 w-4" />}
                    autoComplete="address-level2"
                    enterKeyHint="done"
                  />
                  <div className="flex flex-wrap gap-1.5">
                    {SALTA_LOCALITY_PRESETS.map((preset) => {
                      const isActive = locality === preset;
                      return (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => {
                            triggerHapticFeedback(8);
                            setLocality(preset);
                          }}
                          className={cn(
                            'rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors cursor-pointer border',
                            isActive
                              ? 'bg-[var(--brand-primary)] text-[var(--brand-primary-foreground)] border-[var(--brand-primary)]'
                              : 'bg-[var(--brand-surface)] text-[var(--brand-text-muted)] border-[var(--brand-border)]'
                          )}
                        >
                          {preset}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <Separator />

              {/* 2. Calificación Comercial: Medio de Pago / Obra Social */}
              <div className="space-y-2.5">
                <Label className="block font-mono text-[11px] uppercase tracking-wider text-[var(--brand-text-muted)]">
                  01 · Beneficio o Cobertura Preferida
                </Label>

                <div className="grid grid-cols-3 gap-2">
                  {PAYMENT_OPTIONS.map((opt) => {
                    const isSelected = preferredPayment === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                          triggerHapticFeedback(10);
                          setPreferredPayment(opt.value);
                        }}
                        className={cn(
                          'flex flex-col items-center justify-center rounded-xl py-2.5 px-2 text-center border transition-all cursor-pointer',
                          isSelected
                            ? 'border-2 border-[var(--brand-primary)] bg-[var(--brand-accent)]/90 text-[var(--brand-text)] shadow-2xs'
                            : 'border-[var(--brand-border)] bg-[var(--brand-surface)] text-[var(--brand-text-muted)]'
                        )}
                      >
                        <span className="text-xs font-semibold leading-tight text-[var(--brand-text)]">
                          {opt.label}
                        </span>
                        <span className="font-mono text-[10px] font-semibold text-[var(--brand-primary)] mt-1">
                          {opt.badge}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {preferredPayment === 'HEALTH_INSURANCE' && (
                  <div className="rounded-xl border border-[var(--brand-accent-border)] bg-[var(--brand-accent)]/50 p-3 space-y-2.5">
                    <p className="text-xs font-semibold text-[var(--brand-text)]">
                      Seleccioná o indicá tu Obra Social / Mutual:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {SALTA_HEALTH_INSURANCE_PRESETS.map((ins) => {
                        const isSelected = healthInsuranceName === ins;
                        return (
                          <button
                            key={ins}
                            type="button"
                            onClick={() => {
                              triggerHapticFeedback(8);
                              setHealthInsuranceName(ins);
                            }}
                            className={cn(
                              'rounded-md px-2.5 py-1 text-[11px] font-medium border transition-colors cursor-pointer',
                              isSelected
                                ? 'bg-[var(--brand-primary)] text-[var(--brand-primary-foreground)] border-[var(--brand-primary)]'
                                : 'bg-[var(--brand-surface)] text-[var(--brand-text)] border-[var(--brand-border)]'
                            )}
                          >
                            {ins}
                          </button>
                        );
                      })}
                    </div>
                    <InputField
                      label="Obra Social o Coseguro"
                      placeholder="Ej: IPS Salta, PAMI, OSUNSa, OSPe..."
                      value={healthInsuranceName}
                      onChange={(e) => setHealthInsuranceName(e.target.value)}
                    />
                  </div>
                )}
              </div>

              <Separator />

              {/* 3. Estado de Receta con Radix RadioGroup */}
              <div className="space-y-2.5">
                <Label className="block font-mono text-[11px] uppercase tracking-wider text-[var(--brand-text-muted)]">
                  02 · Disponibilidad de Receta Oftalmológica
                </Label>

                <RadioGroupPrimitive.Root
                  value={prescriptionStatus}
                  onValueChange={(val) => {
                    if (val) {
                      triggerHapticFeedback(10);
                      setPrescriptionStatus(val as PrescriptionStatus);
                    }
                  }}
                  aria-label="Estado de receta"
                  className="flex flex-col gap-2 w-full"
                >
                  {PRESCRIPTION_OPTIONS.map((option) => {
                    const isSelected = prescriptionStatus === option.value;
                    return (
                      <RadioGroupPrimitive.Item
                        key={option.value}
                        value={option.value}
                        className={cn(
                          'min-h-[54px] w-full text-left rounded-xl px-3.5 py-3 border transition-all cursor-pointer flex items-center justify-between gap-3 active:scale-[0.99]',
                          isSelected
                            ? 'border-2 border-[var(--brand-primary)] bg-[var(--brand-accent)]/85'
                            : 'border-[var(--brand-border)] bg-[var(--brand-surface)]'
                        )}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-[13px] font-semibold text-[var(--brand-text)] leading-snug whitespace-normal break-words">
                            {option.label}
                          </p>
                          <p className="text-xs text-[var(--brand-text-muted)] leading-relaxed whitespace-normal break-words mt-0.5">
                            {option.sublabel}
                          </p>
                        </div>

                        <div
                          className={cn(
                            'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors',
                            isSelected
                              ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]'
                              : 'border-[var(--brand-border)] bg-[var(--brand-surface)]'
                          )}
                        >
                          <span
                            className={cn(
                              'h-1.5 w-1.5 rounded-full',
                              isSelected ? 'bg-white' : 'bg-transparent'
                            )}
                          />
                        </div>
                      </RadioGroupPrimitive.Item>
                    );
                  })}
                </RadioGroupPrimitive.Root>
              </div>

              {/* 4. Snap & Quote: Captura de Foto de Receta con Cámara Móvil */}
              <div className="rounded-xl border border-dashed border-[var(--brand-primary)]/70 bg-[var(--brand-accent)]/40 p-3.5">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />

                {photoFileName ? (
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {photoPreviewUrl ? (
                        <img
                          src={photoPreviewUrl}
                          alt="Vista previa de receta"
                          className="h-12 w-12 rounded-lg object-cover border border-[var(--brand-primary)] shrink-0"
                        />
                      ) : null}
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-emerald-800">
                          Foto de receta vinculada a tu Ficha
                        </p>
                        <p className="font-mono text-[11px] text-[var(--brand-text-muted)] truncate">
                          {photoFileName}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      aria-label="Quitar foto de receta"
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface)] text-rose-600 cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex w-full items-center justify-between gap-3 text-left cursor-pointer py-0.5"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--brand-primary)] text-[var(--brand-primary-foreground)]">
                        <Camera className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold text-[var(--brand-text)] leading-snug">
                          Adjuntar o tomar foto de mi receta
                        </p>
                        <p className="text-xs text-[var(--brand-text-muted)] leading-snug">
                          Opcional · Prioridad de revisión en laboratorio
                        </p>
                      </div>
                    </div>
                    <span className="shrink-0 rounded-lg bg-[var(--brand-surface)] px-3 py-1.5 text-xs font-semibold text-[var(--brand-primary)] border border-[var(--brand-border)]">
                      Abrir Cámara
                    </span>
                  </button>
                )}
              </div>

              <Separator />

              {/* 5. Detalle de Graduación / Observaciones para Ventas */}
              <div className="space-y-2">
                <Label
                  htmlFor="clinical-notes-input"
                  className="block font-mono text-[11px] uppercase tracking-wider text-[var(--brand-text-muted)]"
                >
                  03 · Observaciones de Receta o Pedido (Opcional)
                </Label>
                <textarea
                  id="clinical-notes-input"
                  rows={2}
                  value={clinicalNotes}
                  onChange={(e) => setClinicalNotes(e.target.value)}
                  placeholder="Ej: Miopía OD -2.50 / OI -2.75, busco armazón liviano, o necesito envío al interior..."
                  className="w-full rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)] px-3.5 py-2.5 text-sm text-[var(--brand-text)] placeholder:text-[var(--brand-text-muted)]/60 focus:border-[var(--brand-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-ring)]/25"
                />
              </div>

              <div className="pt-1">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  disabled={isSubmitting}
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                >
                  {isSubmitting
                    ? 'Generando Ficha y Cotización...'
                    : 'Emitir Mi Cotización Ahora'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      {/* Barra Inferior Fija en Zona del Pulgar — Fuera de `motion.div` para iOS Safari */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--brand-border)] bg-[var(--brand-surface)]/95 backdrop-blur-xl px-4 pt-2.5 pb-safe-bottom shadow-xl">
        <div className="mx-auto max-w-[430px]">
          <Button
            type="submit"
            form="lead-capture-form"
            variant="primary"
            size="lg"
            fullWidth
            disabled={isSubmitting}
            rightIcon={<ArrowRight className="h-4 w-4" />}
          >
            {isSubmitting
              ? 'Generando Cotización...'
              : 'Emitir Mi Cotización Ahora'}
          </Button>
        </div>
      </div>
    </>
  );
}

export default LeadCaptureStep;
