/**
 * Participación de un estudiante en una monitoría (`bookings/{sessionId}_{studentId}`).
 *
 * El id determinista impide que un estudiante tenga dos participaciones en la misma monitoría.
 * Varias participaciones comparten una sola monitoría (`sessions`): reservar no bloquea un
 * horario por estudiante.
 *
 * Estados: ACTIVE (inscrito) · CANCELLED (se retiró o se canceló la monitoría)
 *          ATTENDED / ABSENT (asistencia registrada al cerrar la monitoría).
 */
export const BookingStatuses = ["ACTIVE", "CANCELLED", "ATTENDED", "ABSENT"] as const;
export type BookingStatus = (typeof BookingStatuses)[number];

export type Booking = {
  id: string;
  sessionId: string;
  studentId: string;
  professorId: string;
  subjectId: string;
  /** Copia del horario de la monitoría (inmutable una vez reservada) para consultas por estudiante. */
  startAt: number;
  endAt: number;
  status: BookingStatus;
  isOrganizer: boolean;
  createdAt: number;
  updatedAt?: number;
  cancelledAt?: number;
};

export function bookingId(sessionId: string, studentId: string) {
  return `${sessionId}_${studentId}`;
}
