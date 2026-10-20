import { useState } from 'react';
import {
  Palette,
  ChevronDown,
  ChevronUp,
  Check,
  Video,
  VideoOff,
} from 'lucide-react';
import {
  BRAND_THEME_PRESETS,
  getBrandThemePreset,
} from '../../config/brandTheme';
import { ENV_CONFIG } from '../../config/env';
import type { BrandThemeId } from '../../types/optical.types';
import { cn } from '../../utils/cn';

export interface ThemeSwitcherDevProps {
  readonly activeTheme: BrandThemeId;
  readonly onSelectTheme: (theme: BrandThemeId) => void;
  readonly catalogSourceLabel: string;
  readonly videoEnabled: boolean;
  readonly onToggleVideo: () => void;
}

/**
 * Barra superior compacta de desarrollo (Discovery Kit · Solana).
 * Permite conmutar en 1 clic:
 * - Los 3 presets de marca (Neutral, Boutique, Clínica)
 * - El fondo de video Google Flow (ON / OFF) para comparar en vivo
 */
export function ThemeSwitcherDev({
  activeTheme,
  onSelectTheme,
  catalogSourceLabel,
  videoEnabled,
  onToggleVideo,
}: ThemeSwitcherDevProps) {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  if (!ENV_CONFIG.isDevelopment) {
    return null;
  }

  const currentPreset = getBrandThemePreset(activeTheme);

  return (
    <div
      aria-label="Selector de identidad visual para Discovery (Modo Dev)"
      className="sticky top-0 z-50 w-full bg-slate-950/95 backdrop-blur-md text-slate-100 border-b border-white/10"
    >
      <div className="mx-auto flex max-w-[430px] items-center justify-between gap-1.5 px-3 py-1.5">
        {/* Indicador compacto */}
        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          className="inline-flex items-center gap-1.5 text-left cursor-pointer py-0.5"
        >
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-indigo-500/20 text-indigo-300">
            <Palette className="h-3 w-3" />
          </span>
          <span className="text-[11px] font-bold tracking-tight text-white">
            {currentPreset.shortLabel}
          </span>
          {isExpanded ? (
            <ChevronUp className="h-3.5 w-3.5 text-slate-400" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          )}
        </button>

        {/* Conmutador 1-clic de los 3 presets */}
        <div className="flex items-center gap-1 rounded-lg bg-slate-900 p-0.5 border border-slate-800">
          {BRAND_THEME_PRESETS.map((preset) => {
            const isSelected = preset.id === activeTheme;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => onSelectTheme(preset.id)}
                className={cn(
                  'px-2 py-1 text-[11px] font-semibold rounded-md transition-all cursor-pointer',
                  isSelected
                    ? 'bg-white text-slate-950 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                )}
              >
                {preset.shortLabel}
              </button>
            );
          })}
        </div>

        {/* Toggle rápido Video Google Flow ON/OFF */}
        <button
          type="button"
          onClick={onToggleVideo}
          title="Activar/Desactivar Video Google Flow de fondo"
          className={cn(
            'inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[11px] font-semibold transition-colors cursor-pointer',
            videoEnabled
              ? 'border-emerald-500/50 bg-emerald-500/20 text-emerald-300'
              : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
          )}
        >
          {videoEnabled ? (
            <>
              <Video className="h-3 w-3" />
              <span>Flow ON</span>
            </>
          ) : (
            <>
              <VideoOff className="h-3 w-3" />
              <span>Flow OFF</span>
            </>
          )}
        </button>
      </div>

      {/* Desplegable con detalles de paleta y tipografía para la reunión con Solana */}
      {isExpanded && (
        <div className="border-t border-slate-800 bg-slate-950/98 px-3 py-2.5">
          <div className="mx-auto max-w-[430px] space-y-2 text-xs">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Presets de Marca (Discovery Solana)</span>
              <span>{catalogSourceLabel}</span>
            </div>
            <div className="grid gap-1.5">
              {BRAND_THEME_PRESETS.map((preset) => {
                const isSelected = preset.id === activeTheme;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      onSelectTheme(preset.id);
                      setIsExpanded(false);
                    }}
                    className={cn(
                      'w-full text-left rounded-xl p-2.5 border transition-all cursor-pointer flex items-center justify-between gap-2',
                      isSelected
                        ? 'border-indigo-400/70 bg-indigo-950/50'
                        : 'border-slate-800 bg-slate-900/60'
                    )}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-white text-xs">
                          {preset.name}
                        </span>
                        {isSelected ? (
                          <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        ) : null}
                      </div>
                      <p className="text-[11px] text-slate-300 truncate">
                        {preset.tagline}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {preset.previewSwatches.map((hex) => (
                        <span
                          key={hex}
                          className="h-4 w-4 rounded-full border border-white/20"
                          style={{ backgroundColor: hex }}
                        />
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
