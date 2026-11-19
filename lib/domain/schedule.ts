import {
  MAX_DAYS_AHEAD,
  MIN_LEAD_MINUTES,
  SLOT_MAX_MINUTES,
  SLOT_MIN_MINUTES,
  TIMEZONE_UTC_OFFSET_MINUTES,
} from "./config.ts";
import { DomainError } from "./errors.ts";

const MINUTE = 60_000;
const DAY = 24 * 60 * MINUTE;

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

export type SlotTimes = {
  date: string; // YYYY-MM-DD (hora local de Colombia)
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  startAt: number; // epoch ms
  endAt: number; // epoch ms
  durationMinutes: number;
};

/** Convierte fecha y hora locales (Colombia) a epoch ms. Devuelve null si no son válidas. */
export function localToEpoch(date: string, time: string): number | null {
  const d = DATE_RE.exec(date);
  const t = TIME_RE.exec(time);
  if (!d || !t) return null;
  const [y, m, day] = [Number(d[1]), Number(d[2]), Number(d[3])];
  const utc = Date.UTC(y, m - 1, day, Number(t[1]), Number(t[2]));
  // Rechaza fechas imposibles (p. ej. 2026-02-30), que Date.UTC desbordaría al mes siguiente.
  const check = new Date(utc);
  if (check.getUTCFullYear() !== y || check.getUTCMonth() !== m - 1 || check.getUTCDate() !== day) {
    return null;
  }
  return utc - TIMEZONE_UTC_OFFSET_MINUTES * MINUTE;
}

/** Fecha local (Colombia) en formato YYYY-MM-DD para un instante dado. */
export function epochToLocalDate(epochMs: number): string {
  return new Date(epochMs + TIMEZONE_UTC_OFFSET_MINUTES * MINUTE).toISOString().slice(0, 10);
}

/** Inicio y fin (exclusivo) de un día local en epoch ms. */
export function localDayRange(date: string): { from: number; to: number } | null {
  const from = localToEpoch(date, "00:00");
  if (from === null) return null;
  return { from, to: from + DAY };
}

/** Valida y normaliza una franja de disponibilidad. Lanza DomainError con un mensaje claro. */
export function buildSlotTimes(
  input: { date: string; startTime: string; endTime: string },
  now: number,
): SlotTimes {
  const startAt = localToEpoch(input.date, input.startTime);
  const endAt = localToEpoch(input.date, input.endTime);
  if (startAt === null || endAt === null) {
    throw new DomainError("La fecha u hora no tienen un formato válido.");
  }
  if (endAt <= startAt) {
    throw new DomainError("La hora de finalización debe ser posterior a la hora de inicio.");
  }
  const durationMinutes = (endAt - startAt) / MINUTE;
  if (durationMinutes < SLOT_MIN_MINUTES) {
    throw new DomainError(`La franja debe durar al menos ${SLOT_MIN_MINUTES} minutos.`);
  }
  if (durationMinutes > SLOT_MAX_MINUTES) {
    throw new DomainError(`La franja no puede durar más de ${SLOT_MAX_MINUTES / 60} horas.`);
  }
  if (startAt < now + MIN_LEAD_MINUTES * MINUTE) {
    throw new DomainError(
      `La franja debe empezar al menos ${MIN_LEAD_MINUTES} minutos después de la hora actual.`,
    );
  }
  if (startAt > now + MAX_DAYS_AHEAD * DAY) {
    throw new DomainError(`Solo puedes publicar disponibilidad hasta ${MAX_DAYS_AHEAD} días adelante.`);
  }
  return {
    date: input.date,
    startTime: input.startTime,
    endTime: input.endTime,
    startAt,
    endAt,
    durationMinutes,
  };
}

/** Dos intervalos [start, end) se cruzan si cada uno empieza antes de que termine el otro. */
export function intervalsOverlap(
  a: { startAt: number; endAt: number },
  b: { startAt: number; endAt: number },
) {
  return a.startAt < b.endAt && b.startAt < a.endAt;
}

/** Margen para buscar candidatos a cruce: ninguna franja dura más que esto. */
export const OVERLAP_LOOKBACK_MS = SLOT_MAX_MINUTES * MINUTE;

export function isBookableTime(startAt: number, now: number) {
  return startAt >= now + MIN_LEAD_MINUTES * MINUTE;
}
