import { renderSkillLogPage } from '../components/skillLogFactory.js';
import { Icon } from '../components/icons.js';

export function renderWriting(container) {
  renderSkillLogPage(container, {
    type: 'writing',
    title: 'Writing',
    icon: Icon.pen,
    fields: [
      { key: 'format', label: 'Formato', type: 'select', options: [
        { value: 'redaccion', label: 'Redacción' }, { value: 'diario', label: 'Diario personal' },
        { value: 'dialogo', label: 'Diálogo' }, { value: 'otro', label: 'Otro' },
      ] },
      { key: 'wordCount', label: 'Palabras escritas', type: 'number' },
      { key: 'corrections', label: 'Correcciones / errores', type: 'textarea' },
    ],
  });
}
