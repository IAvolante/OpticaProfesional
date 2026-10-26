/**
 * ============================================================================
 * GOOGLE APPS SCRIPT — CRM & CATÁLOGO EN VIVO PARA ÓPTICA PROFESIONAL (2026)
 * ============================================================================
 *
 * ¿QUÉ HACE ESTE SCRIPT?
 * 1. Crea y configura automáticamente las 2 pestañas de la planilla con un solo clic
 *    ejecutando la función `inicializarPlanillaCRM()`:
 *    - Pestaña 1: "CONSULTAS_Y_CLIENTES" (CRM de Seguimiento, respuestas de los 5 pasos,
 *      WhatsApp clicable, certificado 12 meses, foto de la receta en Google Drive y estado).
 *    - Pestaña 2: "PRECIOS_CRISTALES" (Catálogo de precios que lee la web en vivo).
 * 2. Crea automáticamente en Google Drive la carpeta "Recetas Optica Profesional - Cotizador Web"
 *    y guarda allí cada foto de receta subida por los clientes, pegando el link directo en la celda.
 * 3. Expone `doGet()` para que la web consulte los precios actualizados en vivo.
 * 4. Expone `doPost()` para guardar cada consulta nueva de principio a fin y devolver el link de la receta.
 */

const SHEET_LEADS_NAME = 'CONSULTAS_Y_CLIENTES';
const SHEET_PRICES_NAME = 'PRECIOS_CRISTALES';
const DRIVE_FOLDER_NAME = 'Recetas Optica Profesional - Cotizador Web';

/**
 * PASO 1 DE INSTALACIÓN:
 * Seleccioná `inicializarPlanillaCRM` en la barra superior de Apps Script y tocá "Ejecutar".
 * Esto armará toda la planilla con el diseño de Óptica Profesional (#336699 y #99CC99).
 */
function inicializarPlanillaCRM() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. Crear o preparar pestaña CONSULTAS_Y_CLIENTES
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
    'Notas Internas Óptica'
  ];

  if (leadsSheet.getLastRow() === 0) {
    leadsSheet.getRange(1, 1, 1, leadsHeaders.length).setValues([leadsHeaders]);
  }

  const headerRange = leadsSheet.getRange(1, 1, 1, leadsHeaders.length);
  headerRange
    .setBackground('#336699')
    .setFontColor('#FFFFFF')
    .setFontWeight('bold')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');

  leadsSheet.setFrozenRows(1);
  leadsSheet.setRowHeight(1, 36);

  // Configurar lista desplegable de Estado de Seguimiento en Columna B (filas 2 a 500)
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

  // Anchos de columna cómodos para lectura
  leadsSheet.setColumnWidth(1, 145); // Fecha
  leadsSheet.setColumnWidth(2, 175); // Estado
  leadsSheet.setColumnWidth(3, 135); // Certificado
  leadsSheet.setColumnWidth(4, 180); // Nombre
  leadsSheet.setColumnWidth(5, 130); // WhatsApp
  leadsSheet.setColumnWidth(6, 170); // Link WA
  leadsSheet.setColumnWidth(7, 210); // Cristal Elegido
  leadsSheet.setColumnWidth(8, 130); // Precio Elegido
  leadsSheet.setColumnWidth(9, 250); // Paso 1
  leadsSheet.setColumnWidth(10, 230); // Paso 2
  leadsSheet.setColumnWidth(11, 220); // Paso 3
  leadsSheet.setColumnWidth(12, 230); // Paso 4
  leadsSheet.setColumnWidth(13, 160); // Paso 5
  leadsSheet.setColumnWidth(14, 240); // Link Foto Receta
  leadsSheet.setColumnWidth(19, 240); // Notas

  // 2. Crear o preparar pestaña PRECIOS_CRISTALES
  let pricesSheet = ss.getSheetByName(SHEET_PRICES_NAME);
  if (!pricesSheet) {
    pricesSheet = ss.insertSheet(SHEET_PRICES_NAME, 1);
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

  // 3. Asegurar carpeta en Google Drive para las fotos de recetas
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

    const cleanCustomerName = String(fullName || 'Cliente')
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

    // Permitir que cualquiera con el link (el vendedor desde WhatsApp o desde la planilla) pueda ver la receta
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
 * POST: Recibe cada consulta del cotizador web, guarda la receta en Drive y agrega la fila en CONSULTAS_Y_CLIENTES.
 */
function doPost(e) {
  try {
    const rawBody = e && e.postData && e.postData.contents ? e.postData.contents : '{}';
    const data = JSON.parse(rawBody);

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_LEADS_NAME);
    if (!sheet) {
      inicializarPlanillaCRM();
      sheet = ss.getSheetByName(SHEET_LEADS_NAME);
    }

    const passportCode = String(data.passportCode || data.leadId || 'OP-2026');
    const fullName = String(data.fullName || '').trim();
    const whatsapp = String(data.whatsapp || '').trim();
    const whatsappLink = data.whatsappLink || ('https://wa.me/549' + whatsapp);

    // Si viene foto en Base64, la guardamos en Google Drive y obtenemos su URL
    let uploadedPhotoUrl = '';
    if (data.prescriptionPhotoBase64) {
      uploadedPhotoUrl = guardarRecetaEnDrive_(
        data.prescriptionPhotoBase64,
        data.prescriptionPhotoName,
        passportCode,
        fullName
      );
    }

    const formattedDate = Utilities.formatDate(
      new Date(),
      'America/Argentina/Salta',
      'dd/MM/yyyy HH:mm:ss'
    );

    const newRow = [
      formattedDate,                                              // 1. Fecha y Hora
      'Pendiente de contacto',                                    // 2. Estado de Seguimiento
      passportCode,                                               // 3. Certificado 12 Meses
      fullName,                                                   // 4. Nombre y Apellido
      whatsapp,                                                   // 5. WhatsApp
      whatsappLink,                                               // 6. Link Directo WhatsApp
      String(data.selectedCommercialName || '') + ' (' + String(data.selectedTier || '') + ')', // 7. Cristal Elegido
      Number(data.selectedPriceARS || 0),                         // 8. Precio Elegido (ARS)
      String(data.step1Label || data.improvementGoal || ''),      // 9. Paso 1: Mejora / Material
      String(data.step2Label || data.activityContext || ''),      // 10. Paso 2: Actividad Diaria
      String(data.step3Label || data.clientPriority || ''),       // 11. Paso 3: Prioridad
      String(data.step4Label || data.budgetPreferences || ''),    // 12. Paso 4: Obra Social / Financiación
      String(data.step5Label || data.prescriptionAttachment || ''), // 13. Paso 5: ¿Adjuntó Receta?
      uploadedPhotoUrl || 'Sin foto adjunta',                     // 14. Link Foto de Receta (Google Drive)
      String(data.primaryName || ''),                             // 15. Opción 1 Cotizada
      Number(data.priceStockARS || 0),                            // 16. Precio Opción 1
      String(data.alternativeName || ''),                         // 17. Opción 2 Cotizada
      Number(data.alternativePriceARS || 0),                      // 18. Precio Opción 2
      ''                                                          // 19. Notas Internas Óptica
    ];

    sheet.appendRow(newRow);

    return respuestaJson_({
      ok: true,
      leadId: passportCode,
      photoUrl: uploadedPhotoUrl || undefined
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
