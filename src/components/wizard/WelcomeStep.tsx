import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowRight,
  Building2,
  ExternalLink,
  MapPin,
} from 'lucide-react';
import { ENV_CONFIG } from '../../config/env';
import { buildB2BSmartOpticalWhatsAppLink } from '../../utils/whatsapp.encoder';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/Card';
import { Separator } from '../ui/Separator';

export interface WelcomeStepProps {
  readonly onStartWizard: () => void;
  readonly videoEnabled?: boolean;
}

const VALUE_PILLARS: readonly {
  readonly code: string;
  readonly title: string;
  readonly description: string;
}[] = [
  {
    code: '01',
    title: 'Cristales Digitales + Armazones (Zeiss · Essilor · Novar)',
    description:
      'Relevamos en 5 pasos tu necesidad visual, montura y cobertura para emitir tu presupuesto exacto.',
  },
  {
    code: '02',
    title: 'Precio Rango Stock vs. Rango Laboratorio',
    description:
      'Desglose transparente del valor del par según el rango de tus dioptrías y espesor.',
  },
  {
    code: '03',
    title: 'Obras Sociales, Coseguro y Pedidos Interior',
    description:
      'Transferencia directa de tu ficha técnica al equipo de ventas por WhatsApp.',
  },
];

/**
 * Paso 0 ('WELCOME'): Construido con primitivas shadcn/ui (`Card`, `Separator`, `Badge`, `Button`)
 * y tipografía clínica Inter + DM Sans + JetBrains Mono. Cero iconos decorativos de IA.
 */
export function WelcomeStep({
  onStartWizard,
  videoEnabled = true,
}: WelcomeStepProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <>
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={prefersReducedMotion ? undefined : { opacity: 0, y: -12 }}
        transition={{ type: 'spring', stiffness: 360, damping: 28 }}
        className="flex flex-1 flex-col justify-between gap-3 pb-28"
      >
        {/* Ventana escénica superior para lucir el video de Google Flow */}
        {videoEnabled ? (
          <div className="flex items-center justify-between min-h-[160px] sm:min-h-[180px] pt-1">
            <div className="inline-flex items-center gap-1.5 rounded-md bg-slate-950/65 backdrop-blur-md border border-white/15 px-3 py-1 text-[11px] font-medium text-white shadow-xs">
              <MapPin className="h-3 w-3 text-emerald-400" />
              <span>{ENV_CONFIG.addressSalta}</span>
            </div>

            <a
              href={ENV_CONFIG.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md bg-slate-950/65 backdrop-blur-md border border-white/15 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-slate-950/80 transition-colors"
            >
              <span>{ENV_CONFIG.instagramHandle}</span>
              <ExternalLink className="h-3 w-3 text-white/70" />
            </a>
          </div>
        ) : null}

        {/* Tarjeta Principal shadcn/ui */}
        <Card variant="elevated">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-2 pb-1">
              <Badge variant="brand">Sistema de Cotización Óptica</Badge>
              <span className="font-mono text-[11px] font-medium text-[var(--brand-text-muted)]">
                SALTA CAPITAL
              </span>
            </div>

            <CardTitle className="text-[21px] leading-[1.22] font-bold">
              Cotizá tus cristales recetados y armazón desde tu celular
            </CardTitle>
            <CardDescription className="text-[13px]">
              Trabajamos con laboratorios digitales certificados (
              <strong className="font-semibold text-[var(--brand-text)]">
                Zeiss, Essilor, Novar
              </strong>
              ) y convenios con Obras Sociales en Salta Capital e Interior.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-2.5">
            {VALUE_PILLARS.map((pillar) => (
              <div
                key={pillar.code}
                className="flex items-start gap-3 rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)]/90 p-3"
              >
                <span className="font-mono text-xs font-semibold text-[var(--brand-primary)] pt-0.5 shrink-0">
                  {pillar.code}
                </span>
                <div className="min-w-0 space-y-0.5">
                  <p className="text-[13px] font-semibold text-[var(--brand-text)] leading-snug">
                    {pillar.title}
                  </p>
                  <p className="text-xs text-[var(--brand-text-muted)] leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              </div>
            ))}

            <Separator className="my-2" />

            <div className="grid grid-cols-3 gap-2 pt-0.5 text-center font-mono text-[10px] font-semibold uppercase tracking-wider text-[var(--brand-text-muted)]">
              <span>5 Pasos</span>
              <span>Tallado Digital</span>
              <span>Garantía Escrita</span>
            </div>
          </CardContent>
        </Card>

        {/* Acceso B2B Compacto: SMART OPTICAL */}
        <Card className="p-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--brand-accent)] text-[var(--brand-accent-foreground)] border border-[var(--brand-accent-border)]">
              <Building2 className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[var(--brand-primary)]">
                {ENV_CONFIG.brandNameB2B} · División Mayorista
              </p>
              <p className="text-xs text-[var(--brand-text-muted)] truncate">
                Laboratorio y distribución B2B para ópticas del NOA
              </p>
            </div>
          </div>

          <a
            href={buildB2BSmartOpticalWhatsAppLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[36px] shrink-0 items-center justify-center rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface)] px-3 py-1.5 text-xs font-semibold text-[var(--brand-text)] active:scale-95 transition-transform"
          >
            Cuenta B2B
          </a>
        </Card>
      </motion.div>

      {/* Barra Inferior Fija en Zona del Pulgar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--brand-border)] bg-[var(--brand-surface)]/95 backdrop-blur-xl px-4 pt-2.5 pb-safe-bottom shadow-xl">
        <div className="mx-auto max-w-[430px]">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={onStartWizard}
            rightIcon={<ArrowRight className="h-4 w-4" />}
          >
            Iniciar Relevamiento y Cotización
          </Button>
        </div>
      </div>
    </>
  );
}
