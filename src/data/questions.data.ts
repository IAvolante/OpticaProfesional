import type { WizardQuestionDefinition } from '../types/optical.types';

/**
 * Árbol de preguntas desacoplado de los componentes UI.
 * Diseñado para actualizar textos o ponderaciones luego de la entrevista con Solana
 * sin modificar la vista `QuestionStep.tsx`.
 */
export const OPTICAL_WIZARD_QUESTIONS: readonly WizardQuestionDefinition[] = [
  {
    id: 'visionNeed',
    stepNumber: 1,
    categoryBadge: 'Paso 1 de 5 · Distancia Visual',
    title: '¿Para qué distancia necesitás principalmente tus nuevos cristales?',
    subtitle:
      'Elegí la opción que mejor describa tu receta oftalmológica o tu necesidad cotidiana.',
    options: [
      {
        value: 'single_distance',
        label: 'Visión Sencilla (Lejos o Cerca)',
        description:
          'Necesito ver nítido a una sola distancia principal (para usar todo el día, manejar o leer de cerca).',
        clinicalHint: 'Familia Monofocal',
        badgeText: 'Más elegido',
      },
      {
        value: 'near_and_far',
        label: 'Lejos y Cerca en el mismo anteojo (Multifocal)',
        description:
          'Quiero ver bien de lejos, a distancia intermedia (PC/tablero) y leer el celular sin cambiar de lentes.',
        clinicalHint: 'Multifocal Progresivo Digital',
        badgeText: 'Todo en uno',
      },
      {
        value: 'visual_rest',
        label: 'Descanso Visual y Protección Digital',
        description:
          'No tengo aumento fuerte o son mis primeros lentes para aliviar fatiga ocular, ardor o dolor de cabeza.',
        clinicalHint: 'Descanso / Neutro o Bajas Dioptrías',
      },
    ],
  },
  {
    id: 'screenExposure',
    stepNumber: 2,
    categoryBadge: 'Paso 2 de 5 · Exposición Digital',
    title: '¿Cuántas horas al día usás pantallas (celular, computadora o tablet)?',
    subtitle:
      'La luz azul-violeta de las pantallas LED y la iluminación de oficina influyen directamente en el tratamiento ideal.',
    options: [
      {
        value: 'intensive_6h_plus',
        label: 'Uso Intensivo (Más de 6 horas por día)',
        description:
          'Trabajo o estudio frente a monitores y celular gran parte del día; siento cansancio visual al final de la tarde.',
        clinicalHint: 'Prioridad Filtro Blue Cut + Antirreflex',
        badgeText: 'Alta protección',
      },
      {
        value: 'moderate_3_to_6h',
        label: 'Uso Moderado (Entre 3 y 6 horas por día)',
        description:
          'Alterno momentos de pantalla con otras tareas cotidianas o atención al público.',
        clinicalHint: 'Filtro Azul Preventivo + Antirreflex',
      },
      {
        value: 'low_under_3h',
        label: 'Uso Bajo (Menos de 3 horas por día)',
        description:
          'Uso poco la computadora; priorizo máxima transparencia óptica y fácil limpieza.',
        clinicalHint: 'Antirreflex Multicapa Hidrofóbico',
      },
    ],
  },
  {
    id: 'lightSensitivity',
    stepNumber: 3,
    categoryBadge: 'Paso 3 de 5 · Sol y Conducción en Salta',
    title: '¿Cómo te afecta el sol de Salta o las luces al manejar?',
    subtitle:
      'La radiación UV en nuestra región es elevada durante todo el año y puede requerir adaptación automática a la luz.',
    options: [
      {
        value: 'outdoor_commute',
        label: 'Me molesta el sol al salir y quiero que se oscurezcan solos',
        description:
          'Entro y salgo frecuentemente; busco cristales claros adentro que se oscurezcan automáticamente al sol.',
        clinicalHint: 'Tecnología Fotocromática UV400',
        badgeText: '2 en 1 Inteligente',
      },
      {
        value: 'day_night_driving',
        label: 'Manejo frecuentemente (de día o de noche)',
        description:
          'Busco reducir los reflejos de los faros LED en ruta/ciudad y descansar la vista al conducir.',
        clinicalHint: 'Antirreflex de Alta Definición + UV',
      },
      {
        value: 'mostly_indoors',
        label: 'Los uso principalmente en interiores',
        description:
          'Trabajo bajo luz artificial o en casa y prefiero cristales totalmente transparentes todo el tiempo.',
        clinicalHint: 'Cristal Claro con Filtro Selectivo',
      },
    ],
  },
  {
    id: 'graduationSeverity',
    stepNumber: 4,
    categoryBadge: 'Paso 4 de 5 · Graduación y Espesor',
    title: '¿Cómo describirías el aumento de tu receta médica?',
    subtitle:
      'Esto nos permite calcular el índice de delgadez ideal y distinguir entre Rango de Stock y Rango de Laboratorio.',
    options: [
      {
        value: 'neutral_or_low',
        label: 'Aumento Bajo o Descanso (Hasta ±2.00 dioptrías)',
        description:
          'Mis cristales suelen ser livianos y delgados, o busco lentes de descanso.',
        clinicalHint: 'Ingresa en Rango Stock Estándar',
      },
      {
        value: 'moderate_up_to_4',
        label: 'Aumento Intermedio (Entre ±2.25 y ±4.00 dioptrías)',
        description:
          'Tengo miopía, hipermetropía o astigmatismo moderado y busco buen equilibrio entre estética y precio.',
        clinicalHint: 'Índice 1.56 / Policarbonato 1.59',
      },
      {
        value: 'high_plus_4',
        label: 'Aumento Alto (Más de ±4.00 D o astigmatismo fuerte)',
        description:
          'Quiero evitar el efecto de cristal grueso o pesado; priorizo cristales extra delgados y ultralivianos.',
        clinicalHint: 'Policarbonato 1.59 / Alto Índice 1.67 · Rango Lab',
        badgeText: 'Estética Ultradelgada',
      },
      {
        value: 'unknown_recipe',
        label: 'Tengo la receta médica pero no sé leer los valores',
        description:
          'Quiero ver el estimado en pantalla y enviarles la foto de mi receta por WhatsApp para que la verifiquen.',
        clinicalHint: 'Revisión Óptica Personalizada',
      },
    ],
  },
  {
    id: 'framePreference',
    stepNumber: 5,
    categoryBadge: 'Paso 5 de 5 · Armazón y Montura',
    title: '¿Necesitás también el armazón o ya tenés uno propio?',
    subtitle:
      'Informanos si querés ver modelos de armazones nuevos junto con tus cristales o si traés tu propia montura.',
    options: [
      {
        value: 'need_new_frame',
        label: 'Busco Armazón Nuevo + Cristales Completos',
        description:
          'Quiero que el equipo de ventas me envíe catálogo o fotos de armazones (acetato, metal o titanio) acordes a mi rostro y aumento.',
        clinicalHint: 'Cotización Integral: Cristales + Armazón Recetado',
        badgeText: 'Anteojo Completo',
      },
      {
        value: 'need_clip_on',
        label: 'Busco Armazón con Clip-On Magnético (Receta + Sol)',
        description:
          'Quiero un armazón recetado con frente imantado polarizado para convertirlo en lente de sol en un segundo.',
        clinicalHint: 'Línea Clip-On Magnético Polarizado UV400',
        badgeText: 'Tendencia 2 en 1',
      },
      {
        value: 'own_frame',
        label: 'Ya tengo mi propio armazón (Solo Cristales)',
        description:
          'Quiero conservar mi montura actual y encargar únicamente el tallado y calibración de los cristales nuevos.',
        clinicalHint: 'Adaptación y Biselado en Armazón del Cliente',
      },
      {
        value: 'undecided_frame',
        label: 'Quiero comparar ambas opciones con el asesor',
        description:
          'Tengo un armazón pero me gustaría conocer las promociones de armazón nuevo + cristales.',
        clinicalHint: 'Asesoramiento de Montura en Mostrador / WhatsApp',
      },
    ],
  },
] as const;
