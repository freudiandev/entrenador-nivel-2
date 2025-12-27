# entrenador-nivel-2 (Next.js)

Simulador web para guardias de seguridad Nivel II. Construido con Next.js (App Router) para servir el banco oficial de preguntas, aleatorizar opciones y mostrar fundamentos teóricos al fallar.

## Arquitectura
- `app/`: páginas y layout. `app/page.tsx` es el simulador (cliente) y `app/layout.tsx` define el shell global.
- `app/globals.css`: hoja de estilos global extraída del HTML original.
- `lib/quiz.ts`: lógica de parseo, categorización, aleatorización y generación de feedback.
- `public/data/question-bank.txt` y `public/data/theory.txt`: banco completo de preguntas y teoría (texto plano). Se cargan en el cliente al iniciar.
- `next.config.mjs`, `tsconfig.json`: configuración de Next/TypeScript.

## Uso
1. Instala dependencias: `npm install`.
2. Desarrollo: `npm run dev` y abre `http://localhost:3000`.
3. Producción: `npm run build` y luego `npm start`.

## Flujo del simulador
- Pantalla inicial con reglas y botón **Iniciar Entrenamiento**.
- El banco se carga, se aleatoriza el orden de preguntas y opciones, y se rellenan distractores.
- Al contestar se bloquean opciones, se marca la correcta, y si fallas se muestra el fundamento teórico localizado en el material.
- Nota mínima de aprobación: 80% (se calcula según total de preguntas).
- Pantalla de resultado con botones para reiniciar o volver al inicio.

## Notas
- El antiguo `index.html` permanece sólo como referencia; la aplicación activa usa la estructura Next.js descrita arriba.
- Si actualizas el banco o la teoría, edita los `.txt` en `public/data/` y la lógica los recargará en el cliente.
