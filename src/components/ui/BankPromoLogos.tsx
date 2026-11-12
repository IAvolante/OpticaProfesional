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
            : 'border-[#003058]/25 bg-[#F2F7FC] text-[#1E293B]'
        )}
      >
        {/* Logo Oficial Banco Macro */}
        <span
          aria-hidden="true"
          className="inline-flex h-5 items-center gap-1.5 rounded-md bg-[#003058] px-1.5 text-[10.5px] font-extrabold tracking-tight text-white shadow-2xs"
        >
          <svg
            viewBox="30 75 420 280"
            className="h-3.5 w-4 shrink-0"
            fill="none"
          >
            {/* Arco exterior */}
            <path
              d="M 46 276 A 194 194 0 0 1 434 276 A 8 8 0 0 1 426 284 L 387 284 A 8 8 0 0 1 379 276 A 139 139 0 0 0 101 276 A 8 8 0 0 1 93 284 L 54 284 A 8 8 0 0 1 46 276 Z"
              fill="#FFFFFF"
            />
            {/* Arco interior */}
            <path
              d="M 115 276 A 125 125 0 0 1 365 276 A 8 8 0 0 1 357 284 L 318 284 A 8 8 0 0 1 310 276 A 70 70 0 0 0 170 276 A 8 8 0 0 1 162 284 L 123 284 A 8 8 0 0 1 115 276 Z"
              fill="#FFFFFF"
            />
            {/* Círculo central */}
            <circle cx="240" cy="284" r="56" fill="#FFFFFF" />
          </svg>
          <span>Macro</span>
        </span>
        <span
          className={cn(
            'text-[11.5px] font-bold tracking-tight',
            isDark ? 'text-white' : 'text-[#003058]'
          )}
        >
          6 cuotas
        </span>
      </div>
    </div>
  );
}
