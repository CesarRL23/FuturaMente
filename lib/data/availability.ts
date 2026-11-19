import "server-only";

import type { Query } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase/admin";
import { MIN_LEAD_MINUTES } from "@/lib/domain/config";
import { localDayRange } from "@/lib/domain/schedule";
import type { AvailabilitySlot } from "@/models/availability";
import { Collections } from "@/models/collections";

const DAY = 24 * 3600_000;

export function toSlot(id: string, data: FirebaseFirestore.DocumentData): AvailabilitySlot {
  return { ...(data as AvailabilitySlot), id };
}

/**
 * Franjas del profesor desde hace 7 días en adelante.
 * Índice: availability (professorId ASC, startAt ASC).
 */
export async function listProfessorSlots(professorId: string, now: number): Promise<AvailabilitySlot[]> {
  const snap = await getAdminDb()
    .collection(Collections.AVAILABILITY)
    .where("professorId", "==", professorId)
    .where("startAt", ">=", now - 7 * DAY)
    .orderBy("startAt", "asc")
    .limit(300)
    .get();
  return snap.docs.map((d) => toSlot(d.id, d.data()));
}

export type SearchFilters = { subjectId?: string; professorId?: string; date?: string };

/** Aplica los filtros comunes de búsqueda (estado, materia, profesor, fecha) ordenando por inicio. */
export function applySearchFilters(
  base: Query,
  status: string,
  filters: SearchFilters,
  now: number,
): Query {
  let q = base.where("status", "==", status);
  if (filters.subjectId) q = q.where("subjectId", "==", filters.subjectId);
  if (filters.professorId) q = q.where("professorId", "==", filters.professorId);

  let from = now + MIN_LEAD_MINUTES * 60_000;
  const day = filters.date ? localDayRange(filters.date) : null;
  if (day) {
    from = Math.max(from, day.from);
    q = q.where("startAt", "<", day.to);
  }
  return q.where("startAt", ">=", from).orderBy("startAt", "asc");
}

/**
 * Franjas disponibles para reservar (no muestra BOOKED ni CANCELLED).
 * Índices: availability (status, startAt), (status, subjectId, startAt),
 * (status, professorId, startAt), (status, subjectId, professorId, startAt).
 */
export async function searchAvailableSlots(
  filters: SearchFilters,
  now: number,
  limit = 60,
): Promise<AvailabilitySlot[]> {
  const q = applySearchFilters(getAdminDb().collection(Collections.AVAILABILITY), "AVAILABLE", filters, now);
  const snap = await q.limit(limit).get();
  return snap.docs.map((d) => toSlot(d.id, d.data()));
}
