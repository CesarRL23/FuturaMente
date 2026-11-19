import "server-only";

import type { Transaction } from "firebase-admin/firestore";
import { toSlot } from "@/lib/data/availability";
import { readLock, touchLock } from "@/lib/data/locks";
import { toSession } from "@/lib/data/sessions";
import { DomainError } from "@/lib/domain/errors";
import { OVERLAP_LOOKBACK_MS } from "@/lib/domain/schedule";
import { planJoinSession, planLeaveSession, planNewSession } from "@/lib/domain/sessionRules";
import { getAdminDb } from "@/lib/firebase/admin";
import { bookingId, type Booking } from "@/models/booking";
import { Collections } from "@/models/collections";
import type { Session } from "@/models/session";
import { normalizeSubject, type SubjectDoc } from "@/models/subject";

/**
 * Reservas: una franja reservada produce UNA monitoría (`sessions`) y una participación
 * (`bookings`) por estudiante. Todo dentro de transacciones; el precio se calcula aquí.
 */

/** Participaciones del estudiante que podrían cruzarse con el intervalo (índice studentId + startAt). */
async function readStudentBookingsNear(
  tx: Transaction,
  studentId: string,
  interval: { startAt: number; endAt: number },
) {
  const snap = await tx.get(
    getAdminDb()
      .collection(Collections.BOOKINGS)
      .where("studentId", "==", studentId)
      .where("startAt", ">", interval.startAt - OVERLAP_LOOKBACK_MS)
      .where("startAt", "<", interval.endAt),
  );
  return snap.docs.map((d) => d.data() as Booking);
}

/** Reserva una franja: crea la monitoría con la capacidad elegida. Devuelve el id de la monitoría. */
export async function bookSlotFor(studentId: string, slotId: string, capacity: number) {
  const db = getAdminDb();
  const slotRef = db.collection(Collections.AVAILABILITY).doc(slotId);
  const sessionRef = db.collection(Collections.SESSIONS).doc();
  const bookingRef = db.collection(Collections.BOOKINGS).doc(bookingId(sessionRef.id, studentId));

  await db.runTransaction(async (tx) => {
    const now = Date.now();
    // --- lecturas ---
    const lock = await readLock(tx, "student", studentId);
    const slotSnap = await tx.get(slotRef);
    if (!slotSnap.exists) throw new DomainError("Este horario ya no existe.");
    const slot = toSlot(slotSnap.id, slotSnap.data()!);
    const subjectSnap = await tx.get(db.collection(Collections.SUBJECTS).doc(slot.subjectId));
    const subject = subjectSnap.exists
      ? normalizeSubject(subjectSnap.id, subjectSnap.data() as Partial<SubjectDoc>)
      : null;
    const studentBookings = await readStudentBookingsNear(tx, studentId, slot);

    // --- reglas ---
    const plan = planNewSession({
      slot,
      subjectProfessorIds: subject?.active ? subject.professorIds : [],
      studentId,
      capacity,
      studentBookings,
      now,
    });

    // --- escrituras ---
    const session: Session = {
      id: sessionRef.id,
      availabilityId: slot.id,
      professorId: slot.professorId,
      subjectId: slot.subjectId,
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      startAt: slot.startAt,
      endAt: slot.endAt,
      durationMinutes: slot.durationMinutes,
      timezone: slot.timezone,
      modality: plan.pricing.modality,
      capacity,
      participantCount: 1,
      participantIds: [studentId],
      organizerId: studentId,
      status: plan.status,
      pricing: plan.pricing,
      hasMeetingLink: false,
      createdAt: now,
    };
    const booking: Booking = {
      id: bookingRef.id,
      sessionId: sessionRef.id,
      studentId,
      professorId: slot.professorId,
      subjectId: slot.subjectId,
      startAt: slot.startAt,
      endAt: slot.endAt,
      status: "ACTIVE",
      isOrganizer: true,
      createdAt: now,
    };
    tx.create(sessionRef, session);
    tx.create(bookingRef, booking);
    tx.update(slotRef, { status: "BOOKED", sessionId: sessionRef.id, updatedAt: now });
    touchLock(tx, lock);
  });
  return sessionRef.id;
}

/** Ocupa un cupo en una monitoría grupal abierta. */
export async function joinSessionFor(studentId: string, sessionId: string) {
  if (!sessionId) throw new DomainError("Monitoría no válida.");
  const db = getAdminDb();
  const sessionRef = db.collection(Collections.SESSIONS).doc(sessionId);
  const bookingRef = db.collection(Collections.BOOKINGS).doc(bookingId(sessionId, studentId));

  await db.runTransaction(async (tx) => {
    const now = Date.now();
    const lock = await readLock(tx, "student", studentId);
    const sessionSnap = await tx.get(sessionRef);
    if (!sessionSnap.exists) throw new DomainError("Esta monitoría ya no existe.");
    const session = toSession(sessionSnap.id, sessionSnap.data()!);
    const bookingSnap = await tx.get(bookingRef);
    const existing = bookingSnap.exists ? (bookingSnap.data() as Booking) : null;
    const studentBookings = await readStudentBookingsNear(tx, studentId, session);

    const plan = planJoinSession({ session, existingBooking: existing, studentId, studentBookings, now });

    tx.update(sessionRef, {
      participantIds: plan.participantIds,
      participantCount: plan.participantIds.length,
      status: plan.status,
      updatedAt: now,
    });
    const booking: Booking = {
      id: bookingRef.id,
      sessionId,
      studentId,
      professorId: session.professorId,
      subjectId: session.subjectId,
      startAt: session.startAt,
      endAt: session.endAt,
      status: "ACTIVE",
      isOrganizer: false,
      createdAt: existing?.createdAt ?? now,
      ...(existing ? { updatedAt: now } : {}),
    };
    tx.set(bookingRef, booking);
    touchLock(tx, lock);
  });
}

/**
 * Cancela la participación del estudiante. Si no quedan participantes, la monitoría se
 * cancela y la franja se libera (vuelve a AVAILABLE) en la misma transacción.
 */
export async function cancelBookingFor(studentId: string, sessionId: string) {
  if (!sessionId) throw new DomainError("Reserva no válida.");
  const db = getAdminDb();
  // El id incluye el uid: un estudiante solo puede tocar su propia participación.
  const bookingRef = db.collection(Collections.BOOKINGS).doc(bookingId(sessionId, studentId));
  const sessionRef = db.collection(Collections.SESSIONS).doc(sessionId);

  let sessionCancelled = false;
  await db.runTransaction(async (tx) => {
    const now = Date.now();
    const bookingSnap = await tx.get(bookingRef);
    if (!bookingSnap.exists) throw new DomainError("No encontramos esa reserva.");
    const booking = bookingSnap.data() as Booking;
    const sessionSnap = await tx.get(sessionRef);
    if (!sessionSnap.exists) throw new DomainError("La monitoría ya no existe.");
    const session = toSession(sessionSnap.id, sessionSnap.data()!);
    const slotRef = db.collection(Collections.AVAILABILITY).doc(session.availabilityId);
    const slotSnap = await tx.get(slotRef);

    const plan = planLeaveSession({ session, booking, now });

    tx.update(bookingRef, { status: "CANCELLED", cancelledAt: now, updatedAt: now });
    tx.update(sessionRef, {
      participantIds: plan.participantIds,
      participantCount: plan.participantIds.length,
      status: plan.status,
      updatedAt: now,
      ...(plan.cancelSession
        ? { cancelledAt: now, cancelledBy: studentId, cancellationReason: "Todos los participantes cancelaron." }
        : {}),
    });
    // Liberación del horario: solo si la franja sigue ligada a esta monitoría.
    if (plan.cancelSession && slotSnap.exists) {
      const slot = toSlot(slotSnap.id, slotSnap.data()!);
      if (slot.status === "BOOKED" && slot.sessionId === session.id) {
        tx.update(slotRef, { status: "AVAILABLE", sessionId: null, updatedAt: now });
      }
    }
    sessionCancelled = plan.cancelSession;
  });
  return { sessionCancelled };
}
