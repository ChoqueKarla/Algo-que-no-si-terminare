/**
 * toast.js — notificaciones flotantes breves.
 */
export function showToast(message, type = 'default', duration = 3000) {
  const root = document.getElementById('toast-root');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  root.appendChild(toast);
  setTimeout(() => {
    toast.style.transition = 'opacity 300ms, transform 300ms';
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(30px)';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/** Pequeña lluvia de confeti para celebrar logros o días completados. */
export function celebrate() {
  const colors = ['#4c8dff', '#ef5b7a', '#e8b339', '#3ecf8e', '#f4f6f8'];
  for (let i = 0; i < 40; i += 1) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = `${Math.random() * 100}vw`;
    piece.style.width = `${6 + Math.random() * 6}px`;
    piece.style.height = `${6 + Math.random() * 6}px`;
    piece.style.background = colors[i % colors.length];
    piece.style.animationDuration = `${1.2 + Math.random() * 1.2}s`;
    document.body.appendChild(piece);
    setTimeout(() => piece.remove(), 3000);
  }
}
