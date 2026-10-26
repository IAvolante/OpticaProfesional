/**
 * ============================================================================
 * GOOGLE APPS SCRIPT — CRM & TRACKING DE EMBUDO PARA ÓPTICA PROFESIONAL (2026)
 * ============================================================================
 *
 * ¿QUÉ HACE ESTE SCRIPT?
 * Organiza automáticamente la planilla en 3 pestañas separadas y prolijas:
 *
 * 1. "CONSULTAS_Y_CLIENTES" (Pestaña 1 — Para Vendedores de la Óptica):
 *    Guarda ÚNICAMENTE las personas que completaron su Nombre y WhatsApp.
 *    Lista 100% limpia para hacer clic en el link de WhatsApp, ver su receta y vender.
 *
 * 2. "TRACKING_INCOMPLETOS" (Pestaña 2 — Métricas de Abandono y Publicidad):
 *    Guarda automáticamente a cada visitante que contestó las 5 preguntas y llegó a ver
 *    los precios pero AÚN NO completó su Nombre y WhatsApp.
 *    -> Si la persona se va sin dejar datos, queda acá para medir qué buscan y de qué anuncio vinieron.
 *    -> Si la persona SÍ completa su Nombre y WhatsApp, el sistema la mueve automáticamente
 *       de "TRACKING_INCOMPLETOS" hacia "CONSULTAS_Y_CLIENTES" (para que nunca queden duplicados).
 *
 * 3. "PRECIOS_CRISTALES" (Pestaña 3 — Catálogo en Vivo):
 *    Lista de precios que la web consulta en tiempo real.
 */

const SHEET_LEADS_NAME = 'CONSULTAS_Y_CLIENTES';
const SHEET_TRACKING_NAME = 'TRACKING_INCOMPLETOS';
const SHEET_PRICES_NAME = 'PRECIOS_CRISTALES';
const DRIVE_FOLDER_NAME = 'Recetas Optica Profesional - Cotizador Web';

/**
 * Configura o asegura que exista la pestaña CONSULTAS_Y_CLIENTES (Registros Completos)
 */
function asegurarHojaClientes_(ss) {
  let leadsSheet = ss.getSheetByName(SHEET_LEADS_NAME);
  if (!leadsSheet) {
    leadsSheet = ss.insertSheet(SHEET_LEADS_NAME, 0);
  }

  const leadsHeaders = [
    'Fecha y Hora',
    'Estado de Seguimiento',
    'Certificado 12 Meses',
    'Nombre y Apellido',
    'WhatsApp',
    'Link Directo WhatsApp',
    'Cristal Elegido',
    'Precio Elegido (ARS)',
    'Paso 1: Mejora / Material',
    'Paso 2: Actividad Diaria',
    'Paso 3: Prioridad del Cliente',
    'Paso 4: Obra Social / Financiación',
    'Paso 5: ¿Adjuntó Receta?',
    'Link Foto de Receta (Google Drive)',
    'Opción 1 Cotizada',
    'Precio Opción 1 (ARS)',
    'Opción 2 Cotizada',
    'Precio Opción 2 (ARS)',
    'Notas Internas / Origen'
  ];

  if (leadsSheet.getLastRow() === 0) {
    leadsSheet.getRange(1, 1, 1, leadsHeaders.length).setValues([leadsHeaders]);

    const headerRange = leadsSheet.getRange(1, 1, 1, leadsHeaders.length);
    headerRange
      .setBackground('#336699')
      .setFontColor('#FFFFFF')
      .setFontWeight('bold')
      .setHorizontalAlignment('center')
      .setVerticalAlignment('middle');

    leadsSheet.setFrozenRows(1);
    leadsSheet.setRowHeight(1, 36);

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
    leadsSheet.getRange(2, 2, 500, 1).setDataValidation(statusRule);

    leadsSheet.setColumnWidth(1, 145);
    leadsSheet.setColumnWidth(2, 175);
    leadsSheet.setColumnWidth(3, 135);
    leadsSheet.setColumnWidth(4, 180);
    leadsSheet.setColumnWidth(5, 130);
    leadsSheet.setColumnWidth(6, 170);
    leadsSheet.setColumnWidth(7, 210);
    leadsSheet.setColumnWidth(8, 130);
    leadsSheet.setColumnWidth(9, 250);
    leadsSheet.setColumnWidth(10, 230);
    leadsSheet.setColumnWidth(11, 220);
    leadsSheet.setColumnWidth(12, 230);
    leadsSheet.setColumnWidth(13, 160);
    leadsSheet.setColumnWidth(14, 240);
    leadsSheet.setColumnWidth(19, 240);
  }

  return leadsSheet;
}

/**
 * Configura o asegura que exista la pestaña TRACKING_INCOMPLETOS (Visitantes que vieron precios pero no dejaron WhatsApp)
 */
function asegurarHojaTracking_(ss) {
  let trackingSheet = ss.getSheetByName(SHEET_TRACKING_NAME);
  if (!trackingSheet) {
    trackingSheet = ss.insertSheet(SHEET_TRACKING_NAME, 1);
  }

  const trackingHeaders = [
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

  if (trackingSheet.getLastRow() === 0) {
    trackingSheet.getRange(1, 1, 1, trackingHeaders.length).setValues([trackingHeaders]);

    const headerRange = trackingSheet.getRange(1, 1, 1, trackingHeaders.length);
    headerRange
      .setBackground('#4A607A')
      .setFontColor('#FFFFFF')
      .setFontWeight('bold')
      .setHorizontalAlignment('center')
      .setVerticalAlignment('middle');

    trackingSheet.setFrozenRows(1);
    trackingSheet.setRowHeight(1, 36);

    trackingSheet.setColumnWidth(1, 145); // Fecha
    trackingSheet.setColumnWidth(2, 210); // Estado Embudo
    trackingSheet.setColumnWidth(3, 130); // Código Sesión
    trackingSheet.setColumnWidth(4, 230); // Origen UTM
    trackingSheet.setColumnWidth(5, 250); // Paso 1
    trackingSheet.setColumnWidth(6, 230); // Paso 2
    trackingSheet.setColumnWidth(7, 220); // Paso 3
    trackingSheet.setColumnWidth(8, 230); // Paso 4
    trackingSheet.setColumnWidth(9, 160); // Paso 5
    trackingSheet.setColumnWidth(10, 240); // Link Foto
    trackingSheet.setColumnWidth(11, 210); // Opción 1
    trackingSheet.setColumnWidth(12, 140); // Precio 1
    trackingSheet.setColumnWidth(13, 210); // Opción 2
    trackingSheet.setColumnWidth(14, 140); // Precio 2
  }

  return trackingSheet;
}

/**
 * PASO 1 DE INSTALACIÓN (Opcional si ya está creada):
 * Crea y formatea las 3 pestañas: CONSULTAS_Y_CLIENTES, TRACKING_INCOMPLETOS y PRECIOS_CRISTALES.
 */
function inicializarPlanillaCRM() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  asegurarHojaClientes_(ss);
  asegurarHojaTracking_(ss);

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
      ['ORGANICO-AR', 'Orgánico con antirreflejo', 48000, 82000, 'Visión clara eliminando reflejos molestos', '24 a 48 hs hábiles', 12],
      ['ORGANICO-BLUE-AR', 'Orgánico Blue Cut AR', 68000, 112000, 'Filtro de luz azul + Antirreflejo para pantallas', '24 a 48 hs hábiles', 12],
      ['ALTO-INDICE-167', 'Orgánico Alto Índice 1.67 AR', 142000, 195000, 'Ultradelgado índice 1.67 (hasta 40% más fino)', '48 a 72 hs hábiles', 12],
      ['ALTO-INDICE-174', 'Orgánico Alto Índice 1.74 AR', 215000, 278000, 'Máxima delgadez óptica índice 1.74', '5 a 7 días hábiles', 12],
      ['BIFOCAL-AR', 'Bifocal Orgánico AR', 96000, 138000, 'Visión de lejos y cerca con antirreflejo', '4 a 6 días hábiles', 12],
      ['MULTIFOCAL-AR', 'Multifocal Progresivo Digital AR', 168000, 225000, 'Lejos, intermedia y cerca sin líneas visibles', '5 a 7 días hábiles', 12],
      ['ORGANICO-FILTRO-SOL', 'Orgánico con Filtro UV400 + AR', 74000, 118000, 'Protección solar UV400 y manejo diurno', '24 a 48 hs hábiles', 12],
      ['ORGANICO-FOTOCROMATICO', 'Fotocromático Inteligente + Blue AR', 124000, 174000, 'Transparente adentro, se oscurece al sol', '48 a 72 hs hábiles', 12]
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
  pricesSheet.setColumnWidth(1, 190);
  pricesSheet.setColumnWidth(2, 250);
  pricesSheet.setColumnWidth(3, 150);
  pricesSheet.setColumnWidth(4, 160);
  pricesSheet.setColumnWidth(5, 280);

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
  const newFolder = DriveApp.createFolder(DRIVE_FOLDER_NAME);
  return newFolder;
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
 * Busca una fila por Código de Sesión (#OP-XXXX) en la Columna C (índice 3) de una hoja dada.
 */
function buscarFilaPorCodigo_(sheet, passportCode) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return -1;

  const codes = sheet.getRange(2, 3, lastRow - 1, 1).getValues();
  for (let i = 0; i < codes.length; i++) {
    if (String(codes[i][0] || '').trim() === passportCode) {
      return i + 2;
    }
  }
  return -1;
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
 * POST:
 * - Si `stage === 'QUOTE_VIEWED'` (solo vio precios sin dejar datos): guarda/actualiza en `TRACKING_INCOMPLETOS`.
 * - Si `stage === 'LEAD_SUBMITTED'` (completó Nombre y WhatsApp): guarda en `CONSULTAS_Y_CLIENTES`
 *   y elimina esa sesión de `TRACKING_INCOMPLETOS` para que `TRACKING_INCOMPLETOS` solo tenga las incompletas.
 */
function doPost(e) {
  try {
    const rawBody = e && e.postData && e.postData.contents ? e.postData.contents : '{}';
    const data = JSON.parse(rawBody);

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const leadsSheet = asegurarHojaClientes_(ss);
    const trackingSheet = asegurarHojaTracking_(ss);

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

    // Si viene foto en Base64, la guardamos en Google Drive y obtenemos su URL
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
        prevPhotoUrl = String(trackingSheet.getRange(existingTrackingRow, 10).getValue() || '').trim();
      }

      const finalPhotoTracking =
        uploadedPhotoUrl ||
        (prevPhotoUrl && prevPhotoUrl !== 'Sin foto adjunta' ? prevPhotoUrl : 'Sin foto adjunta');

      const trackingRowValues = [
        formattedDate,                                                // 1. Fecha y Hora
        'Vio precios (Sin completar datos)',                          // 2. Estado en el Embudo
        passportCode,                                                 // 3. Código de Sesión
        utmOrigin,                                                    // 4. Origen / Publicidad (UTM)
        String(data.step1Label || data.improvementGoal || ''),        // 5. Paso 1
        String(data.step2Label || data.activityContext || ''),        // 6. Paso 2
        String(data.step3Label || data.clientPriority || ''),         // 7. Paso 3
        String(data.step4Label || data.budgetPreferences || ''),      // 8. Paso 4
        String(data.step5Label || data.prescriptionAttachment || ''), // 9. Paso 5
        finalPhotoTracking,                                           // 10. Link Foto de Receta
        String(data.primaryName || ''),                               // 11. Opción 1 Mostrada
        Number(data.priceStockARS || 0),                              // 12. Precio Opción 1
        String(data.alternativeName || ''),                           // 13. Opción 2 Mostrada
        Number(data.alternativePriceARS || 0)                         // 14. Precio Opción 2
      ];

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
    // (Y se retira de TRACKING_INCOMPLETOS porque ya completó sus datos)
    // =========================================================================
    let photoFromTracking = '';
    const existingTrackingRow = buscarFilaPorCodigo_(trackingSheet, passportCode);
    if (existingTrackingRow > 0) {
      photoFromTracking = String(trackingSheet.getRange(existingTrackingRow, 10).getValue() || '').trim();
      trackingSheet.deleteRow(existingTrackingRow);
    }

    const existingLeadRow = buscarFilaPorCodigo_(leadsSheet, passportCode);
    let prevLeadPhoto = '';
    if (existingLeadRow > 0) {
      prevLeadPhoto = String(leadsSheet.getRange(existingLeadRow, 14).getValue() || '').trim();
    }

    const finalLeadPhoto =
      uploadedPhotoUrl ||
      (photoFromTracking && photoFromTracking !== 'Sin foto adjunta' ? photoFromTracking : '') ||
      (prevLeadPhoto && prevLeadPhoto !== 'Sin foto adjunta' ? prevLeadPhoto : 'Sin foto adjunta');

    const fullName = String(data.fullName || '').trim();
    const whatsapp = String(data.whatsapp || '').trim();
    const whatsappLink = data.whatsappLink || ('https://wa.me/549' + whatsapp);

    const leadRowValues = [
      formattedDate,                                                // 1. Fecha y Hora
      'Pendiente de contacto',                                      // 2. Estado de Seguimiento
      passportCode,                                                 // 3. Certificado 12 Meses
      fullName,                                                     // 4. Nombre y Apellido
      whatsapp,                                                     // 5. WhatsApp
      whatsappLink,                                                 // 6. Link Directo WhatsApp
      String(data.selectedCommercialName || '') + ' (' + String(data.selectedTier || '') + ')', // 7. Cristal Elegido
      Number(data.selectedPriceARS || 0),                           // 8. Precio Elegido (ARS)
      String(data.step1Label || data.improvementGoal || ''),        // 9. Paso 1
      String(data.step2Label || data.activityContext || ''),        // 10. Paso 2
      String(data.step3Label || data.clientPriority || ''),         // 11. Paso 3
      String(data.step4Label || data.budgetPreferences || ''),      // 12. Paso 4
      String(data.step5Label || data.prescriptionAttachment || ''), // 13. Paso 5
      finalLeadPhoto,                                               // 14. Link Foto de Receta
      String(data.primaryName || ''),                               // 15. Opción 1 Cotizada
      Number(data.priceStockARS || 0),                              // 16. Precio Opción 1
      String(data.alternativeName || ''),                           // 17. Opción 2 Cotizada
      Number(data.alternativePriceARS || 0),                        // 18. Precio Opción 2
      'Origen: ' + utmOrigin                                        // 19. Notas Internas / Origen
    ];

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
