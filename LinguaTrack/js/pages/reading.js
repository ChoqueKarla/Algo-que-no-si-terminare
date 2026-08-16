import { renderSkillLogPage } from '../components/skillLogFactory.js';
import { Icon } from '../components/icons.js';

export function renderReading(container) {
  renderSkillLogPage(container, {
    type: 'reading',
    title: 'Reading',
    icon: Icon.bookOpen,
    fields: [
      { key: 'material', label: 'Material', type: 'select', options: [
        { value: 'historia', label: 'Historia/cuento' }, { value: 'libro', label: 'Libro' },
        { value: 'articulo', label: 'Artículo' }, { value: 'noticia', label: 'Noticia' },
      ] },
      { key: 'title', label: 'Título', type: 'text' },
      { key: 'comprehension', label: 'Comprensión', type: 'rating' },
    ],
  });
}
