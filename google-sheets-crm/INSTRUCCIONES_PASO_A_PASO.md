# Guía Paso a Paso (3 Minutos): Activar el CRM en Google Sheets + Fotos de Recetas en Drive

Con este método podés crear todo hoy en **tu propia cuenta de Google**, probarlo en vivo y más adelante transferirle la propiedad a la cuenta de **Óptica Profesional** sin perder ni un solo dato.

---

## Parte 1: Crear tu Planilla e Instalar el Script Automático

1. Entrá a [sheets.new](https://sheets.new) desde tu navegador para crear una planilla en blanco en tu cuenta de Google.
2. Ponéle de título arriba a la izquierda: **`CRM y Precios - Óptica Profesional 2026`**.
3. En el menú superior, hacé clic en **Extensiones $\rightarrow$ Apps Script**.
4. Borrá las 3 líneas que vienen por defecto (`function myFunction() {}`) y pegá **todo el contenido** del archivo [`Codigo.gs`](file:///d:/GitHub/OpticaProfesional/google-sheets-crm/Codigo.gs).
5. Tocá el ícono de **Guardar** (disquete o `Ctrl + S`).
6. Arriba al lado del botón **Ejecutar**, asegurate de que en el desplegable diga **`inicializarPlanillaCRM`** y hacé clic en **Ejecutar**:
   - Google te va a pedir **Revisar permisos** $\rightarrow$ Elegí tu cuenta $\rightarrow$ **Configuración avanzada** $\rightarrow$ **Ir a Proyecto sin título (no seguro)** $\rightarrow$ **Permitir**.
   - ¡Listo! Si volvés a la pestaña de la planilla vas a ver que se crearon solas las dos hojas con los colores de Óptica Profesional (`#336699`):
     - **`CONSULTAS_Y_CLIENTES`** (con las columnas de los 5 pasos, link a WhatsApp, link a la foto de la receta y desplegable de estado de seguimiento).
     - **`PRECIOS_CRISTALES`** (con los 8 cristales listos para editar precios cuando quieran).
   - Y en tu Google Drive se creó sola la carpeta **`Recetas Optica Profesional - Cotizador Web`**.

---

## Parte 2: Obtener la URL para Conectar la Web

1. Dentro de la ventana de **Apps Script**, arriba a la derecha hacé clic en el botón azul **Implementar $\rightarrow$ Nueva implementación**.
2. Hacé clic en el engranaje junto a "Selecciona el tipo" y elegí **Aplicación web**.
3. Completá los 3 campos así:
   - **Descripción:** `API CRM y Precios Óptica Profesional`
   - **Ejecutar como:** `Yo` (tu correo)
   - **Quién tiene acceso:** **`Cualquier persona`** *(Muy importante para que los clientes desde su celular puedan guardar su consulta y receta sin tener que iniciar sesión).*
4. Hacé clic en **Implementar** y copiá la **URL de la aplicación web** (termina en `/exec`).
5. Pasame esa URL por acá (o pegala en `VITE_GOOGLE_SHEETS_WEBAPP_URL`) y queda conectada en vivo.

---

## Parte 3: ¿Cómo transferir todo a la cuenta de la Óptica más adelante y salirte?

El día que Solana te pase el Gmail de la óptica:
1. En Google Drive, compartís con el correo de la óptica tanto la planilla **`CRM y Precios - Óptica Profesional 2026`** como la carpeta **`Recetas Optica Profesional - Cotizador Web`** y tocás **Transferir propiedad**.
2. Desde la cuenta de la óptica abren la planilla $\rightarrow$ **Extensiones $\rightarrow$ Apps Script $\rightarrow$ Implementar $\rightarrow$ Nueva implementación** (con "Ejecutar como: Yo" desde la cuenta de ellos).
3. Actualizamos esa nueva URL en la web y **vos ya podés eliminarte como participante** de la planilla y de la carpeta.
