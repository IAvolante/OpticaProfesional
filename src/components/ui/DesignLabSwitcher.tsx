import { useEffect, useState } from 'react';
import {
  ArrowsOutSimple,
  CaretDown,
  MagicWand,
  SlidersHorizontal,
  TextAa,
} from '@phosphor-icons/react';
import type {
  DesignLabConfig,
  FontScaleId,
  TransitionStyleId,
  VideoBoxSizeId,
} from '../../types/optical.types';
import { cn } from '../../utils/cn';
import { triggerHapticFeedback } from '../../utils/formatters';

export interface DesignLabSwitcherProps {
  readonly config: DesignLabConfig;
  readonly onChangeConfig: (next: DesignLabConfig) => void;
}

const VIDEO_BOX_OPTIONS: readonly {
  readonly id: VideoBoxSizeId;
  readonly number: string;
  readonly label: string;
  readonly detail: string;
}[] = [
  {
    id: 'compact',
    number: '1',
    label: 'Compacto',
    detail: '148px · Más opciones visibles',
  },
  {
    id: 'balanced',
    number: '2',
    label: 'Intermedio',
    detail: '204px · Balance ideal (-1/4)',
  },
  {
    id: 'cinematic',
    number: '3',
    label: 'Amplio 2x',
    detail: '272px · Video protagonista',
  },
];

const FONT_SCALE_OPTIONS: readonly {
  readonly id: FontScaleId;
  readonly number: string;
  readonly label: string;
  readonly detail: string;
}[] = [
  {
    id: 'scale-sm',
    number: '1',
    label: 'Sutil',
    detail: '17px / 14px',
  },
  {
    id: 'scale-md',
    number: '2',
    label: 'Estándar',
    detail: '19px / 15px',
  },
  {
    id: 'scale-lg',
    number: '3',
    label: 'Grande',
    detail: '21px / 16.5px',
  },
];

const TRANSITION_OPTIONS: readonly {
  readonly id: TransitionStyleId;
  readonly number: string;
  readonly label: string;
  readonly detail: string;
}[] = [
  {
    id: 'transition-slide',
    number: '1',
    label: 'Slide Lateral',
    detail: 'Deslizamiento clásico fluido',
  },
  {
    id: 'transition-lens',
    number: '2',
    label: 'Enfoque Óptico',
    detail: 'Efecto foco de lente + zoom',
  },
  {
    id: 'transition-cascade',
    number: '3',
    label: 'Cascada Viva',
    detail: 'Entrada elástica escalonada',
  },
];

/**
 * Laboratorio de Diseño en Vivo para probar junto al cliente:
 * - 3 Tamaños del Box de Video
 * - 3 Tamaños de Letra (con Fuente #4 Sora + DM Sans fijada)
 * - 3 Efectos de Transición entre pasos
 */
export function DesignLabSwitcher({
  config,
  onChangeConfig,
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

  const currentVideoOption =
    VIDEO_BOX_OPTIONS.find((o) => o.id === config.videoBoxSize) ??
    VIDEO_BOX_OPTIONS[1];
  const currentScaleOption =
    FONT_SCALE_OPTIONS.find((o) => o.id === config.fontScale) ??
    FONT_SCALE_OPTIONS[1];
  const currentTransitionOption =
    TRANSITION_OPTIONS.find((o) => o.id === config.transitionStyle) ??
    TRANSITION_OPTIONS[0];

  return (
    <aside
      aria-label="Laboratorio Visual de Prueba"
      className="fixed left-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-50 max-w-[calc(100vw-1.5rem)] sm:max-w-[375px]"
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
            <SlidersHorizontal weight="duotone" className="h-3.5 w-3.5" />
          </span>
          <span>Ajustes Visuales</span>
          <span className="rounded-full bg-[#336699] px-2.5 py-0.5 font-mono text-[10px] font-bold text-white">
            {`Video ${currentVideoOption?.number} · Letra ${currentScaleOption?.number} · FX ${currentTransitionOption?.number}`}
          </span>
        </button>
      ) : (
        <div className="rounded-2xl border border-[#336699]/30 bg-white/98 p-3.5 text-[#102336] shadow-2xl backdrop-blur-xl space-y-3">
          <div className="flex items-center justify-between gap-2 border-b border-[#D5E2EE] pb-2">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#EFF7EF] border border-[#99CC99] text-[#336699]">
                <SlidersHorizontal weight="duotone" className="h-4 w-4" />
              </span>
              <div>
                <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#336699] leading-none">
                  Panel de Prueba en Vivo · Fuente #4 (Sora)
                </p>
                <p className="text-[11px] text-[#4A637C] mt-0.5">
                  Combiná tamaño de video, letra y transiciones
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                triggerHapticFeedback(6);
                setIsExpanded(false);
              }}
              aria-label="Minimizar panel visual"
              className="inline-flex min-h-[32px] items-center gap-1 rounded-lg bg-[#EBF2F8] px-2.5 py-1 text-[11px] font-semibold text-[#264F78] hover:bg-[#D5E2EE] cursor-pointer"
            >
              <span>Cerrar</span>
              <CaretDown weight="bold" className="h-3 w-3" />
            </button>
          </div>

          {/* 1. Tamaño del Box de Video (3 opciones) */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#102336]">
              <ArrowsOutSimple
                weight="duotone"
                className="h-3.5 w-3.5 text-[#336699]"
              />
              <span>1. Tamaño del Box de Video</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {VIDEO_BOX_OPTIONS.map((opt) => {
                const isSelected = config.videoBoxSize === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => {
                      triggerHapticFeedback(10);
                      onChangeConfig({ ...config, videoBoxSize: opt.id });
                    }}
                    className={cn(
                      'flex flex-col items-start rounded-xl border p-2 text-left transition-all cursor-pointer',
                      isSelected
                        ? 'border-2 border-[#336699] bg-[#EFF7EF]/90 text-[#102336] shadow-2xs'
                        : 'border-[#D5E2EE] bg-[#F4F8FB]/80 text-[#102336] hover:border-[#336699]/50'
                    )}
                  >
                    <span className="font-mono text-[10px] font-bold text-[#336699]">
                      {opt.number}. {opt.label}
                    </span>
                    <span className="text-[10px] text-[#4A637C] leading-tight mt-0.5">
                      {opt.detail}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Tamaño de la Fuente (3 opciones) */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#102336]">
              <TextAa weight="duotone" className="h-3.5 w-3.5 text-[#336699]" />
              <span>2. Tamaño de Letra (Pregunta y Opciones)</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {FONT_SCALE_OPTIONS.map((opt) => {
                const isSelected = config.fontScale === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => {
                      triggerHapticFeedback(10);
                      onChangeConfig({ ...config, fontScale: opt.id });
                    }}
                    className={cn(
                      'flex flex-col items-start rounded-xl border p-2 text-left transition-all cursor-pointer',
                      isSelected
                        ? 'border-2 border-[#336699] bg-[#EFF7EF]/90 text-[#102336] shadow-2xs'
                        : 'border-[#D5E2EE] bg-[#F4F8FB]/80 text-[#102336] hover:border-[#336699]/50'
                    )}
                  >
                    <span className="font-mono text-[10px] font-bold text-[#336699]">
                      {opt.number}. {opt.label}
                    </span>
                    <span className="text-[10px] text-[#4A637C] leading-tight mt-0.5">
                      {opt.detail}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Efecto de Transición entre Pasos (3 opciones) */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#102336]">
              <MagicWand
                weight="duotone"
                className="h-3.5 w-3.5 text-[#336699]"
              />
              <span>3. Efecto de Transición al Cambiar de Paso</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {TRANSITION_OPTIONS.map((opt) => {
                const isSelected = config.transitionStyle === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => {
                      triggerHapticFeedback(10);
                      onChangeConfig({ ...config, transitionStyle: opt.id });
                    }}
                    className={cn(
                      'flex flex-col items-start rounded-xl border p-2 text-left transition-all cursor-pointer',
                      isSelected
                        ? 'border-2 border-[#336699] bg-[#EFF7EF]/90 text-[#102336] shadow-2xs'
                        : 'border-[#D5E2EE] bg-[#F4F8FB]/80 text-[#102336] hover:border-[#336699]/50'
                    )}
                  >
                    <span className="font-mono text-[10px] font-bold text-[#336699]">
                      {opt.number}. {opt.label}
                    </span>
                    <span className="text-[10px] text-[#4A637C] leading-tight mt-0.5">
                      {opt.detail}
                    </span>
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
