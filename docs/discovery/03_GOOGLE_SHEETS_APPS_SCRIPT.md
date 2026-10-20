# 03. Integración Serverless con Google Sheets & Apps Script (`Code.gs`)

Esta guía documenta la estructura exacta del libro de Google Sheets que utilizará **Solana / Óptica Profesional** para actualizar precios en vivo sin depender de programación, y para almacenar automáticamente cada lead generado en las campañas.

---

## 1. Estructura de Pestañas del Libro de Google Sheets

Crear una hoja de cálculo de Google llamada **`OpticaProfesional_Master_DB`** con **exactamente dos pestañas (hojas)**:

### Pestaña 1: `Precios_Cristales`
La fila 1 debe contener exactamente estos encabezados (respetando mayúsculas y guiones bajos):

| Columna | Encabezado Exacto | Tipo de Dato | Ejemplo | Descripción |
| :--- | :--- | :--- | :--- | :--- |
| **A** | `sku` | Texto único | `MONO-BLUE-156` | Identificador inmutable vinculado al motor de recomendación |
| **B** | `nombre_comercial` | Texto | `Monofocal Digital Blue Cut` | Nombre visible para el paciente |
| **C** | `familia` | Texto | `MONOFOCAL` | `DESCANSO`, `MONOFOCAL`, `BIFOCAL`, `MULTIFOCAL` |
| **D** | `indice_refraccion` | Texto | `1.56` | `1.50`, `1.56`, `1.59`, `1.67` |
| **E** | `material` | Texto | `Orgánico Mid-Index con Filtro Azul` | Descripción técnica del material |
| **F** | `precio_stock_ars` | Número entero | `68000` | Precio del par en rango de Stock (en ARS, sin signo `$`) |
| **G** | `precio_lab_ars` | Número entero | `112000` | Precio del par en rango de Laboratorio / Tallado (en ARS) |
| **H** | `rango_stock_detalle` | Texto | `Esf ±4.00 D / Cil hasta -2.00 D` | Corte de dioptrías aplicable al precio de stock |
| **I** | `tiempo_entrega_stock` | Texto | `24 a 48 hs hábiles` | Demora estimada para rango stock |
| **J** | `tiempo_entrega_lab` | Texto | `5 a 7 días hábiles` | Demora estimada para rango laboratorio |
| **K** | `garantia_meses` | Número entero | `12` | Meses de garantía del tratamiento/cristal |
| **L** | `activo` | Booleano | `TRUE` | `TRUE` para publicar, `FALSE` para pausar |

---

### Pestaña 2: `Leads_Campañas`
La fila 1 debe contener exactamente estos encabezados:

| Columna | Encabezado Exacto | Descripción |
| :--- | :--- | :--- |
| **A** | `timestamp_iso` | Fecha y hora exacta del lead (Hora Argentina `America/Argentina/Salta`) |
| **B** | `lead_id` | Identificador único generado por el frontend |
| **C** | `nombre` | Nombre del paciente / cliente |
| **D** | `whatsapp` | Teléfono de contacto ingresado |
| **E** | `localidad` | Localidad (ej. Salta Capital, San Lorenzo, Cerrillos, Interior) |
| **F** | `tiene_receta` | `SI`, `NO`, `DESACTUALIZADA` |
| **G** | `sku_primario` | SKU del cristal principal recomendado |
| **H** | `cristal_primario` | Nombre comercial del cristal principal |
| **I** | `precio_stock_informado` | Precio en rango Stock mostrado al usuario |
| **J** | `precio_lab_informado` | Precio en rango Laboratorio mostrado al usuario |
| **K** | `sku_alternativo` | SKU de la opción alternativa sugerida |
| **L** | `respuestas_json` | Resumen serializado de las respuestas del Wizard |
| **M** | `theme_activo` | Tema visual activo al momento de la conversión |
| **N** | `utm_source` | Origen de campaña / Referrer |

---

## 2. Código Completo de Google Apps Script (`Code.gs`)

1. En la planilla de Google Sheets, ir al menú **Extensiones > Apps Script**.
2. Borrar cualquier código existente en `Código.gs` y pegar íntegramente el siguiente bloque:

```javascript
/**
 * ============================================================================
 * ÓPTICA PROFESIONAL & SMART OPTICAL (SALTA) — API SERVERLESS v1.0
 * ============================================================================
 * Provee:
 *  - doGet(e):  Lectura en tiempo real de la pestaña "Precios_Cristales"
 *  - doPost(e): Escritura transaccional con LockService en "Leads_Campañas"
 */

var SHEET_PRICES = 'Precios_Cristales';
var SHEET_LEADS = 'Leads_Campañas';
var TIMEZONE = 'America/Argentina/Salta';

/**
 * Endpoint GET: Devuelve el catálogo de precios actualizado en formato JSON.
 */
function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_PRICES);

    if (!sheet) {
      return buildJsonResponse({
        ok: false,
        error: 'No se encontró la pestaña ' + SHEET_PRICES,
        updatedAt: new Date().toISOString(),
        items: []
      });
    }

    var values = sheet.getDataRange().getValues();
    if (values.length <= 1) {
      return buildJsonResponse({
        ok: true,
        updatedAt: new Date().toISOString(),
        items: []
      });
    }

    var headers = values[0].map(function (h) {
      return String(h).trim().toLowerCase();
    });

    var items = [];
    for (var i = 1; i < values.length; i++) {
      var row = values[i];
      var record = {};
      for (var c = 0; c < headers.length; c++) {
        record[headers[c]] = row[c];
      }

      var isActive =
        record['activo'] === true ||
        String(record['activo']).toUpperCase() === 'TRUE' ||
        String(record['activo']).toUpperCase() === 'SI';

      if (record['sku'] && isActive) {
        items.push({
          sku: String(record['sku']).trim(),
          commercialName: String(record['nombre_comercial'] || '').trim(),
          family: String(record['familia'] || 'MONOFOCAL').trim(),
          refractiveIndex: String(record['indice_refraccion'] || '1.50').trim(),
          materialDescription: String(record['material'] || '').trim(),
          priceStockARS: Number(record['precio_stock_ars']) || 0,
          priceLabARS: Number(record['precio_lab_ars']) || 0,
          stockRangeDescription: String(record['rango_stock_detalle'] || '').trim(),
          deliveryTimeStock: String(record['tiempo_entrega_stock'] || '24 a 48 hs hábiles').trim(),
          deliveryTimeLab: String(record['tiempo_entrega_lab'] || '5 a 7 días hábiles').trim(),
          warrantyMonths: Number(record['garantia_meses']) || 12
        });
      }
    }

    return buildJsonResponse({
      ok: true,
      updatedAt: Utilities.formatDate(new Date(), TIMEZONE, "yyyy-MM-dd'T'HH:mm:ssXXX"),
      items: items
    });
  } catch (err) {
    return buildJsonResponse({
      ok: false,
      error: String(err && err.message ? err.message : err),
      updatedAt: new Date().toISOString(),
      items: []
    });
  }
}

/**
 * Endpoint POST: Registra un nuevo Lead usando LockService para evitar colisiones
 * cuando ingresan múltiples consultas simultáneas desde Meta Ads.
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    // Espera hasta 10 segundos por el bloqueo de escritura exclusiva
    lock.waitLock(10000);

    var rawBody = e && e.postData && e.postData.contents ? e.postData.contents : '{}';
    var payload = JSON.parse(rawBody);

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_LEADS);

    if (!sheet) {
      sheet = ss.insertSheet(SHEET_LEADS);
      sheet.appendRow([
        'timestamp_iso',
        'lead_id',
        'nombre',
        'whatsapp',
        'localidad',
        'tiene_receta',
        'sku_primario',
        'cristal_primario',
        'precio_stock_informado',
        'precio_lab_informado',
        'sku_alternativo',
        'respuestas_json',
        'theme_activo',
        'utm_source'
      ]);
    }

    var timestamp = Utilities.formatDate(new Date(), TIMEZONE, "yyyy-MM-dd'T'HH:mm:ssXXX");

    sheet.appendRow([
      timestamp,
      String(payload.leadId || ''),
      String(payload.fullName || ''),
      String(payload.whatsapp || ''),
      String(payload.locality || 'Salta Capital'),
      String(payload.prescriptionStatus || ''),
      String(payload.primarySku || ''),
      String(payload.primaryName || ''),
      Number(payload.priceStockARS || 0),
      Number(payload.priceLabARS || 0),
      String(payload.alternativeSku || ''),
      JSON.stringify(payload.answers || {}),
      String(payload.activeTheme || ''),
      String(payload.utmSource || 'direct')
    ]);

    return buildJsonResponse({
      ok: true,
      savedAt: timestamp
    });
  } catch (err) {
    return buildJsonResponse({
      ok: false,
      error: String(err && err.message ? err.message : err)
    });
  } finally {
    lock.releaseLock();
  }
}

/**
 * Construye respuesta JSON compatible con CORS de Google Apps Script (ContentService).
 */
function buildJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(
    ContentService.MimeType.JSON
  );
}
```

---

## 3. Pasos de Despliegue como Web App (Importante para CORS)

1. Hacer clic en el botón azul **Implementar > Nueva implementación** arriba a la derecha.
2. En "Seleccionar tipo", elegir **Aplicación web** (icono de engranaje).
3. Configurar los 3 campos obligatorios exactamente así:
   - **Descripción:** `API Cotizador Óptica Profesional v1`
   - **Ejecutar como:** `Yo` (tu cuenta de Google propietaria de la hoja).
   - **Quién tiene acceso:** `Cualquier persona` *(Obligatorio para que el navegador de los clientes pueda consultar los precios sin pedirles login de Google)*.
4. Copiar la **URL de la aplicación web** (`https://script.google.com/macros/s/.../exec`) y pegarla en la variable `VITE_GOOGLE_SHEETS_WEBAPP_URL` del archivo `.env`.
5. **Nota técnica sobre CORS en POST:** El cliente `src/services/sheets.service.ts` envía la petición `POST` con `Content-Type: text/plain;charset=utf-8` para evitar el preflight `OPTIONS` que Google Apps Script rechaza, permitiendo tanto leer la respuesta JSON como garantizar el guardado atómico.
