import { TIMEZONE } from "@/lib/domain/config";

const dateFormatter = new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeZone: TIMEZONE });
const longDateFormatter = new Intl.DateTimeFormat("es-CO", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: TIMEZONE,
});
const shortDateFormatter = new Intl.DateTimeFormat("es-CO", {
  weekday: "short",
  day: "numeric",
  month: "short",
  timeZone: TIMEZONE,
});
const timeFormatter = new Intl.DateTimeFormat("es-CO", {
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
  timeZone: TIMEZONE,
});
const copFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

export function formatDate(epochMs: number | undefined | null) {
  if (!epochMs) return "—";
  return dateFormatter.format(new Date(epochMs));
}

/** "lunes, 23 de noviembre de 2026" */
export function formatLongDate(epochMs: number) {
  const text = longDateFormatter.format(new Date(epochMs));
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** "lun, 23 nov" */
export function formatShortDate(epochMs: number) {
  return shortDateFormatter.format(new Date(epochMs));
}

/** "8:00 a. m. – 10:00 a. m." */
export function formatTimeRange(startAt: number, endAt: number) {
  return `${timeFormatter.format(new Date(startAt))} – ${timeFormatter.format(new Date(endAt))}`;
}

/** "2 h", "1 h 30 min", "45 min" */
export function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

/** "$ 65.000" (pesos colombianos, enteros) */
export function formatCOP(value: number) {
  return copFormatter.format(value);
}
