import { renderSkillLogPage } from '../components/skillLogFactory.js';
import { Icon } from '../components/icons.js';

export function renderPronunciation(container) {
  renderSkillLogPage(container, {
    type: 'pronunciation',
    title: 'Pronunciación',
    icon: Icon.volume,
    fields: [
      { key: 'sound', label: 'Sonido / palabra difícil', type: 'text' },
      { key: 'rating', label: 'Dominio actual', type: 'rating' },
    ],
  });
}
