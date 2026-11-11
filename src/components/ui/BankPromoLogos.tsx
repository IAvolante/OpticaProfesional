import { cn } from '../../utils/cn';

export interface BankPromoLogosProps {
  readonly variant?: 'light' | 'dark';
  readonly className?: string;
}

/**
 * Logos vectoriales oficiales de las 2 promociones bancarias de Óptica Profesional:
 * - Naranja X: 12 cuotas
 * - Banco Macro: 6 cuotas
 */
export function BankPromoLogos({
  variant = 'light',
  className,
}: BankPromoLogosProps) {
  const isDark = variant === 'dark';

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-2 pt-1.5',
        className
      )}
    >
      {/* Promo 1: Naranja X — 12 cuotas */}
      <div
        className={cn(
          'inline-flex items-center gap-2 rounded-xl border px-2.5 py-1.5 shadow-2xs transition-colors',
          isDark
            ? 'border-white/20 bg-white/10 text-white'
            : 'border-[#FF5000]/25 bg-[#FFF6F2] text-[#1E293B]'
        )}
      >
        {/* Logo Naranja X */}
        <span
          aria-hidden="true"
          className="inline-flex h-5 items-center justify-center rounded-md bg-[#FF5000] px-1.5 text-[10.5px] font-black tracking-tight text-white shadow-2xs"
        >
          <span>Naranja</span>
          <span className="ml-0.5 rounded-xs bg-[#651F71] px-1 py-0.2 text-[9.5px] font-black text-white">
            X
          </span>
        </span>
        <span
          className={cn(
            'text-[11.5px] font-bold tracking-tight',
            isDark ? 'text-white' : 'text-[#C23B00]'
          )}
        >
          12 cuotas
        </span>
      </div>

      {/* Promo 2: Banco Macro — 6 cuotas */}
      <div
        className={cn(
          'inline-flex items-center gap-2 rounded-xl border px-2.5 py-1.5 shadow-2xs transition-colors',
          isDark
            ? 'border-white/20 bg-white/10 text-white'
            : 'border-[#003057]/25 bg-[#F2F7FC] text-[#1E293B]'
        )}
      >
        {/* Logo Banco Macro */}
        <span
          aria-hidden="true"
          className="inline-flex h-5 items-center gap-1 rounded-md bg-[#003057] px-1.5 text-[10.5px] font-extrabold tracking-tight text-white shadow-2xs"
        >
          <svg
            viewBox="0 0 16 16"
            className="h-3.5 w-3.5 shrink-0"
            fill="none"
          >
            <circle
              cx="8"
              cy="8"
              r="5.5"
              stroke="#00A3E0"
              strokeWidth="2"
            />
            <circle cx="8" cy="8" r="2.2" fill="#FFFFFF" />
          </svg>
          <span>Macro</span>
        </span>
        <span
          className={cn(
            'text-[11.5px] font-bold tracking-tight',
            isDark ? 'text-white' : 'text-[#003057]'
          )}
        >
          6 cuotas
        </span>
      </div>
    </div>
  );
}
