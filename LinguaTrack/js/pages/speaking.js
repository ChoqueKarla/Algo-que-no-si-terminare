import { renderSkillLogPage } from '../components/skillLogFactory.js';
import { Icon } from '../components/icons.js';

export function renderSpeaking(container) {
  renderSkillLogPage(container, {
    type: 'speaking',
    title: 'Speaking',
    icon: Icon.mic,
    fields: [
      { key: 'mode', label: 'Modalidad', type: 'select', options: [
        { value: 'shadowing', label: 'Shadowing' }, { value: 'lectura', label: 'Lectura en voz alta' },
        { value: 'conversacion', label: 'Conversación' }, { value: 'monologo', label: 'Monólogo grabado' },
      ] },
      { key: 'pronunciationRating', label: 'Pronunciación', type: 'rating' },
      { key: 'errors', label: 'Errores detectados', type: 'textarea' },
    ],
  });
}
