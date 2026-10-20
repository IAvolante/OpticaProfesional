import type { QuestionOptionValue } from '../../types/optical.types';
import { cn } from '../../utils/cn';

export interface OpticalOptionDiagramProps {
  readonly value: QuestionOptionValue;
  readonly isSelected: boolean;
}

/**
 * Diagramas técnicos SVG a medida (Estilo Blueprint Clínico Zeiss / Warby Parker)
 * para cada una de las 16 opciones del configurador óptico de 5 pasos.
 * Reemplaza los bloques de puro texto e íconos genéricos por esquemas ópticos reales.
 */
export function OpticalOptionDiagram({
  value,
  isSelected,
}: OpticalOptionDiagramProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border transition-all duration-200',
        isSelected
          ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]/12 text-[var(--brand-primary)] shadow-2xs'
          : 'border-[var(--brand-border)] bg-[var(--brand-surface-elevated)]/75 text-[var(--brand-text-muted)] group-hover:border-[var(--brand-primary)]/40 group-hover:text-[var(--brand-primary)]'
      )}
    >
      {renderDiagramByOption(value)}
    </div>
  );
}

function renderDiagramByOption(value: QuestionOptionValue) {
  switch (value) {
    /* =========================================================================
     * PASO 1: DISTANCIA VISUAL
     * ========================================================================= */
    case 'single_distance':
      // Lente Monofocal: Campo único nítido con punto focal central
      return (
        <svg viewBox="0 0 48 48" className="h-10 w-10" fill="none">
          <rect
            x="6"
            y="11"
            width="36"
            height="26"
            rx="11"
            stroke="currentColor"
            strokeWidth="2"
          />
          <circle
            cx="24"
            cy="24"
            r="7"
            className="fill-current opacity-15"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="2 2"
          />
          <circle cx="24" cy="24" r="2.5" className="fill-current" />
          <path
            d="M12 24H16M32 24H36M24 14V17M24 31V34"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      );

    case 'near_and_far':
      // Lente Multifocal Progresivo: Corredor progresivo de 3 zonas (Lejos, Intermedia, Cerca)
      return (
        <svg viewBox="0 0 48 48" className="h-10 w-10" fill="none">
          <rect
            x="6"
            y="10"
            width="36"
            height="28"
            rx="11"
            stroke="currentColor"
            strokeWidth="2"
          />
          {/* Zona superior (Lejos) */}
          <path
            d="M9 19H39"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeDasharray="2.5 2"
          />
          {/* Corredor intermedio y zona de lectura inferior */}
          <path
            d="M17 19C19 24 20 28 18 36M31 19C29 24 28 28 30 36"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
          <circle cx="24" cy="15" r="1.75" className="fill-current" />
          <circle cx="24" cy="24" r="1.75" className="fill-current opacity-70" />
          <circle cx="24" cy="32" r="2.25" className="fill-current" />
        </svg>
      );

    case 'visual_rest':
      // Descanso Visual: Ojo relajado con escudo de ondas de alta energía
      return (
        <svg viewBox="0 0 48 48" className="h-10 w-10" fill="none">
          <path
            d="M6 24C10.5 16.5 17 13 24 13C31 13 37.5 16.5 42 24C37.5 31.5 31 35 24 35C17 35 10.5 31.5 6 24Z"
            stroke="currentColor"
            strokeWidth="2"
          />
          <circle
            cx="24"
            cy="24"
            r="5.5"
            className="fill-current opacity-20"
            stroke="currentColor"
            strokeWidth="1.75"
          />
          <path
            d="M16 9L20 11M32 9L28 11"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      );

    /* =========================================================================
     * PASO 2: EXPOSICIÓN A PANTALLAS (FILTRO AZUL / ANTIRREFLEX)
     * ========================================================================= */
    case 'intensive_6h_plus':
      // Bloqueo Blue Cut Intensivo (+6h): Lente vertical rebotando rayos HEV
      return (
        <svg viewBox="0 0 48 48" className="h-10 w-10" fill="none">
          {/* Perfil del lente con tratamiento Blue Cut */}
          <path
            d="M27 8C31 16 31 32 27 40"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M31 10C34.5 17 34.5 31 31 38"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeDasharray="2 2"
          />
          {/* Rayos LED entrantes y rebotados */}
          <path
            d="M8 16H24L15 10M8 24H25L16 29M8 32H24"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <text
            x="33"
            y="27"
            className="fill-current font-mono text-[9px] font-bold"
          >
            6h+
          </text>
        </svg>
      );

    case 'moderate_3_to_6h':
      // Uso Moderado (3-6h): Monitor + Lente con filtro selectivo equilibrado
      return (
        <svg viewBox="0 0 48 48" className="h-10 w-10" fill="none">
          <rect
            x="8"
            y="11"
            width="24"
            height="17"
            rx="3"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path
            d="M16 32H24M20 28V32"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <circle
            cx="33"
            cy="28"
            r="8"
            className="fill-current opacity-15"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path
            d="M30 28L32 30L36 26"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );

    case 'low_under_3h':
      // Uso Bajo (<3h): Transparencia Multicapa Hidrofóbica 99%
      return (
        <svg viewBox="0 0 48 48" className="h-10 w-10" fill="none">
          <circle
            cx="24"
            cy="24"
            r="14"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M16 20L28 14M14 27L32 18"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <circle cx="31" cy="30" r="2.5" className="fill-current opacity-30" />
        </svg>
      );

    /* =========================================================================
     * PASO 3: SENSIBILIDAD SOLAR Y CONDUCCIÓN
     * ========================================================================= */
    case 'outdoor_commute':
      // Fotocromático Mitad Claro / Mitad Oscuro con Sol UV400
      return (
        <svg viewBox="0 0 48 48" className="h-10 w-10" fill="none">
          <rect
            x="6"
            y="12"
            width="36"
            height="24"
            rx="10"
            stroke="currentColor"
            strokeWidth="2"
          />
          {/* Mitad derecha oscurecida por transición solar */}
          <path
            d="M24 12H32C37.5228 12 42 16.4772 42 22V26C42 31.5228 37.5228 36 32 36H24V12Z"
            className="fill-current opacity-30"
          />
          <path
            d="M24 9V39"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="2 2"
          />
          <circle cx="33" cy="24" r="4" className="fill-current" />
        </svg>
      );

    case 'day_night_driving':
      // Conducción Día y Noche: Ruta en perspectiva + atenuación de halo LED
      return (
        <svg viewBox="0 0 48 48" className="h-10 w-10" fill="none">
          <path
            d="M10 38L20 14H28L38 38"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M24 18V23M24 28V35"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <circle cx="16" cy="12" r="2" className="fill-current" />
          <circle cx="32" cy="12" r="2" className="fill-current" />
        </svg>
      );

    case 'mostly_indoors':
      // Uso Interior: Cristal 100% Claro con ejes de nitidez
      return (
        <svg viewBox="0 0 48 48" className="h-10 w-10" fill="none">
          <rect
            x="7"
            y="12"
            width="34"
            height="24"
            rx="10"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M15 24H33M24 17V31"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeDasharray="2 2"
          />
        </svg>
      );

    /* =========================================================================
     * PASO 4: GRADUACIÓN Y ESPESOR (CORTE TRANSVERSAL DE CRISTAL)
     * ========================================================================= */
    case 'neutral_or_low':
      // Corte transversal de cristal delgado estándar (±2.00 D)
      return (
        <svg viewBox="0 0 48 48" className="h-10 w-10" fill="none">
          <path
            d="M21 9C24 18 24 30 21 39H27C30 30 30 18 27 9H21Z"
            className="fill-current opacity-20"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <text
            x="8"
            y="27"
            className="fill-current font-mono text-[8px] font-bold"
          >
            1.56
          </text>
        </svg>
      );

    case 'moderate_up_to_4':
      // Comparativa de reducción intermedia (-35% espesor)
      return (
        <svg viewBox="0 0 48 48" className="h-10 w-10" fill="none">
          {/* Borde convencional punteado */}
          <path
            d="M14 9C18 18 18 30 14 39H24C27 30 27 18 24 9H14Z"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeDasharray="2 2"
          />
          {/* Perfil reducido 1.59 */}
          <path
            d="M28 9C31 18 31 30 28 39H34C36.5 30 36.5 18 34 9H28Z"
            className="fill-current opacity-25"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      );

    case 'high_plus_4':
      // Alto Índice 1.67 Asférico Ultradelgado vs Convencional Grueso (-45%)
      return (
        <svg viewBox="0 0 48 48" className="h-10 w-10" fill="none">
          {/* Cristal grueso convencional */}
          <path
            d="M10 9C15 18 15 30 10 39H22C25 30 25 18 22 9H10Z"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeDasharray="2 2"
          />
          {/* Cristal ultradelgado 1.67 */}
          <path
            d="M31 9C33.2 18 33.2 30 31 39H35.5C37.5 30 37.5 18 35.5 9H31Z"
            className="fill-current opacity-35"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      );

    case 'unknown_recipe':
      // Receta Oftalmológica OD / OI / ESF / CIL
      return (
        <svg viewBox="0 0 48 48" className="h-10 w-10" fill="none">
          <rect
            x="9"
            y="8"
            width="30"
            height="32"
            rx="4"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M14 16H34M14 23H34M14 30H26M24 16V33"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      );

    /* =========================================================================
     * PASO 5: ARMAZÓN Y MONTURA
     * ========================================================================= */
    case 'need_new_frame':
      // Armazón Completo + Cristales Calibrados
      return (
        <svg viewBox="0 0 48 48" className="h-10 w-10" fill="none">
          <rect
            x="5"
            y="16"
            width="16"
            height="13"
            rx="4.5"
            className="fill-current opacity-15"
            stroke="currentColor"
            strokeWidth="2"
          />
          <rect
            x="27"
            y="16"
            width="16"
            height="13"
            rx="4.5"
            className="fill-current opacity-15"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M21 20C22.5 18.5 25.5 18.5 27 20"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );

    case 'need_clip_on':
      // Armazón Recetado + Frente Solar Clip-On Magnético Desacoplado
      return (
        <svg viewBox="0 0 48 48" className="h-10 w-10" fill="none">
          {/* Montura base recetada */}
          <rect
            x="6"
            y="20"
            width="15"
            height="11"
            rx="3.5"
            stroke="currentColor"
            strokeWidth="1.75"
          />
          <rect
            x="27"
            y="20"
            width="15"
            height="11"
            rx="3.5"
            stroke="currentColor"
            strokeWidth="1.75"
          />
          <path d="M21 24H27" stroke="currentColor" strokeWidth="1.75" />
          {/* Clip-On Solar Magnético arriba acoplándose */}
          <rect
            x="8"
            y="10"
            width="14"
            height="8"
            rx="2.5"
            className="fill-current opacity-30"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <rect
            x="26"
            y="10"
            width="14"
            height="8"
            rx="2.5"
            className="fill-current opacity-30"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path d="M22 13H26" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      );

    case 'own_frame':
      // Solo Cristales Biselados listos para montar en armazón propio (punteado)
      return (
        <svg viewBox="0 0 48 48" className="h-10 w-10" fill="none">
          <rect
            x="5"
            y="16"
            width="16"
            height="13"
            rx="4.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="2.5 2"
          />
          <rect
            x="27"
            y="16"
            width="16"
            height="13"
            rx="4.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="2.5 2"
          />
          <circle
            cx="13"
            cy="22.5"
            r="4"
            className="fill-current opacity-25"
          />
          <circle
            cx="35"
            cy="22.5"
            r="4"
            className="fill-current opacity-25"
          />
        </svg>
      );

    case 'undecided_frame':
      // Comparativa Dual: Armazón + Cristales vs Solo Cristales
      return (
        <svg viewBox="0 0 48 48" className="h-10 w-10" fill="none">
          <rect
            x="7"
            y="11"
            width="15"
            height="11"
            rx="3.5"
            className="fill-current opacity-20"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <rect
            x="26"
            y="26"
            width="15"
            height="11"
            rx="3.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeDasharray="2.5 2"
          />
          <path
            d="M26 16H35V22M22 32H13V26"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
  }
}
