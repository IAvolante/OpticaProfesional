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
 * Genera una imagen PNG de alta definición (1080px de ancho) con la "Ficha de Presupuesto"
 * de Óptica Profesional para que el cliente la descargue en su celular y la muestre en el mostrador.
 * Incluye:
 * - Las 2 opciones recomendadas con sus precios
 * - Las respuestas elegidas por el cliente en la encuesta
 * - Las promociones vigentes (12 cuotas Naranja X, 6 cuotas Macro, Obra Social, Contado)
 * - Certificado de 12 meses (si es monofocal) o invitación a medición en gabinete (si es multifocal/bifocal/ocupacional)
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
  const height = 1660;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return false;
  }

  // 1. Fondo clínico luminoso con degradado suave
  const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
  bgGrad.addColorStop(0, '#F4F8FB');
  bgGrad.addColorStop(0.65, '#EDF4FA');
  bgGrad.addColorStop(1, '#E4EEF7');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Halo decorativo superior
  const topGlow = ctx.createRadialGradient(width / 2, 110, 40, width / 2, 110, 520);
  topGlow.addColorStop(0, 'rgba(51, 102, 153, 0.14)');
  topGlow.addColorStop(1, 'rgba(51, 102, 153, 0)');
  ctx.fillStyle = topGlow;
  ctx.fillRect(0, 0, width, 420);

  // 2. Contenedor principal tipo tarjeta clínica
  const cardX = 44;
  const cardY = 40;
  const cardW = width - 88;
  const cardH = height - 80;

  ctx.save();
  ctx.shadowColor = 'rgba(14, 32, 51, 0.10)';
  ctx.shadowBlur = 32;
  ctx.shadowOffsetY = 10;
  drawRoundedRect(ctx, cardX, cardY, cardW, cardH, 42);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  ctx.restore();

  drawRoundedRect(ctx, cardX, cardY, cardW, cardH, 42);
  ctx.strokeStyle = 'rgba(51, 102, 153, 0.22)';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // 3. Cabecera Azul Marino de Óptica Profesional
  const headerH = 195;
  ctx.save();
  drawRoundedRect(ctx, cardX, cardY, cardW, headerH, 42);
  ctx.clip();
  const headerGrad = ctx.createLinearGradient(cardX, cardY, cardX + cardW, cardY + headerH);
  headerGrad.addColorStop(0, '#0E2033');
  headerGrad.addColorStop(0.55, '#15314E');
  headerGrad.addColorStop(1, '#1E466E');
  ctx.fillStyle = headerGrad;
  ctx.fillRect(cardX, cardY, cardW, headerH);
  ctx.restore();

  // Cargar logo ícono
  const logoImg = await loadImageElement(
    `${import.meta.env.BASE_URL}logo-op-icon.png`
  );

  let titleStartX = cardX + 48;
  if (logoImg) {
    const targetH = 68;
    const aspect = logoImg.width / Math.max(logoImg.height, 1);
    const targetW = targetH * aspect;
    ctx.drawImage(logoImg, cardX + 46, cardY + 42, targetW, targetH);
    titleStartX = cardX + 46 + targetW + 20;
  }

  ctx.fillStyle = '#99CC99';
  ctx.font = '500 38px "Sora", "DM Sans", system-ui, sans-serif';
  ctx.fillText('Optica', titleStartX, cardY + 86);
  const opticaWidth = ctx.measureText('Optica ').width;

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '700 38px "Sora", "DM Sans", system-ui, sans-serif';
  ctx.fillText('Profesional', titleStartX + opticaWidth, cardY + 86);

  // Badge derecho en cabecera: Fecha y código de ficha
  const passportCode = lead?.passportCode ?? 'OP-2026';
  const dateStr = new Date().toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  drawRoundedRect(ctx, cardX + cardW - 310, cardY + 42, 262, 64, 32);
  ctx.fillStyle = 'rgba(153, 204, 153, 0.18)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(153, 204, 153, 0.55)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = '#99CC99';
  ctx.font = '700 20px "DM Sans", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`FICHA #${passportCode}`, cardX + cardW - 179, cardY + 70);
  ctx.fillStyle = '#CBD5E1';
  ctx.font = '500 17px "DM Sans", system-ui, sans-serif';
  ctx.fillText(`Fecha: ${dateStr}`, cardX + cardW - 179, cardY + 94);
  ctx.textAlign = 'left';

  // Subtítulo cabecera
  const cleanName = (fullName ?? lead?.fullName ?? '').trim();
  const cleanPhone = (whatsapp ?? lead?.whatsapp ?? '').trim();
  const customerLabel = cleanName
    ? `Presupuesto personalizado para: ${cleanName}${cleanPhone ? ` · WhatsApp: ${cleanPhone}` : ''}`
    : 'Ficha de Presupuesto · Mostrá esta imagen al visitarnos en la óptica';

  ctx.fillStyle = '#E2E8F0';
  ctx.font = '600 22px "DM Sans", system-ui, sans-serif';
  ctx.fillText(customerLabel, cardX + 48, cardY + 156);

  // 4. Sección: LAS 2 OPCIONES RECOMENDADAS Y SUS PRECIOS
  let cursorY = cardY + headerH + 38;

  ctx.fillStyle = '#265077';
  ctx.font = '800 22px "Sora", system-ui, sans-serif';
  ctx.fillText('OPCIONES RECOMENDADAS SEGÚN TUS RESPUESTAS', cardX + 48, cursorY);

  cursorY += 20;

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
  const colW = (cardW - 96 - colGap) / 2;
  const boxH = 265;

  displayOptions.slice(0, 2).forEach((item, index) => {
    const boxX = cardX + 48 + index * (colW + colGap);
    const isSelected = item.optionNumber === selectedOptionNumber;
    const formattedPrice = formatLensPriceARS(item.lens);

    drawRoundedRect(ctx, boxX, cursorY, colW, boxH, 28);
    ctx.fillStyle = isSelected ? '#EFF6FF' : '#F8FAFC';
    ctx.fill();
    ctx.strokeStyle = isSelected ? '#336699' : '#CBD5E1';
    ctx.lineWidth = isSelected ? 3.5 : 2;
    ctx.stroke();

    // Etiqueta Opción 1 / Opción 2
    ctx.fillStyle = '#265077';
    ctx.font = '800 20px "Sora", system-ui, sans-serif';
    ctx.fillText(`OPCIÓN ${item.optionNumber}`, boxX + 26, cursorY + 42);

    // Píldora "ELEGIDA"
    if (isSelected) {
      drawRoundedRect(ctx, boxX + colW - 142, cursorY + 18, 118, 34, 17);
      ctx.fillStyle = '#336699';
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '700 16px "DM Sans", system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('✓ ELEGIDA', boxX + colW - 83, cursorY + 40);
      ctx.textAlign = 'left';
    }

    // Nombre comercial del cristal
    ctx.fillStyle = '#0F172A';
    ctx.font = '800 30px "Sora", system-ui, sans-serif';
    const nameLines = wrapCanvasText(ctx, item.lens.commercialName, colW - 52);
    nameLines.slice(0, 2).forEach((line, lIdx) => {
      ctx.fillText(line, boxX + 26, cursorY + 90 + lIdx * 34);
    });

    // Precio grande o rango Desde/Hasta
    const priceY = nameLines.length > 1 ? cursorY + 168 : cursorY + 150;
    const isRangePrice = formattedPrice.length > 14;
    ctx.fillStyle = '#1D4ED8';
    ctx.font = isRangePrice
      ? '800 25px "Sora", system-ui, sans-serif'
      : '800 38px "Sora", system-ui, sans-serif';

    const priceLines = wrapCanvasText(ctx, formattedPrice, colW - 52);
    priceLines.slice(0, 2).forEach((line, pIdx) => {
      ctx.fillText(line, boxX + 26, priceY + pIdx * 30);
    });

    // Subtítulo / distancia
    ctx.fillStyle = '#475569';
    ctx.font = '600 19px "DM Sans", system-ui, sans-serif';
    ctx.fillText(item.tagline, boxX + 26, cursorY + boxH - 24);
  });

  cursorY += boxH + 38;

  // 5. Sección: RESUMEN DE LO QUE ELEGISTE EN LA ENCUESTA
  drawRoundedRect(ctx, cardX + 48, cursorY, cardW - 96, 460, 28);
  ctx.fillStyle = '#F8FAFC';
  ctx.fill();
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#0F172A';
  ctx.font = '800 22px "Sora", system-ui, sans-serif';
  ctx.fillText('RESUMEN DE TUS RESPUESTAS EN LA ENCUESTA', cardX + 76, cursorY + 44);

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

  let rowY = cursorY + 86;
  for (const row of rows) {
    ctx.fillStyle = '#336699';
    ctx.font = '700 20px "DM Sans", system-ui, sans-serif';
    ctx.fillText(row.label, cardX + 76, rowY);

    ctx.fillStyle = '#1E293B';
    ctx.font = '500 20px "DM Sans", system-ui, sans-serif';
    const wrapped = wrapCanvasText(ctx, row.value, cardW - 160);
    wrapped.slice(0, 2).forEach((line, idx) => {
      ctx.fillText(line, cardX + 76, rowY + 26 + idx * 24);
    });

    rowY += wrapped.length > 1 ? 78 : 66;
  }

  cursorY += 492;

  // 6. Bloque de Promociones Bancarias + Beneficio Obra Social / Contado
  drawRoundedRect(ctx, cardX + 48, cursorY, cardW - 96, 190, 26);
  ctx.fillStyle = '#EFF6FF';
  ctx.fill();
  ctx.strokeStyle = 'rgba(51, 102, 153, 0.30)';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#0E2033';
  ctx.font = '800 21px "Sora", system-ui, sans-serif';
  ctx.fillText(
    'BENEFICIOS Y PROMOCIONES VIGENTES EN ÓPTICA PROFESIONAL',
    cardX + 76,
    cursorY + 40
  );

  // Badge Naranja X
  drawRoundedRect(ctx, cardX + 76, cursorY + 58, 260, 44, 14);
  ctx.fillStyle = '#FF5000';
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '800 20px "DM Sans", system-ui, sans-serif';
  ctx.fillText('Naranja X · 12 cuotas', cardX + 96, cursorY + 87);

  // Badge Macro
  drawRoundedRect(ctx, cardX + 352, cursorY + 58, 250, 44, 14);
  ctx.fillStyle = '#003057';
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '800 20px "DM Sans", system-ui, sans-serif';
  ctx.fillText('Banco Macro · 6 cuotas', cardX + 372, cursorY + 87);

  ctx.fillStyle = '#1E293B';
  ctx.font = '600 19px "DM Sans", system-ui, sans-serif';
  ctx.fillText(
    '• Obra Social: ¡Tenés un armazón sin cargo seleccionado!',
    cardX + 76,
    cursorY + 134
  );
  ctx.fillText(
    '• Efectivo / Contado: Consultanos por beneficios de contado a nuestro WhatsApp.',
    cardX + 76,
    cursorY + 166
  );

  cursorY += 218;

  // 7. Pie de Ficha: Certificado 12 Meses (Monofocal) o Medición en Gabinete + Dirección
  const activeOption =
    displayOptions.find((o) => o.optionNumber === selectedOptionNumber) ??
    displayOptions[0]!;
  const hasAnnualPromo = activeOption.lens.hasAnnualReplacementPromo;

  drawRoundedRect(ctx, cardX + 48, cursorY, cardW - 96, 195, 28);
  const footerGrad = ctx.createLinearGradient(
    cardX + 48,
    cursorY,
    cardX + cardW - 48,
    cursorY + 195
  );
  footerGrad.addColorStop(0, '#0E2033');
  footerGrad.addColorStop(1, '#173757');
  ctx.fillStyle = footerGrad;
  ctx.fill();

  ctx.fillStyle = '#99CC99';
  ctx.font = '800 23px "Sora", system-ui, sans-serif';
  ctx.fillText(
    hasAnnualPromo
      ? '★ INCLUYE CERTIFICADO: ¡RENOVÁ TUS CRISTALES GRATIS EN 12 MESES!'
      : '★ CRISTALES A MEDIDA: MEDICIÓN DIGITAL SIN CARGO EN LA ÓPTICA',
    cardX + 76,
    cursorY + 46
  );

  ctx.fillStyle = '#E2E8F0';
  ctx.font = '500 19px "DM Sans", system-ui, sans-serif';
  ctx.fillText(
    hasAnnualPromo
      ? 'Presentando esta ficha con tu compra de cristales monofocales tenés 1 recambio sin cargo durante 12 meses.'
      : 'Presentá esta ficha en la óptica para tomar tus mediciones oculares y cotizar tu cristal exacto.',
    cardX + 76,
    cursorY + 84
  );

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '700 21px "DM Sans", system-ui, sans-serif';
  ctx.fillText(
    `📍 ${ENV_CONFIG.addressSalta}  |  🕒 ${ENV_CONFIG.businessHours}`,
    cardX + 76,
    cursorY + 134
  );

  ctx.fillStyle = '#99CC99';
  ctx.font = '700 20px "DM Sans", system-ui, sans-serif';
  ctx.fillText(
    `📲 WhatsApp: 387 516-4050  ·  Instagram: ${ENV_CONFIG.instagramHandle}`,
    cardX + 76,
    cursorY + 168
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
