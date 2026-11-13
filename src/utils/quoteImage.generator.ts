import { ENV_CONFIG } from '../config/env';
import type {
  CompletedOpticalAnswers,
  LeadContactData,
  OpticalRecommendationResult,
} from '../types/optical.types';
import { formatLensPriceARS } from './formatters';
import {
  ACTIVITY_CONTEXT_LABELS,
  BUDGET_PREFERENCE_LABELS,
  CLIENT_PRIORITY_LABELS,
  IMPROVEMENT_GOAL_LABELS,
} from './whatsapp.encoder';

export interface GenerateQuoteCardImageParams {
  readonly answers: CompletedOpticalAnswers;
  readonly recommendation: OpticalRecommendationResult;
  readonly selectedOptionNumber: number;
  readonly fullName?: string;
  readonly whatsapp?: string;
  readonly lead?: LeadContactData | null;
}

/**
 * Paleta estricta del Logo Oficial de Óptica Profesional:
 * - Azul Profesional: #336699 (y sus tonos marinos oscuros #0E2033 / #16324F / #265077)
 * - Verde Salvia:     #99CC99 (y sus tintes suaves #EFF7EF / #CBE6CB)
 * - Neutros Clínicos: #FFFFFF / #F4F8FB / #E2ECF5
 */
const BRAND_COLORS = {
  navyDark: '#0E2033',
  navyMid: '#16324F',
  bluePrimary: '#336699',
  blueDeep: '#265077',
  blueSoftBg: '#EFF5FA',
  blueBorder: '#C5D9EB',
  greenPrimary: '#99CC99',
  greenSoftBg: '#EFF7EF',
  canvasTop: '#F4F8FB',
  canvasBottom: '#E6EFF7',
  white: '#FFFFFF',
  textLight: '#E8F0F8',
  textMutedOnDark: '#B8CCE0',
} as const;

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
): void {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function wrapCanvasText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (ctx.measureText(testLine).width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines.length > 0 ? lines : [''];
}

function loadImageElement(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/**
 * Dibuja el logo vectorial oficial de WhatsApp (burbuja + auricular telefónico)
 * usando únicamente los colores del logo de Óptica Profesional.
 */
function drawWhatsAppLogo(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  size: number,
  color: string
): void {
  ctx.save();
  ctx.translate(centerX - size / 2, centerY - size / 2);
  const scale = size / 24;
  ctx.scale(scale, scale);

  // Contorno circular de burbuja de WhatsApp
  const bubblePath = new Path2D(
    'M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2ZM12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.98 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67Z'
  );
  // Auricular interno de WhatsApp
  const phonePath = new Path2D(
    'M16.56 14.44C16.31 14.31 15.09 13.71 14.86 13.63C14.63 13.55 14.47 13.51 14.3 13.76C14.13 14.01 13.66 14.57 13.51 14.74C13.37 14.91 13.22 14.93 12.97 14.81C12.72 14.68 11.92 14.42 10.97 13.57C10.23 12.91 9.73 12.1 9.59 11.85C9.44 11.6 9.57 11.47 9.7 11.34C9.81 11.23 9.95 11.05 10.07 10.9C10.2 10.76 10.24 10.65 10.32 10.49C10.41 10.32 10.36 10.18 10.3 10.05C10.24 9.93 9.74 8.71 9.54 8.21C9.34 7.73 9.13 7.79 8.98 7.78C8.84 7.78 8.67 7.78 8.51 7.78C8.34 7.78 8.07 7.84 7.85 8.09C7.62 8.34 6.98 8.94 6.98 10.16C6.98 11.38 7.87 12.56 7.99 12.72C8.12 12.89 9.74 15.39 12.23 16.46C12.82 16.72 13.28 16.87 13.64 16.99C14.23 17.18 14.77 17.15 15.2 17.09C15.68 17.02 16.67 16.49 16.87 15.91C17.08 15.33 17.08 14.83 17.02 14.73C16.96 14.62 16.81 14.56 16.56 14.44Z'
  );

  ctx.fillStyle = color;
  ctx.fill(bubblePath);
  ctx.fill(phonePath);
  ctx.restore();
}

/**
 * Dibuja el logo vectorial oficial de Instagram (cámara redondeada + lente + visor)
 * usando únicamente los colores del logo de Óptica Profesional.
 */
function drawInstagramLogo(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  size: number,
  color: string
): void {
  ctx.save();
  const half = size / 2;
  const x = centerX - half;
  const y = centerY - half;

  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(2, size * 0.095);

  // Marco cuadrado redondeado de cámara
  drawRoundedRect(ctx, x + size * 0.08, y + size * 0.08, size * 0.84, size * 0.84, size * 0.24);
  ctx.stroke();

  // Lente central circular
  ctx.beginPath();
  ctx.arc(centerX, centerY, size * 0.21, 0, Math.PI * 2);
  ctx.stroke();

  // Punto superior derecho del visor
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(centerX + size * 0.23, centerY - size * 0.23, size * 0.06, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Dibuja un ícono vectorial limpio de ubicación (Pin) con los colores del logo.
 */
function drawMapPinIcon(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  size: number,
  color: string
): void {
  ctx.save();
  ctx.translate(centerX - size / 2, centerY - size / 2);
  const scale = size / 24;
  ctx.scale(scale, scale);

  const pinPath = new Path2D(
    'M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z'
  );
  ctx.fillStyle = color;
  ctx.fill(pinPath);
  ctx.restore();
}

/**
 * Dibuja un ícono vectorial limpio de reloj (Horarios) con los colores del logo.
 */
function drawClockIcon(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  size: number,
  color: string
): void {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(2, size * 0.1);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.beginPath();
  ctx.arc(centerX, centerY, size * 0.42, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(centerX, centerY - size * 0.24);
  ctx.lineTo(centerX, centerY);
  ctx.lineTo(centerX + size * 0.18, centerY + size * 0.1);
  ctx.stroke();
  ctx.restore();
}

/**
 * Genera una imagen PNG de alta definición (1080px de ancho) con la "Ficha de Presupuesto"
 * de Óptica Profesional respetando estrictamente la paleta del logo (#336699 y #99CC99),
 * con ajuste automático de textos y logos vectoriales de WhatsApp e Instagram en el footer.
 */
export async function downloadQuoteSummaryImage(
  params: GenerateQuoteCardImageParams
): Promise<boolean> {
  const {
    answers,
    recommendation,
    selectedOptionNumber,
    fullName,
    whatsapp,
    lead,
  } = params;

  const width = 1080;
  const height = 1760;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return false;
  }

  // 1. Fondo clínico luminoso en gama del logo (#F4F8FB -> #E6EFF7)
  const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
  bgGrad.addColorStop(0, BRAND_COLORS.canvasTop);
  bgGrad.addColorStop(1, BRAND_COLORS.canvasBottom);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Contenedor principal tipo tarjeta clínica
  const cardX = 44;
  const cardY = 36;
  const cardW = width - 88;
  const cardH = height - 72;
  const innerX = cardX + 46;
  const innerW = cardW - 92;

  ctx.save();
  ctx.shadowColor = 'rgba(14, 32, 51, 0.10)';
  ctx.shadowBlur = 32;
  ctx.shadowOffsetY = 10;
  drawRoundedRect(ctx, cardX, cardY, cardW, cardH, 42);
  ctx.fillStyle = BRAND_COLORS.white;
  ctx.fill();
  ctx.restore();

  drawRoundedRect(ctx, cardX, cardY, cardW, cardH, 42);
  ctx.strokeStyle = BRAND_COLORS.blueBorder;
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // 3. Cabecera Azul Marino + Azul Profesional (#0E2033 -> #336699)
  const headerH = 190;
  ctx.save();
  drawRoundedRect(ctx, cardX, cardY, cardW, headerH, 42);
  ctx.clip();
  const headerGrad = ctx.createLinearGradient(
    cardX,
    cardY,
    cardX + cardW,
    cardY + headerH
  );
  headerGrad.addColorStop(0, BRAND_COLORS.navyDark);
  headerGrad.addColorStop(0.6, BRAND_COLORS.navyMid);
  headerGrad.addColorStop(1, BRAND_COLORS.blueDeep);
  ctx.fillStyle = headerGrad;
  ctx.fillRect(cardX, cardY, cardW, headerH);
  ctx.restore();

  // Cargar isotipo oficial "op"
  const logoImg = await loadImageElement(
    `${import.meta.env.BASE_URL}logo-op-icon.png`
  );

  let titleStartX = innerX;
  if (logoImg) {
    const targetH = 66;
    const aspect = logoImg.width / Math.max(logoImg.height, 1);
    const targetW = targetH * aspect;
    ctx.drawImage(logoImg, innerX, cardY + 40, targetW, targetH);
    titleStartX = innerX + targetW + 20;
  }

  ctx.fillStyle = BRAND_COLORS.greenPrimary;
  ctx.font = '500 38px "Sora", "DM Sans", system-ui, sans-serif';
  ctx.fillText('Optica', titleStartX, cardY + 84);
  const opticaWidth = ctx.measureText('Optica ').width;

  ctx.fillStyle = BRAND_COLORS.white;
  ctx.font = '700 38px "Sora", "DM Sans", system-ui, sans-serif';
  ctx.fillText('Profesional', titleStartX + opticaWidth, cardY + 84);

  // Badge derecho en cabecera: Fecha y código de ficha
  const passportCode = lead?.passportCode ?? 'OP-2026';
  const dateStr = new Date().toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const badgeW = 266;
  const badgeX = cardX + cardW - 46 - badgeW;
  drawRoundedRect(ctx, badgeX, cardY + 40, badgeW, 64, 32);
  ctx.fillStyle = 'rgba(153, 204, 153, 0.16)';
  ctx.fill();
  ctx.strokeStyle = BRAND_COLORS.greenPrimary;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = BRAND_COLORS.greenPrimary;
  ctx.font = '700 19px "DM Sans", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`FICHA #${passportCode}`, badgeX + badgeW / 2, cardY + 68);
  ctx.fillStyle = BRAND_COLORS.textLight;
  ctx.font = '500 16.5px "DM Sans", system-ui, sans-serif';
  ctx.fillText(`Fecha: ${dateStr}`, badgeX + badgeW / 2, cardY + 92);
  ctx.textAlign = 'left';

  // Subtítulo cabecera
  const cleanName = (fullName ?? lead?.fullName ?? '').trim();
  const cleanPhone = (whatsapp ?? lead?.whatsapp ?? '').trim();
  const customerLabel = cleanName
    ? `Presupuesto personalizado para: ${cleanName}${cleanPhone ? ` · WhatsApp: ${cleanPhone}` : ''}`
    : 'Ficha de Presupuesto · Mostrá esta imagen al visitarnos en la óptica';

  ctx.fillStyle = BRAND_COLORS.textLight;
  ctx.font = '600 21px "DM Sans", system-ui, sans-serif';
  ctx.fillText(customerLabel, innerX, cardY + 152);

  // 4. Sección: LAS 2 OPCIONES RECOMENDADAS Y SUS PRECIOS
  let cursorY = cardY + headerH + 36;

  ctx.fillStyle = BRAND_COLORS.blueDeep;
  ctx.font = '800 21px "Sora", system-ui, sans-serif';
  ctx.fillText('OPCIONES RECOMENDADAS SEGÚN TUS RESPUESTAS', innerX, cursorY);

  cursorY += 18;

  const displayOptions =
    recommendation.allMatchedOptions &&
    recommendation.allMatchedOptions.length >= 2
      ? recommendation.allMatchedOptions
      : [
          {
            optionNumber: 1,
            lens: recommendation.primaryOption,
            tagline: recommendation.primaryCardTagline,
            matchedQuestions: ['P1'] as const,
          },
          {
            optionNumber: 2,
            lens: recommendation.alternativeOption,
            tagline: recommendation.alternativeCardTagline,
            matchedQuestions: ['P2'] as const,
          },
        ];

  const colGap = 24;
  const colW = (innerW - colGap) / 2;
  const boxH = 260;

  displayOptions.slice(0, 2).forEach((item, index) => {
    const boxX = innerX + index * (colW + colGap);
    const isSelected = item.optionNumber === selectedOptionNumber;
    const formattedPrice = formatLensPriceARS(item.lens);

    drawRoundedRect(ctx, boxX, cursorY, colW, boxH, 26);
    ctx.fillStyle = isSelected ? BRAND_COLORS.blueSoftBg : BRAND_COLORS.canvasTop;
    ctx.fill();
    ctx.strokeStyle = isSelected
      ? BRAND_COLORS.bluePrimary
      : BRAND_COLORS.blueBorder;
    ctx.lineWidth = isSelected ? 3.5 : 2;
    ctx.stroke();

    // Etiqueta Opción 1 / Opción 2
    ctx.fillStyle = BRAND_COLORS.blueDeep;
    ctx.font = '800 19px "Sora", system-ui, sans-serif';
    ctx.fillText(`OPCIÓN ${item.optionNumber}`, boxX + 26, cursorY + 42);

    // Píldora "ELEGIDA" con colores del logo
    if (isSelected) {
      drawRoundedRect(ctx, boxX + colW - 144, cursorY + 18, 120, 34, 17);
      ctx.fillStyle = BRAND_COLORS.bluePrimary;
      ctx.fill();
      ctx.fillStyle = BRAND_COLORS.white;
      ctx.font = '700 15.5px "DM Sans", system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('✓ ELEGIDA', boxX + colW - 84, cursorY + 40);
      ctx.textAlign = 'left';
    }

    // Nombre comercial del cristal
    ctx.fillStyle = BRAND_COLORS.navyDark;
    ctx.font = '800 29px "Sora", system-ui, sans-serif';
    const nameLines = wrapCanvasText(ctx, item.lens.commercialName, colW - 52);
    nameLines.slice(0, 2).forEach((line, lIdx) => {
      ctx.fillText(line, boxX + 26, cursorY + 88 + lIdx * 34);
    });

    // Precio grande o rango Desde/Hasta en Azul Profesional del logo (#336699)
    const priceY = nameLines.length > 1 ? cursorY + 164 : cursorY + 148;
    const isRangePrice = formattedPrice.length > 14;
    ctx.fillStyle = BRAND_COLORS.bluePrimary;
    ctx.font = isRangePrice
      ? '800 24px "Sora", system-ui, sans-serif'
      : '800 38px "Sora", system-ui, sans-serif';

    const priceLines = wrapCanvasText(ctx, formattedPrice, colW - 52);
    priceLines.slice(0, 2).forEach((line, pIdx) => {
      ctx.fillText(line, boxX + 26, priceY + pIdx * 30);
    });

    // Subtítulo / distancia
    ctx.fillStyle = BRAND_COLORS.blueDeep;
    ctx.font = '600 18.5px "DM Sans", system-ui, sans-serif';
    ctx.fillText(item.tagline, boxX + 26, cursorY + boxH - 22);
  });

  cursorY += boxH + 30;

  // 5. Sección: RESUMEN DE LO QUE ELEGISTE EN LA ENCUESTA
  const step1Goals =
    answers.improvementGoals && answers.improvementGoals.length > 0
      ? answers.improvementGoals
          .map((g) => IMPROVEMENT_GOAL_LABELS[g])
          .join(' + ')
      : IMPROVEMENT_GOAL_LABELS[answers.improvementGoal];

  const step2Activities =
    answers.activityContexts && answers.activityContexts.length > 0
      ? answers.activityContexts
          .map((a) => ACTIVITY_CONTEXT_LABELS[a])
          .join(' + ')
      : ACTIVITY_CONTEXT_LABELS[answers.activityContext];

  const step3Priorities =
    answers.clientPriorities && answers.clientPriorities.length > 0
      ? answers.clientPriorities
          .map((p) => CLIENT_PRIORITY_LABELS[p])
          .join(' + ')
      : CLIENT_PRIORITY_LABELS[answers.clientPriority];

  const step4Budgets =
    answers.budgetPreferences.length > 0
      ? answers.budgetPreferences
          .map((b) => BUDGET_PREFERENCE_LABELS[b])
          .join(' · ')
      : 'Soy particular';

  const step5Rx =
    answers.prescriptionAttachment === 'cargar_foto_receta'
      ? 'Receta adjuntada en el cotizador'
      : 'Aún no tengo la receta a mano';

  const rows: readonly { readonly label: string; readonly value: string }[] = [
    { label: '1. ¿Qué querés mejorar?', value: step1Goals },
    { label: '2. Actividad principal:', value: step2Activities },
    { label: '3. Tu prioridad:', value: step3Priorities },
    { label: '4. Presupuesto / Beneficios:', value: step4Budgets },
    { label: '5. Tu receta óptica:', value: step5Rx },
  ];

  // Calculamos el alto real necesario de las respuestas para que nada se pise
  ctx.font = '500 19px "DM Sans", system-ui, sans-serif';
  const preparedRows = rows.map((row) => ({
    label: row.label,
    lines: wrapCanvasText(ctx, row.value, innerW - 56).slice(0, 2),
  }));

  const summaryBoxH =
    70 +
    preparedRows.reduce(
      (acc, r) => acc + (r.lines.length > 1 ? 76 : 58),
      0
    );

  drawRoundedRect(ctx, innerX, cursorY, innerW, summaryBoxH, 26);
  ctx.fillStyle = BRAND_COLORS.canvasTop;
  ctx.fill();
  ctx.strokeStyle = BRAND_COLORS.blueBorder;
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = BRAND_COLORS.navyDark;
  ctx.font = '800 21px "Sora", system-ui, sans-serif';
  ctx.fillText(
    'RESUMEN DE TUS RESPUESTAS EN LA ENCUESTA',
    innerX + 28,
    cursorY + 42
  );

  let rowY = cursorY + 80;
  for (const row of preparedRows) {
    ctx.fillStyle = BRAND_COLORS.bluePrimary;
    ctx.font = '700 19px "DM Sans", system-ui, sans-serif';
    ctx.fillText(row.label, innerX + 28, rowY);

    ctx.fillStyle = BRAND_COLORS.navyDark;
    ctx.font = '500 19px "DM Sans", system-ui, sans-serif';
    row.lines.forEach((line, idx) => {
      ctx.fillText(line, innerX + 28, rowY + 25 + idx * 23);
    });

    rowY += row.lines.length > 1 ? 76 : 58;
  }

  cursorY += summaryBoxH + 26;

  // 6. Bloque de Promociones Bancarias + Beneficio Obra Social / Contado (ÚNICAMENTE COLORES DEL LOGO)
  const promoBoxH = 184;
  drawRoundedRect(ctx, innerX, cursorY, innerW, promoBoxH, 26);
  ctx.fillStyle = BRAND_COLORS.blueSoftBg;
  ctx.fill();
  ctx.strokeStyle = BRAND_COLORS.blueBorder;
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = BRAND_COLORS.navyDark;
  ctx.font = '800 20px "Sora", system-ui, sans-serif';
  ctx.fillText(
    'BENEFICIOS Y PROMOCIONES VIGENTES EN ÓPTICA PROFESIONAL',
    innerX + 28,
    cursorY + 38
  );

  // Badge 1: Naranja X en Azul Profesional (#336699) + isotipo X en Verde Salvia (#99CC99)
  drawRoundedRect(ctx, innerX + 28, cursorY + 54, 294, 44, 14);
  ctx.fillStyle = BRAND_COLORS.bluePrimary;
  ctx.fill();
  drawRoundedRect(ctx, innerX + 44, cursorY + 63, 26, 26, 6);
  ctx.fillStyle = BRAND_COLORS.greenPrimary;
  ctx.fill();
  ctx.fillStyle = BRAND_COLORS.navyDark;
  ctx.font = '900 16px "Sora", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('X', innerX + 57, cursorY + 82);
  ctx.textAlign = 'left';
  ctx.fillStyle = BRAND_COLORS.white;
  ctx.font = '700 19px "DM Sans", system-ui, sans-serif';
  ctx.fillText('Naranja X · 12 cuotas', innerX + 80, cursorY + 83);

  // Badge 2: Banco Macro en Azul Marino del Logo (#16324F) + isotipo doble arco en Verde Salvia (#99CC99)
  drawRoundedRect(ctx, innerX + 338, cursorY + 54, 314, 44, 14);
  ctx.fillStyle = BRAND_COLORS.navyMid;
  ctx.fill();

  const macroCx = innerX + 366;
  const macroCy = cursorY + 80;
  ctx.save();
  ctx.fillStyle = BRAND_COLORS.greenPrimary;
  // Arco exterior
  ctx.beginPath();
  ctx.arc(macroCx, macroCy, 12.5, Math.PI, 0, false);
  ctx.arc(macroCx, macroCy, 9.0, 0, Math.PI, true);
  ctx.closePath();
  ctx.fill();
  // Arco interior
  ctx.beginPath();
  ctx.arc(macroCx, macroCy, 7.8, Math.PI, 0, false);
  ctx.arc(macroCx, macroCy, 4.4, 0, Math.PI, true);
  ctx.closePath();
  ctx.fill();
  // Círculo central
  ctx.beginPath();
  ctx.arc(macroCx, macroCy + 0.5, 3.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.fillStyle = BRAND_COLORS.white;
  ctx.font = '700 19px "DM Sans", system-ui, sans-serif';
  ctx.fillText('Banco Macro · 6 cuotas', innerX + 388, cursorY + 83);

  ctx.fillStyle = BRAND_COLORS.navyDark;
  ctx.font = '600 18.5px "DM Sans", system-ui, sans-serif';
  ctx.fillText(
    '• Obra Social: ¡Tenés un armazón sin cargo seleccionado!',
    innerX + 28,
    cursorY + 130
  );
  ctx.fillText(
    '• Efectivo / Contado: Consultanos por beneficios de contado a nuestro WhatsApp.',
    innerX + 28,
    cursorY + 160
  );

  cursorY += promoBoxH + 26;

  // 7. FOOTER DEL VOUCHER — Todos los datos perfectamente contenidos + Logos oficiales de WhatsApp e Instagram
  const activeOption =
    displayOptions.find((o) => o.optionNumber === selectedOptionNumber) ??
    displayOptions[0]!;
  const hasAnnualPromo = activeOption.lens.hasAnnualReplacementPromo;

  const footerTextMaxW = innerW - 56;

  const footerHeadlineText = hasAnnualPromo
    ? '★ CERTIFICADO: ¡RENOVÁ TUS CRISTALES GRATIS EN 12 MESES!'
    : '★ CRISTALES A MEDIDA: MEDICIÓN DIGITAL SIN CARGO EN LA ÓPTICA';

  const footerSubText = hasAnnualPromo
    ? 'Presentando esta ficha con tu compra de cristales monofocales tenés 1 recambio sin cargo durante los próximos 12 meses.'
    : 'Presentá esta ficha en la óptica para tomar tus mediciones oculares sin cargo y cotizar tu cristal exacto.';

  ctx.font = '800 20.5px "Sora", system-ui, sans-serif';
  const headlineLines = wrapCanvasText(ctx, footerHeadlineText, footerTextMaxW);

  ctx.font = '500 18px "DM Sans", system-ui, sans-serif';
  const subLines = wrapCanvasText(ctx, footerSubText, footerTextMaxW);

  // Calculamos la altura restante o ideal para el footer de modo que todo entre con holgura
  const remainingCardH = cardY + cardH - cursorY - 36;
  const footerH = Math.max(245, remainingCardH);

  drawRoundedRect(ctx, innerX, cursorY, innerW, footerH, 28);
  const footerGrad = ctx.createLinearGradient(
    innerX,
    cursorY,
    innerX + innerW,
    cursorY + footerH
  );
  footerGrad.addColorStop(0, BRAND_COLORS.navyDark);
  footerGrad.addColorStop(1, BRAND_COLORS.navyMid);
  ctx.fillStyle = footerGrad;
  ctx.fill();

  ctx.strokeStyle = 'rgba(153, 204, 153, 0.40)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  let footerCursorY = cursorY + 38;

  // Título del certificado / beneficio (con wrap seguro)
  ctx.fillStyle = BRAND_COLORS.greenPrimary;
  ctx.font = '800 20.5px "Sora", system-ui, sans-serif';
  headlineLines.forEach((line) => {
    ctx.fillText(line, innerX + 28, footerCursorY);
    footerCursorY += 26;
  });

  footerCursorY += 4;

  // Explicación del certificado (con wrap seguro en 2 líneas para que jamás se corte a la derecha)
  ctx.fillStyle = BRAND_COLORS.textLight;
  ctx.font = '500 18px "DM Sans", system-ui, sans-serif';
  subLines.forEach((line) => {
    ctx.fillText(line, innerX + 28, footerCursorY);
    footerCursorY += 24;
  });

  // Línea divisoria sutil dentro del footer en color Verde Salvia del logo
  footerCursorY += 8;
  ctx.beginPath();
  ctx.moveTo(innerX + 28, footerCursorY);
  ctx.lineTo(innerX + innerW - 28, footerCursorY);
  ctx.strokeStyle = 'rgba(153, 204, 153, 0.25)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Fila 1 de datos de la óptica: Dirección y Horarios con íconos vectoriales en #99CC99
  const addressRowY = footerCursorY + 32;
  drawMapPinIcon(
    ctx,
    innerX + 40,
    addressRowY - 7,
    22,
    BRAND_COLORS.greenPrimary
  );
  ctx.fillStyle = BRAND_COLORS.white;
  ctx.font = '700 18.5px "DM Sans", system-ui, sans-serif';
  const addressText = ENV_CONFIG.addressSalta;
  ctx.fillText(addressText, innerX + 58, addressRowY);

  const addressWidth = ctx.measureText(addressText).width;
  const separatorX = innerX + 58 + addressWidth + 18;

  ctx.fillStyle = BRAND_COLORS.greenPrimary;
  ctx.fillText('|', separatorX, addressRowY);

  const clockIconX = separatorX + 26;
  drawClockIcon(
    ctx,
    clockIconX,
    addressRowY - 6,
    21,
    BRAND_COLORS.greenPrimary
  );
  ctx.fillStyle = BRAND_COLORS.textLight;
  ctx.font = '600 18px "DM Sans", system-ui, sans-serif';
  ctx.fillText(ENV_CONFIG.businessHours, clockIconX + 18, addressRowY);

  // Fila 2 de datos de la óptica: Píldoras con Logos Vectoriales de WhatsApp e Instagram
  const socialRowY = addressRowY + 22;
  const pillH = 44;

  // Píldora WhatsApp con logo oficial vectorial
  const waPillX = innerX + 28;
  const waPillW = 365;
  drawRoundedRect(ctx, waPillX, socialRowY, waPillW, pillH, 22);
  ctx.fillStyle = 'rgba(153, 204, 153, 0.14)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(153, 204, 153, 0.45)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  drawWhatsAppLogo(
    ctx,
    waPillX + 28,
    socialRowY + pillH / 2,
    24,
    BRAND_COLORS.greenPrimary
  );
  ctx.fillStyle = BRAND_COLORS.white;
  ctx.font = '700 18.5px "DM Sans", system-ui, sans-serif';
  ctx.fillText('WhatsApp: 387 516-4050', waPillX + 48, socialRowY + 29);

  // Píldora Instagram con logo oficial vectorial
  const igPillX = waPillX + waPillW + 20;
  const igPillW = innerW - 56 - waPillW - 20;
  drawRoundedRect(ctx, igPillX, socialRowY, igPillW, pillH, 22);
  ctx.fillStyle = 'rgba(153, 204, 153, 0.14)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(153, 204, 153, 0.45)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  drawInstagramLogo(
    ctx,
    igPillX + 28,
    socialRowY + pillH / 2,
    23,
    BRAND_COLORS.greenPrimary
  );
  ctx.fillStyle = BRAND_COLORS.white;
  ctx.font = '700 18.5px "DM Sans", system-ui, sans-serif';
  ctx.fillText(
    `Instagram: ${ENV_CONFIG.instagramHandle}`,
    igPillX + 48,
    socialRowY + 29
  );

  // 8. Descargar PNG automáticamente
  const fileName = `Presupuesto-Optica-Profesional-${passportCode}.png`;
  const dataUrl = canvas.toDataURL('image/png');

  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  return true;
}
