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
 */
export const FALLBACK_LENS_CATALOG: readonly LensCatalogItem[] = [
  {
    sku: 'ORGANICO-BLANCO',
    commercialName: 'Orgánico Blanco',
    shortBadge: 'Equilibrio calidad y precio',
    family: 'MONOFOCAL',
    refractiveIndex: '1.50',
    visionRangeLabel: 'monofocal',
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
    labRangeDescription: 'Graduaciones especiales de laboratorio',
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
    labRangeDescription: 'Graduaciones especiales de laboratorio',
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
    labRangeDescription: 'Graduaciones especiales de laboratorio',
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
    labRangeDescription: 'Graduaciones especiales de laboratorio',
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
    materialDescription:
      'Cristales ocupacionales diseñados para visión intermedia, escritorio, lectura y alcance medio sin cambiar de anteojos',
    treatments: [
      'Enfoque Lejos / Intermedia y Cerca',
      'Transición Suave Sin Líneas',
      'Tratamiento Antirreflejo (AR)',
      'Certificado Recambio 12 Meses Gratis',
    ],
    idealForSummary:
      'Ideales para leer, trabajar de cerca e intermedia evitando cambiar de anteojos.',
    priceStockARS: 0,
    priceLabARS: 0,
    stockRangeDescription: 'Lejos / Intermedia',
    labRangeDescription: 'Cotización Desde según tu graduación',
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
    materialDescription:
      'Cristales bifocales para ver de lejos y leer de cerca con un único par de anteojos',
    treatments: [
      'Doble Enfoque (Lejos / Cerca)',
      'Tratamiento Antirreflejo (AR)',
      'Protección Antirrayas',
      'Certificado Recambio 12 Meses Gratis',
    ],
    idealForSummary:
      'Solución clásica y práctica para ver bien de lejos y de cerca sin cambiar de anteojos.',
    priceStockARS: 0,
    priceLabARS: 0,
    stockRangeDescription: 'Lejos / Cerca',
    labRangeDescription: 'Cotización Desde según tu graduación',
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
    materialDescription:
      'Cristales multifocales progresivos para ver de lejos, intermedia y cerca sin líneas visibles',
    treatments: [
      'Progresivo (Lejos / Intermedia / Cerca)',
      'Sin Línea Divisoria Visible',
      'Tratamiento Antirreflejo (AR)',
      'Certificado Recambio 12 Meses Gratis',
    ],
    idealForSummary:
      'La tecnología más completa para todas las distancias (lejos, intermedia y cerca) en un solo anteojo.',
    priceStockARS: 0,
    priceLabARS: 0,
    stockRangeDescription: 'Lejos / Intermedia / Cerca',
    labRangeDescription: 'Cotización Desde según tu graduación',
    deliveryTimeStock: '5 a 7 días hábiles',
    deliveryTimeLab: '7 a 10 días hábiles',
    warrantyMonths: 12,
  },
] as const;
