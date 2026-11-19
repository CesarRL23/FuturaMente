import "server-only";

import type { Transaction } from "firebase-admin/firestore";
import { toSlot } from "@/lib/data/availability";
import { readLock, touchLock } from "@/lib/data/locks";
import { TIMEZONE } from "@/lib/domain/config";
import { DomainError } from "@/lib/domain/errors";
import { buildSlotTimes, OVERLAP_LOOKBACK_MS, type SlotTimes } from "@/lib/domain/schedule";
import { assertNoSlotOverlap, assertSlotEditable } from "@/lib/domain/sessionRules";
import { getAdminDb } from "@/lib/firebase/admin";
import type { AvailabilitySlot } from "@/models/availability";
import { Collections } from "@/models/collections";
import { normalizeSubject, type SubjectDoc } from "@/models/subject";

/**
 * Operaciones transaccionales sobre la disponibilidad de un profesor.
 * Reciben el uid ya autenticado (las Server Actions hacen requireRole y validan la entrada).
 */

export type SlotInput = { subjectId: string; date: string; startTime: string; endTime: string };

/** La materia debe existir, estar activa y tener al profesor en `professorIds`. */
async function assertSubjectAssigned(tx: Transaction, subjectId: string, professorId: string) {
  const snap = await tx.get(getAdminDb().collection(Collections.SUBJECTS).doc(subjectId));
  const subject = snap.exists ? normalizeSubject(snap.id, snap.data() as Partial<SubjectDoc>) : null;
  if (!subject || !subject.active || !subject.professorIds.includes(professorId)) {
    throw new DomainError("Solo puedes publicar disponibilidad en las materias que te asignó el administrador.");
  }
}

/** Franjas del profesor que podrían cruzarse con `times` (índice professorId + startAt). */
async function readPossibleOverlaps(tx: Transaction, professorId: string, times: SlotTimes) {
  const snap = await tx.get(
    getAdminDb()
      .collection(Collections.AVAILABILITY)
      .where("professorId", "==", professorId)
      .where("startAt", ">", times.startAt - OVERLAP_LOOKBACK_MS)
      .where("startAt", "<", times.endAt),
  );
  return snap.docs.map((d) => toSlot(d.id, d.data()));
}

async function readOwnSlot(tx: Transaction, slotId: string, professorId: string) {
  if (!slotId) throw new DomainError("Franja no válida.");
  const ref = getAdminDb().collection(Collections.AVAILABILITY).doc(slotId);
  const snap = await tx.get(ref);
  if (!snap.exists || snap.data()?.professorId !== professorId) {
    throw new DomainError("No encontramos esa franja.");
  }
  return { ref, slot: toSlot(snap.id, snap.data()!) };
}

export async function createSlot(professorId: string, input: SlotInput, now = Date.now()) {
  const times = buildSlotTimes(input, now);
  const db = getAdminDb();
  const ref = db.collection(Collections.AVAILABILITY).doc();

  await db.runTransaction(async (tx) => {
    const lock = await readLock(tx, "professor", professorId);
    await assertSubjectAssigned(tx, input.subjectId, professorId);
    assertNoSlotOverlap(times, await readPossibleOverlaps(tx, professorId, times));

    const slot: AvailabilitySlot = {
      id: ref.id,
      professorId,
      subjectId: input.subjectId,
      ...times,
      timezone: TIMEZONE,
      status: "AVAILABLE",
      sessionId: null,
      createdAt: now,
    };
    tx.create(ref, slot);
    touchLock(tx, lock);
  });
  return ref.id;
}

export async function updateSlot(professorId: string, slotId: string, input: SlotInput, now = Date.now()) {
  const times = buildSlotTimes(input, now);
  const db = getAdminDb();

  await db.runTransaction(async (tx) => {
    const lock = await readLock(tx, "professor", professorId);
    const { ref, slot } = await readOwnSlot(tx, slotId, professorId);
    assertSlotEditable(slot);
    await assertSubjectAssigned(tx, input.subjectId, professorId);
    assertNoSlotOverlap(times, await readPossibleOverlaps(tx, professorId, times), slotId);

    tx.update(ref, { subjectId: input.subjectId, ...times, updatedAt: now });
    touchLock(tx, lock);
  });
}

export async function deleteSlot(professorId: string, slotId: string) {
  const db = getAdminDb();
  await db.runTransaction(async (tx) => {
    const lock = await readLock(tx, "professor", professorId);
    const { ref, slot } = await readOwnSlot(tx, slotId, professorId);
    assertSlotEditable(slot);
    tx.delete(ref);
    touchLock(tx, lock);
  });
}
