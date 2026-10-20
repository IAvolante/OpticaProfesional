import * as ProgressPrimitive from '@radix-ui/react-progress';
import { cn } from '../../utils/cn';

export interface ProgressBarProps {
  readonly percentage: number;
  readonly label?: string;
  readonly stepIndicator?: string;
  readonly slim?: boolean;
  readonly className?: string;
}

/**
 * Barra de progreso basada en `@radix-ui/react-progress` (arquitectura shadcn/ui)
 * con animación acelerada por GPU (`translateX`).
 */
export function ProgressBar({
  percentage,
  label,
  stepIndicator,
  slim = false,
  className,
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(percentage)));

  if (slim) {
    return (
      <ProgressPrimitive.Root
        value={clamped}
        max={100}
        aria-label={label ?? 'Progreso del diagnóstico óptico'}
        className={cn(
          'relative h-1 w-full overflow-hidden bg-[var(--brand-surface-elevated)]/60',
          className
        )}
      >
        <ProgressPrimitive.Indicator
          className="h-full w-full flex-1 bg-[var(--brand-primary)] transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${100 - clamped}%)` }}
        />
      </ProgressPrimitive.Root>
    );
  }

  return (
    <div className={cn('w-full space-y-1.5', className)}>
      {(label || stepIndicator) && (
        <div className="flex items-center justify-between text-xs font-medium text-[var(--brand-text-muted)]">
          <span>{label}</span>
          <span>{stepIndicator ?? `${clamped}%`}</span>
        </div>
      )}
      <ProgressPrimitive.Root
        value={clamped}
        max={100}
        aria-label={label ?? 'Progreso del diagnóstico óptico'}
        className="relative h-2 w-full overflow-hidden rounded-full bg-[var(--brand-surface-elevated)] border border-[var(--brand-border)]"
      >
        <ProgressPrimitive.Indicator
          className="h-full w-full flex-1 bg-[var(--brand-primary)] transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${100 - clamped}%)` }}
        />
      </ProgressPrimitive.Root>
    </div>
  );
}
