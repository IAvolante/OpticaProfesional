import type { HTMLAttributes, ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-md px-2.5 py-0.5 text-[11px] font-semibold tracking-normal transition-colors',
  {
    variants: {
      variant: {
        brand:
          'bg-[var(--brand-accent)] text-[var(--brand-accent-foreground)] border border-[var(--brand-accent-border)]',
        stock:
          'bg-[var(--brand-badge-stock-bg)] text-[var(--brand-badge-stock-text)] border border-emerald-600/20',
        lab: 'bg-[var(--brand-badge-lab-bg)] text-[var(--brand-badge-lab-text)] border border-[var(--brand-accent-border)]',
        neutral:
          'bg-[var(--brand-surface-elevated)] text-[var(--brand-text-muted)] border border-[var(--brand-border)]',
      },
    },
    defaultVariants: {
      variant: 'brand',
    },
  }
);

export type BadgeVariant = NonNullable<
  VariantProps<typeof badgeVariants>['variant']
>;

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  readonly icon?: ReactNode;
  readonly children: ReactNode;
}

export function Badge({
  variant,
  icon,
  className,
  children,
  ...rest
}: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...rest}>
      {icon ? <span className="shrink-0">{icon}</span> : null}
      <span>{children}</span>
    </span>
  );
}
