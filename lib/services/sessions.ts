import "server-only";

import type { Transaction } from "firebase-admin/firestore";
import { toSlot } from "@/lib/data/availability";
import { sessionMeetingRef, toSession } from "@/lib/data/sessions";
import { DomainError } from "@/lib/domain/errors";
import { parseMeetingLink } from "@/lib/domain/meeting";
import { isBookableTime } from "@/lib/domain/schedule";
import {
  assertCanCancelByProfessor,
  assertCanConfirm,
  assertMeetingEditable,
  planComplete,
} from "@/lib/domain/sessionRules";
import { getAdminDb } from "@/lib/firebase/admin";
import type { Booking } from "@/models/booking";
import { Collections } from "@/models/collections";
import type { SessionMeeting } from "@/models/session";

/** Operaciones del profesor sobre sus monitorías (verifican propiedad dentro de la transacción). */

async function readOwnSession(tx: Transaction, sessionId: string, professorId: string) {
  if (!sessionId) throw new DomainError("Monitoría no válida.");
  const ref = getAdminDb().collection(Collections.SESSIONS).doc(sessionId);
  const snap = await tx.get(ref);
  if (!snap.exists || snap.data()?.professorId !== professorId) {
    throw new DomainError("No encontramos esa monitoría.");
  }
  return { ref, session: toSession(snap.id, snap.data()!) };
}

async function readSessionBookings(tx: Transaction, sessionId: string) {
  const snap = await tx.get(
    getAdminDb().collection(Collections.BOOKINGS).where("sessionId", "==", sessionId),
  );
  return snap.docs.map((d) => ({ ref: d.ref, booking: d.data() as Booking }));
}

export async function setMeetingLinkFor(professorId: string, sessionId: string, rawUrl: string) {
  const link = parseMeetingLink(rawUrl);
  const db = getAdminDb();
  await db.runTransaction(async (tx) => {
    const now = Date.now();
    const { ref, session } = await readOwnSession(tx, sessionId, professorId);
    assertMeetingEditable(session, now);

    const meeting: SessionMeeting = {
      provider: link.provider,
      url: link.url,
      source: "MANUAL",
      externalId: null,
      updatedAt: now,
      updatedBy: professorId,
    };
    tx.set(sessionMeetingRef(session.id), meeting);
    tx.update(ref, { hasMeetingLink: true, updatedAt: now });
  });
}

export async function confirmSessionFor(professorId: string, sessionId: string) {
  const db = getAdminDb();
  await db.runTransaction(async (tx) => {
    const now = Date.now();
    const { ref, session } = await readOwnSession(tx, sessionId, professorId);
    assertCanConfirm(session, now);
    tx.update(ref, { status: "CONFIRMED", confirmedAt: now, updatedAt: now });
  });
}

/**
 * Cancela la monitoría para todos. La franja vuelve a AVAILABLE solo si el profesor lo pide
 * (`release`) y aún se puede reservar; en otro caso queda CANCELLED.
 */
export async function cancelSessionFor(
  professorId: string,
  sessionId: string,
  options: { release: boolean; reason: string },
) {
  const db = getAdminDb();
  let released = false;
  await db.runTransaction(async (tx) => {
    const now = Date.now();
    // --- lecturas ---
    const { ref, session } = await readOwnSession(tx, sessionId, professorId);
    const slotRef = db.collection(Collections.AVAILABILITY).doc(session.availabilityId);
    const slotSnap = await tx.get(slotRef);
    const bookings = await readSessionBookings(tx, session.id);
    assertCanCancelByProfessor(session, now);

    // --- escrituras ---
    tx.update(ref, {
      status: "CANCELLED",
      cancelledAt: now,
      cancelledBy: professorId,
      cancellationReason: options.reason || "Cancelada por el profesor.",
      updatedAt: now,
    });
    for (const { ref: bRef, booking } of bookings) {
      if (booking.status === "ACTIVE") {
        tx.update(bRef, { status: "CANCELLED", cancelledAt: now, updatedAt: now });
      }
    }
    released = false;
    if (slotSnap.exists) {
      const slot = toSlot(slotSnap.id, slotSnap.data()!);
      if (slot.sessionId === session.id && slot.status === "BOOKED") {
        released = options.release && isBookableTime(slot.startAt, now);
        tx.update(
          slotRef,
          released
            ? { status: "AVAILABLE", sessionId: null, updatedAt: now }
            : { status: "CANCELLED", updatedAt: now },
        );
      }
    }
  });
  return { released };
}

export async function completeSessionFor(professorId: string, sessionId: string, attendedIds: string[]) {
  const db = getAdminDb();
  await db.runTransaction(async (tx) => {
    const now = Date.now();
    const { ref, session } = await readOwnSession(tx, sessionId, professorId);
    const bookings = await readSessionBookings(tx, session.id);
    const plan = planComplete(session, attendedIds, now);

    tx.update(ref, { status: "COMPLETED", completedAt: now, updatedAt: now });
    const attended = new Set(plan.attended);
    for (const { ref: bRef, booking } of bookings) {
      if (booking.status === "ACTIVE") {
        tx.update(bRef, { status: attended.has(booking.studentId) ? "ATTENDED" : "ABSENT", updatedAt: now });
      }
    }
  });
}
