import { FALLBACK_LENS_CATALOG } from '../data/catalog.fallback';
import type {
  ClinicalTag,
  CompletedOpticalAnswers,
  LensCatalogItem,
  OpticalRecommendationResult,
} from '../types/optical.types';

/**
 * Busca un cristal por SKU dentro del catálogo activo (Google Sheets) y cae de forma
 * segura en el catálogo estático de contingencia si un SKU no estuviera presente.
 */
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

  // Garantía total de retorno sin undefined con noUncheckedIndexedAccess: true
  const firstActive = catalog[0];
  if (firstActive) {
    return firstActive;
  }

  return {
    sku: 'MONO-BLUE-156',
    commercialName: 'Monofocal Digital Blue Cut 1.56 + Antirreflex HD',
    shortBadge: 'Equilibrio Total Digital',
    family: 'MONOFOCAL',
    refractiveIndex: '1.56',
    materialDescription: 'Orgánico índice medio 1.56 con bloqueo de luz azul nociva',
    treatments: [
      'Bloqueo Luz Azul Digital (Blue Cut)',
      'Antirreflex HD Nocturno',
      'Filtro UV400 Integral',
    ],
    idealForSummary: 'Cristal versátil para uso diario y pantallas digitales.',
    priceStockARS: 68000,
    priceLabARS: 112000,
    stockRangeDescription: 'Esférico ±4.00 D con Cilíndrico hasta -2.00 D',
    labRangeDescription: 'Graduaciones fuera de rango estándar',
    deliveryTimeStock: '24 a 48 hs hábiles en Salta',
    deliveryTimeLab: '5 a 7 días hábiles',
    warrantyMonths: 12,
  };
}

/**
 * MOTOR DETERMINÍSTICO PURO DE RECOMENDACIÓN ÓPTICA
 * Pondera las 4 dimensiones clínicas relevadas en el Wizard y devuelve:
 *  - `primaryOption`: Cristal principal ideal para el caso del paciente.
 *  - `alternativeOption`: Segunda opción comparativa (upgrade tecnológico o material más delgado).
 *  - `personalizedReasoning`: Explicación pedagógica de mostrador adaptada a las respuestas.
 *  - `clinicalTags`: Etiquetas técnicas resumidas.
 *  - `requiresLabRangeWarning`: Indica si la receta probablemente requiera tallado de laboratorio.
 */
export function calculateOpticalRecommendation(
  answers: CompletedOpticalAnswers,
  catalog: readonly LensCatalogItem[] = FALLBACK_LENS_CATALOG
): OpticalRecommendationResult {
  const reasoning: string[] = [];
  const tags: ClinicalTag[] = [];

  let primarySku = 'MONO-BLUE-156';
  let alternativeSku = 'MONO-PHOTO-156';
  let alternativeUpgradeReason =
    'Suma tecnología fotocromática para que el cristal se oscurezca automáticamente al salir al sol de Salta.';

  const isMultifocal = answers.visionNeed === 'near_and_far';
  const isVisualRest = answers.visionNeed === 'visual_rest';
  const isHighGraduation = answers.graduationSeverity === 'high_plus_4';
  const isModerateGraduation = answers.graduationSeverity === 'moderate_up_to_4';
  const isUnknownRecipe = answers.graduationSeverity === 'unknown_recipe';
  const wantsPhotochromic = answers.lightSensitivity === 'outdoor_commute';
  const drivesFrequently = answers.lightSensitivity === 'day_night_driving';
  const highScreenTime =
    answers.screenExposure === 'intensive_6h_plus' ||
    answers.screenExposure === 'moderate_3_to_6h';

  // 1. RAMA MULTIFOCAL / PROGRESIVO
  if (isMultifocal) {
    tags.push({
      id: 'tag-multifocal',
      label: 'Progresivo Digital Freeform',
      category: 'optics',
    });

    reasoning.push(
      'Como necesitás enfocar de lejos, a distancia intermedia (PC/tablero) y de cerca sin cambiar de anteojos, seleccionamos la familia de Multifocales Progresivos de Tallado Digital.'
    );

    if (wantsPhotochromic || isHighGraduation || isModerateGraduation) {
      primarySku = 'MULTI-PHOTO-159';
      alternativeSku = 'MULTI-DIG-156';
      alternativeUpgradeReason =
        'Opción en índice 1.56 transparente (sin oscurecimiento solar) para optimizar el presupuesto manteniendo tallado digital HD.';
      reasoning.push(
        'Priorizamos Policarbonato 1.59 Fotocromático para combinar menor espesor, liviandad todo el día y adaptación automática a la radiación UV exterior.'
      );
    } else {
      primarySku = 'MULTI-DIG-156';
      alternativeSku = 'MULTI-PHOTO-159';
      alternativeUpgradeReason =
        'Upgrade a Policarbonato 1.59 Ultraliviano + Fotocromático para mayor delgadez y protección solar automática.';
      reasoning.push(
        'El tallado digital Freeform amplía los corredores visuales laterales para una adaptación rápida y natural.'
      );
    }
  }
  // 2. RAMA DESCANSO VISUAL (SIN GRADUACIÓN FUERTE)
  else if (isVisualRest && !isHighGraduation && !isModerateGraduation) {
    tags.push({
      id: 'tag-rest',
      label: 'Descanso Ocular Digital',
      category: 'protection',
    });

    if (wantsPhotochromic) {
      primarySku = 'MONO-PHOTO-156';
      alternativeSku = 'DESC-BLUE-156';
      alternativeUpgradeReason =
        'Opción 100% transparente con filtro Blue Cut si preferís que no se oscurezca al salir al exterior.';
      reasoning.push(
        'Seleccionamos cristales Fotocromáticos con filtro de luz azul integrado: relajan tu vista frente a las pantallas y se oscurecen automáticamente al sol.'
      );
    } else {
      primarySku = 'DESC-BLUE-156';
      alternativeSku = 'MONO-PHOTO-156';
      alternativeUpgradeReason =
        'Suma oscurecimiento automático al sol (Fotocromático UV400) además del filtro para pantallas.';
      reasoning.push(
        'Para descanso visual y prevención de fatiga digital, recomendamos cristales orgánicos 1.56 con bloqueo selectivo de luz azul-violeta y antirreflex hidrofóbico.'
      );
    }
  }
  // 3. RAMA MONOFOCAL CON GRADUACIÓN ALTA (PRIORIDAD ESPESOR Y PESO)
  else if (isHighGraduation) {
    tags.push({
      id: 'tag-high-index',
      label: 'Reducción de Espesor (Alto Índice)',
      category: 'material',
    });

    primarySku = 'MONO-HI-167';
    alternativeSku = 'MONO-POLY-159';
    alternativeUpgradeReason =
      'Alternativa en Policarbonato 1.59 Ultraliviano de alta resistencia a impactos con excelente relación precio/delgadez.';
    reasoning.push(
      'Para graduaciones mayores a ±4.00 dioptrías o astigmatismos fuertes, el Alto Índice 1.67 Asférico reduce hasta un 45% el espesor del cristal y evita el efecto estético de ojo agrandado o achicado.'
    );
  }
  // 4. RAMA MONOFOCAL CON GRADUACIÓN INTERMEDIA
  else if (isModerateGraduation) {
    tags.push({
      id: 'tag-mid-index',
      label: 'Equilibrio Estético y Liviandad',
      category: 'material',
    });

    if (wantsPhotochromic) {
      primarySku = 'MONO-PHOTO-156';
      alternativeSku = 'MONO-POLY-159';
      alternativeUpgradeReason =
        'Alternativa en Policarbonato 1.59 Ultraliviano si priorizás máxima delgadez y resistencia sobre el oscurecimiento solar.';
      reasoning.push(
        'Combinamos tu graduación intermedia con tecnología Fotocromática y filtro de luz azul para que uses un único anteojo adentro y bajo el sol de Salta.'
      );
    } else {
      primarySku = 'MONO-POLY-159';
      alternativeSku = 'MONO-BLUE-156';
      alternativeUpgradeReason =
        'Alternativa en índice 1.56 Digital Blue Cut con excelente protección digital y un valor más accesible en rango de stock.';
      reasoning.push(
        'Con graduación intermedia (±2.25 a ±4.00 D), el Policarbonato 1.59 logra un anteojo notablemente más liviano, delgado y resistente para uso diario.'
      );
    }
  }
  // 5. RAMA MONOFOCAL ESTÁNDAR / RECETA POR VERIFICAR
  else {
    if (wantsPhotochromic) {
      primarySku = 'MONO-PHOTO-156';
      alternativeSku = 'MONO-BLUE-156';
      alternativeUpgradeReason =
        'Alternativa en cristal claro con filtro Blue Cut + Antirreflex HD si preferís que permanezca siempre transparente.';
      reasoning.push(
        'Como te molesta el sol al salir, la opción ideal es el Monofocal Fotocromático con Blue Cut: transparente en interiores y lente de sol UV400 en exteriores.'
      );
    } else if (highScreenTime || drivesFrequently) {
      primarySku = 'MONO-BLUE-156';
      alternativeSku = wantsPhotochromic ? 'MONO-POLY-159' : 'MONO-PHOTO-156';
      alternativeUpgradeReason =
        'Upgrade a Fotocromático + Blue Cut para sumar protección automática contra el sol de Salta sin cambiar de anteojos.';
      reasoning.push(
        'Seleccionamos Monofocal Digital Blue Cut 1.56 con Antirreflex HD para neutralizar el brillo de pantallas LED y reducir el encandilamiento nocturno al conducir.'
      );
    } else {
      primarySku = 'MONO-AR-150';
      alternativeSku = 'MONO-BLUE-156';
      alternativeUpgradeReason =
        'Suma filtro selectivo de luz azul (Blue Cut) e índice 1.56 más delgado para mayor confort frente al celular y luces LED.';
      reasoning.push(
        'Para uso cotidiano con baja exposición a pantallas, el Monofocal Orgánico con Antirreflex Multicapa te brinda excelente transparencia y fácil limpieza.'
      );
    }
  }

  // Etiquetas clínicas transversales según exposición digital y conducción
  if (highScreenTime) {
    tags.push({
      id: 'tag-bluecut',
      label: 'Filtro Luz Azul (Blue Cut)',
      category: 'protection',
    });
    reasoning.push(
      'Incluimos bloqueo de espectro azul-violeta para proteger tu contraste visual durante tus jornadas frente a pantallas.'
    );
  }

  if (wantsPhotochromic) {
    tags.push({
      id: 'tag-photochromic',
      label: 'Adaptación Solar UV400',
      category: 'protection',
    });
  } else if (drivesFrequently) {
    tags.push({
      id: 'tag-driving',
      label: 'Antirreflex Conducción Día/Noche',
      category: 'optics',
    });
    reasoning.push(
      'El tratamiento Antirreflex HD disminuye los halos luminosos de los faros LED en ruta y ciudad.'
    );
  }

  // Ponderación de Armazón / Montura para el equipo de Ventas
  if (answers.framePreference === 'need_clip_on') {
    tags.push({
      id: 'tag-frame-clipon',
      label: 'Combo Armazón Clip-On Magnético',
      category: 'protection',
    });
    reasoning.push(
      'Tu ficha incluye solicitud de Armazón con Clip-On Polarizado Magnético para que nuestro equipo te envíe fotos de los modelos disponibles.'
    );
  } else if (answers.framePreference === 'need_new_frame') {
    tags.push({
      id: 'tag-frame-new',
      label: 'Incluye Selección de Armazón Nuevo',
      category: 'material',
    });
    reasoning.push(
      'Preparamos tu orden para que el asesor te muestre armazones en acetato, metal o titanio compatibles con el espesor de tu cristal.'
    );
  } else if (answers.framePreference === 'own_frame') {
    tags.push({
      id: 'tag-frame-own',
      label: 'Biselado en Armazón Propio',
      category: 'material',
    });
    reasoning.push(
      'Calibraremos los cristales directamente sobre tu propio armazón en nuestro laboratorio de Salta.'
    );
  }

  const requiresLabRangeWarning =
    isMultifocal || isHighGraduation || isUnknownRecipe;

  tags.push({
    id: 'tag-range',
    label: requiresLabRangeWarning
      ? 'Confirmar Stock vs. Laboratorio con Receta'
      : 'Apto Rango Stock Estándar',
    category: 'range',
  });

  const estimatedRangeNote = isMultifocal
    ? 'Los cristales multifocales se calibran con tu distancia nasopupilar y altura de armazón. Te mostramos el valor en Línea Digital Base y en Tallado Personalizado de Campo Amplio.'
    : isHighGraduation
      ? 'Cuando la receta supera ±4.00 D de esfera o -2.00 D de cilindro (astigmatismo), el cristal pasa de Rango Stock a Tallado de Laboratorio. Te detallamos ambos valores con total transparencia.'
      : isUnknownRecipe
        ? 'Como tenés tu receta lista para revisar, te informamos tanto el Precio Rango Stock (la mayoría de las recetas habituales) como el Precio Rango Laboratorio.'
        : 'Por los datos que nos indicaste, tu graduación tiene alta probabilidad de ingresar en el Precio Rango Stock (entrega rápida en 24 a 48 hs hábiles).';

  const primaryOption = resolveLensBySku(primarySku, catalog);
  const alternativeOption = resolveLensBySku(alternativeSku, catalog);

  return {
    primaryOption,
    alternativeOption,
    alternativeUpgradeReason,
    personalizedReasoning: reasoning,
    clinicalTags: tags,
    requiresLabRangeWarning,
    estimatedRangeNote,
  };
}
