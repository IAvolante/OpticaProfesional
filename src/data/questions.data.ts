import type { WizardQuestionDefinition } from '../types/optical.types';

/**
 * Árbol de preguntas oficial de Óptica Profesional (5 pasos definidos por Solana en PREGUNTAS .pdf).
 */
export const OPTICAL_WIZARD_QUESTIONS: readonly WizardQuestionDefinition[] = [
  {
    id: 'improvementGoal',
    stepNumber: 1,
    categoryBadge: 'Paso 1 de 5 · Material y Mejora Visual',
    title: '¿Qué es lo principal que querés mejorar con tus nuevos anteojos?',
    subtitle:
      'Seleccioná el aspecto principal que querés lograr con tus nuevos cristales.',
    options: [
      {
        value: 'organico_ar',
        label: 'Ver con mayor nitidez',
        description:
          'Visión clara y definida eliminando los reflejos molestos de las luces.',
        clinicalHint: 'Orgánico con Antirreflejo (AR)',
        badgeText: 'ORGÁNICO AR',
      },
      {
        value: 'organico_blue_ar',
        label: 'Sentir mayor comodidad visual cuando uso pantallas',
        description:
          'Alivio frente al cansancio visual por uso de computadora, celular o tablet.',
        clinicalHint: 'Filtro de Luz Azul + Antirreflejo',
        badgeText: 'ORGÁNICO BLUE AR',
      },
      {
        value: 'alto_indice',
        label: 'Tener cristales más finos y livianos',
        description:
          'Reducción de espesor y peso para una estética superior en tu armazón.',
        clinicalHint: 'Ultradelgados Índices 1.67 y 1.74',
        badgeText: 'ORGÁNICOS ALTO ÍNDICE (1.67 Y 1.74)',
      },
      {
        value: 'bifocal_multifocal',
        label: 'Evitar cambiar de anteojos para distintas distancias',
        description:
          'Ver bien de lejos, intermedia y cerca con un único par de anteojos.',
        clinicalHint: 'Progresivos Multifocales y Bifocales',
        badgeText: 'BIFOCAL Y MULTIFOCALES',
      },
      {
        value: 'filtro_fotocromatico',
        label: 'Manejar mejor, reflejos o molestias del sol',
        description:
          'Mayor confort al aire libre, reducción de encandilamiento y adaptación solar.',
        clinicalHint: 'Filtro UV400 / Fotocromático Inteligente',
        badgeText: 'ORGÁNICO CON FILTRO O FOTOCROMÁTICO',
      },
    ],
  },
  {
    id: 'activityContext',
    stepNumber: 2,
    categoryBadge: 'Paso 2 de 5 · Tu Rutina Diaria',
    title: '¿En qué actividades necesitás mayor comodidad visual?',
    subtitle:
      'Contanos en qué momento del día sentís que más necesitás tus cristales.',
    options: [
      {
        value: 'computadora_celular',
        label: 'Trabajando con la computadora o usando el celular.',
        description:
          'Jornadas de oficina, estudio o uso continuo de dispositivos digitales.',
        clinicalHint: 'Confort Digital y Enfoque Intermedio',
        badgeText: 'USO DIGITAL',
      },
      {
        value: 'lectura_cerca',
        label: 'Leyendo o realizando tareas de cerca.',
        description:
          'Lectura prolongada, estudio o actividades manuales de precisión.',
        clinicalHint: 'Nitidez en Visión Próxima',
        badgeText: 'VISIÓN DE CERCA',
      },
      {
        value: 'manejando_aire_libre',
        label: 'Manejando o realizando actividades al aire libre.',
        description:
          'Conducción en ciudad o ruta, exposición al sol y cambios de luz.',
        clinicalHint: 'Protección Exterior y Antirreflejo Vial',
        badgeText: 'MANEJO Y EXTERIOR',
      },
      {
        value: 'actividades_diarias',
        label: 'En todas mis actividades diarias.',
        description:
          'Uso permanente durante todo el día tanto en interiores como al salir.',
        clinicalHint: 'Solución Integral para Todo el Día',
        badgeText: 'TODO EL DÍA',
      },
    ],
  },
  {
    id: 'clientPriority',
    stepNumber: 3,
    categoryBadge: 'Paso 3 de 5 · Tu Prioridad',
    title: '¿Cuál es tu prioridad a la hora de elegir tus anteojos?',
    subtitle:
      'Así personalizamos las 2 alternativas que mejor se ajustan a lo que buscás.',
    options: [
      {
        value: 'precio',
        label: 'Encontrar un buen equilibrio entre calidad y precio',
        description:
          'Busco cuidar mi presupuesto sin resignar calidad óptica ni durabilidad.',
        clinicalHint: 'Mejor Relación Calidad / Precio',
        badgeText: 'PRECIO',
      },
      {
        value: 'tecnologia',
        label: 'Priorizo cristales con las últimas tecnologías del mercado',
        description:
          'Quiero la máxima protección visual, filtros avanzados y precisión digital.',
        clinicalHint: 'Innovación y Tratamientos Premium',
        badgeText: 'TECNOLOGÍA',
      },
      {
        value: 'moda',
        label: 'Que mis anteojos combinen con mi estilo y se vean bien estéticamente.',
        description:
          'Priorizo cristales delgados, sin reflejos y con terminación estética impecable.',
        clinicalHint: 'Estética, Delgadez y Transparencia',
        badgeText: 'MODA',
      },
      {
        value: 'solucion',
        label: 'Resolver mi necesidad visual de forma práctica, sin complicaciones.',
        description:
          'Quiero una recomendación clara, rápida y lista para usar cuanto antes.',
        clinicalHint: 'Practicidad y Rapidez de Entrega',
        badgeText: 'SOLUCIÓN',
      },
    ],
  },
  {
    id: 'budgetPreferences',
    stepNumber: 4,
    categoryBadge: 'Paso 4 de 5 · Beneficios para tu Presupuesto',
    title: '¿Datos útiles para tu presupuesto?',
    subtitle:
      'Podés seleccionar más de una opción para sumar todos tus beneficios en el cierre.',
    isMultiSelect: true,
    options: [
      {
        value: 'tengo_obra_social',
        label: 'Tengo obra social',
        description:
          'Si está en nuestra lista de prestadores, contás con un armazón estándar sin cargo al venir a probártelo.',
        clinicalHint: 'Beneficio Armazón Estándar Sin Cargo',
        badgeText: 'OBRA SOCIAL',
      },
      {
        value: 'soy_particular',
        label: 'Soy particular',
        description:
          'Cotización directa con el precio más competitivo y entrega rápida.',
        clinicalHint: 'Atención Directa Particular',
        badgeText: 'PARTICULAR',
      },
      {
        value: 'interes_cuotas_tarjeta',
        label: 'Me interesa conocer cuotas según mi tarjeta',
        description:
          'Opciones de financiación en cuotas según tu tarjeta bancaria.',
        clinicalHint: 'Financiación con Tarjeta',
        badgeText: 'CUOTAS',
      },
      {
        value: 'beneficio_pago_contado',
        label: 'Beneficio pago contado',
        description:
          'Bonificación especial abonando de contado en efectivo o transferencia.',
        clinicalHint: 'Descuento Especial Contado',
        badgeText: 'PAGO CONTADO',
      },
    ],
  },
  {
    id: 'prescriptionAttachment',
    stepNumber: 5,
    categoryBadge: 'Paso 5 de 5 · Tu Receta',
    title: '¿Querés adjuntarnos tu receta?',
    subtitle:
      'Si la tenés a mano, tocá para subir la foto ahora mismo y que se adjunte a tu consulta.',
    options: [
      {
        value: 'cargar_foto_receta',
        label: 'Cargar la foto de la receta',
        description:
          'Tocá acá para sacar una foto o elegirla de tu galería en un solo paso.',
        clinicalHint: 'Subida Directa desde tu Celular',
        badgeText: 'ADJUNTAR FOTO',
      },
      {
        value: 'aun_no_la_tengo',
        label: 'Aún no la tengo',
        description:
          'Ver directamente mis 2 opciones recomendadas y mi certificado de garantía de 12 meses.',
        clinicalHint: 'Ver Resultado Ahora',
        badgeText: 'CONTINUAR SIN RECETA',
      },
    ],
  },
] as const;
