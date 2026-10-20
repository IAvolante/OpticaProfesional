import { ENV_CONFIG } from '../../config/env';

export interface OpticalBrandTransitionProps {
  readonly stepKey: string;
}

/**
 * Sello de agua difuminado en el fondo del lienzo (`z-[1]`, detrás de las tarjetas).
 * Nunca se superpone sobre el contenido ni usa círculos o bordes: solo queda
 * suavemente visible en el lienzo de fondo en el instante en que una tarjeta
 * sale y entra la siguiente (`AnimatePresence mode="wait"`).
 */
export function OpticalBrandTransition(_props: OpticalBrandTransitionProps) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[1] flex items-center justify-center overflow-hidden"
    >
      <img
        src="/logo-optica-profesional.png"
        alt={ENV_CONFIG.brandNameB2C}
        className="w-52 max-w-[55%] object-contain opacity-[0.14] blur-[3px] select-none"
      />
    </div>
  );
}
