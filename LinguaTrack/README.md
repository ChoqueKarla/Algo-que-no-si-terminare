# LinguaTrack

Aplicación web completa para el seguimiento de tu aprendizaje de **inglés, coreano y chino mandarín** durante 365 días. Construida 100% con **HTML5 + CSS3 + JavaScript vanilla (ES6+ con módulos)**, sin frameworks ni librerías externas. Todos los datos se guardan en **LocalStorage**.

## Cómo ejecutarla

Los módulos ES6 requieren servirse por `http://`, no funcionan abriendo `index.html` directamente con doble clic (`file://`). Desde la carpeta del proyecto:

```bash
# Opción 1: Python
python3 -m http.server 8080

# Opción 2: Node
npx serve .

# Opción 3: extensión "Live Server" de VS Code
```

Luego abre `http://localhost:8080` en tu navegador.

## Qué incluye

- **Dashboard**, **Calendario**, **Planificador**, **Mi progreso**, **Mi nivel**
- **Plan anual / mensual / semanal / diario**, generado algorítmicamente para 365 días (no repetido, dificultad creciente A0→B2)
- **Vocabulario** (35 categorías, repetición espaciada 1-3-7-15-30-60-90-180-365 días)
- **Gramática** por fase e idioma (explicación, ejemplos, errores comunes, ejercicios)
- **Listening, Speaking, Reading, Writing, Pronunciación, Shadowing** (registro de sesiones)
- **Exámenes** (generados desde tu vocabulario), **Repasos** (modo flashcard), **Logros**, **Estadísticas** (gráficos en Canvas nativo)
- **Configuración** (horario semanal que regenera el plan, metas, exportar/importar/restablecer datos), **Perfil**, **Acerca de**

## Arquitectura

```
index.html
css/            variables, base, layout, components, animations
js/
  core/         storage.js, state.js, router.js, utils.js, spacedRepetition.js
  data/         languages.js, phases.js, planGenerator.js, vocabularySeed.js,
                grammarSeed.js, achievementsData.js, quotes.js
  components/   sidebar, navbar, modal, toast, charts (Canvas), icons,
                skillLogFactory (reutilizado por las 6 páginas de habilidades)
  pages/        una función render por sección, registrada en app.js
```

## Añadir un idioma nuevo

1. Agrega una entrada en `js/data/languages.js` (código, nombre, bandera, color).
2. (Opcional) agrega palabras/gramática semilla en `vocabularySeed.js` / `grammarSeed.js`.
3. El generador de plan (`planGenerator.js`), el vocabulario, la gramática y todas las páginas leen el registro de idiomas dinámicamente — no hay nada más que tocar.
