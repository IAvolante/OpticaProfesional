/**
 * ============================================================================
 * GOOGLE APPS SCRIPT — CRM & TRACKING INTELIGENTE PARA ÓPTICA PROFESIONAL (2026)
 * ============================================================================
 *
 * ¿QUÉ TIENE DE ESPECIAL ESTA VERSIÓN?
 * 1. MAPEADO INTELIGENTE POR NOMBRE DE COLUMNA:
 *    El script lee los títulos de la Fila 1 antes de guardar cada registro.
 *    Si vos o la óptica arrastran o cambian de lugar cualquier columna en Google Sheets
 *    (por ejemplo, poniendo "Nombre y Apellido" en la Columna A), el sistema detecta
 *    automáticamente dónde está cada título y guarda cada dato debajo de su columna correcta.
 *
 * 2. DOS HOJAS DE SEGUIMIENTO SEPARADAS:
 *    - "CONSULTAS_Y_CLIENTES": Solo clientes reales que completaron Nombre y WhatsApp.
 *    - "TRACKING_INCOMPLETOS": Visitantes que contestaron las 5 preguntas y vieron precios
 *      pero no dejaron sus datos (si luego completan sus datos, se mueven solos a CONSULTAS_Y_CLIENTES).
 *    - "PRECIOS_CRISTALES": Catálogo de precios en vivo.
 */

const SHEET_LEADS_NAME = 'CONSULTAS_Y_CLIENTES';
const SHEET_TRACKING_NAME = 'TRACKING_INCOMPLETOS';
const SHEET_PRICES_NAME = 'PRECIOS_CRISTALES';
const DRIVE_FOLDER_NAME = 'Recetas Optica Profesional - Cotizador Web';

const LEADS_DEFAULT_HEADERS = [
  'Fecha y Hora',
  'Estado de Seguimiento',
  'Nombre y Apellido',
  'Link Directo WhatsApp',
  'Link Foto de Receta (Google Drive)',
  'Cristal Elegido',
  'Precio Elegido (ARS)',
  'Paso 1: Mejora / Material',
  'Paso 2: Actividad Diaria',
  'Paso 3: Prioridad del Cliente',
  'Paso 4: Obra Social / Financiación',
  'Paso 5: ¿Adjuntó Receta?',
  'WhatsApp',
  'Certificado 12 Meses',
  'Opción 1 Cotizada',
  'Precio Opción 1 (ARS)',
  'Opción 2 Cotizada',
  'Precio Opción 2 (ARS)',
  'Notas Internas / Origen'
];

const TRACKING_DEFAULT_HEADERS = [
  'Fecha y Hora',
  'Estado en el Embudo',
  'Código de Sesión',
  'Origen / Publicidad (UTM)',
  'Paso 1: Mejora / Material',
  'Paso 2: Actividad Diaria',
  'Paso 3: Prioridad del Visitante',
  'Paso 4: Obra Social / Financiación',
  'Paso 5: ¿Adjuntó Receta?',
  'Link Foto de Receta (Google Drive)',
  'Opción 1 Mostrada',
  'Precio Opción 1 (ARS)',
  'Opción 2 Mostrada',
  'Precio Opción 2 (ARS)'
];

/**
 * Encuentra el número de columna (1-based) buscando por el título en la Fila 1.
 */
function encontrarColumnaPorTitulo_(sheet, posiblesTitulos) {
  const lastCol = sheet.getLastColumn();
  if (lastCol < 1) return -1;
  const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  const targets = Array.isArray(posiblesTitulos) ? posiblesTitulos : [posiblesTitulos];

  for (let col = 0; col < headers.length; col++) {
    const h = String(headers[col] || '').trim().toLowerCase();
    for (let t = 0; t < targets.length; t++) {
      if (h === String(targets[t]).trim().toLowerCase()) {
        return col + 1;
      }
    }
  }
  return -1;
}

/**
 * Arma el array de celdas en el orden EXACTO en que estén las columnas de la Fila 1 de la hoja.
 * Así, aunque cambien el orden de las columnas manualmente, cada dato cae siempre en su columna correcta.
 */
function armarFilaSegunEncabezadosActuales_(sheet, diccionarioDatos, defaultHeaders) {
  let lastCol = sheet.getLastColumn();
  if (lastCol < 1) {
    sheet.getRange(1, 1, 1, defaultHeaders.length).setValues([defaultHeaders]);
    lastCol = defaultHeaders.length;
  }

  const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  const fila = [];

  for (let i = 0; i < headers.length; i++) {
    const titulo = String(headers[i] || '').trim();
    if (titulo in diccionarioDatos) {
      fila.push(diccionarioDatos[titulo]);
    } else {
      fila.push('');
    }
  }

  return fila;
}

/**
 * Aplica la lista desplegable de "Estado de Seguimiento" únicamente a la columna que tenga ese título,
 * limpiando flechas viejas que hayan quedado corridas en otras columnas.
 */
function repararValidacionEstado_(leadsSheet) {
  const maxRows = Math.max(leadsSheet.getMaxRows() - 1, 500);
  const maxCols = Math.max(leadsSheet.getLastColumn(), LEADS_DEFAULT_HEADERS.length);

  // Limpiar validaciones viejas que hayan quedado desfasadas al mover columnas
  leadsSheet.getRange(2, 1, maxRows, maxCols).clearDataValidations();

  const statusCol = encontrarColumnaPorTitulo_(leadsSheet, ['Estado de Seguimiento']);
  if (statusCol > 0) {
    const statusRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(
        [
          'Pendiente de contacto',
          'Contactado por WhatsApp',
          'Esperando receta',
          'Citado al local',
          'Venta cerrada',
          'Desestimado'
        ],
        true
      )
      .setAllowInvalid(true)
      .build();
    leadsSheet.getRange(2, statusCol, 500, 1).setDataValidation(statusRule);
  }
}

/**
 * Configura o asegura que exista la pestaña CONSULTAS_Y_CLIENTES (Registros Completos)
 */
function asegurarHojaClientes_(ss) {
  let leadsSheet = ss.getSheetByName(SHEET_LEADS_NAME);
  if (!leadsSheet) {
    leadsSheet = ss.insertSheet(SHEET_LEADS_NAME, 0);
  }

  if (leadsSheet.getLastRow() === 0) {
    leadsSheet.getRange(1, 1, 1, LEADS_DEFAULT_HEADERS.length).setValues([LEADS_DEFAULT_HEADERS]);

    const headerRange = leadsSheet.getRange(1, 1, 1, LEADS_DEFAULT_HEADERS.length);
    headerRange
      .setBackground('#336699')
      .setFontColor('#FFFFFF')
      .setFontWeight('bold')
      .setHorizontalAlignment('center')
      .setVerticalAlignment('middle');

    leadsSheet.setFrozenRows(1);
    leadsSheet.setRowHeight(1, 36);
    repararValidacionEstado_(leadsSheet);
  }

  return leadsSheet;
}

/**
 * Configura o asegura que exista la pestaña TRACKING_INCOMPLETOS
 */
function asegurarHojaTracking_(ss) {
  let trackingSheet = ss.getSheetByName(SHEET_TRACKING_NAME);
  if (!trackingSheet) {
    trackingSheet = ss.insertSheet(SHEET_TRACKING_NAME, 1);
  }

  if (trackingSheet.getLastRow() === 0) {
    trackingSheet.getRange(1, 1, 1, TRACKING_DEFAULT_HEADERS.length).setValues([TRACKING_DEFAULT_HEADERS]);

    const headerRange = trackingSheet.getRange(1, 1, 1, TRACKING_DEFAULT_HEADERS.length);
    headerRange
      .setBackground('#4A607A')
      .setFontColor('#FFFFFF')
      .setFontWeight('bold')
      .setHorizontalAlignment('center')
      .setVerticalAlignment('middle');

    trackingSheet.setFrozenRows(1);
    trackingSheet.setRowHeight(1, 36);
  }

  return trackingSheet;
}

/**
 * EJECUTAR ESTA FUNCIÓN ("inicializarPlanillaCRM") SI QUERÉS LIMPIAR LAS PRUEBAS Y ALINEAR TODAS LAS COLUMNAS DE CERO.
 */
function inicializarPlanillaCRM() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. Limpiar y alinear CONSULTAS_Y_CLIENTES con las columnas más cómodas primero
  let leadsSheet = ss.getSheetByName(SHEET_LEADS_NAME);
  if (!leadsSheet) {
    leadsSheet = ss.insertSheet(SHEET_LEADS_NAME, 0);
  } else {
    leadsSheet.clear();
    leadsSheet.getRange(1, 1, leadsSheet.getMaxRows(), leadsSheet.getMaxColumns()).clearDataValidations();
  }

  leadsSheet.getRange(1, 1, 1, LEADS_DEFAULT_HEADERS.length).setValues([LEADS_DEFAULT_HEADERS]);
  leadsSheet
    .getRange(1, 1, 1, LEADS_DEFAULT_HEADERS.length)
    .setBackground('#336699')
    .setFontColor('#FFFFFF')
    .setFontWeight('bold')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');
  leadsSheet.setFrozenRows(1);
  leadsSheet.setRowHeight(1, 36);
  repararValidacionEstado_(leadsSheet);

  leadsSheet.setColumnWidth(1, 145); // Fecha y Hora
  leadsSheet.setColumnWidth(2, 175); // Estado de Seguimiento
  leadsSheet.setColumnWidth(3, 185); // Nombre y Apellido
  leadsSheet.setColumnWidth(4, 195); // Link Directo WhatsApp
  leadsSheet.setColumnWidth(5, 230); // Link Foto de Receta
  leadsSheet.setColumnWidth(6, 210); // Cristal Elegido
  leadsSheet.setColumnWidth(7, 135); // Precio Elegido

  // 2. Limpiar y alinear TRACKING_INCOMPLETOS
  let trackingSheet = ss.getSheetByName(SHEET_TRACKING_NAME);
  if (!trackingSheet) {
    trackingSheet = ss.insertSheet(SHEET_TRACKING_NAME, 1);
  } else {
    trackingSheet.clear();
    trackingSheet.getRange(1, 1, trackingSheet.getMaxRows(), trackingSheet.getMaxColumns()).clearDataValidations();
  }

  trackingSheet.getRange(1, 1, 1, TRACKING_DEFAULT_HEADERS.length).setValues([TRACKING_DEFAULT_HEADERS]);
  trackingSheet
    .getRange(1, 1, 1, TRACKING_DEFAULT_HEADERS.length)
    .setBackground('#4A607A')
    .setFontColor('#FFFFFF')
    .setFontWeight('bold')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');
  trackingSheet.setFrozenRows(1);
  trackingSheet.setRowHeight(1, 36);

  trackingSheet.setColumnWidth(1, 145);
  trackingSheet.setColumnWidth(2, 210);
  trackingSheet.setColumnWidth(3, 130);
  trackingSheet.setColumnWidth(4, 230);
  trackingSheet.setColumnWidth(5, 250);

  // 3. Asegurar PRECIOS_CRISTALES
  let pricesSheet = ss.getSheetByName(SHEET_PRICES_NAME);
  if (!pricesSheet) {
    pricesSheet = ss.insertSheet(SHEET_PRICES_NAME, 2);
  }

  const pricesHeaders = [
    'SKU (No modificar)',
    'Nombre Comercial en la Web',
    'Precio Vigente (ARS)',
    'Precio Laboratorio (ARS)',
    'Descripción / Rango',
    'Tiempo Entrega Stock',
    'Garantía (Meses)'
  ];

  if (pricesSheet.getLastRow() === 0) {
    pricesSheet.getRange(1, 1, 1, pricesHeaders.length).setValues([pricesHeaders]);

    const initialCatalogRows = [
      ['ORGANICO-BLANCO', 'Orgánico Blanco', 36000, 58000, 'monofocal · Equilibrio calidad y precio', '24 a 48 hs hábiles', 12],
      ['ORGANICO-AR', 'Orgánico AR', 42000, 72000, 'monofocal · Visión clara con antirreflejo', '24 a 48 hs hábiles', 12],
      ['ORGANICO-BLUE-AR', 'Orgánico Blue Ar', 51000, 86000, 'monofocal · Filtro de luz azul + Antirreflejo', '24 a 48 hs hábiles', 12],
      ['ORGANICO-FOTOCROMATICO', 'Orgánico Fotocromático Ar', 104000, 156000, 'monofocal · Transparente adentro, se oscurece al sol', '48 a 72 hs hábiles', 12],
      ['POLICARBONATO-AR', 'Policarbonato Ar', 'Según receta', 0, 'monofocal · Más fino, liviano y resistente', '48 a 72 hs hábiles', 12],
      ['ORGANICO-161', 'Orgánico 1,61', 130000, 185000, 'monofocal · Delgado y estético para uso diario', '48 a 72 hs hábiles', 12],
      ['ALTO-INDICE-167', 'Orgánico 1,67', 150000, 215000, 'monofocal · Alto índice 1,67 ultradelgado', '48 a 72 hs hábiles', 12],
      ['OCUPACIONALES', 'Ocupacionales', 'Desde', 0, 'lejos/intermedia · Visión intermedia y cerca', '5 a 7 días hábiles', 12],
      ['BIFOCAL-AR', 'Bifocales', 'Desde', 0, 'lejos/cerca · Visión de lejos y lectura de cerca', '4 a 6 días hábiles', 12],
      ['MULTIFOCAL-AR', 'Multifocales', 'Desde', 0, 'lejos/intermedia/cerca · Progresivo todas las distancias', '5 a 7 días hábiles', 12]
    ];

    pricesSheet
      .getRange(2, 1, initialCatalogRows.length, pricesHeaders.length)
      .setValues(initialCatalogRows);
  }

  const priceHeaderRange = pricesSheet.getRange(1, 1, 1, pricesHeaders.length);
  priceHeaderRange
    .setBackground('#264F78')
    .setFontColor('#FFFFFF')
    .setFontWeight('bold')
    .setHorizontalAlignment('center');

  pricesSheet.setFrozenRows(1);
  pricesSheet.setRowHeight(1, 34);

  obtenerOCrearCarpetaRecetas_();
}

/**
 * Obtiene o crea la carpeta en Google Drive donde se guardan las fotos de las recetas.
 */
function obtenerOCrearCarpetaRecetas_() {
  const folders = DriveApp.getFoldersByName(DRIVE_FOLDER_NAME);
  if (folders.hasNext()) {
    return folders.next();
  }
  return DriveApp.createFolder(DRIVE_FOLDER_NAME);
}

/**
 * Guarda la imagen Base64 de la receta en Google Drive y devuelve el link directo para verla.
 */
function guardarRecetaEnDrive_(base64DataUrl, originalFileName, passportCode, fullName) {
  if (!base64DataUrl || typeof base64DataUrl !== 'string' || base64DataUrl.indexOf('base64,') === -1) {
    return '';
  }

  try {
    const parts = base64DataUrl.split('base64,');
    const header = parts[0] || '';
    const base64String = parts[1] || '';
    if (!base64String) return '';

    let mimeType = 'image/jpeg';
    const mimeMatch = header.match(/data:([^;]+);/);
    if (mimeMatch && mimeMatch[1]) {
      mimeType = mimeMatch[1];
    }

    const cleanCustomerName = String(fullName || 'Visitante')
      .replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s_-]/g, '')
      .trim()
      .replace(/\s+/g, '_');

    const safeFileName =
      (passportCode || 'OP') +
      '_' +
      cleanCustomerName +
      '_' +
      (originalFileName || 'receta.jpg');

    const decodedBytes = Utilities.base64Decode(base64String);
    const blob = Utilities.newBlob(decodedBytes, mimeType, safeFileName);

    const folder = obtenerOCrearCarpetaRecetas_();
    const file = folder.createFile(blob);

    try {
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    } catch (sharingErr) {
      // Si el dominio restringe compartir público, igual funciona para los usuarios con acceso a la carpeta
    }

    return file.getUrl();
  } catch (err) {
    return 'Error al guardar imagen: ' + String(err);
  }
}

/**
 * Busca una fila por Código de Sesión (#OP-XXXX) buscando primero en qué columna está el código.
 */
function buscarFilaPorCodigo_(sheet, passportCode) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return -1;

  const codeCol = encontrarColumnaPorTitulo_(sheet, ['Certificado 12 Meses', 'Código de Sesión']);
  const colToSearch = codeCol > 0 ? codeCol : 3;

  const codes = sheet.getRange(2, colToSearch, lastRow - 1, 1).getValues();
  for (let i = 0; i < codes.length; i++) {
    if (String(codes[i][0] || '').trim() === passportCode) {
      return i + 2;
    }
  }
  return -1;
}

/**
 * Lee el valor de una celda en una fila según el título de la columna.
 */
function leerValorPorTitulo_(sheet, rowIndex, posiblesTitulos) {
  const col = encontrarColumnaPorTitulo_(sheet, posiblesTitulos);
  if (col < 1 || rowIndex < 2) return '';
  return String(sheet.getRange(rowIndex, col).getValue() || '').trim();
}

/**
 * GET: Devuelve el catálogo de precios de la pestaña PRECIOS_CRISTALES en formato JSON para la web.
 */
function doGet() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_PRICES_NAME);
    if (!sheet) {
      return respuestaJson_({ ok: false, error: 'No existe la pestaña PRECIOS_CRISTALES' });
    }

    const values = sheet.getDataRange().getValues();
    const items = [];

    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      const sku = String(row[0] || '').trim();
      if (!sku) continue;

      items.push({
        sku: sku,
        commercialName: String(row[1] || '').trim(),
        priceStockARS: row[2],
        priceLabARS: row[3],
        stockRangeDescription: String(row[4] || '').trim(),
        deliveryTimeStock: String(row[5] || '').trim(),
        warrantyMonths: Number(row[6] || 12)
      });
    }

    return respuestaJson_({
      ok: true,
      updatedAt: new Date().toISOString(),
      items: items
    });
  } catch (err) {
    return respuestaJson_({ ok: false, error: String(err) });
  }
}

/**
 * POST: Guarda cada columna haciendo coincidir el nombre exacto del encabezado en la Fila 1.
 */
function doPost(e) {
  try {
    const rawBody = e && e.postData && e.postData.contents ? e.postData.contents : '{}';
    const data = JSON.parse(rawBody);

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const leadsSheet = asegurarHojaClientes_(ss);
    const trackingSheet = asegurarHojaTracking_(ss);

    // Asegurar que las flechas desplegables estén únicamente en la columna "Estado de Seguimiento"
    repararValidacionEstado_(leadsSheet);

    const passportCode = String(data.passportCode || data.leadId || 'OP-2026').trim();
    const isAnonymousPreview =
      data.stage === 'QUOTE_VIEWED' || !data.whatsapp || String(data.whatsapp).trim() === '-';

    const formattedDate = Utilities.formatDate(
      new Date(),
      'America/Argentina/Salta',
      'dd/MM/yyyy HH:mm:ss'
    );

    const utmOrigin =
      data.utmSource && data.utmSource !== 'direct'
        ? String(data.utmSource)
        : 'Tráfico Directo / Orgánico';

    let uploadedPhotoUrl = String(data.prescriptionPhotoUrl || '').trim();
    if (!uploadedPhotoUrl && data.prescriptionPhotoBase64) {
      uploadedPhotoUrl = guardarRecetaEnDrive_(
        data.prescriptionPhotoBase64,
        data.prescriptionPhotoName,
        passportCode,
        isAnonymousPreview ? 'Receta_Paso5' : data.fullName
      );
    }

    // =========================================================================
    // CASO 1: VISITANTE VIENDO PRECIOS SIN COMPLETAR DATOS -> TRACKING_INCOMPLETOS
    // =========================================================================
    if (isAnonymousPreview) {
      const existingTrackingRow = buscarFilaPorCodigo_(trackingSheet, passportCode);
      let prevPhotoUrl = '';
      if (existingTrackingRow > 0) {
        prevPhotoUrl = leerValorPorTitulo_(trackingSheet, existingTrackingRow, [
          'Link Foto de Receta (Google Drive)'
        ]);
      }

      const finalPhotoTracking =
        uploadedPhotoUrl ||
        (prevPhotoUrl && prevPhotoUrl !== 'Sin foto adjunta' ? prevPhotoUrl : 'Sin foto adjunta');

      const datosTracking = {
        'Fecha y Hora': formattedDate,
        'Estado en el Embudo': 'Vio precios (Sin completar datos)',
        'Código de Sesión': passportCode,
        'Origen / Publicidad (UTM)': utmOrigin,
        'Paso 1: Mejora / Material': String(data.step1Label || data.improvementGoal || ''),
        'Paso 2: Actividad Diaria': String(data.step2Label || data.activityContext || ''),
        'Paso 3: Prioridad del Visitante': String(data.step3Label || data.clientPriority || ''),
        'Paso 4: Obra Social / Financiación': String(data.step4Label || data.budgetPreferences || ''),
        'Paso 5: ¿Adjuntó Receta?': String(data.step5Label || data.prescriptionAttachment || ''),
        'Link Foto de Receta (Google Drive)': finalPhotoTracking,
        'Opción 1 Mostrada': String(data.primaryName || ''),
        'Precio Opción 1 (ARS)': Number(data.priceStockARS || 0),
        'Opción 2 Mostrada': String(data.alternativeName || ''),
        'Precio Opción 2 (ARS)': Number(data.alternativePriceARS || 0)
      };

      const trackingRowValues = armarFilaSegunEncabezadosActuales_(
        trackingSheet,
        datosTracking,
        TRACKING_DEFAULT_HEADERS
      );

      if (existingTrackingRow > 0) {
        trackingSheet
          .getRange(existingTrackingRow, 1, 1, trackingRowValues.length)
          .setValues([trackingRowValues]);
      } else {
        trackingSheet.appendRow(trackingRowValues);
      }

      return respuestaJson_({
        ok: true,
        sheet: SHEET_TRACKING_NAME,
        leadId: passportCode,
        photoUrl: finalPhotoTracking !== 'Sin foto adjunta' ? finalPhotoTracking : undefined
      });
    }

    // =========================================================================
    // CASO 2: CLIENTE COMPLETÓ NOMBRE Y WHATSAPP -> CONSULTAS_Y_CLIENTES
    // =========================================================================
    let photoFromTracking = '';
    const existingTrackingRow = buscarFilaPorCodigo_(trackingSheet, passportCode);
    if (existingTrackingRow > 0) {
      photoFromTracking = leerValorPorTitulo_(trackingSheet, existingTrackingRow, [
        'Link Foto de Receta (Google Drive)'
      ]);
      trackingSheet.deleteRow(existingTrackingRow);
    }

    const existingLeadRow = buscarFilaPorCodigo_(leadsSheet, passportCode);
    let prevLeadPhoto = '';
    if (existingLeadRow > 0) {
      prevLeadPhoto = leerValorPorTitulo_(leadsSheet, existingLeadRow, [
        'Link Foto de Receta (Google Drive)'
      ]);
    }

    const finalLeadPhoto =
      uploadedPhotoUrl ||
      (photoFromTracking && photoFromTracking !== 'Sin foto adjunta' ? photoFromTracking : '') ||
      (prevLeadPhoto && prevLeadPhoto !== 'Sin foto adjunta' ? prevLeadPhoto : 'Sin foto adjunta');

    const fullName = String(data.fullName || '').trim();
    const whatsapp = String(data.whatsapp || '').trim();
    const whatsappLink = data.whatsappLink || ('https://wa.me/549' + whatsapp);

    const datosCliente = {
      'Fecha y Hora': formattedDate,
      'Estado de Seguimiento': 'Pendiente de contacto',
      'Certificado 12 Meses': passportCode,
      'Nombre y Apellido': fullName,
      'WhatsApp': whatsapp,
      'Link Directo WhatsApp': whatsappLink,
      'Cristal Elegido': String(data.selectedCommercialName || '') + ' (' + String(data.selectedTier || '') + ')',
      'Precio Elegido (ARS)': Number(data.selectedPriceARS || 0),
      'Paso 1: Mejora / Material': String(data.step1Label || data.improvementGoal || ''),
      'Paso 2: Actividad Diaria': String(data.step2Label || data.activityContext || ''),
      'Paso 3: Prioridad del Cliente': String(data.step3Label || data.clientPriority || ''),
      'Paso 4: Obra Social / Financiación': String(data.step4Label || data.budgetPreferences || ''),
      'Paso 5: ¿Adjuntó Receta?': String(data.step5Label || data.prescriptionAttachment || ''),
      'Link Foto de Receta (Google Drive)': finalLeadPhoto,
      'Opción 1 Cotizada': String(data.primaryName || ''),
      'Precio Opción 1 (ARS)': Number(data.priceStockARS || 0),
      'Opción 2 Cotizada': String(data.alternativeName || ''),
      'Precio Opción 2 (ARS)': Number(data.alternativePriceARS || 0),
      'Notas Internas Óptica': 'Origen: ' + utmOrigin,
      'Notas Internas / Origen': 'Origen: ' + utmOrigin
    };

    const leadRowValues = armarFilaSegunEncabezadosActuales_(
      leadsSheet,
      datosCliente,
      LEADS_DEFAULT_HEADERS
    );

    if (existingLeadRow > 0) {
      leadsSheet.getRange(existingLeadRow, 1, 1, leadRowValues.length).setValues([leadRowValues]);
    } else {
      leadsSheet.appendRow(leadRowValues);
    }

    return respuestaJson_({
      ok: true,
      sheet: SHEET_LEADS_NAME,
      movedFromTracking: existingTrackingRow > 0,
      leadId: passportCode,
      photoUrl: finalLeadPhoto !== 'Sin foto adjunta' ? finalLeadPhoto : undefined
    });
  } catch (err) {
    return respuestaJson_({
      ok: false,
      error: String(err)
    });
  }
}

function respuestaJson_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
