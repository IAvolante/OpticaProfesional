import type { QuestionOptionValue } from '../../types/optical.types';
import { cn } from '../../utils/cn';

export interface OpticalOptionDiagramProps {
  readonly value: QuestionOptionValue;
  readonly isSelected: boolean;
}

/**
 * Esquemas técnicos SVG a medida para cada opción de los 5 pasos definidos en PREGUNTAS .pdf,
 * utilizando la identidad bicolor del logo 2026 (#336699 Azul Profesional + #99CC99 Verde Salvia).
 */
export function OpticalOptionDiagram({
  value,
  isSelected,
}: OpticalOptionDiagramProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border transition-all duration-200',
        isSelected
          ? 'border-[#336699] bg-[#336699] text-white shadow-2xs'
          : 'border-[var(--brand-border)] bg-[var(--brand-surface-elevated)]/80 text-[#336699] group-hover:border-[#99CC99] group-hover:bg-[#EFF7EF]'
      )}
    >
      {renderDiagramByOption(value)}
    </div>
  );
}

function renderDiagramByOption(value: QuestionOptionValue) {
  switch (value) {
    /* =========================================================================
     * PASO 1: ¿QUÉ ES LO PRINCIPAL QUE QUERÉS MEJORAR? (MATERIAL)
     * ========================================================================= */
    case 'organico_ar':
      return (
        <svg viewBox="0 0 48 48" className="h-7 w-7" fill="none">
          <circle
            cx="24"
            cy="24"
            r="14"
            stroke="currentColor"
            strokeWidth="2.2"
          />
          <path
            d="M16 20L28 14M14 27L31 18"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="24" cy="24" r="3" className="fill-current" />
        </svg>
      );

    case 'organico_blue_ar':
      return (
        <svg viewBox="0 0 48 48" className="h-7 w-7" fill="none">
          <path
            d="M28 9C32 17 32 31 28 39"
            stroke="currentColor"
            strokeWidth="2.6"
            strokeLinecap="round"
          />
          <path
            d="M9 17H24L16 11M9 24H25L17 29M9 31H24"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );

    case 'alto_indice':
      return (
        <svg viewBox="0 0 48 48" className="h-7 w-7" fill="none">
          <path
            d="M11 10C16 18 16 30 11 38H21C24 30 24 18 21 10H11Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="2.5 2"
          />
          <path
            d="M30 10C32.5 18 32.5 30 30 38H35C37 30 37 18 35 10H30Z"
            className="fill-current opacity-25"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
        </svg>
      );

    case 'bifocal_multifocal':
      return (
        <svg viewBox="0 0 48 48" className="h-7 w-7" fill="none">
          <rect
            x="7"
            y="11"
            width="34"
            height="26"
            rx="10"
            stroke="currentColor"
            strokeWidth="2.2"
          />
          <path
            d="M17 19C19 24 20 28 18 35M31 19C29 24 28 28 30 35"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <circle cx="24" cy="16" r="2" className="fill-current" />
          <circle cx="24" cy="24" r="2" className="fill-current opacity-75" />
          <circle cx="24" cy="31" r="2.2" className="fill-current" />
        </svg>
      );

    case 'filtro_fotocromatico':
      return (
        <svg viewBox="0 0 48 48" className="h-7 w-7" fill="none">
          <rect
            x="6"
            y="13"
            width="36"
            height="22"
            rx="9"
            stroke="currentColor"
            strokeWidth="2.2"
          />
          <path
            d="M24 13H33C37.97 13 42 17.03 42 22V26C42 30.97 37.97 35 33 35H24V13Z"
            className="fill-current opacity-30"
          />
          <circle cx="33" cy="24" r="3.5" className="fill-current" />
        </svg>
      );

    /* =========================================================================
     * PASO 2: ¿EN QUÉ ACTIVIDADES NECESITÁS MAYOR COMODIDAD VISUAL?
     * ========================================================================= */
    case 'computadora_celular':
      return (
        <svg viewBox="0 0 48 48" className="h-7 w-7" fill="none">
          <rect
            x="7"
            y="11"
            width="24"
            height="17"
            rx="3"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M14 32H24M19 28V32"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <rect
            x="30"
            y="18"
            width="11"
            height="18"
            rx="2.5"
            className="fill-current opacity-15"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      );

    case 'lectura_cerca':
      return (
        <svg viewBox="0 0 48 48" className="h-7 w-7" fill="none">
          <path
            d="M8 14C13 12 19 13 24 16C29 13 35 12 40 14V35C35 33 29 34 24 37C19 34 13 33 8 35V14Z"
            stroke="currentColor"
            strokeWidth="2.1"
            strokeLinejoin="round"
          />
          <path
            d="M24 16V37"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );

    case 'manejando_aire_libre':
      return (
        <svg viewBox="0 0 48 48" className="h-7 w-7" fill="none">
          <path
            d="M10 37L20 14H28L38 37"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M24 18V23M24 28V35"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );

    case 'actividades_diarias':
      return (
        <svg viewBox="0 0 48 48" className="h-7 w-7" fill="none">
          <circle
            cx="24"
            cy="24"
            r="14"
            stroke="currentColor"
            strokeWidth="2.1"
          />
          <path
            d="M24 15V24L30 28"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );

    /* =========================================================================
     * PASO 3: ¿CUÁL ES TU PRIORIDAD A LA HORA DE ELEGIR TUS ANTEOJOS?
     * ========================================================================= */
    case 'precio':
      return (
        <svg viewBox="0 0 48 48" className="h-7 w-7" fill="none">
          <path
            d="M12 25L22 35L38 15"
            stroke="currentColor"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );

    case 'tecnologia':
      return (
        <svg viewBox="0 0 48 48" className="h-7 w-7" fill="none">
          <polygon
            points="24,8 38,16 38,32 24,40 10,32 10,16"
            stroke="currentColor"
            strokeWidth="2.1"
            strokeLinejoin="round"
          />
          <circle cx="24" cy="24" r="5" className="fill-current opacity-30" />
          <circle cx="24" cy="24" r="2.2" className="fill-current" />
        </svg>
      );

    case 'moda':
      return (
        <svg viewBox="0 0 48 48" className="h-7 w-7" fill="none">
          <circle
            cx="16"
            cy="24"
            r="8"
            stroke="currentColor"
            strokeWidth="2.2"
          />
          <circle
            cx="32"
            cy="24"
            r="8"
            stroke="currentColor"
            strokeWidth="2.2"
          />
          <path
            d="M24 22V35"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </svg>
      );

    case 'solucion':
      return (
        <svg viewBox="0 0 48 48" className="h-7 w-7" fill="none">
          <path
            d="M26 8L12 26H24L22 40L36 22H24L26 8Z"
            className="fill-current opacity-20"
            stroke="currentColor"
            strokeWidth="2.1"
            strokeLinejoin="round"
          />
        </svg>
      );

    /* =========================================================================
     * PASO 4: ¿DATOS ÚTILES PARA TU PRESUPUESTO? (MULTI-SELECT)
     * ========================================================================= */
    case 'tengo_obra_social':
      return (
        <svg viewBox="0 0 48 48" className="h-7 w-7" fill="none">
          <path
            d="M24 8L37 13V23C37 31.5 31.2 37.8 24 40C16.8 37.8 11 31.5 11 23V13L24 8Z"
            stroke="currentColor"
            strokeWidth="2.1"
            strokeLinejoin="round"
          />
          <path
            d="M24 18V28M19 23H29"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </svg>
      );

    case 'soy_particular':
      return (
        <svg viewBox="0 0 48 48" className="h-7 w-7" fill="none">
          <circle cx="24" cy="17" r="6" stroke="currentColor" strokeWidth="2.1" />
          <path
            d="M12 37C12 31.5 17.4 27 24 27C30.6 27 36 31.5 36 37"
            stroke="currentColor"
            strokeWidth="2.1"
            strokeLinecap="round"
          />
        </svg>
      );

    case 'interes_cuotas_tarjeta':
      return (
        <svg viewBox="0 0 48 48" className="h-7 w-7" fill="none">
          <rect
            x="7"
            y="13"
            width="34"
            height="22"
            rx="4"
            stroke="currentColor"
            strokeWidth="2.1"
          />
          <path d="M7 20H41" stroke="currentColor" strokeWidth="2.2" />
          <path
            d="M13 28H21"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );

    case 'beneficio_pago_contado':
      return (
        <svg viewBox="0 0 48 48" className="h-7 w-7" fill="none">
          <rect
            x="8"
            y="14"
            width="32"
            height="20"
            rx="4"
            stroke="currentColor"
            strokeWidth="2.1"
          />
          <circle
            cx="24"
            cy="24"
            r="4.5"
            className="fill-current opacity-25"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      );

    /* =========================================================================
     * PASO 5: ¿QUERÉS ADJUNTARNOS TU RECETA?
     * ========================================================================= */
    case 'cargar_foto_receta':
      return (
        <svg viewBox="0 0 48 48" className="h-7 w-7" fill="none">
          <path
            d="M16 13L19 9H29L32 13H38C39.66 13 41 14.34 41 16V35C41 36.66 39.66 38 38 38H10C8.34 38 7 36.66 7 35V16C7 14.34 8.34 13 10 13H16Z"
            stroke="currentColor"
            strokeWidth="2.1"
            strokeLinejoin="round"
          />
          <circle
            cx="24"
            cy="25"
            r="6"
            className="fill-current opacity-20"
            stroke="currentColor"
            strokeWidth="2.1"
          />
        </svg>
      );

    case 'aun_no_la_tengo':
      return (
        <svg viewBox="0 0 48 48" className="h-7 w-7" fill="none">
          <path
            d="M12 24H36M28 16L36 24L28 32"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
  }
}
