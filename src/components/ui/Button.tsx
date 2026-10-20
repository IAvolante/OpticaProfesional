import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

/**
 * Variantes tipadas estilo HeroUI / Aceternity UI con `class-variance-authority` (CVA)
 * y soporte polimórfico `asChild` vía `@radix-ui/react-slot`.
 */
const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2.5 select-none cursor-pointer',
    'font-semibold tracking-tight transition-all duration-150 ease-out',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-black',
    'active:scale-[0.975] disabled:opacity-50 disabled:pointer-events-none',
  ],
  {
    variants: {
      variant: {
        primary: 'optical-gradient-btn',
        secondary:
          'bg-[var(--brand-accent)] text-[var(--brand-accent-foreground)] border border-[var(--brand-accent-border)] hover:brightness-110',
        outline:
          'bg-[var(--brand-surface-elevated)]/80 text-[var(--brand-text)] border border-[var(--brand-border)] hover:border-white/25 hover:bg-[var(--brand-surface-elevated)]',
        ghost:
          'bg-transparent text-[var(--brand-text-muted)] hover:text-[var(--brand-text)] hover:bg-white/5',
        whatsapp:
          'bg-gradient-to-r from-[#15803D] via-[#16A34A] to-[#10B981] text-white border border-emerald-300/30 shadow-[0_8px_24px_-4px_rgba(16,185,129,0.45)] inset-ring inset-ring-white/20 hover:brightness-110',
      },
      size: {
        sm: 'min-h-[38px] px-3 py-1.5 text-xs rounded-xl',
        md: 'min-h-[46px] px-4 py-2.5 text-sm rounded-xl',
        lg: 'min-h-[52px] px-6 py-3.5 text-[15px] rounded-2xl',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
    },
  }
);

export type ButtonVariant = NonNullable<
  VariantProps<typeof buttonVariants>['variant']
>;
export type ButtonSize = NonNullable<
  VariantProps<typeof buttonVariants>['size']
>;

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  readonly asChild?: boolean;
  readonly leftIcon?: ReactNode;
  readonly rightIcon?: ReactNode;
}

export function Button({
  variant,
  size,
  fullWidth,
  asChild = false,
  leftIcon,
  rightIcon,
  className,
  children,
  disabled,
  type = 'button',
  ...rest
}: ButtonProps) {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      type={asChild ? undefined : type}
      disabled={disabled}
      className={cn(buttonVariants({ variant, size, fullWidth }), className)}
      {...rest}
    >
      {asChild ? (
        children
      ) : (
        <>
          {leftIcon ? <span className="shrink-0">{leftIcon}</span> : null}
          <span>{children}</span>
          {rightIcon ? <span className="shrink-0">{rightIcon}</span> : null}
        </>
      )}
    </Comp>
  );
}
