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
 * Jerarquía clínica estricta:
 * 1. La Pregunta 1 (`improvementGoal`) actúa como filtro maestro de familia:
 *    - Solo si el usuario elige `bifocal_multifocal` ("Evitar cambiar de anteojos para distintas distancias")
 *      se habilitan Ocupacionales, Bifocales y Multifocales, devolviendo exactamente las 2 mejores opciones
 *      multi-distancia según su actividad (P2).
 *    - Si el usuario elige cualquiera de las otras 4 opciones en P1, busca un cristal MONOFOCAL y jamás
 *      se le mezclan Ocupacionales, Bifocales ni Multifocales.
 * 2. El resultado final devuelve SIEMPRE exactamente 2 opciones (`Opción 1` y `Opción 2`), tal cual el
 *    diseño de cierre oficial de Solana en `PREGUNTAS .pdf`.
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
    p2: ['computadora_celular', 'lectura_cerca'],
    p3: ['tecnologia', 'solucion'],
    isMultiDistanceGroup: true,
  },
  {
    sku: 'BIFOCAL-AR',
    p1: ['bifocal_multifocal'],
    p2: ['lectura_cerca', 'manejando_aire_libre', 'actividades_diarias'],
    p3: ['precio', 'solucion'],
    isMultiDistanceGroup: true,
  },
  {
    sku: 'MULTIFOCAL-AR',
    p1: ['bifocal_multifocal'],
    p2: [
      'computadora_celular',
      'lectura_cerca',
      'manejando_aire_libre',
      'actividades_diarias',
    ],
    p3: ['tecnologia', 'moda', 'solucion', 'precio'],
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

interface ScoredMatrixEntry {
  readonly sku: string;
  readonly lens: LensCatalogItem;
  readonly matchedQuestions: readonly ('P1' | 'P2' | 'P3')[];
  readonly score: number;
  readonly tieBreakOrder: number;
}

/**
 * Resuelve la segunda opción complementaria monofocal cuando solo 1 cristal tuvo coincidencia directa
 * (ej: P1=organico_ar + P2=lectura_cerca + P3=tecnologia -> Opción 1: Orgánico AR, Opción 2: Orgánico Blue Ar).
 */
function resolveComplementaryMonofocalSku(
  primarySku: string,
  answers: CompletedOpticalAnswers
): string {
  if (answers.clientPriority === 'precio' && primarySku !== 'ORGANICO-BLANCO') {
    return 'ORGANICO-BLANCO';
  }
  if (answers.clientPriority === 'tecnologia' && primarySku !== 'ALTO-INDICE-167') {
    return 'ALTO-INDICE-167';
  }
  if (answers.clientPriority === 'moda' && primarySku !== 'ORGANICO-161') {
    return 'ORGANICO-161';
  }
  if (primarySku === 'ORGANICO-AR') {
    return 'ORGANICO-BLUE-AR';
  }
  if (primarySku === 'ORGANICO-BLUE-AR') {
    return 'ORGANICO-AR';
  }
  if (primarySku === 'ORGANICO-FOTOCROMATICO') {
    return answers.activityContext === 'computadora_celular'
      ? 'ORGANICO-BLUE-AR'
      : 'ORGANICO-AR';
  }
  return 'ORGANICO-BLUE-AR';
}

/**
 * MOTOR DETERMINÍSTICO DE RECOMENDACIÓN — ÓPTICA PROFESIONAL (2026)
 * - Segmenta estrictamente por la Pregunta 1: Ocupacionales/Bifocales/Multifocales SOLO aparecen
 *   si el cliente eligió `bifocal_multifocal` ("Evitar cambiar de anteojos para distintas distancias").
 * - Garantiza que el resultado final contenga SIEMPRE exactamente 2 opciones (`Opción 1` y `Opción 2`).
 */
export function calculateOpticalRecommendation(
  answers: CompletedOpticalAnswers,
  catalog: readonly LensCatalogItem[] = FALLBACK_LENS_CATALOG
): OpticalRecommendationResult {
  // Filtro maestro excluyente: solo es multi-distancia si lo pidió explícitamente en la Pregunta 1
  const isMultiDistanceNeed =
    answers.improvementGoal === 'bifocal_multifocal';

  let topTwoEntries: readonly [ScoredMatrixEntry, ScoredMatrixEntry];

  if (isMultiDistanceNeed) {
    // Si pidió evitar cambiar de anteojos para distintas distancias, seleccionamos exactamente 2 opciones
    // entre Ocupacionales, Bifocales y Multifocales según su actividad principal (P2):
    // - Uso de computadora/celular o lectura de cerca -> Opción 1: Ocupacionales | Opción 2: Multifocales
    // - Manejando/aire libre o Todas las actividades diarias -> Opción 1: Bifocales | Opción 2: Multifocales
    const firstMultiSku =
      answers.activityContext === 'computadora_celular' ||
      answers.activityContext === 'lectura_cerca'
        ? 'OCUPACIONALES'
        : 'BIFOCAL-AR';
    const secondMultiSku = 'MULTIFOCAL-AR';

    topTwoEntries = [
      {
        sku: firstMultiSku,
        lens: resolveLensBySku(firstMultiSku, catalog),
        matchedQuestions: ['P1', 'P2'],
        score: 175,
        tieBreakOrder: 1,
      },
      {
        sku: secondMultiSku,
        lens: resolveLensBySku(secondMultiSku, catalog),
        matchedQuestions: ['P1', 'P2', 'P3'],
        score: 225,
        tieBreakOrder: 2,
      },
    ];
  } else {
    // Caso Monofocal (las otras 4 opciones de la Pregunta 1): jamás se incluyen Ocupacionales, Bifocales ni Multifocales
    const scoredEntries: ScoredMatrixEntry[] = [];

    ENCUESTA_XLSX_MATRIX.forEach((rule, idx) => {
      if (rule.isMultiDistanceGroup) {
        return;
      }

      const hitP1 = rule.p1.includes(answers.improvementGoal);
      const hitP2 = rule.p2.includes(answers.activityContext);
      const hitP3 = rule.p3.includes(answers.clientPriority);

      const matchedQuestions: ('P1' | 'P2' | 'P3')[] = [];
      if (hitP1) matchedQuestions.push('P1');
      if (hitP2) matchedQuestions.push('P2');
      if (hitP3) matchedQuestions.push('P3');

      if (matchedQuestions.length === 0) {
        return;
      }

      // Ponderación clínica según encuesta.xlsx:
      // - P1 (mejora principal elegida en el Paso 1) asegura que el cristal pedido esté siempre en las 2 tarjetas (+150)
      // - P2 (actividad diaria) define la segunda opción o desempata (+75)
      // - P3 (prioridad del cliente: Precio, Tecnología, Moda, Solución) define el complemento (+55)
      let score =
        (hitP1 ? 150 : 0) + (hitP2 ? 75 : 0) + (hitP3 ? 55 : 0);

      // Si en P1 eligió "Tener cristales más finos y livianos" (alto_indice):
      // encuesta.xlsx marca 'x' en Policarbonato Ar y Orgánico 1,67.
      // Si además sumó 'x' en Orgánico 1,61 (por P2d "Todo el día" o P3c/d "Moda/Solución"):
      // - Cuando prioriza Moda o Tecnología, mostramos Orgánico 1,61 ($130.000) + Orgánico 1,67 ($150.000).
      // - Cuando prioriza Precio o Solución, mostramos Policarbonato Ar + Orgánico 1,67 (o 1,61 si sumó doble coincidencia).
      if (answers.improvementGoal === 'alto_indice') {
        if (
          rule.sku === 'ORGANICO-161' &&
          (answers.clientPriority === 'moda' ||
            answers.clientPriority === 'tecnologia')
        ) {
          score += 105;
        }
        if (
          rule.sku === 'POLICARBONATO-AR' &&
          (answers.clientPriority === 'moda' ||
            answers.clientPriority === 'tecnologia')
        ) {
          score -= 40;
        }
      }

      scoredEntries.push({
        sku: rule.sku,
        lens: resolveLensBySku(rule.sku, catalog),
        matchedQuestions,
        score,
        tieBreakOrder: idx,
      });
    });

    // Ordenar de mayor puntaje clínico a menor
    scoredEntries.sort(
      (a, b) => b.score - a.score || a.tieBreakOrder - b.tieBreakOrder
    );

    // Si solo hubo 1 cristal con 'x', agregamos su complemento natural para tener siempre exactamente 2 opciones
    if (scoredEntries.length === 1) {
      const onlyEntry = scoredEntries[0]!;
      const compSku = resolveComplementaryMonofocalSku(onlyEntry.sku, answers);
      scoredEntries.push({
        sku: compSku,
        lens: resolveLensBySku(compSku, catalog),
        matchedQuestions: ['P2'],
        score: 40,
        tieBreakOrder: 99,
      });
    } else if (scoredEntries.length === 0) {
      scoredEntries.push(
        {
          sku: 'ORGANICO-AR',
          lens: resolveLensBySku('ORGANICO-AR', catalog),
          matchedQuestions: ['P1'],
          score: 100,
          tieBreakOrder: 1,
        },
        {
          sku: 'ORGANICO-BLUE-AR',
          lens: resolveLensBySku('ORGANICO-BLUE-AR', catalog),
          matchedQuestions: ['P2'],
          score: 80,
          tieBreakOrder: 2,
        }
      );
    }

    // Recorte estricto a las 2 mejores opciones (Opción 1 y Opción 2)
    const firstCandidate = scoredEntries[0]!;
    const secondCandidate = scoredEntries[1]!;

    // Ordenamos las 2 tarjetas de menor a mayor precio numérico (Opción 1 accesible a la izquierda, Opción 2 superadora a la derecha)
    const shouldSwapByPrice =
      firstCandidate.lens.priceStockARS > 0 &&
      secondCandidate.lens.priceStockARS > 0 &&
      firstCandidate.lens.priceStockARS > secondCandidate.lens.priceStockARS;

    topTwoEntries = shouldSwapByPrice
      ? [secondCandidate, firstCandidate]
      : [firstCandidate, secondCandidate];
  }

  const allMatchedOptions: RecommendedLensCardItem[] = topTwoEntries.map(
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

  const tags: ClinicalTag[] = allMatchedOptions.map((item) => ({
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
    'Por eso, seleccionamos dos alternativas que se adaptan a tu rutina, para que puedas elegir la que mejor se ajuste a lo que necesitás.';

  const requiresLabRangeWarning = isMultiDistanceNeed;

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
