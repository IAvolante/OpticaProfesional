import { FALLBACK_LENS_CATALOG } from '../data/catalog.fallback';
import type {
  ClinicalTag,
  CompletedOpticalAnswers,
  LensCatalogItem,
  OpticalRecommendationResult,
} from '../types/optical.types';

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
 * MOTOR DETERMINÍSTICO DE RECOMENDACIÓN — ÓPTICA PROFESIONAL (2026)
 * Cruza las respuestas de los Pasos 1, 2 y 3 con el catálogo sincronizado de Google Sheets
 * y devuelve las 2 alternativas exactas para el Cierre del Asesor Virtual (Paso 6).
 */
export function calculateOpticalRecommendation(
  answers: CompletedOpticalAnswers,
  catalog: readonly LensCatalogItem[] = FALLBACK_LENS_CATALOG
): OpticalRecommendationResult {
  const reasoning: string[] = [];
  const tags: ClinicalTag[] = [];

  let primarySku = 'ORGANICO-AR';
  let primaryCardTagline = 'Práctica y conveniente';
  let alternativeSku = 'ORGANICO-BLUE-AR';
  let alternativeCardTagline = 'Con filtro adicional';
  let alternativeUpgradeReason =
    'Suma bloqueo de luz azul para mayor descanso frente a computadora y celular.';

  switch (answers.improvementGoal) {
    case 'organico_ar':
    case 'organico_blue_ar': {
      // Tal cual el Ejemplo de Cierre del PDF: Opción 1 Orgánico con antirreflejo vs Opción 2 Orgánico Blue Cut AR
      if (
        answers.improvementGoal === 'organico_ar' &&
        answers.activityContext === 'manejando_aire_libre'
      ) {
        primarySku = 'ORGANICO-AR';
        primaryCardTagline = 'Práctica y conveniente';
        alternativeSku = 'ORGANICO-FOTOCROMATICO';
        alternativeCardTagline = 'Se adapta al sol y manejo';
        alternativeUpgradeReason =
          'Se oscurece automáticamente al salir al sol y reduce reflejos al manejar.';
      } else {
        primarySku = 'ORGANICO-AR';
        primaryCardTagline = 'Práctica y conveniente';
        alternativeSku = 'ORGANICO-BLUE-AR';
        alternativeCardTagline = 'Con filtro adicional';
        alternativeUpgradeReason =
          'Incorpora filtro Blue Cut para proteger tus ojos del brillo de pantallas digitales.';
      }

      tags.push({
        id: 'tag-nitidez-pantallas',
        label:
          answers.improvementGoal === 'organico_blue_ar'
            ? 'Orgánico Blue AR · Pantallas'
            : 'Orgánico AR · Alta Nitidez',
        category: 'protection',
      });
      reasoning.push(
        'Seleccionamos la dupla de cristales Orgánico con Antirreflejo y Orgánico Blue Cut AR para brindarte máxima nitidez y confort digital.'
      );
      break;
    }

    case 'alto_indice': {
      primarySku = 'ALTO-INDICE-167';
      primaryCardTagline = 'Más fino y liviano (1.67)';
      alternativeSku = 'ALTO-INDICE-174';
      alternativeCardTagline = 'Máxima delgadez (1.74)';
      alternativeUpgradeReason =
        'Índice 1.74 ultradelgado para lograr la mayor reducción de espesor y peso del mercado.';

      tags.push({
        id: 'tag-alto-indice',
        label: 'Alto Índice 1.67 / 1.74',
        category: 'material',
      });
      reasoning.push(
        'Priorizamos cristales Orgánicos de Alto Índice (1.67 y 1.74) para que tus lentes queden notablemente más finos, estéticos y livianos.'
      );
      break;
    }

    case 'bifocal_multifocal': {
      primarySku = 'BIFOCAL-AR';
      primaryCardTagline = 'Práctica y conveniente';
      alternativeSku = 'MULTIFOCAL-AR';
      alternativeCardTagline = 'Todas las distancias sin líneas';
      alternativeUpgradeReason =
        'Progresivo Multifocal Digital sin línea divisoria visible para ver de lejos, intermedia y cerca.';

      tags.push({
        id: 'tag-multifocal',
        label: 'Bifocal y Multifocal Digital',
        category: 'optics',
      });
      reasoning.push(
        'Para evitar cambiar de anteojos entre distintas distancias, te comparamos la opción Bifocal con Antirreflejo y el Multifocal Progresivo Digital.'
      );
      break;
    }

    case 'filtro_fotocromatico': {
      primarySku = 'ORGANICO-FILTRO-SOL';
      primaryCardTagline = 'Ideal manejo y sol';
      alternativeSku = 'ORGANICO-FOTOCROMATICO';
      alternativeCardTagline = 'Claro adentro · Oscuro al sol';
      alternativeUpgradeReason =
        'Tecnología fotocromática inteligente que se aclara en interiores y se oscurece automáticamente al sol.';

      tags.push({
        id: 'tag-sol-manejo',
        label: 'Control Solar y Conducción',
        category: 'protection',
      });
      reasoning.push(
        'Para manejar mejor y eliminar reflejos o molestias del sol, seleccionamos nuestras opciones con Filtro UV400 y Fotocromático Inteligente.'
      );
      break;
    }
  }

  // Etiquetas adicionales según las preferencias de presupuesto (Paso 4)
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

  const requiresLabRangeWarning =
    answers.improvementGoal === 'alto_indice' ||
    answers.improvementGoal === 'bifocal_multifocal';

  const estimatedRangeNote =
    'Incluye Certificado de Garantía Exclusivo: 1 recambio de cristales sin cargo de la misma categoría y características durante los próximos 12 meses.';

  const primaryOption = resolveLensBySku(primarySku, catalog);
  const alternativeOption = resolveLensBySku(alternativeSku, catalog);

  return {
    primaryOption,
    primaryCardTagline,
    alternativeOption,
    alternativeCardTagline,
    advisorObservationParagraph,
    advisorClosingParagraph,
    alternativeUpgradeReason,
    personalizedReasoning: reasoning,
    clinicalTags: tags,
    requiresLabRangeWarning,
    estimatedRangeNote,
  };
}
