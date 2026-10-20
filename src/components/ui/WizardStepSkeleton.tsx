/**
 * Skeleton con estética Liquid Glass y el logo difuminado de Óptica Profesional
 * para las transiciones Lazy UI (`React.lazy` + `Suspense`).
 */
export function WizardStepSkeleton() {
  return (
    <div
      role="status"
      aria-label="Cargando paso del cotizador"
      className="flex flex-1 flex-col items-center justify-center py-12"
    >
      <div className="relative flex h-44 w-44 items-center justify-center rounded-full border border-white/75 bg-white/70 shadow-lg backdrop-blur-xl">
        <div className="absolute inset-2.5 rounded-full border border-dashed border-[var(--brand-primary)]/30" />
        <img
          src="/logo-optica-profesional.png"
          alt="Óptica Profesional"
          className="w-32 object-contain opacity-65 blur-[2px] animate-pulse select-none"
        />
      </div>
    </div>
  );
}
