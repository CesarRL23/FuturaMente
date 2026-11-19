# MONLINE

Plataforma web de monitorías académicas: conecta a profesores que ofrecen monitorías con
estudiantes que necesitan refuerzo.

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · Firebase
Authentication · Cloud Firestore · Firebase Admin SDK · Zod · React Hook Form · Recharts.

## Ejecutar

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start   # producción
npm run lint
```

Variables necesarias en `.env.local`: `NEXT_PUBLIC_FIREBASE_*`, `FIREBASE_SERVICE_ACCOUNT_JSON`
y, opcionalmente, `AUTH_COOKIE_NAME` (por defecto `monline_session`).

Para dar rol de administrador: `npx ts-node set-admin.ts "correo@dominio.com"`.

## Roles y paneles

| Rol | Ruta | Secciones |
| --- | --- | --- |
| ADMIN | `/admin` | Dashboard, Profesores, Estudiantes, Materias, Monitorías, Reservas, Liquidaciones, Reportes, Usuarios y permisos, Configuración |
| PROFESSOR | `/professor` | Dashboard, Mi perfil, Mis materias, Mi disponibilidad, Mis monitorías, Historial |
| STUDENT | `/student` | Dashboard, Buscar monitorías, Mis reservas, Historial, Mi perfil |

La navegación está en `lib/navigation.ts`. Cada layout de rol y cada página llaman a
`requireRole()`; `/dashboard` redirige al panel correspondiente con `roleLanding()`.

## Estructura

```
app/                 rutas (App Router) por rol + autenticación
components/ui        Button, Card, Input/Textarea/Select/Label, Alert, Badge, Icon, EmptyState, StatCard, PageHeader, ModuleCard, DataTable
components/layout    SiteHeader, Logo, AuthShell, PanelShell, PanelNav
lib/auth             sesión (cookie + Firebase Admin), requireRole, roleLanding
lib/data             consultas de lectura a Firestore (server-only)
models               tipos de datos y nombres de colecciones
server/actions       lógica de negocio (server actions validadas con Zod)
legacy/              código del sistema anterior de notas, fuera del funcionamiento activo
```

Diseño: los colores de marca se definen como tokens `brand-*` en `app/globals.css` (`@theme`)
y se combinan con los neutros `slate` de Tailwind.

## Datos (Firestore)

| Colección | Estado | Modelo |
| --- | --- | --- |
| `users` | activa | `models/user.ts` (incluye `professorProfile` / `studentProfile` opcionales) |
| `subjects` | activa | `models/subject.ts` — relación N:M con profesores mediante `professorIds` |
| `availability` | activa | `models/availability.ts` — franjas con fecha: AVAILABLE · BOOKED · CANCELLED |
| `sessions` | activa | `models/session.ts` — UNA monitoría por franja reservada: OPEN · FULL · CONFIRMED · COMPLETED · CANCELLED |
| `sessions/{id}/private/meeting` | activa | enlace de Meet/Zoom, separado para leerlo solo con autorización |
| `bookings` | activa | `models/booking.ts` — participación `{sessionId}_{studentId}`: ACTIVE · CANCELLED · ATTENDED · ABSENT |
| `locks` | técnica | serializa transacciones del mismo profesor/estudiante (`lib/data/locks.ts`) |
| `payments` | preparada (Fase 3) | `models/payment.ts` |
| `reviews` | preparada | `models/review.ts` |
| `grades`, `enrollments`, `observations` | histórico, sin uso | se conservan sin cambios |

## Reglas de negocio

Todos los parámetros están en `lib/domain/config.ts`:

| Parámetro | Valor |
| --- | --- |
| Tarifas por monitoría (no por estudiante) | 1 persona $65.000 · 2 personas $75.000 · 3 o más $85.000 |
| Distribución | 60 % profesor / 40 % MONLINE (enteros; MONLINE recibe el resto del redondeo) |
| Capacidad máxima de una monitoría grupal | 10 (límite operativo configurable, `MAX_GROUP_CAPACITY`) |
| Duración de una franja | 30 min a 4 h |
| Antelación mínima para publicar y reservar | 30 min · se publica hasta 90 días adelante |
| Zona horaria | America/Bogota (UTC-5) |
| Enlaces admitidos | HTTPS de `meet.google.com` o `zoom.us` (y subdominios de Zoom) |

Flujo: el profesor publica una franja → un estudiante la reserva eligiendo la capacidad →
se crea una monitoría con el precio calculado en el servidor y la franja pasa a BOOKED →
otros estudiantes pueden unirse mientras esté OPEN → el profesor registra el enlace,
confirma, y al final cierra la monitoría registrando la asistencia.
Si todos los participantes cancelan, la monitoría se cancela y la franja vuelve a AVAILABLE.
Si cancela el profesor, la franja queda CANCELLED salvo que marque "volver a publicar".

Arquitectura: `lib/domain/*` son reglas puras (probadas con pruebas unitarias),
`lib/services/*` las ejecutan dentro de transacciones de Firestore y `server/actions/*`
solo autentican (`requireRole`), validan con Zod y delegan.

## Índices y reglas de Firestore

Las consultas requieren los índices compuestos de `firestore.indexes.json`. Despliégalos
(y las reglas de `firestore.rules`, que niegan todo acceso directo desde el navegador) con:

```bash
npx firebase-tools login
npx firebase-tools deploy --only firestore:indexes,firestore:rules --project <id-del-proyecto>
```

Hasta que los índices terminen de construirse, las páginas que los usan fallan con un error
`FAILED_PRECONDITION` (el log del servidor incluye el enlace para crearlos).

## Pruebas

```bash
npm test                 # unitarias: tarifas, horarios, enlaces, estados y cupos (sin Firebase)
npm run test:integration # flujo completo contra el emulador local de Firestore (requiere Java)
```

Las de integración usan el proyecto ficticio `demo-monline` en el emulador (puerto 8181);
nunca tocan la base real.

**Compatibilidad de `subjects`:** los documentos antiguos solo tienen `professorId`.
`normalizeSubject()` lo convierte en `professorIds` al leer; al modificar los profesores de una
materia se escribe `professorIds` (el campo antiguo no se borra, pero se ignora).

## Cookie de sesión

El nombre pasó de `acadex_session` a `monline_session`. Para no cerrar la sesión de golpe, el
servidor sigue aceptando la cookie antigua (`LEGACY_AUTH_COOKIE_NAMES` en `lib/env.ts`), y al
iniciar o cerrar sesión se borra. Como las cookies duran 5 días, pasado ese plazo tras el
despliegue se puede vaciar esa lista.
