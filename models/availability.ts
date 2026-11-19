/**
 * Franja de disponibilidad publicada por un profesor (`availability/{id}`).
 *
 * Ciclo de vida:
 *   AVAILABLE ──(un estudiante reserva)──▶ BOOKED ──(se libera)──▶ AVAILABLE
 *                                           └──(profesor cancela sin liberar)──▶ CANCELLED
 * Una franja AVAILABLE puede editarse o eliminarse; una BOOKED o CANCELLED no.
 */

export const AvailabilityStatuses = ["AVAILABLE", "BOOKED", "CANCELLED"] as const;
export type AvailabilityStatus = (typeof AvailabilityStatuses)[number];

export type AvailabilitySlot = {
  id: string;
  professorId: string;
  subjectId: string;
  date: string; // YYYY-MM-DD, hora local de Colombia
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  startAt: number; // epoch ms (para consultas y orden)
  endAt: number; // epoch ms
  durationMinutes: number;
  timezone: string; // "America/Bogota"
  status: AvailabilityStatus;
  /** Monitoría creada sobre esta franja (si está BOOKED, o la última que la ocupó). */
  sessionId: string | null;
  createdAt: number;
  updatedAt?: number;
};
