/**
 * statistics.js — gráficos (barras, líneas, donut) dibujados a mano en
 * <canvas>, sin librerías externas, con datos derivados del estado real.
 */
import { State, computeStats } from '../core/state.js';
import { LANGUAGE_LIST } from '../data/languages.js';
import { toISODate, addDays, weekdayShort } from '../core/utils.js';
import { drawBarChart, drawLineChart, drawDonut } from '../components/charts.js';
import { Icon } from '../components/icons.js';

export function renderStatistics(container) {
  const stats = computeStats();
  const plan = State.getPlan();
  const logs = State.getLogs();
  const exams = State.getExams();

  // Minutos estudiados en los últimos 14 días (plan completado + logs registrados ese día)
  const last14 = Array.from({ length: 14 }, (_, i) => addDays(new Date(), -13 + i));
  const minutesByDay = last14.map((d) => {
    const iso = toISODate(d);
    const dayPlan = plan.find((p) => p.date === iso);
    const planMin = dayPlan ? dayPlan.languages.filter((b) => b.status === 'completado').reduce((s, b) => s + (b.duration || 0), 0) : 0;
    const logMin = Object.values(logs).flat().filter((l) => l.date === iso).reduce((s, l) => s + (Number(l.minutes) || 0), 0);
    return planMin + logMin;
  });

  // Palabras aprendidas acumuladas (aproximado por fecha de aprendizaje)
  const allWords = Object.values(State.getVocabulary()).flat().filter((w) => w.learnedDate);
  const cumulativeWords = last14.map((d) => {
    const iso = toISODate(d);
    return allWords.filter((w) => w.learnedDate <= iso).length;
  });

  const skillCounts = ['listening', 'speaking', 'reading', 'writing', 'pronunciation', 'shadowing'].map((k) => logs[k]?.length || 0);
  const examScores = exams.slice(-10);

  container.innerHTML = `
    <div class="grid grid-4 mb-4">
      <div class="card stat-card"><div class="stat-icon">${Icon.clock}</div><div class="stat-value">${stats.totalHours}h</div><div class="stat-label">Horas totales</div></div>
      <div class="card stat-card"><div class="stat-icon">${Icon.flame}</div><div class="stat-value">${stats.streak}</div><div class="stat-label">Racha actual</div></div>
      <div class="card stat-card"><div class="stat-icon">${Icon.fileText}</div><div class="stat-value">${stats.examsAvgScore}%</div><div class="stat-label">Promedio de exámenes</div></div>
      <div class="card stat-card"><div class="stat-icon">${Icon.book}</div><div class="stat-value">${stats.wordsLearned}</div><div class="stat-label">Palabras en proceso</div></div>
    </div>

    <div class="grid grid-2 mb-4">
      <div class="card">
        <div class="card-title"><h3>Minutos estudiados (últimos 14 días)</h3></div>
        <canvas id="chart-minutes" style="width:100%; height:220px;"></canvas>
      </div>
      <div class="card">
        <div class="card-title"><h3>Palabras acumuladas (últimos 14 días)</h3></div>
        <canvas id="chart-words" style="width:100%; height:220px;"></canvas>
      </div>
    </div>

    <div class="grid grid-2 mb-4">
      <div class="card">
        <div class="card-title"><h3>Sesiones por habilidad</h3></div>
        <div class="flex" style="align-items:center; gap:20px;">
          <canvas id="chart-skills" width="160" height="160"></canvas>
          <div class="flex-col gap-2">
            ${['Listening','Speaking','Reading','Writing','Pronunciación','Shadowing'].map((l, i) => `
              <div class="flex gap-2" style="align-items:center;"><span style="width:10px; height:10px; border-radius:50%; background:${donutColor(i)};"></span><span style="font-size:var(--fs-sm);">${l}: ${skillCounts[i]}</span></div>
            `).join('')}
          </div>
        </div>
      </div>
      <div class="card">
        <div class="card-title"><h3>Comparación entre idiomas · días completados</h3></div>
        <canvas id="chart-lang" style="width:100%; height:220px;"></canvas>
      </div>
    </div>

    <div class="card">
      <div class="card-title"><h3>Últimos exámenes</h3></div>
      ${examScores.length ? `<canvas id="chart-exams" style="width:100%; height:200px;"></canvas>` : '<p class="text-muted">Aún no hay exámenes registrados.</p>'}
    </div>
  `;

  drawBarChart(document.getElementById('chart-minutes'), last14.map((d) => weekdayShort(d.getDay())), minutesByDay, { color: '#4c8dff' });
  drawLineChart(document.getElementById('chart-words'), last14.map((d) => `${d.getDate()}`), [{ label: 'Palabras', color: '#3ecf8e', values: cumulativeWords }]);
  drawDonut(document.getElementById('chart-skills'), skillCounts.map((v, i) => ({ value: v || 0.001, color: donutColor(i) })));
  drawBarChart(document.getElementById('chart-lang'), LANGUAGE_LIST.map((l) => l.name.split(' ')[0]), LANGUAGE_LIST.map((l) => stats.perLanguage[l.code].completedDays), { color: '#e8b339' });
  if (examScores.length) {
    drawLineChart(document.getElementById('chart-exams'), examScores.map((e) => e.date.slice(5)), [{ label: 'Puntaje', color: '#4c8dff', values: examScores.map((e) => e.score) }]);
  }
}

function donutColor(i) {
  const palette = ['#4c8dff', '#ef5b7a', '#e8b339', '#3ecf8e', '#a97bff', '#5b6472'];
  return palette[i % palette.length];
}
