/**
 * profile.js — datos personales del estudiante y resumen de su viaje.
 */
import { State, computeStats } from '../core/state.js';
import { LANGUAGE_LIST } from '../data/languages.js';
import { esc, formatLongDate } from '../core/utils.js';
import { showToast } from '../components/toast.js';
import { updateProfileChip } from '../components/navbar.js';
import { Icon } from '../components/icons.js';

export function renderProfile(container) {
  const profile = State.getProfile();
  const stats = computeStats();

  container.innerHTML = `
    <div class="grid split-profile">
      <div class="card" style="text-align:center;">
        <div class="avatar" id="profile-avatar" style="width:88px; height:88px; font-size:32px; margin:0 auto 14px;">${(profile.avatarInitial || profile.name[0]).toUpperCase()}</div>
        <h2 style="margin-bottom:2px;">${esc(profile.name)}</h2>
        <p class="text-muted">Miembro desde ${formatLongDate(new Date(`${profile.joinDate}T00:00:00`))}</p>
        <div class="flex gap-2" style="justify-content:center; flex-wrap:wrap;">
          ${LANGUAGE_LIST.map((l) => `<span class="badge ${l.badgeClass}">${l.flag} ${l.name}</span>`).join('')}
        </div>
      </div>

      <div class="card">
        <div class="card-title"><h3>Editar perfil</h3></div>
        <form id="profile-form">
          <div class="field"><label>Nombre</label><input name="name" value="${esc(profile.name)}" required /></div>
          <div class="field"><label>Inicial de avatar</label><input name="avatarInitial" maxlength="2" value="${esc(profile.avatarInitial || '')}" /></div>
          <div class="field"><label>Biografía</label><textarea name="bio">${esc(profile.bio || '')}</textarea></div>
        </form>
        <button class="btn btn-primary" id="save-profile-btn">Guardar cambios</button>
      </div>
    </div>

    <div class="grid grid-4 mt-4">
      <div class="card stat-card"><div class="stat-icon">${Icon.flame}</div><div class="stat-value">${stats.streak}</div><div class="stat-label">Racha actual</div></div>
      <div class="card stat-card"><div class="stat-icon">${Icon.clock}</div><div class="stat-value">${stats.totalHours}h</div><div class="stat-label">Horas totales</div></div>
      <div class="card stat-card"><div class="stat-icon">${Icon.book}</div><div class="stat-value">${stats.wordsLearned}</div><div class="stat-label">Palabras aprendidas</div></div>
      <div class="card stat-card"><div class="stat-icon">${Icon.trophy}</div><div class="stat-value">${State.getAchievements().length}</div><div class="stat-label">Logros</div></div>
    </div>
  `;

  container.querySelector('#save-profile-btn').addEventListener('click', () => {
    const form = document.getElementById('profile-form');
    const data = Object.fromEntries(new FormData(form).entries());
    State.setProfile({ ...profile, ...data });
    updateProfileChip();
    showToast('Perfil actualizado', 'success');
    renderProfile(container);
  });
}
