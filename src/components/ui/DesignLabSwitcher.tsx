import { useEffect, useState } from 'react';
import { CaretDown, Check, TextAa } from '@phosphor-icons/react';
import { FONT_PAIR_PRESETS } from '../../config/brandTheme';
import type { FontPairId } from '../../types/optical.types';
import { cn } from '../../utils/cn';
import { triggerHapticFeedback } from '../../utils/formatters';

export interface DesignLabSwitcherProps {
  readonly activeFontPair: FontPairId;
  readonly onSelectFontPair: (fontPair: FontPairId) => void;
}

/**
 * Selector flotante exclusivo de 5 Fuentes para que Solana pruebe en vivo
 * las distintas personalidades tipográficas sobre el diseño Light de Óptica Profesional.
 */
export function DesignLabSwitcher({
  activeFontPair,
  onSelectFontPair,
}: DesignLabSwitcherProps) {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  useEffect(() => {
    if (!isExpanded) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsExpanded(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isExpanded]);

  const currentFontPreset =
    FONT_PAIR_PRESETS.find((f) => f.id === activeFontPair) ??
    FONT_PAIR_PRESETS[0];

  return (
    <aside
      aria-label="Selector de 5 Fuentes Tipográficas"
      className="fixed left-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-50 max-w-[calc(100vw-1.5rem)] sm:max-w-[360px]"
    >
      {!isExpanded ? (
        <button
          type="button"
          aria-expanded={false}
          onClick={() => {
            triggerHapticFeedback(8);
            setIsExpanded(true);
          }}
          className="flex min-h-[42px] items-center gap-2 rounded-full border border-[#336699]/35 bg-white/95 px-3.5 py-2 text-xs font-semibold text-[#102336] shadow-xl backdrop-blur-xl transition-transform hover:scale-[1.02] active:scale-95 cursor-pointer"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#EFF7EF] border border-[#99CC99] text-[#336699]">
            <TextAa weight="duotone" className="h-3.5 w-3.5" />
          </span>
          <span>Probar Fuentes</span>
          <span className="rounded-full bg-[#336699] px-2.5 py-0.5 font-mono text-[10px] font-bold text-white">
            {currentFontPreset
              ? `${currentFontPreset.optionNumber}/5 · ${currentFontPreset.name.split('+')[0]?.trim()}`
              : '1/5'}
          </span>
        </button>
      ) : (
        <div className="rounded-2xl border border-[#336699]/30 bg-white/98 p-3.5 text-[#102336] shadow-2xl backdrop-blur-xl space-y-2.5">
          <div className="flex items-center justify-between gap-2 border-b border-[#D5E2EE] pb-2">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#EFF7EF] border border-[#99CC99] text-[#336699]">
                <TextAa weight="duotone" className="h-4 w-4" />
              </span>
              <div>
                <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#336699] leading-none">
                  5 Opciones de Tipografía
                </p>
                <p className="text-[11px] text-[#4A637C] mt-0.5">
                  Tocá cada opción para verla aplicada en vivo
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                triggerHapticFeedback(6);
                setIsExpanded(false);
              }}
              aria-label="Minimizar selector de fuentes"
              className="inline-flex min-h-[32px] items-center gap-1 rounded-lg bg-[#EBF2F8] px-2.5 py-1 text-[11px] font-semibold text-[#264F78] hover:bg-[#D5E2EE] cursor-pointer"
            >
              <span>Cerrar</span>
              <CaretDown weight="bold" className="h-3 w-3" />
            </button>
          </div>

          {/* Lista de las 5 Fuentes */}
          <div className="grid grid-cols-1 gap-1.5">
            {FONT_PAIR_PRESETS.map((font) => {
              const isSelected = activeFontPair === font.id;
              return (
                <button
                  key={font.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => {
                    triggerHapticFeedback(10);
                    onSelectFontPair(font.id);
                  }}
                  className={cn(
                    'flex items-center justify-between rounded-xl border px-3 py-2 text-left transition-all cursor-pointer',
                    isSelected
                      ? 'border-2 border-[#336699] bg-[#EFF7EF]/85 text-[#102336] shadow-2xs'
                      : 'border-[#D5E2EE] bg-[#F4F8FB]/70 text-[#102336] hover:border-[#336699]/50 hover:bg-white'
                  )}
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11.5px] font-bold text-[#336699] leading-tight">
                        {font.shortLabel}
                      </span>
                      <span className="font-mono text-[10px] text-[#4A637C] truncate">
                        ({font.name})
                      </span>
                    </div>
                    <p className="text-[10.5px] text-[#4A637C] leading-snug mt-0.5">
                      {font.summary}
                    </p>
                  </div>

                  <span
                    className={cn(
                      'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors',
                      isSelected
                        ? 'border-[#336699] bg-[#336699] text-white'
                        : 'border-[#D5E2EE] bg-white'
                    )}
                  >
                    {isSelected ? (
                      <Check weight="bold" className="h-3 w-3" />
                    ) : null}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </aside>
  );
}

export default DesignLabSwitcher;
