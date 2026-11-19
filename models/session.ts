import type { SessionModality, SessionPricing } from "../lib/domain/pricing.ts";
import type { MeetingProvider } from "../lib/domain/meeting.ts";

/**
 * Monitoría (`sessions/{id}`): una única sesión por franja reservada, con un profesor,
 * una materia, un horario y uno o varios estudiantes participantes.
 *
 * Estados:
 *   OPEN       admite participantes (grupal con cupos libres)
 *   FULL       capacidad completa
 *   CONFIRMED  confirmada por el profesor (ya no admite nuevos participantes)
 *   COMPLETED  realizada (cerrada por el profesor con asistencia)
 *   CANCELLED  cancelada
 */
export const SessionStatuses = ["OPEN", "FULL", "CONFIRMED", "COMPLETED", "CANCELLED"] as const;
export type SessionStatus = (typeof SessionStatuses)[number];

/** Estados en los que la monitoría sigue vigente (no cerrada ni cancelada). */
export const ACTIVE_SESSION_STATUSES: SessionStatus[] = ["OPEN", "FULL", "CONFIRMED"];

export type Session = {
  id: string;
  availabilityId: string;
  professorId: string;
  subjectId: string;
  date: string;
  startTime: string;
  endTime: string;
  startAt: number;
  endAt: number;
  durationMinutes: number;
  timezone: string;
  modality: SessionModality;
  capacity: number;
  participantCount: number;
  /** Estudiantes con participación ACTIVE (o ATTENDED/ABSENT si ya se cerró). */
  participantIds: string[];
  /** Estudiante que creó la monitoría al reservar la franja. */
  organizerId: string;
  status: SessionStatus;
  /** Precio y distribución calculados en el servidor al crear la monitoría. */
  pricing: SessionPricing;
  /** Indica si hay enlace registrado, sin exponerlo (el enlace vive en un subdocumento privado). */
  hasMeetingLink: boolean;
  createdAt: number;
  updatedAt?: number;
  confirmedAt?: number;
  completedAt?: number;
  cancelledAt?: number;
  cancelledBy?: string;
  cancellationReason?: string;
};

/**
 * Enlace de videoconferencia: `sessions/{id}/private/meeting`.
 * Separado del documento principal para que solo se lea cuando el usuario está autorizado
 * (profesor de la monitoría, participante activo o administrador).
 * `source` y `externalId` dejan preparada la integración con las API de Meet / Zoom.
 */
export type SessionMeeting = {
  provider: MeetingProvider;
  url: string;
  source: "MANUAL" | "GOOGLE_MEET_API" | "ZOOM_API";
  externalId: string | null;
  updatedAt: number;
  updatedBy: string;
};
