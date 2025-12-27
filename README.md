# entrenador-nivel-2 (Next.js)

[Visita el sitio desplegado en GitHub Pages](https://freudiandev.github.io/entrenador-nivel-2/) y pon a prueba el simulador en línea.

Simulador web para guardias de seguridad Nivel II. Construido con Next.js (App Router) para servir el banco oficial de preguntas, aleatorizar opciones y mostrar fundamentos teóricos al fallar.

## Arquitectura
- `app/`: páginas y layout. `app/page.tsx` es el simulador (cliente) y `app/layout.tsx` define el shell global.
- `app/globals.css`: hoja de estilos global (con footer con enlace a Instagram de freudiandev).
- `lib/quiz.ts`: lógica de parseo, categorización, aleatorización y generación de feedback.
- `public/data/question-bank.txt` y `public/data/theory.txt`: banco completo de preguntas y teoría (texto plano). Se cargan en el cliente al iniciar.
- `next.config.mjs`, `tsconfig.json`: configuración de Next/TypeScript.

## Tecnologías
- Next.js 16
- React 19
- TypeScript 5.9
- ESLint 9 (con `eslint-config-next`)

## Características recientes
- Feedback ampliado: muestra el fragmento completo de teoría y la sección del manual (módulo/unidad) donde se respalda la respuesta.
- Export estática preparada para GitHub Pages con `basePath` `/entrenador-nivel-2`.
- Footer global con crédito “programado por freudiandev” y enlace a Instagram.
- Dockerfile listo con Nginx para servir la exportación (`out/`) en cualquier entorno.

## Despliegue (GitHub Pages)
- Producción pública: https://freudiandev.github.io/entrenador-nivel-2/
- Empuja a `main` para actualizar el sitio; el flujo de despliegue toma la versión actual y la sirve en GitHub Pages.
- La exportación estática usa `basePath` `/entrenador-nivel-2` (se activa automáticamente en GitHub Actions con `GITHUB_ACTIONS=true`).

## Uso
1. Instala dependencias: `npm install`.
2. Desarrollo: `npm run dev` y abre `http://localhost:3000`.
3. Producción: `npm run build` y luego `npm start`.
4. Export con basePath (como en Pages): `GITHUB_ACTIONS=true npm run build` (genera `out/`).
5. Lint: `npm run lint`.

## Flujo del simulador
- Pantalla inicial con reglas y botón **Iniciar Entrenamiento**.
- El banco se carga, se aleatoriza el orden de preguntas y opciones, y se rellenan distractores.
- Al contestar se bloquean opciones, se marca la correcta, y si fallas se muestra el fundamento teórico completo, indicando la sección del manual donde está la respuesta.
- Nota mínima de aprobación: 80% (se calcula según total de preguntas).
- Pantalla de resultado con botones para reiniciar o volver al inicio.

## Notas
- El antiguo `index.html` fue retirado para evitar confusiones; la raíz del proyecto es la app de Next.js.
- Si actualizas el banco o la teoría, edita los `.txt` en `public/data/` y la lógica los recargará en el cliente.
- GitHub Pages sirve la exportación estática generada por Next.js (`out/`); el `index.html` raíz no participa en el despliegue.

## Docker
1. Construir la imagen: `docker build -t entrenador-nivel-2 .`
2. Ejecutar el contenedor: `docker run -p 8080:80 entrenador-nivel-2`
3. Abre `http://localhost:8080` para usar el simulador (sirve la exportación estática de Next.js).

## Hashtags y SEO
- Hashtags: #EntrenamientoSeguridad #GuardiaNivel2 #SimuladorExamen #CapacitacionSeguridad #LicenciaSeguridad
- Palabras clave: simulador guardia de seguridad, preguntas nivel II, banco de preguntas, teoría seguridad privada, entrenamiento online
