import { renderSkillLogPage } from '../components/skillLogFactory.js';
import { Icon } from '../components/icons.js';

export function renderShadowing(container) {
  renderSkillLogPage(container, {
    type: 'shadowing',
    title: 'Shadowing',
    icon: Icon.repeat,
    fields: [
      { key: 'source', label: 'Audio/video usado', type: 'text' },
      { key: 'accuracy', label: 'Precisión de imitación', type: 'rating' },
    ],
  });
}
