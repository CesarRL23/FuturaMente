/**
 * Parámetros de negocio de MONLINE.
 * Módulo puro (sin dependencias de Next ni Firebase) para poder usarlo en servidor, cliente
 * y pruebas unitarias. Cambiar un valor aquí lo aplica en toda la plataforma.
 */

/** Zona horaria de operación. Colombia no tiene horario de verano (UTC-5 todo el año). */
export const TIMEZONE = "America/Bogota";
export const TIMEZONE_UTC_OFFSET_MINUTES = -5 * 60;

export const CURRENCY = "COP";

/**
 * Tarifas por monitoría completa (no por estudiante), en pesos enteros.
 * Se elige el primer tramo cuyo `minParticipants` sea <= a la capacidad reservada,
 * recorriendo de mayor a menor.
 */
export const PRICE_TIERS = [
  { minParticipants: 3, price: 85_000, label: "Grupal (3 o más personas)" },
  { minParticipants: 2, price: 75_000, label: "Grupal (2 personas)" },
  { minParticipants: 1, price: 65_000, label: "Individual" },
] as const;

/** Distribución del precio total. Deben sumar 100. */
export const PROFESSOR_SHARE_PERCENT = 60;
export const PLATFORM_SHARE_PERCENT = 40;

/**
 * Límite operativo de participantes por monitoría grupal.
 * El negocio no fija un máximo; este valor existe solo para evitar capacidades absurdas
 * y puede ampliarse aquí sin otros cambios.
 */
export const MAX_GROUP_CAPACITY = 10;

/** Duración permitida de una franja de disponibilidad. */
export const SLOT_MIN_MINUTES = 30;
export const SLOT_MAX_MINUTES = 4 * 60;

/** Antelación mínima para publicar una franja o reservarla / unirse a ella. */
export const MIN_LEAD_MINUTES = 30;

/** Hasta cuántos días hacia adelante se puede publicar disponibilidad. */
export const MAX_DAYS_AHEAD = 90;

/** Plataformas de videoconferencia admitidas para los enlaces manuales. */
export const MEETING_PROVIDERS = {
  GOOGLE_MEET: { label: "Google Meet", hosts: ["meet.google.com"] },
  ZOOM: { label: "Zoom", hosts: ["zoom.us"], allowSubdomains: true },
} as const;
