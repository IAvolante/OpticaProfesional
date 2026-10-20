import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, Layers, Monitor, Sun } from 'lucide-react';
import type { RefractiveIndex } from '../../types/optical.types';
import { cn } from '../../utils/cn';
import { triggerHapticFeedback } from '../../utils/formatters';

export interface LensVisualSimulatorProps {
  readonly refractiveIndex: RefractiveIndex;
  readonly hasPhotochromic: boolean;
  readonly commercialName: string;
}

type SimulatorMode = 'BLUE_AR' | 'SUN_PHOTO' | 'THICKNESS';

/**
 * Simulador Visual Interactivo ("Probá el Cristal con tu Dedo") potenciado con los
 * videos macro reales generados en Google Flow:
 * 1. `BLUE_AR`: Reproduce `optical-titanium-bluecut-flow.mp4` (Reflejo Blue Cut + Armazón Titanio 4K).
 * 2. `SUN_PHOTO`: Reproduce `optical-photochromic-flow.mp4` (Transición Fotocromática Real bajo el sol).
 * 3. `THICKNESS`: Reproduce `optical-hero-flow.mp4` con comparativa de espesor según el Índice.
 */
export function LensVisualSimulator({
  refractiveIndex,
  hasPhotochromic,
}: LensVisualSimulatorProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [mode, setMode] = useState<SimulatorMode>(
    hasPhotochromic ? 'SUN_PHOTO' : 'BLUE_AR'
  );
  const [isEffectActive, setIsEffectActive] = useState<boolean>(true);

  const handleModeChange = (nextMode: SimulatorMode) => {
    triggerHapticFeedback(10);
    setMode(nextMode);
    setIsEffectActive(true);
  };

  const handleToggleEffect = () => {
    triggerHapticFeedback(12);
    setIsEffectActive((prev) => !prev);
  };

  const thicknessReductionPercent =
    refractiveIndex === '1.67'
      ? 45
      : refractiveIndex === '1.59'
        ? 35
        : refractiveIndex === '1.56'
          ? 20
          : 10;

  const activeVideoFile =
    mode === 'SUN_PHOTO'
      ? 'videos/optical-photochromic-flow.mp4'
      : mode === 'BLUE_AR'
        ? 'videos/optical-titanium-bluecut-flow.mp4'
        : 'videos/optical-hero-flow.mp4';

  const activePosterUrl =
    mode === 'SUN_PHOTO'
      ? '/videos/optical-photochromic-flow-poster.jpg'
      : mode === 'BLUE_AR'
        ? '/videos/optical-titanium-bluecut-flow-poster.jpg'
        : '/videos/optical-hero-flow-poster.jpg';

  const activeVideoUrl = `/${activeVideoFile}`;

  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) {
      return;
    }
    videoEl.defaultMuted = true;
    videoEl.muted = true;
    void videoEl.play().catch(() => {
      // Ignorar si el navegador difiere la reproducción
    });
  }, [activeVideoUrl]);

  return (
    <div className="optical-glass-card rounded-2xl p-3.5 space-y-3 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--brand-text)]">
          <Eye className="h-3.5 w-3.5 text-[var(--brand-primary)]" />
          Laboratorio Visual en Vivo (Google Flow)
        </span>
        <span className="text-[10px] font-semibold text-[var(--brand-primary)]">
          Tocá para interactuar
        </span>
      </div>

      {/* Selector de 3 pruebas ópticas con videos reales */}
      <div className="grid grid-cols-3 gap-1 rounded-xl bg-[var(--brand-canvas)] p-1 border border-[var(--brand-border)]">
        <button
          type="button"
          onClick={() => handleModeChange('BLUE_AR')}
          className={cn(
            'flex items-center justify-center gap-1 rounded-lg py-1.5 px-2 text-[11px] font-bold transition-all cursor-pointer',
            mode === 'BLUE_AR'
              ? 'bg-[var(--brand-surface)] text-[var(--brand-primary)] shadow-xs'
              : 'text-[var(--brand-text-muted)]'
          )}
        >
          <Monitor className="h-3 w-3 shrink-0" />
          <span>Blue Cut 4K</span>
        </button>

        <button
          type="button"
          onClick={() => handleModeChange('SUN_PHOTO')}
          className={cn(
            'flex items-center justify-center gap-1 rounded-lg py-1.5 px-2 text-[11px] font-bold transition-all cursor-pointer',
            mode === 'SUN_PHOTO'
              ? 'bg-[var(--brand-surface)] text-[var(--brand-primary)] shadow-xs'
              : 'text-[var(--brand-text-muted)]'
          )}
        >
          <Sun className="h-3 w-3 shrink-0" />
          <span>Fotocromático</span>
        </button>

        <button
          type="button"
          onClick={() => handleModeChange('THICKNESS')}
          className={cn(
            'flex items-center justify-center gap-1 rounded-lg py-1.5 px-2 text-[11px] font-bold transition-all cursor-pointer',
            mode === 'THICKNESS'
              ? 'bg-[var(--brand-surface)] text-[var(--brand-primary)] shadow-xs'
              : 'text-[var(--brand-text-muted)]'
          )}
        >
          <Layers className="h-3 w-3 shrink-0" />
          <span>Espesor</span>
        </button>
      </div>

      {/* Escenario visual interactivo con Video Macro Real */}
      <button
        type="button"
        onClick={handleToggleEffect}
        style={{ backgroundImage: `url(${activePosterUrl})` }}
        className="relative w-full h-36 rounded-2xl overflow-hidden border border-[var(--brand-border)] bg-stone-950 bg-cover bg-center text-left p-3 flex flex-col justify-between cursor-pointer select-none active:scale-[0.99] transition-transform"
      >
        <video
          key={activeVideoUrl}
          ref={videoRef}
          src={activeVideoUrl}
          poster={activePosterUrl}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className={cn(
            'absolute inset-0 h-full w-full object-cover object-center transition-all duration-500',
            isEffectActive
              ? 'brightness-95 contrast-105 scale-100'
              : 'brightness-75 blur-[1.5px] scale-105'
          )}
        />

        {/* Capa oscura graduada para legibilidad perfecta sobre el video */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/45" />

        {mode === 'BLUE_AR' && (
          <>
            <div className="relative z-10 flex items-center justify-between gap-2">
              <span className="rounded-full bg-black/65 backdrop-blur-md border border-white/20 px-2.5 py-0.5 text-[10px] font-bold text-white">
                {isEffectActive
                  ? 'CON Blue Cut + Antirreflex HD'
                  : 'SIN Tratamiento (Brillo LED)'}
              </span>
              <span className="text-[10px] font-semibold text-emerald-300">
                Tocá para comparar
              </span>
            </div>

            <div className="relative z-10 flex items-center justify-between gap-3">
              <p className="text-xs font-medium text-white/95 leading-snug">
                {isEffectActive
                  ? 'Observá el reflejo selectivo azul-violeta sobre el armazón de titanio que bloquea la fatiga digital.'
                  : 'Sin tratamiento antirreflex, los halos de pantallas y faros LED impactan directo en la retina.'}
              </p>
              <div
                className={cn(
                  'h-10 w-10 shrink-0 rounded-full border-2 flex items-center justify-center transition-all duration-500',
                  isEffectActive
                    ? 'border-emerald-400/80 bg-black/50 shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                    : 'border-blue-400 bg-blue-500/40 shadow-[0_0_25px_rgba(96,165,250,0.85)]'
                )}
              >
                <span className="text-[10px] font-bold text-white">
                  {isEffectActive ? 'HD' : 'LED'}
                </span>
              </div>
            </div>
          </>
        )}

        {mode === 'SUN_PHOTO' && (
          <>
            <div className="relative z-10 flex items-center justify-between gap-2">
              <span className="rounded-full bg-black/65 backdrop-blur-md border border-white/20 px-2.5 py-0.5 text-[10px] font-bold text-white">
                {isEffectActive
                  ? 'Transición Solar UV400 en Vivo'
                  : 'En Interior (100% Transparente)'}
              </span>
              <span className="text-[10px] font-semibold text-amber-300">
                Video Real Fotocromático
              </span>
            </div>

            <div className="relative z-10 flex items-center justify-between gap-3">
              <p className="text-xs font-medium text-white/95 leading-snug">
                {isEffectActive
                  ? 'Miralo en acción: al recibir el rayo de sol, el cristal se oscurece automáticamente protegiendo tu vista.'
                  : 'Al regresar al interior o de noche, el cristal vuelve a ser 100% transparente.'}
              </p>
              <div
                className={cn(
                  'h-10 w-14 shrink-0 rounded-xl border-2 transition-all duration-700 flex items-center justify-center backdrop-blur-xs',
                  isEffectActive
                    ? 'border-amber-400/80 bg-amber-950/75 text-amber-200'
                    : 'border-white/70 bg-white/25 text-white'
                )}
              >
                <span className="text-[10px] font-bold">
                  {isEffectActive ? 'UV400' : 'Claro'}
                </span>
              </div>
            </div>
          </>
        )}

        {mode === 'THICKNESS' && (
          <>
            <div className="relative z-10 flex items-center justify-between">
              <span className="rounded-full bg-black/65 backdrop-blur-md border border-white/20 px-2.5 py-0.5 text-[10px] font-bold text-white">
                Índice {refractiveIndex} · Reducción hasta -{thicknessReductionPercent}%
              </span>
              <span className="text-[10px] font-semibold text-teal-300">
                Comparativa de Perfil
              </span>
            </div>

            <div className="relative z-10 grid grid-cols-2 gap-3 items-center pt-1">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] text-slate-200">
                  <span>Orgánico Común</span>
                  <span>Grueso</span>
                </div>
                <div className="h-4 w-full rounded-md bg-slate-400/75 border border-white/40" />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] text-emerald-300 font-bold">
                  <span>Tu Cristal {refractiveIndex}</span>
                  <span>-{thicknessReductionPercent}%</span>
                </div>
                <motion.div
                  initial={{ scaleY: 1 }}
                  animate={{
                    scaleY: isEffectActive
                      ? Math.max(0.45, 1 - thicknessReductionPercent / 100)
                      : 0.85,
                  }}
                  className="h-4 w-full rounded-md bg-emerald-400 border border-emerald-200 shadow-[0_0_12px_rgba(52,211,153,0.5)]"
                />
              </div>
            </div>
          </>
        )}
      </button>
    </div>
  );
}
