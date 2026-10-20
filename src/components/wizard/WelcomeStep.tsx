import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, ExternalLink, MapPin } from 'lucide-react';
import { ENV_CONFIG } from '../../config/env';
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
}

const VALUE_PILLARS: readonly {
  readonly code: string;
  readonly title: string;
  readonly description: string;
}[] = [
  {
    code: '01',
    title: 'Cotización Exclusiva de Cristales Ópticos',
    description:
      'Respondé preguntas simples sobre tu uso diario y tu receta para conocer el cristal y tratamiento ideal al mejor precio de Salta.',
  },
  {
    code: '02',
    title: 'Entrega Rápida: Rango Stock y Laboratorio',
    description:
      'Calculamos al instante si tu graduación ingresa por Stock rápido o Laboratorio de tallado digital.',
  },
  {
    code: '03',
    title: 'Obras Sociales: Armazón Estándar Sin Cargo',
    description:
      'Si tu Obra Social está en nuestra lista de prestadores, contás con un armazón estándar gratis pasando a probártelo por la óptica.',
  },
];

/**
 * Portada Mobile-First enfocada 100% en Cristales y Beneficio de Obra Social.
 */
export function WelcomeStep({ onStartWizard }: WelcomeStepProps) {
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
        <div className="flex flex-wrap items-center justify-between gap-2 min-h-[120px] sm:min-h-[140px] pt-1">
          <div className="inline-flex items-center gap-1.5 rounded-lg bg-slate-950/70 backdrop-blur-md border border-white/15 px-3 py-1.5 text-[11px] font-medium text-white shadow-xs">
            <MapPin className="h-3 w-3 text-emerald-400 shrink-0" />
            <span>{ENV_CONFIG.addressSalta}</span>
          </div>

          <a
            href={ENV_CONFIG.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-950/70 backdrop-blur-md border border-white/15 px-2.5 py-1.5 text-[11px] font-medium text-white hover:bg-slate-950/85 transition-colors"
          >
            <span>{ENV_CONFIG.instagramHandle}</span>
            <ExternalLink className="h-3 w-3 text-white/70 shrink-0" />
          </a>
        </div>

        {/* Tarjeta Principal enfocada 100% en Cristales */}
        <Card variant="elevated">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-2 pb-1">
              <Badge variant="brand">Asesor Digital de Cristales</Badge>
              <span className="font-mono text-[11px] font-medium text-[var(--brand-text-muted)]">
                SALTA CAPITAL
              </span>
            </div>

            <CardTitle className="text-[21px] leading-[1.22] font-bold">
              Cotizá tus cristales recetados al mejor precio y en tiempo récord
            </CardTitle>
            <CardDescription className="text-[13px]">
              Relevamos tu necesidad visual en segundos para enviarte tu
              presupuesto de cristales y preparar tu atención en mostrador.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-2.5">
            {VALUE_PILLARS.map((pillar) => (
              <div
                key={pillar.code}
                className="flex items-start gap-3 rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)]/95 p-3"
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
              <span>Mejor Precio</span>
              <span>Entrega Rápida</span>
              <span>Obras Sociales</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Barra Inferior Fija en Zona del Pulgar alineada a max-w-[480px] */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--brand-border)] bg-[var(--brand-surface)]/95 backdrop-blur-xl px-4 pt-2.5 pb-safe-bottom shadow-xl">
        <div className="mx-auto w-full max-w-[480px]">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={onStartWizard}
            rightIcon={<ArrowRight className="h-4 w-4" />}
          >
            Cotizar Mis Cristales Ahora
          </Button>
        </div>
      </div>
    </>
  );
}
