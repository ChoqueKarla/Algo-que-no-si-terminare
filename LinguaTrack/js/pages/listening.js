import { renderSkillLogPage } from '../components/skillLogFactory.js';
import { Icon } from '../components/icons.js';

export function renderListening(container) {
  renderSkillLogPage(container, {
    type: 'listening',
    title: 'Listening',
    icon: Icon.headphones,
    fields: [
      { key: 'source', label: 'Fuente', type: 'select', options: [
        { value: 'podcast', label: 'Podcast' }, { value: 'video', label: 'Video' },
        { value: 'cancion', label: 'Canción' }, { value: 'otro', label: 'Otro' },
      ] },
      { key: 'title', label: 'Título', type: 'text' },
      { key: 'comprehension', label: 'Comprensión', type: 'rating' },
    ],
  });
}
