/**
 * modal.js — ventana modal genérica y reutilizable.
 * openModal({ title, bodyHTML, actions, onMount }) construye y abre el modal.
 * openFormModal(...) es un atajo para formularios de creación/edición.
 */
import { esc } from '../core/utils.js';

let closeCurrent = null;

export function closeModal() {
  const root = document.getElementById('modal-root');
  root.classList.remove('open');
  root.innerHTML = '';
  closeCurrent = null;
}

export function openModal({ title, bodyHTML, actions = [], onMount = null, wide = false }) {
  const root = document.getElementById('modal-root');
  root.innerHTML = `
    <div class="modal-backdrop" data-close></div>
    <div class="modal-box" style="${wide ? 'max-width:720px;' : ''}">
      <div class="modal-header">
        <h3 style="margin:0;">${esc(title)}</h3>
        <button class="modal-close" data-close>&times;</button>
      </div>
      <div class="modal-body">${bodyHTML}</div>
      <div class="modal-actions"></div>
    </div>
  `;
  const actionsWrap = root.querySelector('.modal-actions');
  actions.forEach((a) => {
    const btn = document.createElement('button');
    btn.className = `btn ${a.className || 'btn-secondary'}`;
    btn.textContent = a.label;
    btn.addEventListener('click', () => {
      const result = a.onClick ? a.onClick() : undefined;
      if (result !== false) closeModal();
    });
    actionsWrap.appendChild(btn);
  });
  root.querySelectorAll('[data-close]').forEach((elx) => elx.addEventListener('click', closeModal));
  root.classList.add('open');
  closeCurrent = closeModal;
  if (onMount) onMount(root);
  return root;
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && closeCurrent) closeCurrent();
});
