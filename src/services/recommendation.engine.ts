import { FALLBACK_LENS_CATALOG } from '../data/catalog.fallback';
import type {
  ActivityContextAnswer,
  ClientPriorityAnswer,
  ClinicalTag,
  CompletedOpticalAnswers,
  ImprovementGoalAnswer,
  LensCatalogItem,
  OpticalRecommendationResult,
  RecommendedLensCardItem,
} from '../types/optical.types';

/**
 * ============================================================================
 * SISTEMA OFICIAL DE SCORING POR PUNTOS — ÓPTICA PROFESIONAL (`MATRICES CON PUNTOS.pdf`)
 * ============================================================================
 * Cada cristal suma los puntos (1 o 2) de todas las opciones seleccionadas por el
 * cliente en la Pregunta 1 (hasta 2 opciones), Pregunta 2 (hasta 2 opciones) y
 * Pregunta 3 (hasta 2 opciones), proponiendo siempre los 2 cristales con mayor puntaje.
 *
 * TABLA 1 — Pregunta 1: ¿Qué es lo principal que querés mejorar con tus nuevos anteojos?
 * - A Nitidez (`organico_ar`):          Orgánico Blanco (1), Orgánico AR (2), Orgánico Blue AR (1)
 * - B Pantallas (`organico_blue_ar`):   Orgánico AR (1), Orgánico Blue AR (2), Ocupacionales (1)
 * - C Finos (`alto_indice`):            Policarbonato AR (1), Orgánico 1.61 (2), Orgánico 1.67 (2)
 * - D Distancias (`bifocal_multifocal`):Ocupacionales (1), Bifocales (1), Multifocales (2)
 * - E Sol (`filtro_fotocromatico`):     Orgánico Fotocromático AR (2)
 *
 * TABLA 2 — Pregunta 2: ¿En qué actividades necesitás mayor comodidad visual?
 * - A Pantallas (`computadora_celular`):Orgánico AR (1), Orgánico Blue AR (2)
 * - B Lectura (`lectura_cerca`):        Orgánico Blanco (1), Orgánico AR (2), Orgánico Blue AR (1), Ocupacionales (2), Bifocales (2), Multifocales (1)
 * - C Manejar (`manejando_aire_libre`): Orgánico AR (2), Policarbonato AR (1)
 * - D Todas (`actividades_diarias`):    Orgánico Blanco (1), Orgánico AR (1), Orgánico Blue AR (1), Orgánico Fotocromático AR (1), Orgánico 1.61 (1), Orgánico 1.67 (1), Bifocales (1), Multifocales (2)
 *
 * TABLA 3 — Pregunta 3: ¿Cuál es tu prioridad a la hora de elegir tus anteojos?
 * - A Precio/calidad (`precio`):        Orgánico Blanco (2), Orgánico AR (2), Orgánico Blue AR (1), Policarbonato AR (1), Bifocales (1)
 * - B Tecnología (`tecnologia`):        Orgánico AR (1), Orgánico Blue AR (2), Orgánico Fotocromático AR (2), Policarbonato AR (1), Orgánico 1.61 (1), Orgánico 1.67 (2), Ocupacionales (2), Multifocales (2)
 * - C Moda (`moda`):                    Orgánico Fotocromático AR (1), Policarbonato AR (2), Orgánico 1.61 (2), Orgánico 1.67 (2), Multifocales (1)
 * - D Practicidad (`solucion`):         Orgánico Blanco (1), Orgánico AR (2), Orgánico Blue AR (2), Orgánico Fotocromático AR (2), Policarbonato AR (1), Orgánico 1.61 (1), Orgánico 1.67 (1), Ocupacionales (2), Bifocales (2), Multifocales (2)
 */
export interface ScoringMatrixRow {
  readonly sku: string;
  readonly p1Scores: Readonly<Partial<Record<ImprovementGoalAnswer, number>>>;
  readonly p2Scores: Readonly<Partial<Record<ActivityContextAnswer, number>>>;
  readonly p3Scores: Readonly<Partial<Record<ClientPriorityAnswer, number>>>;
  readonly isMultiDistanceGroup?: boolean;
}

export const MATRICES_CON_PUNTOS: readonly ScoringMatrixRow[] = [
  {
    sku: 'ORGANICO-BLANCO',
    p1Scores: {
      organico_ar: 1,
    },
    p2Scores: {
      lectura_cerca: 1,
      actividades_diarias: 1,
    },
    p3Scores: {
      precio: 2,
      solucion: 1,
    },
  },
  {
    sku: 'ORGANICO-AR',
    p1Scores: {
      organico_ar: 2,
      organico_blue_ar: 1,
    },
    p2Scores: {
      computadora_celular: 1,
      lectura_cerca: 2,
      manejando_aire_libre: 2,
      actividades_diarias: 1,
    },
    p3Scores: {
      precio: 2,
      tecnologia: 1,
      solucion: 2,
    },
  },
  {
    sku: 'ORGANICO-BLUE-AR',
    p1Scores: {
      organico_ar: 1,
      organico_blue_ar: 2,
    },
    p2Scores: {
      computadora_celular: 2,
      lectura_cerca: 1,
      actividades_diarias: 1,
    },
    p3Scores: {
      precio: 1,
      tecnologia: 2,
      solucion: 2,
    },
  },
  {
    sku: 'ORGANICO-FOTOCROMATICO',
    p1Scores: {
      filtro_fotocromatico: 2,
    },
    p2Scores: {
      actividades_diarias: 1,
    },
    p3Scores: {
      tecnologia: 2,
      moda: 1,
      solucion: 2,
    },
  },
  {
    sku: 'POLICARBONATO-AR',
    p1Scores: {
      alto_indice: 1,
    },
    p2Scores: {
      manejando_aire_libre: 1,
    },
    p3Scores: {
      precio: 1,
      tecnologia: 1,
      moda: 2,
      solucion: 1,
    },
  },
  {
    sku: 'ORGANICO-161',
    p1Scores: {
      alto_indice: 2,
    },
    p2Scores: {
      actividades_diarias: 1,
    },
    p3Scores: {
      tecnologia: 1,
      moda: 2,
      solucion: 1,
    },
  },
  {
    sku: 'ALTO-INDICE-167',
    p1Scores: {
      alto_indice: 2,
    },
    p2Scores: {
      actividades_diarias: 1,
    },
    p3Scores: {
      tecnologia: 2,
      moda: 2,
      solucion: 1,
    },
  },
  {
    sku: 'OCUPACIONALES',
    p1Scores: {
      organico_blue_ar: 1,
      bifocal_multifocal: 1,
    },
    p2Scores: {
      lectura_cerca: 2,
    },
    p3Scores: {
      tecnologia: 2,
      solucion: 2,
    },
    isMultiDistanceGroup: true,
  },
  {
    sku: 'BIFOCAL-AR',
    p1Scores: {
      bifocal_multifocal: 1,
    },
    p2Scores: {
      lectura_cerca: 2,
      actividades_diarias: 1,
    },
    p3Scores: {
      precio: 1,
      solucion: 2,
    },
    isMultiDistanceGroup: true,
  },
  {
    sku: 'MULTIFOCAL-AR',
    p1Scores: {
      bifocal_multifocal: 2,
    },
    p2Scores: {
      lectura_cerca: 1,
      actividades_diarias: 2,
    },
    p3Scores: {
      tecnologia: 2,
      moda: 1,
      solucion: 2,
    },
    isMultiDistanceGroup: true,
  },
] as const;

function resolveLensBySku(
  sku: string,
  catalog: readonly LensCatalogItem[]
): LensCatalogItem {
  const fromActiveCatalog = catalog.find((item) => item.sku === sku);
  if (fromActiveCatalog) {
    return fromActiveCatalog;
  }

  const fromFallback = FALLBACK_LENS_CATALOG.find((item) => item.sku === sku);
  if (fromFallback) {
    return fromFallback;
  }

  const firstActive = catalog[0];
  if (firstActive) {
    return firstActive;
  }

  return FALLBACK_LENS_CATALOG[0] as LensCatalogItem;
}

/**
 * Construye el párrafo empático personalizado del Asesor Virtual contemplando hasta 2 elecciones por paso.
 */
function buildAdvisorObservation(answers: CompletedOpticalAnswers): string {
  const activityClause: Record<ActivityContextAnswer, string> = {
    computadora_celular:
      'pasás muchas horas frente a la computadora o el celular',
    lectura_cerca:
      'dedicás tiempo a la lectura y tareas de precisión de cerca',
    manejando_aire_libre:
      'manejás frecuentemente o realizás actividades al aire libre',
    actividades_diarias:
      'usás tus anteojos de forma continua en todas tus actividades diarias',
  };

  const priorityClause: Record<ClientPriorityAnswer, string> = {
    precio: 'buscás mayor comodidad visual durante el día, sin gastar de más',
    tecnologia:
      'priorizás contar con las últimas tecnologías ópticas para cuidar tu vista',
    moda: 'buscás que tus cristales se vean estéticos, delgados y combinen con tu estilo',
    solucion:
      'querés resolver tu necesidad visual de forma práctica, rápida y sin complicaciones',
  };

  const selectedActivities =
    answers.activityContexts && answers.activityContexts.length > 0
      ? answers.activityContexts
      : [answers.activityContext];

  const firstActivityText = activityClause[selectedActivities[0]!];
  const secondActivityText =
    selectedActivities.length > 1 && selectedActivities[1]
      ? `, además de que ${activityClause[selectedActivities[1]]}`
      : '';

  return `Por lo que nos contás, ${firstActivityText}${secondActivityText}, y ${priorityClause[answers.clientPriority]}.`;
}

/**
 * Devuelve el subtítulo corto de cada tarjeta en base a su distancia y beneficio.
 */
function buildCardTaglineForSku(
  sku: string,
  lens: LensCatalogItem,
  matchedQuestions: readonly ('P1' | 'P2' | 'P3')[]
): string {
  switch (sku) {
    case 'ORGANICO-BLANCO':
      return 'monofocal · Calidad y precio';
    case 'ORGANICO-AR':
      return 'monofocal · Mayor nitidez AR';
    case 'ORGANICO-BLUE-AR':
      return 'monofocal · Filtro pantallas';
    case 'ORGANICO-FOTOCROMATICO':
      return 'monofocal · Sol y manejo';
    case 'POLICARBONATO-AR':
      return 'monofocal · Fino y resistente';
    case 'ORGANICO-161':
      return 'monofocal · Delgado todo el día';
    case 'ALTO-INDICE-167':
      return 'monofocal · Ultradelgado 1,67';
    case 'OCUPACIONALES':
      return 'lejos/intermedia · Escritorio y cerca';
    case 'BIFOCAL-AR':
      return 'lejos/cerca · Doble enfoque';
    case 'MULTIFOCAL-AR':
      return 'lejos/intermedia/cerca · Progresivo';
    default:
      return matchedQuestions.length > 1
        ? `${lens.visionRangeLabel ?? 'monofocal'} · Ideal para tu rutina`
        : lens.shortBadge;
  }
}

interface ScoredLensCandidate {
  readonly sku: string;
  readonly lens: LensCatalogItem;
  readonly totalPoints: number;
  readonly p1Points: number;
  readonly p2Points: number;
  readonly p3Points: number;
  readonly matchedQuestions: readonly ('P1' | 'P2' | 'P3')[];
  readonly matrixIndex: number;
}

/**
 * MOTOR DETERMINÍSTICO DE SCORING POR PUNTOS — ÓPTICA PROFESIONAL (`MATRICES CON PUNTOS.pdf`)
 * Suma los puntos de las respuestas seleccionadas en la Pregunta 1 (hasta 2),
 * Pregunta 2 (hasta 2) y Pregunta 3 (hasta 2), y propone las 2 opciones que más puntos tengan.
 */
export function calculateOpticalRecommendation(
  answers: CompletedOpticalAnswers,
  catalog: readonly LensCatalogItem[] = FALLBACK_LENS_CATALOG
): OpticalRecommendationResult {
  const selectedP1: readonly ImprovementGoalAnswer[] =
    answers.improvementGoals && answers.improvementGoals.length > 0
      ? answers.improvementGoals.slice(0, 2)
      : [answers.improvementGoal];

  const selectedP2: readonly ActivityContextAnswer[] =
    answers.activityContexts && answers.activityContexts.length > 0
      ? answers.activityContexts.slice(0, 2)
      : [answers.activityContext];

  const selectedP3: readonly ClientPriorityAnswer[] =
    answers.clientPriorities && answers.clientPriorities.length > 0
      ? answers.clientPriorities.slice(0, 2)
      : [answers.clientPriority];

  const scoredCandidates: ScoredLensCandidate[] = MATRICES_CON_PUNTOS.map(
    (row, matrixIndex) => {
      const p1Points = selectedP1.reduce(
        (sum, ans) => sum + (row.p1Scores[ans] ?? 0),
        0
      );
      const p2Points = selectedP2.reduce(
        (sum, ans) => sum + (row.p2Scores[ans] ?? 0),
        0
      );
      const p3Points = selectedP3.reduce(
        (sum, ans) => sum + (row.p3Scores[ans] ?? 0),
        0
      );

      const totalPoints = p1Points + p2Points + p3Points;

      const matchedQuestions: ('P1' | 'P2' | 'P3')[] = [];
      if (p1Points > 0) matchedQuestions.push('P1');
      if (p2Points > 0) matchedQuestions.push('P2');
      if (p3Points > 0) matchedQuestions.push('P3');

      return {
        sku: row.sku,
        lens: resolveLensBySku(row.sku, catalog),
        totalPoints,
        p1Points,
        p2Points,
        p3Points,
        matchedQuestions,
        matrixIndex,
      };
    }
  );

  // Ordenamos de mayor a menor puntaje total.
  // En caso de empate exacto en puntos totales, desempatamos por:
  // 1) Mayor puntaje en la Pregunta 1 (lo principal que quiere mejorar)
  // 2) Mayor puntaje en la Pregunta 2 (su actividad principal)
  // 3) Mayor puntaje en la Pregunta 3 (su prioridad)
  // 4) Orden en la tabla oficial del PDF
  const sortedByScore = [...scoredCandidates].sort(
    (a, b) =>
      b.totalPoints - a.totalPoints ||
      b.p1Points - a.p1Points ||
      b.p2Points - a.p2Points ||
      b.p3Points - a.p3Points ||
      a.matrixIndex - b.matrixIndex
  );

  const firstWinner = sortedByScore[0]!;
  const secondWinner = sortedByScore[1]!;

  // Si ambos ganadores tienen precio numérico de stock, mostramos el más accesible como Opción 1 y el superador como Opción 2
  const shouldSwapByPrice =
    firstWinner.lens.priceStockARS > 0 &&
    secondWinner.lens.priceStockARS > 0 &&
    firstWinner.lens.priceStockARS > secondWinner.lens.priceStockARS;

  const topTwoWinners: readonly [ScoredLensCandidate, ScoredLensCandidate] =
    shouldSwapByPrice
      ? [secondWinner, firstWinner]
      : [firstWinner, secondWinner];

  const allMatchedOptions: RecommendedLensCardItem[] = topTwoWinners.map(
    (entry, index) => ({
      optionNumber: index + 1,
      lens: entry.lens,
      tagline: buildCardTaglineForSku(
        entry.sku,
        entry.lens,
        entry.matchedQuestions
      ),
      matchedQuestions:
        entry.matchedQuestions.length > 0 ? entry.matchedQuestions : ['P1'],
      totalPoints: entry.totalPoints,
    })
  );

  const primaryItem = allMatchedOptions[0]!;
  const alternativeItem = allMatchedOptions[1]!;

  const reasoning: string[] = [
    `Recomendación calculada con el sistema de puntuación clínica de Óptica Profesional (${primaryItem.lens.commercialName}: ${primaryItem.totalPoints ?? 0} pts · ${alternativeItem.lens.commercialName}: ${alternativeItem.totalPoints ?? 0} pts).`,
  ];

  const tags: ClinicalTag[] = allMatchedOptions.map((item) => ({
    id: `tag-${item.lens.sku.toLowerCase()}`,
    label: `${item.lens.commercialName} (${item.lens.visionRangeLabel ?? 'monofocal'})`,
    category: item.lens.family === 'MONOFOCAL' ? 'material' : 'optics',
  }));

  if (answers.budgetPreferences.includes('tengo_obra_social')) {
    tags.push({
      id: 'tag-obra-social',
      label: 'Obra Social · ¡Armazón Sin Cargo Seleccionado!',
      category: 'range',
    });
    reasoning.push(
      '¡Si tenés obra social, tenés un armazón sin cargo seleccionado!'
    );
  }

  if (answers.budgetPreferences.includes('beneficio_pago_contado')) {
    tags.push({
      id: 'tag-contado',
      label: 'Contado · Consultar Beneficios por WhatsApp',
      category: 'range',
    });
  }

  if (answers.budgetPreferences.includes('interes_cuotas_tarjeta')) {
    tags.push({
      id: 'tag-cuotas',
      label: '12 Cuotas Naranja X · 6 Cuotas Macro',
      category: 'range',
    });
  }

  const advisorObservationParagraph = buildAdvisorObservation(answers);
  const advisorClosingParagraph =
    'Por eso, seleccionamos las dos alternativas con mayor puntaje para tu rutina, para que puedas elegir la que mejor se ajuste a lo que necesitás.';

  const requiresLabRangeWarning = allMatchedOptions.some(
    (item) => !item.lens.hasAnnualReplacementPromo
  );

  const hasMonofocalOption = allMatchedOptions.some(
    (item) => item.lens.hasAnnualReplacementPromo
  );

  const estimatedRangeNote = hasMonofocalOption
    ? 'Incluye Certificado de Garantía Exclusivo en cristales monofocales: 1 recambio sin cargo de la misma categoría y características durante los próximos 12 meses.'
    : 'Cristales fabricados a medida según graduación y mediciones oculares en gabinete óptico.';

  return {
    primaryOption: primaryItem.lens,
    primaryCardTagline: primaryItem.tagline,
    alternativeOption: alternativeItem.lens,
    alternativeCardTagline: alternativeItem.tagline,
    allMatchedOptions,
    advisorObservationParagraph,
    advisorClosingParagraph,
    alternativeUpgradeReason: alternativeItem.lens.idealForSummary,
    personalizedReasoning: reasoning,
    clinicalTags: tags,
    requiresLabRangeWarning,
    estimatedRangeNote,
  };
}
