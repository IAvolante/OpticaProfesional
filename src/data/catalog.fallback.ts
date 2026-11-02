import type { LensCatalogItem } from '../types/optical.types';

/**
 * Catálogo oficial de 10 cristales de Óptica Profesional (Matriz Oficial `encuesta.xlsx`).
 * Sincronizable en vivo con Google Sheets (`PRECIOS_CRISTALES`):
 *
 * Fila 5:  Orgánico Blanco            | monofocal              | $ 36.000
 * Fila 6:  Orgánico AR                | monofocal              | $ 42.000
 * Fila 7:  Orgánico Blue Ar           | monofocal              | $ 51.000
 * Fila 8:  Orgánico Fotocromático Ar  | monofocal              | $ 104.000
 * Fila 9:  Policarbonato Ar           | monofocal              | Según receta
 * Fila 10: Orgánico 1,61              | monofocal              | $ 130.000
 * Fila 11: Orgánico 1,67              | monofocal              | $ 150.000
 * Fila 12: Ocupacionales              | lejos/intermedia       | Desde (según receta)
 * Fila 13: Bifocales                  | lejos/cerca            | Desde (según receta)
 * Fila 14: Multifocales               | lejos/intermedia/cerca | Desde (según receta)
 *
 * Regla acordada con Solana Casal (reunión 30/10):
 * - Los cristales Monofocales (Filas 5 a 11) incluyen la promoción de Certificado Recambio 12 Meses Gratis (`hasAnnualReplacementPromo: true`).
 * - Los cristales Ocupacionales, Bifocales y Multifocales (Filas 12 a 14) NO entran en la promo de 12 meses (`hasAnnualReplacementPromo: false`);
 *   muestran su precio con prefijo "Desde" y despliegan un bloque específico de Tips, Características y Medición Personalizada en la óptica.
 */
export const FALLBACK_LENS_CATALOG: readonly LensCatalogItem[] = [
  {
    sku: 'ORGANICO-BLANCO',
    commercialName: 'Orgánico Blanco',
    shortBadge: 'Equilibrio calidad y precio',
    family: 'MONOFOCAL',
    refractiveIndex: '1.50',
    visionRangeLabel: 'monofocal',
    hasAnnualReplacementPromo: true,
    materialDescription:
      'Cristal orgánico monofocal estándar con excelente relación entre calidad óptica y precio',
    treatments: [
      'Material Orgánico Liviano',
      'Alta Pureza Óptica',
      'Certificado Recambio 12 Meses Gratis',
    ],
    idealForSummary:
      'La alternativa más económica para resolver tu necesidad visual cuidando tu presupuesto.',
    priceStockARS: 36000,
    priceLabARS: 58000,
    stockRangeDescription: 'Monofocal de stock',
    labRangeDescription: 'Graduaciones de rango o laboratorio',
    deliveryTimeStock: 'Entrega rápida en 24 a 48 hs',
    deliveryTimeLab: '5 a 7 días hábiles',
    warrantyMonths: 12,
  },
  {
    sku: 'ORGANICO-AR',
    commercialName: 'Orgánico AR',
    shortBadge: 'Práctica y mayor nitidez',
    family: 'MONOFOCAL',
    refractiveIndex: '1.50',
    visionRangeLabel: 'monofocal',
    hasAnnualReplacementPromo: true,
    materialDescription:
      'Cristal orgánico monofocal con tratamiento antirreflejo multicapa para ver con mayor nitidez',
    treatments: [
      'Tratamiento Antirreflejo (AR)',
      'Capa Endurecida Antirrayas',
      'Certificado Recambio 12 Meses Gratis',
    ],
    idealForSummary:
      'Visión clara y definida eliminando los reflejos molestos de las luces artificiales.',
    priceStockARS: 42000,
    priceLabARS: 72000,
    stockRangeDescription: 'Monofocal con antirreflejo',
    labRangeDescription: 'Graduaciones de rango o laboratorio',
    deliveryTimeStock: 'Entrega rápida en 24 a 48 hs',
    deliveryTimeLab: '5 a 7 días hábiles',
    warrantyMonths: 12,
  },
  {
    sku: 'ORGANICO-BLUE-AR',
    commercialName: 'Orgánico Blue Ar',
    shortBadge: 'Especial para pantallas',
    family: 'MONOFOCAL',
    refractiveIndex: '1.56',
    visionRangeLabel: 'monofocal',
    hasAnnualReplacementPromo: true,
    materialDescription:
      'Cristal orgánico monofocal con filtro selectivo de luz azul y antirreflejo para pantallas',
    treatments: [
      'Filtro de Luz Azul (Blue Cut)',
      'Antirreflejo Multicapa (AR)',
      'Protección UV400',
      'Certificado Recambio 12 Meses Gratis',
    ],
    idealForSummary:
      'Mayor comodidad visual cuando trabajás con la computadora o usás el celular.',
    priceStockARS: 51000,
    priceLabARS: 86000,
    stockRangeDescription: 'Monofocal Blue Cut + AR',
    labRangeDescription: 'Graduaciones de rango o laboratorio',
    deliveryTimeStock: 'Entrega rápida en 24 a 48 hs',
    deliveryTimeLab: '5 a 7 días hábiles',
    warrantyMonths: 12,
  },
  {
    sku: 'ORGANICO-FOTOCROMATICO',
    commercialName: 'Orgánico Fotocromático Ar',
    shortBadge: 'Ideal sol y manejo',
    family: 'MONOFOCAL',
    refractiveIndex: '1.56',
    visionRangeLabel: 'monofocal',
    hasAnnualReplacementPromo: true,
    materialDescription:
      'Cristal orgánico fotosensible con antirreflejo: claro en interiores y oscuro al sol',
    treatments: [
      'Fotocromático Inteligente (UV400)',
      'Tratamiento Antirreflejo (AR)',
      'Reducción de Reflejos y Sol',
      'Certificado Recambio 12 Meses Gratis',
    ],
    idealForSummary:
      'Comodidad total manejando o realizando actividades al aire libre sin molestias del sol.',
    priceStockARS: 104000,
    priceLabARS: 156000,
    stockRangeDescription: 'Monofocal Fotocromático + AR',
    labRangeDescription: 'Graduaciones de rango o laboratorio',
    deliveryTimeStock: '48 a 72 hs hábiles',
    deliveryTimeLab: '6 a 8 días hábiles',
    warrantyMonths: 12,
  },
  {
    sku: 'POLICARBONATO-AR',
    commercialName: 'Policarbonato Ar',
    shortBadge: 'Delgado, liviano y resistente',
    family: 'MONOFOCAL',
    refractiveIndex: '1.59',
    visionRangeLabel: 'monofocal',
    pricePrefix: 'CONSULTAR',
    hasAnnualReplacementPromo: true,
    materialDescription:
      'Cristal monofocal de policarbonato con antirreflejo: más fino, liviano y de alta resistencia',
    treatments: [
      'Material Policarbonato Ultraliviano',
      'Alta Resistencia a Impactos',
      'Tratamiento Antirreflejo (AR)',
      'Certificado Recambio 12 Meses Gratis',
    ],
    idealForSummary:
      'Cristales más finos, livianos y resistentes para mayor comodidad y durabilidad.',
    priceStockARS: 0,
    priceLabARS: 0,
    stockRangeDescription: 'Monofocal Policarbonato AR',
    labRangeDescription: 'Cotización personalizada según tu receta',
    deliveryTimeStock: '48 a 72 hs hábiles',
    deliveryTimeLab: '5 a 7 días hábiles',
    warrantyMonths: 12,
  },
  {
    sku: 'ORGANICO-161',
    commercialName: 'Orgánico 1,61',
    shortBadge: 'Delgado para todo el día',
    family: 'MONOFOCAL',
    refractiveIndex: '1.61',
    visionRangeLabel: 'monofocal',
    hasAnnualReplacementPromo: true,
    materialDescription:
      'Cristal orgánico monofocal de índice 1,61 reducido: estético, práctico y liviano para uso diario',
    treatments: [
      'Reducción de Espesor Índice 1,61',
      'Terminación Estética Superior',
      'Tratamiento Antirreflejo (AR)',
      'Certificado Recambio 12 Meses Gratis',
    ],
    idealForSummary:
      'Ideal para todas tus actividades diarias combinando estética, liviandad y practicidad.',
    priceStockARS: 130000,
    priceLabARS: 185000,
    stockRangeDescription: 'Monofocal Índice 1,61',
    labRangeDescription: 'Tallado especial según receta',
    deliveryTimeStock: '48 a 72 hs hábiles',
    deliveryTimeLab: '6 a 8 días hábiles',
    warrantyMonths: 12,
  },
  {
    sku: 'ALTO-INDICE-167',
    commercialName: 'Orgánico 1,67',
    shortBadge: 'Ultradelgado alta tecnología',
    family: 'MONOFOCAL',
    refractiveIndex: '1.67',
    visionRangeLabel: 'monofocal',
    hasAnnualReplacementPromo: true,
    materialDescription:
      'Cristal orgánico monofocal de alto índice 1,67 (hasta 40% más fino y liviano) con estética premium',
    treatments: [
      'Alto Índice 1,67 Ultradelgado',
      'Diseño Asférico de Alta Estética',
      'Tratamiento Antirreflejo Premium',
      'Certificado Recambio 12 Meses Gratis',
    ],
    idealForSummary:
      'La máxima tecnología en cristales finos, livianos y estéticos que combinan con tu estilo.',
    priceStockARS: 150000,
    priceLabARS: 215000,
    stockRangeDescription: 'Monofocal Alto Índice 1,67',
    labRangeDescription: 'Tallado digital para graduaciones extendidas',
    deliveryTimeStock: '48 a 72 hs hábiles',
    deliveryTimeLab: '7 a 10 días hábiles',
    warrantyMonths: 12,
  },
  {
    sku: 'OCUPACIONALES',
    commercialName: 'Ocupacionales',
    shortBadge: 'Lejos / Intermedia',
    family: 'OCUPACIONAL',
    refractiveIndex: '1.56',
    visionRangeLabel: 'lejos/intermedia',
    pricePrefix: 'DESDE',
    hasAnnualReplacementPromo: false,
    multiDistanceGuide: {
      badgeLabel: 'TIPS Y CARACTERÍSTICAS · CRISTAL A MEDIDA',
      headline: 'TIPS PARA ELEGIR TUS CRISTALES OCUPACIONALES',
      subheadline:
        'Ideales para ver de cerca y a distancia intermedia (escritorio y computadora) sin cambiar de anteojos.',
      explanation:
        'Los cristales ocupacionales combinan dos medidas progresivas suaves pensadas especialmente para quienes trabajan en oficina, leen y usan pantallas. Además, se pueden personalizar con filtro para pantallas (Blue Cut), antirreflejo y reducción de espesor.',
      tips: [
        'Campo visual amplio y cómodo para leer y mirar el monitor sin forzar la postura del cuello.',
        'Se fabrican a medida según las graduaciones de tu receta y los tratamientos que elijas.',
        'Requieren tomar mediciones oculares presenciales en la óptica para calibrar tu altura y ángulo de mirada.',
      ],
      measurementNotice:
        'Para asesorarte mejor y cotizar tu cristal exacto con beneficios en cuotas con tarjeta o descuento de contado, te invitamos a visitarnos en la óptica.',
      ctaButtonText: 'Quiero asesoramiento para mis Ocupacionales',
    },
    materialDescription:
      'Cristales ocupacionales diseñados para visión intermedia, escritorio, lectura y alcance medio sin cambiar de anteojos',
    treatments: [
      'Enfoque Intermedia y Cerca a Medida',
      'Personalizable con Antirreflejo y Filtro Pantallas',
      'Medición Centrada en Óptica',
    ],
    idealForSummary:
      'Ideales para leer, trabajar en escritorio y computadora evitando cambiar de anteojos.',
    priceStockARS: 0,
    priceLabARS: 0,
    stockRangeDescription: 'Lejos / Intermedia',
    labRangeDescription: 'Cotización Desde según tu graduación y tratamientos',
    deliveryTimeStock: '5 a 7 días hábiles',
    deliveryTimeLab: '7 a 10 días hábiles',
    warrantyMonths: 12,
  },
  {
    sku: 'BIFOCAL-AR',
    commercialName: 'Bifocales',
    shortBadge: 'Lejos / Cerca',
    family: 'BIFOCAL',
    refractiveIndex: '1.56',
    visionRangeLabel: 'lejos/cerca',
    pricePrefix: 'DESDE',
    hasAnnualReplacementPromo: false,
    multiDistanceGuide: {
      badgeLabel: 'TIPS Y CARACTERÍSTICAS · CRISTAL A MEDIDA',
      headline: 'TIPS PARA ELEGIR TUS CRISTALES BIFOCALES',
      subheadline:
        'Dos graduaciones en un mismo cristal para ver de lejos y leer de cerca con total practicidad.',
      explanation:
        'Los cristales bifocales integran tu visión de lejos en la parte superior y un segmento específico de lectura en la parte inferior. Podés sumarle tratamiento antirreflejo, filtro para pantallas o tecnología fotocromática.',
      tips: [
        'Evitás ponerte y sacarte los anteojos cada vez que alternás entre mirar de lejos y leer.',
        'Rápida adaptación visual con zonas de enfoque bien definidas para lejos y cerca.',
        'Para fabricarlos es indispensable tomar las medidas de tu ojo y del armazón en la óptica para ubicar la línea de lectura exacta.',
      ],
      measurementNotice:
        'Para asesorarte mejor sobre el tipo de bifocal ideal y conocer las cuotas con tarjeta o el beneficio por pago contado, pasá a visitarnos.',
      ctaButtonText: 'Quiero asesoramiento para mis Bifocales',
    },
    materialDescription:
      'Cristales bifocales para ver de lejos y leer de cerca con un único par de anteojos',
    treatments: [
      'Doble Enfoque (Lejos / Cerca)',
      'Personalizable con Antirreflejo y Filtros',
      'Medición de Altura en Óptica',
    ],
    idealForSummary:
      'Solución práctica para ver bien de lejos y de cerca sin cambiar de anteojos.',
    priceStockARS: 0,
    priceLabARS: 0,
    stockRangeDescription: 'Lejos / Cerca',
    labRangeDescription: 'Cotización Desde según tu graduación y tratamientos',
    deliveryTimeStock: '4 a 6 días hábiles',
    deliveryTimeLab: '6 a 8 días hábiles',
    warrantyMonths: 12,
  },
  {
    sku: 'MULTIFOCAL-AR',
    commercialName: 'Multifocales',
    shortBadge: 'Lejos / Intermedia / Cerca',
    family: 'MULTIFOCAL',
    refractiveIndex: '1.56',
    visionRangeLabel: 'lejos/intermedia/cerca',
    pricePrefix: 'DESDE',
    hasAnnualReplacementPromo: false,
    multiDistanceGuide: {
      badgeLabel: 'TIPS Y CARACTERÍSTICAS · CRISTAL A MEDIDA',
      headline: 'TIPS PARA ELEGIR TUS CRISTALES MULTIFOCALES',
      subheadline:
        'Visión continua en todas las distancias (lejos, intermedia y cerca) en un solo anteojo y sin líneas visibles.',
      explanation:
        'Los cristales multifocales (progresivos) son tallados a medida para resolver todas las distancias visuales del día a día con estética impecable. Permiten incorporar filtro de pantallas, antirreflejo, fotocromático y reducción de espesor.',
      tips: [
        'Un único anteojo para manejar, usar la computadora y leer el celular sin divisiones visibles en el cristal.',
        'Tallado digital personalizado que explica su diferencia de valor frente a un cristal monofocal estándar.',
        'Requieren mediciones precisas en nuestro gabinete óptico para registrar dónde mirás hacia arriba y hacia abajo con tu armazón puesto.',
      ],
      measurementNotice:
        'Te esperamos en la óptica para tomar tus mediciones sin cargo y brindarte todas las opciones de cuotas con tarjeta o beneficio de contado.',
      ctaButtonText: 'Quiero asesoramiento para mis Multifocales',
    },
    materialDescription:
      'Cristales multifocales progresivos para ver de lejos, intermedia y cerca sin líneas visibles',
    treatments: [
      'Progresivo (Lejos / Intermedia / Cerca)',
      'Sin Línea Divisoria Visible',
      'Medición Digital Personalizada en Óptica',
    ],
    idealForSummary:
      'La tecnología más completa para todas las distancias (lejos, intermedia y cerca) en un solo anteojo.',
    priceStockARS: 0,
    priceLabARS: 0,
    stockRangeDescription: 'Lejos / Intermedia / Cerca',
    labRangeDescription: 'Cotización Desde según tu graduación y tratamientos',
    deliveryTimeStock: '5 a 7 días hábiles',
    deliveryTimeLab: '7 a 10 días hábiles',
    warrantyMonths: 12,
  },
] as const;
