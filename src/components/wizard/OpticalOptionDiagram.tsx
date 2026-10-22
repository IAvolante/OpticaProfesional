import {
  ArrowCircleRight,
  BookOpenText,
  CameraPlus,
  CheckCircle,
  CreditCard,
  Cpu,
  Eye,
  Eyeglasses,
  Feather,
  Laptop,
  Monitor,
  Money,
  Scales,
  ShieldPlus,
  ShootingStar,
  SteeringWheel,
  SunDim,
  SunHorizon,
  UserCheck,
} from '@phosphor-icons/react';
import type { QuestionOptionValue } from '../../types/optical.types';
import { cn } from '../../utils/cn';

export interface OpticalOptionDiagramProps {
  readonly value: QuestionOptionValue;
  readonly isSelected: boolean;
}

/**
 * Iconografía Duotone oficial de @phosphor-icons/react con metáforas 100% literales
 * e instantáneamente comprensibles para cada opción de los Pasos 1 a 5.
 * Emplea la paleta bicolor de Óptica Profesional (#336699 Azul Profesional + #99CC99 Verde Salvia).
 */
export function OpticalOptionDiagram({
  value,
  isSelected,
}: OpticalOptionDiagramProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'optical-duotone-icon flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border transition-all duration-200',
        isSelected
          ? 'optical-duotone-icon-selected border-[#336699] bg-[#336699] text-white shadow-2xs'
          : 'border-[var(--brand-border)] bg-[var(--brand-surface-elevated)]/90 text-[var(--brand-icon-primary,#336699)] group-hover:border-[#99CC99]'
      )}
    >
      {renderPhosphorDuotoneByOption(value)}
    </div>
  );
}

function renderPhosphorDuotoneByOption(value: QuestionOptionValue) {
  const iconClass = 'h-7 w-7 transition-transform duration-200 group-hover:scale-105';

  switch (value) {
    /* =========================================================================
     * PASO 1: ¿QUÉ ES LO PRINCIPAL QUE QUERÉS MEJORAR? (MATERIAL)
     * ========================================================================= */
    case 'organico_ar':
      return <Eye weight="duotone" className={iconClass} />;

    case 'organico_blue_ar':
      return <Monitor weight="duotone" className={iconClass} />;

    case 'alto_indice':
      return <Feather weight="duotone" className={iconClass} />;

    case 'bifocal_multifocal':
      return <Eyeglasses weight="duotone" className={iconClass} />;

    case 'filtro_fotocromatico':
      return <SunDim weight="duotone" className={iconClass} />;

    /* =========================================================================
     * PASO 2: ¿EN QUÉ ACTIVIDADES NECESITÁS MAYOR COMODIDAD VISUAL?
     * ========================================================================= */
    case 'computadora_celular':
      return <Laptop weight="duotone" className={iconClass} />;

    case 'lectura_cerca':
      return <BookOpenText weight="duotone" className={iconClass} />;

    case 'manejando_aire_libre':
      return <SteeringWheel weight="duotone" className={iconClass} />;

    case 'actividades_diarias':
      return <SunHorizon weight="duotone" className={iconClass} />;

    /* =========================================================================
     * PASO 3: ¿CUÁL ES TU PRIORIDAD A LA HORA DE ELEGIR TUS ANTEOJOS?
     * ========================================================================= */
    case 'precio':
      return <Scales weight="duotone" className={iconClass} />;

    case 'tecnologia':
      return <Cpu weight="duotone" className={iconClass} />;

    case 'moda':
      return <ShootingStar weight="duotone" className={iconClass} />;

    case 'solucion':
      return <CheckCircle weight="duotone" className={iconClass} />;

    /* =========================================================================
     * PASO 4: ¿DATOS ÚTILES PARA TU PRESUPUESTO? (MULTI-SELECT)
     * ========================================================================= */
    case 'tengo_obra_social':
      return <ShieldPlus weight="duotone" className={iconClass} />;

    case 'soy_particular':
      return <UserCheck weight="duotone" className={iconClass} />;

    case 'interes_cuotas_tarjeta':
      return <CreditCard weight="duotone" className={iconClass} />;

    case 'beneficio_pago_contado':
      return <Money weight="duotone" className={iconClass} />;

    /* =========================================================================
     * PASO 5: ¿QUERÉS ADJUNTARNOS TU RECETA?
     * ========================================================================= */
    case 'cargar_foto_receta':
      return <CameraPlus weight="duotone" className={iconClass} />;

    case 'aun_no_la_tengo':
      return <ArrowCircleRight weight="duotone" className={iconClass} />;
  }
}
