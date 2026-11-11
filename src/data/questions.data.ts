import type { WizardQuestionDefinition } from '../types/optical.types';

/**
 * Árbol de preguntas oficial de Óptica Profesional (5 pasos definidos por Solana en PREGUNTAS .pdf y reunión del 30/10):
 * - Sin cartelitos técnicos internos (`badgeText` eliminado en todas las opciones según pedido de Solana).
 * - Selección única en las 5 preguntas (incluyendo el Paso 4 de presupuesto).
 */
export const OPTICAL_WIZARD_QUESTIONS: readonly WizardQuestionDefinition[] = [
  {
    id: 'improvementGoal',
    stepNumber: 1,
    categoryBadge: 'Paso 1 de 5 · Material y Mejora Visual',
    title: '¿Qué es lo principal que querés mejorar con tus nuevos anteojos?',
    subtitle:
      'Podés seleccionar hasta 2 opciones para tus nuevos cristales.',
    isMultiSelect: true,
    maxSelections: 2,
    options: [
      {
        value: 'organico_ar',
        label: 'Ver con mayor nitidez',
        description:
          'Visión clara y definida eliminando los reflejos molestos de las luces.',
        clinicalHint: 'Orgánico con Antirreflejo (AR)',
      },
      {
        value: 'organico_blue_ar',
        label: 'Sentir mayor comodidad visual cuando uso pantallas',
        description:
          'Alivio frente al cansancio visual por uso de computadora, celular o tablet.',
        clinicalHint: 'Filtro de Luz Azul + Antirreflejo',
      },
      {
        value: 'alto_indice',
        label: 'Tener cristales más finos y livianos',
        description:
          'Reducción de espesor y peso para una estética superior en tu armazón.',
        clinicalHint: 'Policarbonato AR y Orgánicos 1,61 / 1,67',
      },
      {
        value: 'bifocal_multifocal',
        label: 'Evitar cambiar de anteojos para distintas distancias',
        description:
          'Ver bien de lejos, intermedia y cerca con un único par de anteojos.',
        clinicalHint: 'Ocupacionales, Bifocales y Multifocales',
      },
      {
        value: 'filtro_fotocromatico',
        label: 'Manejar mejor, reflejos o molestias del sol',
        description:
          'Mayor confort al aire libre, reducción de encandilamiento y adaptación solar.',
        clinicalHint: 'Orgánico Fotocromático con Antirreflejo',
      },
    ],
  },
  {
    id: 'activityContext',
    stepNumber: 2,
    categoryBadge: 'Paso 2 de 5 · Tu Rutina Diaria',
    title: '¿En qué actividades necesitás mayor comodidad visual?',
    subtitle:
      'Podés seleccionar hasta 2 actividades principales de tu día a día.',
    isMultiSelect: true,
    maxSelections: 2,
    options: [
      {
        value: 'computadora_celular',
        label: 'Trabajando con la computadora o usando el celular.',
        description:
          'Jornadas de oficina, estudio o uso continuo de dispositivos digitales.',
        clinicalHint: 'Confort Digital y Enfoque Intermedio',
      },
      {
        value: 'lectura_cerca',
        label: 'Leyendo o realizando tareas de cerca.',
        description:
          'Lectura prolongada, estudio o actividades manuales de precisión.',
        clinicalHint: 'Nitidez en Visión Próxima',
      },
      {
        value: 'manejando_aire_libre',
        label: 'Manejando o realizando actividades al aire libre.',
        description:
          'Conducción en ciudad o ruta, exposición al sol y cambios de luz.',
        clinicalHint: 'Protección Exterior y Antirreflejo Vial',
      },
      {
        value: 'actividades_diarias',
        label: 'En todas mis actividades diarias.',
        description:
          'Uso permanente durante todo el día tanto en interiores como al salir.',
        clinicalHint: 'Solución Integral para Todo el Día',
      },
    ],
  },
  {
    id: 'clientPriority',
    stepNumber: 3,
    categoryBadge: 'Paso 3 de 5 · Tu Prioridad',
    title: '¿Cuál es tu prioridad a la hora de elegir tus anteojos?',
    subtitle:
      'Podés seleccionar hasta 2 prioridades para personalizar tus alternativas.',
    isMultiSelect: true,
    maxSelections: 2,
    options: [
      {
        value: 'precio',
        label: 'Encontrar un buen equilibrio entre calidad y precio',
        description:
          'Busco cuidar mi presupuesto sin resignar calidad óptica ni durabilidad.',
        clinicalHint: 'Mejor Relación Calidad / Precio',
      },
      {
        value: 'tecnologia',
        label: 'Priorizo cristales con las últimas tecnologías del mercado',
        description:
          'Quiero la máxima protección visual, filtros avanzados y precisión digital.',
        clinicalHint: 'Innovación y Tratamientos Premium',
      },
      {
        value: 'moda',
        label: 'Que mis anteojos combinen con mi estilo y se vean bien estéticamente.',
        description:
          'Priorizo cristales delgados, sin reflejos y con terminación estética impecable.',
        clinicalHint: 'Estética, Delgadez y Transparencia',
      },
      {
        value: 'solucion',
        label: 'Resolver mi necesidad visual de forma práctica, sin complicaciones.',
        description:
          'Quiero una recomendación clara, rápida y lista para usar cuanto antes.',
        clinicalHint: 'Practicidad y Rapidez de Entrega',
      },
    ],
  },
  {
    id: 'budgetPreferences',
    stepNumber: 4,
    categoryBadge: 'Paso 4 de 5 · Beneficios para tu Presupuesto',
    title: '¿Datos útiles para tu presupuesto?',
    subtitle:
      'Podés seleccionar todas las opciones que quieras sumar a tu presupuesto.',
    isMultiSelect: true,
    options: [
      {
        value: 'tengo_obra_social',
        label: 'Tengo obra social',
        description:
          '¡Si tenés obra social, tenés un armazón sin cargo seleccionado!',
        clinicalHint: 'Armazón Seleccionado Sin Cargo',
      },
      {
        value: 'soy_particular',
        label: 'Soy particular',
        description:
          'Cotización directa con el precio más competitivo y entrega rápida.',
        clinicalHint: 'Atención Directa Particular',
      },
      {
        value: 'interes_cuotas_tarjeta',
        label: 'Me interesa conocer cuotas según mi tarjeta',
        description:
          'Si pagás con tarjeta tenés 2 promos: 12 cuotas con Naranja X y 6 cuotas con Banco Macro.',
        clinicalHint: '12 Cuotas Naranja X · 6 Cuotas Macro',
      },
      {
        value: 'beneficio_pago_contado',
        label: 'Beneficio pago contado',
        description:
          'Consultanos por beneficios de contado a nuestro WhatsApp.',
        clinicalHint: 'Beneficios de Contado por WhatsApp',
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
      },
      {
        value: 'aun_no_la_tengo',
        label: 'Aún no la tengo',
        description:
          'Ver directamente mis opciones recomendadas según mis respuestas.',
        clinicalHint: 'Ver Resultado Ahora',
      },
    ],
  },
] as const;
