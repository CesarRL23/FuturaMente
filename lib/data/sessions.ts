import "server-only";

import { getAdminDb } from "@/lib/firebase/admin";
import { applySearchFilters, type SearchFilters } from "@/lib/data/availability";
import { canViewMeeting } from "@/lib/domain/sessionRules";
import type { Booking } from "@/models/booking";
import { Collections } from "@/models/collections";
import type { Session, SessionMeeting } from "@/models/session";

export function toSession(id: string, data: FirebaseFirestore.DocumentData): Session {
  return { ...(data as Session), id };
}

function meetingRef(sessionId: string) {
  return getAdminDb()
    .collection(Collections.SESSIONS)
    .doc(sessionId)
    .collection("private")
    .doc("meeting");
}

export { meetingRef as sessionMeetingRef };

/**
 * Monitorías del profesor, de la más reciente a la más antigua.
 * Índice: sessions (professorId ASC, startAt DESC).
 */
export async function listProfessorSessions(professorId: string, limit = 200): Promise<Session[]> {
  const snap = await getAdminDb()
    .collection(Collections.SESSIONS)
    .where("professorId", "==", professorId)
    .orderBy("startAt", "desc")
    .limit(limit)
    .get();
  return snap.docs.map((d) => toSession(d.id, d.data()));
}

/**
 * Monitorías grupales con cupos (OPEN) a las que un estudiante puede unirse.
 * Índices: sessions (status, startAt) y combinaciones con subjectId / professorId.
 */
export async function searchOpenSessions(filters: SearchFilters, now: number, limit = 30): Promise<Session[]> {
  const q = applySearchFilters(getAdminDb().collection(Collections.SESSIONS), "OPEN", filters, now);
  const snap = await q.limit(limit).get();
  return snap.docs.map((d) => toSession(d.id, d.data()));
}

export async function getSessionsByIds(ids: string[]): Promise<Map<string, Session>> {
  const unique = Array.from(new Set(ids.filter(Boolean)));
  const result = new Map<string, Session>();
  if (unique.length === 0) return result;
  const db = getAdminDb();
  const snaps = await db.getAll(...unique.map((id) => db.collection(Collections.SESSIONS).doc(id)));
  for (const snap of snaps) if (snap.exists) result.set(snap.id, toSession(snap.id, snap.data()!));
  return result;
}

/**
 * Participaciones del estudiante, de la más reciente a la más antigua.
 * Índice: bookings (studentId ASC, startAt DESC).
 */
export async function listStudentBookings(studentId: string, limit = 200): Promise<Booking[]> {
  const snap = await getAdminDb()
    .collection(Collections.BOOKINGS)
    .where("studentId", "==", studentId)
    .orderBy("startAt", "desc")
    .limit(limit)
    .get();
  return snap.docs.map((d) => ({ ...(d.data() as Booking), id: d.id }));
}

export type StudentReservation = { booking: Booking; session: Session };

/** Participaciones del estudiante con su monitoría (solo las suyas). */
export async function listStudentReservations(studentId: string): Promise<StudentReservation[]> {
  const bookings = await listStudentBookings(studentId);
  const sessions = await getSessionsByIds(bookings.map((b) => b.sessionId));
  return bookings
    .map((booking) => ({ booking, session: sessions.get(booking.sessionId) }))
    .filter((r): r is StudentReservation => Boolean(r.session));
}

/**
 * Devuelve los enlaces de videoconferencia SOLO de las monitorías que el usuario puede ver
 * (profesor de la monitoría, participante activo o administrador). Las demás no se leen.
 */
export async function getAuthorizedMeetings(params: {
  viewerId: string;
  isAdmin: boolean;
  sessions: Session[];
  bookingStatusBySession?: Map<string, Booking["status"]>;
}): Promise<Map<string, SessionMeeting>> {
  const allowed = params.sessions.filter(
    (s) =>
      s.hasMeetingLink &&
      canViewMeeting({
        session: s,
        viewerId: params.viewerId,
        isAdmin: params.isAdmin,
        viewerBookingStatus: params.bookingStatusBySession?.get(s.id) ?? null,
      }),
  );
  const result = new Map<string, SessionMeeting>();
  if (allowed.length === 0) return result;
  const snaps = await getAdminDb().getAll(...allowed.map((s) => meetingRef(s.id)));
  snaps.forEach((snap, i) => {
    if (snap.exists) result.set(allowed[i].id, snap.data() as SessionMeeting);
  });
  return result;
}

/** Últimas monitorías de la plataforma (vista de administración). Índice automático sobre startAt. */
export async function listRecentSessions(limit = 100): Promise<Session[]> {
  const snap = await getAdminDb()
    .collection(Collections.SESSIONS)
    .orderBy("startAt", "desc")
    .limit(limit)
    .get();
  return snap.docs.map((d) => toSession(d.id, d.data()));
}
