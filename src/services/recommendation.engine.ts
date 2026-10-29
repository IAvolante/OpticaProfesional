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
 * Matriz oficial de cruces ('x') provista por los profesionales de Óptica Profesional en `encuesta.xlsx`.
 *
 * - Pregunta 1 (a..e):
 *   a: organico_ar           -> ORGANICO-AR ($42.000)
 *   b: organico_blue_ar      -> ORGANICO-BLUE-AR ($51.000)
 *   c: alto_indice           -> POLICARBONATO-AR (Según receta), ALTO-INDICE-167 ($150.000)
 *   d: bifocal_multifocal    -> OCUPACIONALES (Desde), BIFOCAL-AR (Desde), MULTIFOCAL-AR (Desde)
 *   e: filtro_fotocromatico  -> ORGANICO-FOTOCROMATICO ($104.000)
 *
 * - Pregunta 2 (a..d):
 *   a: computadora_celular   -> ORGANICO-BLUE-AR ($51.000)
 *   b: lectura_cerca         -> OCUPACIONALES (Desde), BIFOCAL-AR (Desde), MULTIFOCAL-AR (Desde)
 *   c: manejando_aire_libre  -> ORGANICO-FOTOCROMATICO ($104.000)
 *   d: actividades_diarias   -> ORGANICO-161 ($130.000)
 *
 * - Pregunta 3 (a..d):
 *   a: precio                -> ORGANICO-BLANCO ($36.000)
 *   b: tecnologia            -> ALTO-INDICE-167 ($150.000), OCUPACIONALES (Desde), BIFOCAL-AR (Desde), MULTIFOCAL-AR (Desde)
 *   c: moda                  -> ORGANICO-161 ($130.000), ALTO-INDICE-167 ($150.000)
 *   d: solucion              -> ORGANICO-BLUE-AR ($51.000), ORGANICO-161 ($130.000)
 */
interface MatrixRowRule {
  readonly sku: string;
  readonly p1: readonly ImprovementGoalAnswer[];
  readonly p2: readonly ActivityContextAnswer[];
  readonly p3: readonly ClientPriorityAnswer[];
  readonly isMultiDistanceGroup?: boolean;
}

export const ENCUESTA_XLSX_MATRIX: readonly MatrixRowRule[] = [
  {
    sku: 'ORGANICO-BLANCO',
    p1: [],
    p2: [],
    p3: ['precio'],
  },
  {
    sku: 'ORGANICO-AR',
    p1: ['organico_ar'],
    p2: [],
    p3: [],
  },
  {
    sku: 'ORGANICO-BLUE-AR',
    p1: ['organico_blue_ar'],
    p2: ['computadora_celular'],
    p3: ['solucion'],
  },
  {
    sku: 'ORGANICO-FOTOCROMATICO',
    p1: ['filtro_fotocromatico'],
    p2: ['manejando_aire_libre'],
    p3: [],
  },
  {
    sku: 'POLICARBONATO-AR',
    p1: ['alto_indice'],
    p2: [],
    p3: [],
  },
  {
    sku: 'ORGANICO-161',
    p1: [],
    p2: ['actividades_diarias'],
    p3: ['moda', 'solucion'],
  },
  {
    sku: 'ALTO-INDICE-167',
    p1: ['alto_indice'],
    p2: [],
    p3: ['tecnologia', 'moda'],
  },
  {
    sku: 'OCUPACIONALES',
    p1: ['bifocal_multifocal'],
    p2: ['lectura_cerca'],
    p3: ['tecnologia'],
    isMultiDistanceGroup: true,
  },
  {
    sku: 'BIFOCAL-AR',
    p1: ['bifocal_multifocal'],
    p2: ['lectura_cerca'],
    p3: ['tecnologia'],
    isMultiDistanceGroup: true,
  },
  {
    sku: 'MULTIFOCAL-AR',
    p1: ['bifocal_multifocal'],
    p2: ['lectura_cerca'],
    p3: ['tecnologia'],
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
 * Construye el párrafo empático personalizado del Asesor Virtual siguiendo el tono exacto
 * del ejemplo de cierre de Solana en PREGUNTAS .pdf.
 */
function buildAdvisorObservation(answers: CompletedOpticalAnswers): string {
  const activityClause: Record<CompletedOpticalAnswers['activityContext'], string> = {
    computadora_celular:
      'pasás muchas horas frente a la computadora o el celular',
    lectura_cerca:
      'dedicás tiempo a la lectura y tareas de precisión de cerca',
    manejando_aire_libre:
      'manejás frecuentemente o realizás actividades al aire libre',
    actividades_diarias:
      'usás tus anteojos de forma continua en todas tus actividades diarias',
  };

  const priorityClause: Record<CompletedOpticalAnswers['clientPriority'], string> = {
    precio: 'buscás mayor comodidad visual durante el día, sin gastar de más',
    tecnologia:
      'priorizás contar con las últimas tecnologías ópticas para cuidar tu vista',
    moda: 'buscás que tus cristales se vean estéticos, delgados y combinen con tu estilo',
    solucion:
      'querés resolver tu necesidad visual de forma práctica, rápida y sin complicaciones',
  };

  return `Por lo que nos contás, ${activityClause[answers.activityContext]} y ${priorityClause[answers.clientPriority]}.`;
}

/**
 * Devuelve el subtítulo corto de cada tarjeta en base a la columna B de `encuesta.xlsx` y su beneficio.
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

/**
 * MOTOR DETERMINÍSTICO DE RECOMENDACIÓN — ÓPTICA PROFESIONAL (2026)
 * Implementa 100% la matriz de `encuesta.xlsx` elaborada por los profesionales de la óptica.
 */
export function calculateOpticalRecommendation(
  answers: CompletedOpticalAnswers,
  catalog: readonly LensCatalogItem[] = FALLBACK_LENS_CATALOG
): OpticalRecommendationResult {
  const isMultiDistanceNeed =
    answers.improvementGoal === 'bifocal_multifocal' ||
    answers.activityContext === 'lectura_cerca';

  interface ScoredMatrixEntry {
    readonly sku: string;
    readonly lens: LensCatalogItem;
    readonly matchedQuestions: readonly ('P1' | 'P2' | 'P3')[];
    readonly score: number;
    readonly tieBreakOrder: number;
  }

  // Orden de prioridad dentro del trío multi-distancia según la actividad (P2)
  const multiDistanceOrder: Record<string, number> =
    answers.activityContext === 'computadora_celular'
      ? { 'OCUPACIONALES': 1, 'MULTIFOCAL-AR': 2, 'BIFOCAL-AR': 3 }
      : { 'BIFOCAL-AR': 1, 'MULTIFOCAL-AR': 2, 'OCUPACIONALES': 3 };

  const scoredEntries: ScoredMatrixEntry[] = [];

  ENCUESTA_XLSX_MATRIX.forEach((rule, idx) => {
    const hitP1 = rule.p1.includes(answers.improvementGoal);
    const hitP2 = rule.p2.includes(answers.activityContext);
    const hitP3 = rule.p3.includes(answers.clientPriority);

    // En la columna P3b ("Últimas tecnologías"), encuesta.xlsx marca Orgánico 1,67 (monofocal)
    // y Ocupacionales/Bifocales/Multifocales (múltiples distancias).
    // Si el usuario NO pidió múltiples distancias en P1 ni lectura de cerca en P2,
    // aplicamos el cruce de P3b al monofocal (Orgánico 1,67) para no sugerir bifocales a quien busca monofocales.
    if (rule.isMultiDistanceGroup && !isMultiDistanceNeed) {
      return;
    }

    const matchedQuestions: ('P1' | 'P2' | 'P3')[] = [];
    if (hitP1) matchedQuestions.push('P1');
    if (hitP2) matchedQuestions.push('P2');
    if (hitP3) matchedQuestions.push('P3');

    if (matchedQuestions.length === 0) {
      return;
    }

    // Ponderación clínica:
    // - P1 (mejora principal elegida) asegura presencia en las opciones principales (+100)
    // - P2 (actividad diaria) define la solución (+75)
    // - P3 (prioridad del cliente) refina o desempata (+50)
    let score =
      (hitP1 ? 100 : 0) + (hitP2 ? 75 : 0) + (hitP3 ? 50 : 0);

    // Si en P1 eligió "Tener cristales más finos y livianos" (alto_indice) y en P2+P3 sumó doble coincidencia en Orgánico 1,61,
    // elevamos Orgánico 1,61 para acompañar a Orgánico 1,67 y Policarbonato Ar.
    if (
      answers.improvementGoal === 'alto_indice' &&
      rule.sku === 'ORGANICO-161' &&
      hitP2 &&
      hitP3
    ) {
      score += 20;
    }

    const lens = resolveLensBySku(rule.sku, catalog);
    const tieBreakOrder = rule.isMultiDistanceGroup
      ? 20 + (multiDistanceOrder[rule.sku] ?? idx)
      : idx;

    scoredEntries.push({
      sku: rule.sku,
      lens,
      matchedQuestions,
      score,
      tieBreakOrder,
    });
  });

  // Ordenar de mayor puntaje clínico a menor
  scoredEntries.sort(
    (a, b) => b.score - a.score || a.tieBreakOrder - b.tieBreakOrder
  );

  // Garantía defensiva: siempre al menos 2 opciones
  if (scoredEntries.length < 2) {
    const fallbackSkus = ['ORGANICO-AR', 'ORGANICO-BLUE-AR'];
    for (const fSku of fallbackSkus) {
      if (!scoredEntries.some((e) => e.sku === fSku)) {
        scoredEntries.push({
          sku: fSku,
          lens: resolveLensBySku(fSku, catalog),
          matchedQuestions: ['P1'],
          score: 10,
          tieBreakOrder: 99,
        });
      }
      if (scoredEntries.length >= 2) break;
    }
  }

  // Tomamos las 2 opciones principales y, si son ambas monofocales con precio numérico,
  // ponemos la de menor valor como Opción 1 y la superior como Opción 2 (tal cual el Ejemplo de Cierre del PDF de Solana).
  const firstCandidate = scoredEntries[0]!;
  const secondCandidate = scoredEntries[1]!;

  const shouldSwapFirstTwoByPrice =
    firstCandidate.lens.priceStockARS > 0 &&
    secondCandidate.lens.priceStockARS > 0 &&
    firstCandidate.lens.priceStockARS > secondCandidate.lens.priceStockARS;

  const orderedEntries: ScoredMatrixEntry[] = shouldSwapFirstTwoByPrice
    ? [secondCandidate, firstCandidate, ...scoredEntries.slice(2)]
    : scoredEntries;

  const allMatchedOptions: RecommendedLensCardItem[] = orderedEntries.map(
    (entry, index) => ({
      optionNumber: index + 1,
      lens: entry.lens,
      tagline: buildCardTaglineForSku(
        entry.sku,
        entry.lens,
        entry.matchedQuestions
      ),
      matchedQuestions: entry.matchedQuestions,
    })
  );

  const primaryItem = allMatchedOptions[0]!;
  const alternativeItem = allMatchedOptions[1]!;

  const reasoning: string[] = [
    `Recomendación calculada según la matriz profesional de Óptica Profesional combinando tus respuestas de Mejora Principal, Actividad Diaria y Prioridad.`,
  ];

  const tags: ClinicalTag[] = allMatchedOptions.slice(0, 3).map((item) => ({
    id: `tag-${item.lens.sku.toLowerCase()}`,
    label: `${item.lens.commercialName} (${item.lens.visionRangeLabel ?? 'monofocal'})`,
    category: item.lens.family === 'MONOFOCAL' ? 'material' : 'optics',
  }));

  if (answers.budgetPreferences.includes('tengo_obra_social')) {
    tags.push({
      id: 'tag-obra-social',
      label: 'Obra Social · Armazón Estándar Sin Cargo',
      category: 'range',
    });
    reasoning.push(
      'Recordá que si tu Obra Social está en nuestra lista de prestadores, contás con un armazón estándar sin cargo al probarlo en la óptica.'
    );
  }

  if (answers.budgetPreferences.includes('beneficio_pago_contado')) {
    tags.push({
      id: 'tag-contado',
      label: 'Beneficio Pago Contado',
      category: 'range',
    });
  }

  if (answers.budgetPreferences.includes('interes_cuotas_tarjeta')) {
    tags.push({
      id: 'tag-cuotas',
      label: 'Financiación según Tarjeta',
      category: 'range',
    });
  }

  const advisorObservationParagraph = buildAdvisorObservation(answers);
  const advisorClosingParagraph =
    allMatchedOptions.length > 2
      ? 'Por eso, seleccionamos las alternativas de nuestra matriz óptica que se adaptan a tu rutina, para que puedas elegir la que mejor se ajuste a lo que necesitás.'
      : 'Por eso, seleccionamos dos alternativas que se adaptan a tu rutina, para que puedas elegir la que mejor se ajuste a lo que necesitás.';

  const requiresLabRangeWarning = isMultiDistanceNeed;

  const estimatedRangeNote =
    'Incluye Certificado de Garantía Exclusivo: 1 recambio de cristales sin cargo de la misma categoría y características durante los próximos 12 meses.';

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
