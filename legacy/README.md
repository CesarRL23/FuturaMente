# Código heredado (sistema de notas)

Esta carpeta conserva el código del sistema anterior de gestión de notas, que **ya no forma parte
del funcionamiento activo de MONLINE**:

- `grades-system/app/professor/{grades,observations,progress}` — registro de notas semanales,
  observaciones y progreso (panel profesor).
- `grades-system/app/student/{grades,progress}` — consulta de notas y progreso (panel estudiante).
- `grades-system/components/` — formularios y vista de progreso asociados.
- `grades-system/server/actions/professor.ts` — acciones de servidor de notas y observaciones.
- `grades-system/public/` — imagen de la portada anterior.

Por qué está aquí y no en `app/`:

- Fuera de `app/` no genera rutas; como nada la importa, no entra en el bundle y sus server
  actions no quedan expuestas.
- Está excluida de `tsconfig.json` y de ESLint, por lo que no afecta al build.

Los datos de Firestore (`grades`, `enrollments`, `observations`) **no se han borrado**.

Para recuperar una funcionalidad, mueve los archivos de vuelta a su ruta original (las rutas
de la carpeta replican la estructura del proyecto) y ajusta los imports. Todo el estado previo
también está en el commit `a020a9a` ("hasta aqui era fururamente").
