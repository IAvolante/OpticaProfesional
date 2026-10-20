import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';
import { cn } from '../../utils/cn';

export interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  readonly label: string;
  readonly helperText?: string;
  readonly errorText?: string;
  readonly leftIcon?: ReactNode;
}

/**
 * Campo de entrada clínico con altura táctil de 48px, soporte de `ref` para auto-foco y alerta visual clara.
 */
export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  function InputField(
    { label, helperText, errorText, leftIcon, className, id, ...rest },
    ref
  ) {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const hasError = Boolean(errorText && errorText.trim().length > 0);

    return (
      <div className="w-full space-y-1.5 scroll-mt-24">
        <label
          htmlFor={inputId}
          className={cn(
            'block text-xs font-semibold tracking-wide transition-colors',
            hasError ? 'text-rose-600' : 'text-[var(--brand-text)]'
          )}
        >
          {label}
        </label>
        <div className="relative">
          {leftIcon ? (
            <div
              className={cn(
                'pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 transition-colors',
                hasError ? 'text-rose-500' : 'text-[var(--brand-text-muted)]'
              )}
            >
              {leftIcon}
            </div>
          ) : null}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={hasError}
            className={cn(
              'min-h-[48px] w-full rounded-xl border bg-[var(--brand-surface)] px-3.5 py-2.5 text-base text-[var(--brand-text)] shadow-2xs transition-all',
              'placeholder:text-[var(--brand-text-muted)]/60',
              'focus:outline-none focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-ring)]/25',
              leftIcon ? 'pl-10' : 'pl-3.5',
              hasError
                ? 'border-2 border-rose-500 bg-rose-50/70 focus:border-rose-600 focus:ring-rose-500/30'
                : 'border-[var(--brand-border)] hover:border-slate-300',
              className
            )}
            {...rest}
          />
        </div>
        {hasError ? (
          <p
            role="alert"
            className="rounded-lg bg-rose-50 border border-rose-200 px-2.5 py-1.5 text-xs font-semibold text-rose-700"
          >
            {errorText}
          </p>
        ) : helperText ? (
          <p className="text-xs text-[var(--brand-text-muted)]">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

