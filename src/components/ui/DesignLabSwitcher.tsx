import { useState } from 'react';
import {
  CaretDown,
  MoonStars,
  Palette,
  SunDim,
  TextAa,
} from '@phosphor-icons/react';
import {
  BRAND_THEME_PRESETS,
  FONT_PAIR_PRESETS,
} from '../../config/brandTheme';
import type { BrandThemeId, FontPairId } from '../../types/optical.types';
import { cn } from '../../utils/cn';
import { triggerHapticFeedback } from '../../utils/formatters';

export interface DesignLabSwitcherProps {
  readonly activeTheme: BrandThemeId;
  readonly activeFontPair: FontPairId;
  readonly onSelectTheme: (theme: BrandThemeId) => void;
  readonly onSelectFontPair: (fontPair: FontPairId) => void;
}

/**
 * Barra flotante compacta y colapsable ("Design Lab") para evaluar en vivo:
 * - 2 Modos Visuales: Clínica Luminosa (Light) vs Dark Glass Asesor (Dark PDF)
 * - 3 Duplas Tipográficas: Fuente A (Logo Match), Fuente B (Tech Optical), Fuente C (Boutique Editorial)
 */
export function DesignLabSwitcher({
  activeTheme,
  activeFontPair,
  onSelectTheme,
  onSelectFontPair,
}: DesignLabSwitcherProps) {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const currentThemePreset =
    BRAND_THEME_PRESETS.find((t) => t.id === activeTheme) ??
    BRAND_THEME_PRESETS[0];
  const currentFontPreset =
    FONT_PAIR_PRESETS.find((f) => f.id === activeFontPair) ??
    FONT_PAIR_PRESETS[0];

  return (
    <aside
      aria-label="Laboratorio de Dirección de Arte (Design Lab)"
      className="fixed bottom-3 right-3 z-50 max-w-[calc(100vw-1.5rem)] sm:max-w-[350px]"
    >
      {!isExpanded ? (
        <button
          type="button"
          onClick={() => {
            triggerHapticFeedback(8);
            setIsExpanded(true);
          }}
          className="flex items-center gap-2 rounded-full border border-[#99CC99]/60 bg-[#0B1929]/95 px-3.5 py-2 text-xs font-semibold text-white shadow-xl backdrop-blur-xl transition-transform hover:scale-[1.02] active:scale-95 cursor-pointer"
        >
          <Palette weight="duotone" className="h-4 w-4 text-[#99CC99]" />
          <span>Design Lab</span>
          <span className="rounded-full bg-[#336699] px-2 py-0.5 font-mono text-[10px] text-white">
            {activeTheme === 'theme-dark-glass' ? 'Dark' : 'Light'} ·{' '}
            {activeFontPair === 'font-logo-match'
              ? 'Fuente A'
              : activeFontPair === 'font-tech-optical'
                ? 'Fuente B'
                : 'Fuente C'}
          </span>
        </button>
      ) : (
        <div className="rounded-2xl border border-[#336699]/50 bg-[#0B1929]/95 p-3.5 text-white shadow-2xl backdrop-blur-xl space-y-3">
          <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2">
            <div className="flex items-center gap-1.5">
              <Palette weight="duotone" className="h-4 w-4 text-[#99CC99]" />
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#99CC99]">
                Design Lab · Dirección de Arte
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                triggerHapticFeedback(6);
                setIsExpanded(false);
              }}
              aria-label="Minimizar Design Lab"
              className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-slate-200 hover:bg-white/20 cursor-pointer"
            >
              <span>Cerrar</span>
              <CaretDown weight="bold" className="h-3 w-3" />
            </button>
          </div>

          {/* 1. Selector de Modo Visual (2 Opciones) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-slate-300">
              <span className="font-semibold flex items-center gap-1">
                {activeTheme === 'theme-dark-glass' ? (
                  <MoonStars weight="duotone" className="h-3.5 w-3.5 text-[#99CC99]" />
                ) : (
                  <SunDim weight="duotone" className="h-3.5 w-3.5 text-[#99CC99]" />
                )}
                Modo Visual (2 Opciones)
              </span>
              <span className="font-mono text-[10px] text-[#99CC99]">
                {currentThemePreset?.shortLabel}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {BRAND_THEME_PRESETS.map((preset) => {
                const isSelected = activeTheme === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      triggerHapticFeedback(10);
                      onSelectTheme(preset.id);
                    }}
                    className={cn(
                      'flex flex-col items-start rounded-xl border p-2 text-left transition-all cursor-pointer',
                      isSelected
                        ? 'border-[#99CC99] bg-[#336699]/40 text-white shadow-sm'
                        : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                    )}
                  >
                    <div className="flex items-center gap-1.5 w-full justify-between">
                      <span className="text-[11px] font-bold leading-tight">
                        {preset.id === 'theme-clinical'
                          ? '1. Clínica Luminosa'
                          : '2. Dark Glass'}
                      </span>
                      <span className="flex items-center gap-0.5 shrink-0">
                        {preset.previewSwatches.map((hex) => (
                          <span
                            key={hex}
                            style={{ backgroundColor: hex }}
                            className="h-2.5 w-2.5 rounded-full border border-white/30"
                          />
                        ))}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-300/85 mt-0.5 leading-tight">
                      {preset.id === 'theme-clinical'
                        ? 'Light (#F4F8FB)'
                        : 'Dark PDF (#0A111A)'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Selector de Combinación de Fuentes (3 Opciones) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-slate-300">
              <span className="font-semibold flex items-center gap-1">
                <TextAa weight="duotone" className="h-3.5 w-3.5 text-[#99CC99]" />
                Dupla de Fuentes (3 Opciones)
              </span>
              <span className="font-mono text-[10px] text-[#99CC99]">
                {currentFontPreset?.shortLabel}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-1.5">
              {FONT_PAIR_PRESETS.map((font) => {
                const isSelected = activeFontPair === font.id;
                return (
                  <button
                    key={font.id}
                    type="button"
                    onClick={() => {
                      triggerHapticFeedback(10);
                      onSelectFontPair(font.id);
                    }}
                    className={cn(
                      'flex items-center justify-between rounded-xl border px-2.5 py-1.5 text-left transition-all cursor-pointer',
                      isSelected
                        ? 'border-[#99CC99] bg-[#336699]/40 text-white'
                        : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                    )}
                  >
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold leading-tight">
                        {font.shortLabel}
                      </p>
                      <p className="text-[10px] text-slate-300/85 truncate">
                        {font.summary}
                      </p>
                    </div>
                    <span
                      className={cn(
                        'ml-2 h-2 w-2 rounded-full shrink-0',
                        isSelected ? 'bg-[#99CC99]' : 'bg-white/20'
                      )}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

export default DesignLabSwitcher;
