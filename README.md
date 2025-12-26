# entrenador-nivel-2

Entrenador web para guardias de seguridad Nivel II. Genera un cuestionario con todo el banco oficial de preguntas y retroalimenta con teoría del manual cuando hay errores.

## Uso

- Abre `index.html` en tu navegador (no requiere servidor ni dependencias).
- Pulsa **Iniciar Entrenamiento**.
- Responde: las opciones se aleatorizan en cada carga.
- Si fallas: se marca en rojo, se resalta la opción correcta y aparece el fundamento teórico.
- El puntaje mínimo de aprobación es 80%.

## Estructura

- `index.html`: HTML/CSS/JS inline. Incluye:
  - Banco de preguntas en `<script type="text/plain" id="question-bank-raw">`.
  - Teoría completa en `<script type="text/plain" id="theory-raw">`.
  - Lógica JS para parsear, aleatorizar y mostrar feedback.
  - Estilos propios + Bootstrap para responsive sin scroll horizontal.

## Guía rápida de diseño (UI/UX)

- Usar la paleta existente (`--primary` azul, `--secondary` dorado) para mantener coherencia visual.
- Mantener padding horizontal en móviles (`px-3` o más) para evitar texto pegado a los bordes.
- Evitar overflow horizontal; verificar que textos largos tengan `overflow-wrap:anywhere`.
- Botones: `btn` principal en azul; `btn-restart` en rojo.
- Tipografía: sistema (Segoe UI / Roboto / Helvetica / Arial).

## Notas técnicas

- Aleatorización de preguntas/opciones con `crypto.getRandomValues` cuando está disponible.
- Parseo robusto de preguntas/alternativas desde el bloque de texto plano (busca `ANSWER:`).
- Las respuestas correctas y la justificación se muestran siempre que se falle.
- Las preguntas se categorizan automáticamente por módulo según palabras clave del enunciado.

## Desarrollo

No hay dependencias ni build steps. Si necesitas ajustar contenido:
- Edita el bloque `question-bank-raw` para actualizar o añadir preguntas.
- Edita el bloque `theory-raw` si cambia el material de referencia.
- La lógica está al final del archivo en el script principal.
