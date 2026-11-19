/**
 * Reglas de negocio de disponibilidad, monitorías y participaciones.
 *
 * Son funciones puras: reciben el estado leído (dentro de una transacción de Firestore) y
 * devuelven qué debe escribirse, o lanzan DomainError. La transacción garantiza que dos
 * operaciones concurrentes sobre el mismo documento no se apliquen sobre el mismo estado:
 * si dos estudiantes compiten por el último cupo, Firestore reintenta la segunda con el
 * estado ya actualizado y estas reglas la rechazan.
 */
import type { AvailabilitySlot } from "../../models/availability.ts";
import type { Booking, BookingStatus } from "../../models/booking.ts";
import type { Session, SessionStatus } from "../../models/session.ts";
import { DomainError } from "./errors.ts";
import { calculatePricing, type SessionPricing } from "./pricing.ts";
import { intervalsOverlap, isBookableTime } from "./schedule.ts";

type Interval = { startAt: number; endAt: number };

const ACTIVE: SessionStatus[] = ["OPEN", "FULL", "CONFIRMED"];

export function isSessionActive(status: SessionStatus) {
  return ACTIVE.includes(status);
}

/* ------------------------------------------------------------------ */
/* Disponibilidad                                                      */
/* ------------------------------------------------------------------ */

export function assertSlotEditable(slot: Pick<AvailabilitySlot, "status">) {
  if (slot.status === "BOOKED") {
    throw new DomainError("Esta franja ya tiene una monitoría reservada y no se puede modificar.");
  }
  if (slot.status === "CANCELLED") {
    throw new DomainError("Esta franja fue cancelada y no se puede modificar.");
  }
}

/**
 * Lanza DomainError si la franja candidata coincide o se cruza con otra del mismo profesor.
 * Las franjas CANCELLED no bloquean el horario.
 */
export function assertNoSlotOverlap(
  candidate: Interval,
  existing: Pick<AvailabilitySlot, "id" | "startAt" | "endAt" | "status" | "startTime" | "endTime" | "date">[],
  ignoreId?: string,
) {
  for (const slot of existing) {
    if (slot.id === ignoreId || slot.status === "CANCELLED") continue;
    if (slot.startAt === candidate.startAt && slot.endAt === candidate.endAt) {
      throw new DomainError("Ya publicaste una franja con exactamente ese horario.");
    }
    if (intervalsOverlap(candidate, slot)) {
      throw new DomainError(
        `El horario se cruza con otra franja tuya (${slot.date}, ${slot.startTime}–${slot.endTime}).`,
      );
    }
  }
}

/* ------------------------------------------------------------------ */
/* Reservar una franja (crea la monitoría)                             */
/* ------------------------------------------------------------------ */

function assertStudentFree(
  target: Interval,
  studentBookings: (Interval & { status: BookingStatus; sessionId?: string })[],
  ignoreSessionId?: string,
) {
  const clash = studentBookings.some(
    (b) =>
      b.status === "ACTIVE" &&
      (ignoreSessionId === undefined || b.sessionId !== ignoreSessionId) &&
      intervalsOverlap(target, b),
  );
  if (clash) throw new DomainError("Ya tienes otra monitoría reservada que se cruza con ese horario.");
}

export function planNewSession(params: {
  slot: Pick<AvailabilitySlot, "status" | "professorId" | "startAt" | "endAt">;
  subjectProfessorIds: string[];
  studentId: string;
  capacity: number;
  studentBookings: (Interval & { status: BookingStatus; sessionId?: string })[];
  now: number;
}): { pricing: SessionPricing; status: SessionStatus } {
  const { slot, studentId, now } = params;

  if (slot.status !== "AVAILABLE") throw new DomainError("Este horario ya no está disponible.");
  if (!isBookableTime(slot.startAt, now)) {
    throw new DomainError("Este horario ya no se puede reservar porque está por comenzar o ya pasó.");
  }
  if (slot.professorId === studentId) {
    throw new DomainError("No puedes reservar una monitoría contigo mismo.");
  }
  if (!params.subjectProfessorIds.includes(slot.professorId)) {
    throw new DomainError("El profesor ya no ofrece esta materia.");
  }
  assertStudentFree(slot, params.studentBookings);

  const pricing = calculatePricing(params.capacity);
  return { pricing, status: params.capacity === 1 ? "FULL" : "OPEN" };
}

/* ------------------------------------------------------------------ */
/* Unirse a una monitoría grupal existente                             */
/* ------------------------------------------------------------------ */

export function planJoinSession(params: {
  session: Pick<Session, "id" | "status" | "professorId" | "capacity" | "participantIds" | "startAt" | "endAt">;
  existingBooking: Pick<Booking, "status"> | null;
  studentId: string;
  studentBookings: (Interval & { status: BookingStatus; sessionId?: string })[];
  now: number;
}): { participantIds: string[]; status: SessionStatus } {
  const { session, studentId, now } = params;

  if (params.existingBooking?.status === "ACTIVE" || session.participantIds.includes(studentId)) {
    throw new DomainError("Ya estás inscrito en esta monitoría.");
  }
  switch (session.status) {
    case "OPEN":
      break;
    case "FULL":
      throw new DomainError("Esta monitoría ya no tiene cupos disponibles.");
    case "CONFIRMED":
      throw new DomainError("Esta monitoría ya fue confirmada y no admite nuevos participantes.");
    default:
      throw new DomainError("Esta monitoría ya no está disponible.");
  }
  if (session.professorId === studentId) {
    throw new DomainError("No puedes inscribirte en tu propia monitoría.");
  }
  if (session.participantIds.length >= session.capacity) {
    throw new DomainError("Esta monitoría ya no tiene cupos disponibles.");
  }
  if (!isBookableTime(session.startAt, now)) {
    throw new DomainError("Esta monitoría está por comenzar o ya pasó.");
  }
  assertStudentFree(session, params.studentBookings, session.id);

  const participantIds = [...session.participantIds, studentId];
  return {
    participantIds,
    status: participantIds.length >= session.capacity ? "FULL" : "OPEN",
  };
}

/* ------------------------------------------------------------------ */
/* Retirarse (estudiante)                                              */
/* ------------------------------------------------------------------ */

export function planLeaveSession(params: {
  session: Pick<Session, "status" | "capacity" | "participantIds" | "startAt">;
  booking: Pick<Booking, "status" | "studentId">;
  now: number;
}): {
  participantIds: string[];
  status: SessionStatus;
  /** Si no quedan participantes, la monitoría se cancela y la franja se libera. */
  cancelSession: boolean;
} {
  const { session, booking, now } = params;

  if (booking.status !== "ACTIVE") throw new DomainError("Esta reserva ya no está activa.");
  if (!isSessionActive(session.status)) throw new DomainError("Esta monitoría ya no está vigente.");
  if (now >= session.startAt) {
    throw new DomainError("La monitoría ya comenzó; no es posible cancelar la reserva.");
  }

  const participantIds = session.participantIds.filter((id) => id !== booking.studentId);
  if (participantIds.length === 0) {
    return { participantIds, status: "CANCELLED", cancelSession: true };
  }
  const status: SessionStatus =
    session.status === "CONFIRMED"
      ? "CONFIRMED"
      : participantIds.length >= session.capacity
        ? "FULL"
        : "OPEN";
  return { participantIds, status, cancelSession: false };
}

/* ------------------------------------------------------------------ */
/* Acciones del profesor                                               */
/* ------------------------------------------------------------------ */

export function assertCanConfirm(session: Pick<Session, "status" | "startAt">, now: number) {
  if (session.status !== "OPEN" && session.status !== "FULL") {
    throw new DomainError("Solo se pueden confirmar monitorías abiertas o completas.");
  }
  if (now >= session.startAt) throw new DomainError("La monitoría ya comenzó.");
}

export function assertCanCancelByProfessor(session: Pick<Session, "status" | "startAt">, now: number) {
  if (!isSessionActive(session.status)) throw new DomainError("Esta monitoría ya no está vigente.");
  if (now >= session.startAt) {
    throw new DomainError("La monitoría ya comenzó; ciérrala registrando la asistencia.");
  }
}

export function planComplete(
  session: Pick<Session, "status" | "startAt" | "participantIds">,
  attendedIds: string[],
  now: number,
): { attended: string[]; absent: string[] } {
  if (!isSessionActive(session.status)) throw new DomainError("Esta monitoría ya no está vigente.");
  if (now < session.startAt) {
    throw new DomainError("Solo puedes cerrar la monitoría a partir de su hora de inicio.");
  }
  const attendedSet = new Set(attendedIds);
  return {
    attended: session.participantIds.filter((id) => attendedSet.has(id)),
    absent: session.participantIds.filter((id) => !attendedSet.has(id)),
  };
}

export function assertMeetingEditable(session: Pick<Session, "status" | "endAt">, now: number) {
  if (!isSessionActive(session.status)) {
    throw new DomainError("No se puede cambiar el enlace de una monitoría cerrada o cancelada.");
  }
  if (now >= session.endAt) throw new DomainError("La monitoría ya terminó.");
}

/* ------------------------------------------------------------------ */
/* Autorización de lectura del enlace                                  */
/* ------------------------------------------------------------------ */

export function canViewMeeting(params: {
  session: Pick<Session, "status" | "professorId" | "participantIds">;
  viewerId: string;
  isAdmin: boolean;
  viewerBookingStatus: BookingStatus | null;
}) {
  const { session, viewerId } = params;
  if (params.isAdmin) return true;
  if (session.status === "CANCELLED") return false;
  if (session.professorId === viewerId) return true;
  return (
    session.participantIds.includes(viewerId) &&
    params.viewerBookingStatus !== null &&
    params.viewerBookingStatus !== "CANCELLED"
  );
}

/* ------------------------------------------------------------------ */
/* Clasificación para las vistas                                       */
/* ------------------------------------------------------------------ */

export type SessionBucket = "upcoming" | "pendingClose" | "completed" | "cancelled";

export function sessionBucket(session: Pick<Session, "status" | "endAt">, now: number): SessionBucket {
  if (session.status === "CANCELLED") return "cancelled";
  if (session.status === "COMPLETED") return "completed";
  return now < session.endAt ? "upcoming" : "pendingClose";
}

export function bookingBucket(
  booking: Pick<Booking, "status">,
  session: Pick<Session, "status" | "endAt">,
  now: number,
): SessionBucket {
  if (booking.status === "CANCELLED" || session.status === "CANCELLED") return "cancelled";
  if (booking.status === "ATTENDED" || booking.status === "ABSENT" || session.status === "COMPLETED") {
    return "completed";
  }
  return now < session.endAt ? "upcoming" : "pendingClose";
}
