import type { LensCatalogItem } from '../types/optical.types';

/**
 * Catálogo oficial de cristales de Óptica Profesional sincronizable en vivo con Google Sheets.
 * Cada SKU representa exactamente las líneas definidas por Solana en PREGUNTAS .pdf:
 * - ORGÁNICO AR (`ORGANICO-AR`)
 * - ORGÁNICO BLUE AR (`ORGANICO-BLUE-AR`)
 * - ORGÁNICOS ALTO ÍNDICE 1.67 y 1.74 (`ALTO-INDICE-167`, `ALTO-INDICE-174`)
 * - BIFOCAL Y MULTIFOCALES (`BIFOCAL-AR`, `MULTIFOCAL-AR`)
 * - ORGÁNICO CON FILTRO O FOTOCROMÁTICO (`ORGANICO-FILTRO-SOL`, `ORGANICO-FOTOCROMATICO`)
 */
export const FALLBACK_LENS_CATALOG: readonly LensCatalogItem[] = [
  {
    sku: 'ORGANICO-AR',
    commercialName: 'Orgánico con antirreflejo',
    shortBadge: 'Práctica y conveniente',
    family: 'MONOFOCAL',
    refractiveIndex: '1.50',
    materialDescription:
      'Cristal orgánico de alta pureza óptica con tratamiento antirreflejo multicapa',
    treatments: [
      'Tratamiento Antirreflejo (AR)',
      'Capa Endurecida Antirrayas',
      'Fácil Limpieza',
      'Certificado Recambio 12 Meses Gratis',
    ],
    idealForSummary:
      'Excelente nitidez óptica para uso diario eliminando reflejos de luces artificiales.',
    priceStockARS: 48000,
    priceLabARS: 82000,
    stockRangeDescription: 'Esférico ±4.00 D con Cilíndrico hasta -2.00 D',
    labRangeDescription: 'Graduaciones especiales de laboratorio',
    deliveryTimeStock: 'Entrega rápida en 24 a 48 hs',
    deliveryTimeLab: '5 a 7 días hábiles',
    warrantyMonths: 12,
  },
  {
    sku: 'ORGANICO-BLUE-AR',
    commercialName: 'Orgánico Blue Cut AR',
    shortBadge: 'Con filtro adicional',
    family: 'MONOFOCAL',
    refractiveIndex: '1.56',
    materialDescription:
      'Cristal orgánico con filtro selectivo de luz azul para pantallas y antirreflejo',
    treatments: [
      'Filtro de Luz Azul (Blue Cut)',
      'Antirreflejo Multicapa HD',
      'Protección UV400',
      'Certificado Recambio 12 Meses Gratis',
    ],
    idealForSummary:
      'Mayor comodidad visual cuando usás computadora, celular o tablet durante el día.',
    priceStockARS: 68000,
    priceLabARS: 112000,
    stockRangeDescription: 'Esférico ±4.00 D con Cilíndrico hasta -2.00 D',
    labRangeDescription: 'Graduaciones especiales de laboratorio',
    deliveryTimeStock: 'Entrega rápida en 24 a 48 hs',
    deliveryTimeLab: '5 a 7 días hábiles',
    warrantyMonths: 12,
  },
  {
    sku: 'ALTO-INDICE-167',
    commercialName: 'Orgánico Alto Índice 1.67 AR',
    shortBadge: 'Más fino y liviano',
    family: 'MONOFOCAL',
    refractiveIndex: '1.67',
    materialDescription:
      'Cristal orgánico de alto índice 1.67 asférico (hasta 40% más delgado y liviano)',
    treatments: [
      'Reducción de Espesor Índice 1.67',
      'Geometría Asférica Estética',
      'Filtro Blue Cut + Antirreflejo AR',
      'Certificado Recambio 12 Meses Gratis',
    ],
    idealForSummary:
      'Ideal para lograr cristales notablemente más finos, livianos y estéticos.',
    priceStockARS: 154000,
    priceLabARS: 225000,
    stockRangeDescription: 'Esférico -8.00 a +4.00 D con Cilíndrico hasta -2.00 D',
    labRangeDescription: 'Tallado digital para graduaciones extendidas',
    deliveryTimeStock: '48 a 72 hs hábiles',
    deliveryTimeLab: '7 a 10 días hábiles',
    warrantyMonths: 12,
  },
  {
    sku: 'ALTO-INDICE-174',
    commercialName: 'Orgánico Alto Índice 1.74 Ultra AR',
    shortBadge: 'Máxima delgadez estética',
    family: 'MONOFOCAL',
    refractiveIndex: '1.74',
    materialDescription:
      'Cristal orgánico ultradelgado índice 1.74 con la mayor reducción de espesor del mercado',
    treatments: [
      'Ultradelgado Índice 1.74',
      'Diseño Asférico de Alta Estética',
      'Antirreflejo Premium Hidrofóbico',
      'Certificado Recambio 12 Meses Gratis',
    ],
    idealForSummary:
      'La máxima tecnología en delgadez y liviandad para que tus anteojos se vean impecables.',
    priceStockARS: 210000,
    priceLabARS: 295000,
    stockRangeDescription: 'Rango extendido de alta graduación',
    labRangeDescription: 'Tallado especial personalizado',
    deliveryTimeStock: '72 hs hábiles',
    deliveryTimeLab: '7 a 10 días hábiles',
    warrantyMonths: 12,
  },
  {
    sku: 'BIFOCAL-AR',
    commercialName: 'Bifocal Orgánico con Antirreflejo',
    shortBadge: 'Práctico lejos y cerca',
    family: 'BIFOCAL',
    refractiveIndex: '1.56',
    materialDescription:
      'Cristal bifocal orgánico con zona de lejos y lectura definida con antirreflejo',
    treatments: [
      'Doble Enfoque (Lejos y Cerca)',
      'Tratamiento Antirreflejo (AR)',
      'Protección Antirrayas',
      'Certificado Recambio 12 Meses Gratis',
    ],
    idealForSummary:
      'Solución práctica y económica para ver de lejos y leer de cerca sin cambiar de anteojos.',
    priceStockARS: 118000,
    priceLabARS: 168000,
    stockRangeDescription: 'Adición estándar de lejos y lectura',
    labRangeDescription: 'Combinaciones especiales de laboratorio',
    deliveryTimeStock: '4 a 6 días hábiles',
    deliveryTimeLab: '6 a 8 días hábiles',
    warrantyMonths: 12,
  },
  {
    sku: 'MULTIFOCAL-AR',
    commercialName: 'Multifocal Progresivo Digital AR',
    shortBadge: 'Todas las distancias sin líneas',
    family: 'MULTIFOCAL',
    refractiveIndex: '1.56',
    materialDescription:
      'Progresivo multifocal digital sin línea divisoria para lejos, computadora y cerca',
    treatments: [
      'Tallado Digital Progresivo (Lejos, PC y Cerca)',
      'Sin Línea Divisoria Visible',
      'Filtro Blue Cut + Antirreflejo AR',
      'Certificado Recambio 12 Meses Gratis',
    ],
    idealForSummary:
      'Evitá cambiar de anteojos con una transición suave y estética para todas tus distancias.',
    priceStockARS: 192000,
    priceLabARS: 268000,
    stockRangeDescription: 'Línea Progresiva Digital Base',
    labRangeDescription: 'Tallado Freeform de Campo Amplio',
    deliveryTimeStock: '5 a 7 días hábiles',
    deliveryTimeLab: '7 a 10 días hábiles',
    warrantyMonths: 12,
  },
  {
    sku: 'ORGANICO-FILTRO-SOL',
    commercialName: 'Orgánico con Filtro Solar + AR',
    shortBadge: 'Conducción y sol exterior',
    family: 'MONOFOCAL',
    refractiveIndex: '1.56',
    materialDescription:
      'Cristal orgánico con filtro UV400 y control de encandilamiento con antirreflejo',
    treatments: [
      'Filtro Solar UV400 / Antirreflejo Vial',
      'Reducción de Reflejos al Manejar',
      'Tratamiento Antirrayas',
      'Certificado Recambio 12 Meses Gratis',
    ],
    idealForSummary:
      'Pensado para manejar con mayor seguridad y eliminar las molestias del sol y reflejos.',
    priceStockARS: 84000,
    priceLabARS: 135000,
    stockRangeDescription: 'Esférico ±4.00 D con Cilíndrico hasta -2.00 D',
    labRangeDescription: 'Graduaciones especiales de laboratorio',
    deliveryTimeStock: '48 a 72 hs hábiles',
    deliveryTimeLab: '5 a 7 días hábiles',
    warrantyMonths: 12,
  },
  {
    sku: 'ORGANICO-FOTOCROMATICO',
    commercialName: 'Orgánico Fotocromático + Blue AR',
    shortBadge: 'Se adapta solo al sol',
    family: 'MONOFOCAL',
    refractiveIndex: '1.56',
    materialDescription:
      'Cristal fotosensible inteligente: transparente adentro y lente de sol al salir al aire libre',
    treatments: [
      'Oscurecimiento Automático al Sol (UV400)',
      'Transparente en Interiores + Filtro Pantallas',
      'Antirreflejo Multicapa AR',
      'Certificado Recambio 12 Meses Gratis',
    ],
    idealForSummary:
      'Comodidad total al manejar o salir al aire libre sin tener que llevar dos pares de anteojos.',
    priceStockARS: 114000,
    priceLabARS: 172000,
    stockRangeDescription: 'Esférico ±4.00 D con Cilíndrico hasta -2.00 D',
    labRangeDescription: 'Graduaciones especiales de laboratorio',
    deliveryTimeStock: '48 a 72 hs hábiles',
    deliveryTimeLab: '6 a 8 días hábiles',
    warrantyMonths: 12,
  },
] as const;
