/**
 * charts.js — gráficos ligeros dibujados a mano sobre <canvas>, sin
 * dependencias externas (pedido explícitamente: HTML/CSS/JS vanilla).
 * Incluye: barras, líneas y anillo de progreso (donut).
 */
function setupCanvas(canvas) {
  const ratio = window.devicePixelRatio || 1;
  const { width, height } = canvas.getBoundingClientRect();
  canvas.width = width * ratio;
  canvas.height = height * ratio;
  const ctx = canvas.getContext('2d');
  ctx.scale(ratio, ratio);
  return { ctx, width, height };
}

const CSS = getComputedStyle(document.documentElement);
function cssVar(name) { return CSS.getPropertyValue(name).trim(); }

export function drawBarChart(canvas, labels, values, { color = '#4c8dff', maxOverride = null } = {}) {
  const { ctx, width, height } = setupCanvas(canvas);
  ctx.clearRect(0, 0, width, height);
  const padding = { top: 16, right: 10, bottom: 26, left: 10 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;
  const max = maxOverride || Math.max(1, ...values);
  const barGap = 8;
  const barW = (chartW / values.length) - barGap;

  values.forEach((v, i) => {
    const barH = (v / max) * chartH;
    const x = padding.left + i * (barW + barGap);
    const y = padding.top + (chartH - barH);
    const grad = ctx.createLinearGradient(0, y, 0, y + barH);
    grad.addColorStop(0, color);
    grad.addColorStop(1, 'rgba(76,141,255,0.35)');
    ctx.fillStyle = grad;
    roundRect(ctx, x, y, Math.max(barW, 2), Math.max(barH, 2), 4);
    ctx.fill();

    ctx.fillStyle = cssVar('--text-3') || '#5b6472';
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(labels[i], x + barW / 2, height - 8);
  });
}

export function drawLineChart(canvas, labels, series) {
  // series: [{ label, color, values: number[] }]
  const { ctx, width, height } = setupCanvas(canvas);
  ctx.clearRect(0, 0, width, height);
  const padding = { top: 16, right: 12, bottom: 26, left: 30 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;
  const allValues = series.flatMap((s) => s.values);
  const max = Math.max(1, ...allValues);

  // Ejes guía
  ctx.strokeStyle = cssVar('--border-1') || '#262c34';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 3; i += 1) {
    const y = padding.top + (chartH / 3) * i;
    ctx.beginPath(); ctx.moveTo(padding.left, y); ctx.lineTo(width - padding.right, y); ctx.stroke();
  }

  series.forEach((s) => {
    ctx.beginPath();
    ctx.strokeStyle = s.color;
    ctx.lineWidth = 2.2;
    s.values.forEach((v, i) => {
      const x = padding.left + (chartW / (s.values.length - 1 || 1)) * i;
      const y = padding.top + chartH - (v / max) * chartH;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke();

    s.values.forEach((v, i) => {
      const x = padding.left + (chartW / (s.values.length - 1 || 1)) * i;
      const y = padding.top + chartH - (v / max) * chartH;
      ctx.beginPath();
      ctx.fillStyle = s.color;
      ctx.arc(x, y, 2.6, 0, Math.PI * 2);
      ctx.fill();
    });
  });

  ctx.fillStyle = cssVar('--text-3') || '#5b6472';
  ctx.font = '10px Inter, sans-serif';
  ctx.textAlign = 'center';
  labels.forEach((l, i) => {
    const x = padding.left + (chartW / (labels.length - 1 || 1)) * i;
    ctx.fillText(l, x, height - 8);
  });
}

export function drawDonut(canvas, segments) {
  // segments: [{ value, color }]
  const { ctx, width, height } = setupCanvas(canvas);
  ctx.clearRect(0, 0, width, height);
  const cx = width / 2; const cy = height / 2;
  const radius = Math.min(width, height) / 2 - 6;
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;
  let start = -Math.PI / 2;
  segments.forEach((seg) => {
    const angle = (seg.value / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, start, start + angle);
    ctx.strokeStyle = seg.color;
    ctx.lineWidth = 10;
    ctx.lineCap = 'butt';
    ctx.stroke();
    start += angle;
  });
}

/** Anillo de progreso simple (0-100) usado en Dashboard / Mi nivel. */
export function drawProgressRing(canvas, percent, color = '#4c8dff', trackColor = null) {
  const { ctx, width, height } = setupCanvas(canvas);
  ctx.clearRect(0, 0, width, height);
  const cx = width / 2; const cy = height / 2;
  const radius = Math.min(width, height) / 2 - 7;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.strokeStyle = trackColor || cssVar('--bg-4') || '#232933';
  ctx.lineWidth = 9;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx, cy, radius, -Math.PI / 2, -Math.PI / 2 + (percent / 100) * Math.PI * 2);
  ctx.strokeStyle = color;
  ctx.lineWidth = 9;
  ctx.lineCap = 'round';
  ctx.stroke();
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
