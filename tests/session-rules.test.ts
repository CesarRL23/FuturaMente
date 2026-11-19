import { test } from "node:test";
import assert from "node:assert/strict";
import {
  assertCanCancelByProfessor,
  assertMeetingEditable,
  assertNoSlotOverlap,
  assertSlotEditable,
  bookingBucket,
  canViewMeeting,
  planComplete,
  planJoinSession,
  planLeaveSession,
  planNewSession,
  sessionBucket,
} from "../lib/domain/sessionRules.ts";
import { DomainError } from "../lib/domain/errors.ts";

const H = 3600_000;
const NOW = Date.UTC(2026, 10, 20, 17, 0);
const START = NOW + 24 * H;
const END = START + 2 * H;

const slot = { status: "AVAILABLE" as const, professorId: "prof", startAt: START, endAt: END };

function session(over: Partial<Parameters<typeof planJoinSession>[0]["session"]> = {}) {
  return {
    id: "s1",
    status: "OPEN" as const,
    professorId: "prof",
    capacity: 2,
    participantIds: ["ana"],
    startAt: START,
    endAt: END,
    ...over,
  };
}

/* ---------------- Disponibilidad ---------------- */

test("disponibilidad: detecta duplicados y cruces del mismo profesor", () => {
  const existing = [
    { id: "a", startAt: START, endAt: END, status: "AVAILABLE" as const, date: "2026-11-21", startTime: "12:00", endTime: "14:00" },
  ];
  assert.throws(() => assertNoSlotOverlap({ startAt: START, endAt: END }, existing), /exactamente/);
  assert.throws(() => assertNoSlotOverlap({ startAt: START + H, endAt: END + H }, existing), /cruza/);
  // contigua: permitida
  assertNoSlotOverlap({ startAt: END, endAt: END + H }, existing);
  // al editar la misma franja no choca consigo misma
  assertNoSlotOverlap({ startAt: START + H, endAt: END + H }, existing, "a");
  // franjas canceladas no bloquean
  assertNoSlotOverlap({ startAt: START, endAt: END }, [{ ...existing[0], status: "CANCELLED" }]);
});

test("disponibilidad: no se edita ni elimina si está reservada o cancelada", () => {
  assertSlotEditable({ status: "AVAILABLE" });
  assert.throws(() => assertSlotEditable({ status: "BOOKED" }), /reservada/);
  assert.throws(() => assertSlotEditable({ status: "CANCELLED" }), DomainError);
});

/* ---------------- Reservar ---------------- */

test("reserva individual: capacidad 1 queda FULL con tarifa individual", () => {
  const r = planNewSession({ slot, subjectProfessorIds: ["prof"], studentId: "ana", capacity: 1, studentBookings: [], now: NOW });
  assert.equal(r.status, "FULL");
  assert.equal(r.pricing.totalPrice, 65_000);
});

test("reserva grupal: capacidad 2 queda OPEN con tarifa grupal", () => {
  const r = planNewSession({ slot, subjectProfessorIds: ["prof"], studentId: "ana", capacity: 2, studentBookings: [], now: NOW });
  assert.equal(r.status, "OPEN");
  assert.equal(r.pricing.totalPrice, 75_000);
  assert.equal(r.pricing.professorAmount, 45_000);
});

test("reserva: rechaza franja no disponible, propia, materia no asignada y cruce del estudiante", () => {
  const base = { slot, subjectProfessorIds: ["prof"], studentId: "ana", capacity: 1, studentBookings: [], now: NOW };
  assert.throws(() => planNewSession({ ...base, slot: { ...slot, status: "BOOKED" } }), /ya no está disponible/);
  assert.throws(() => planNewSession({ ...base, studentId: "prof" }), /contigo mismo/);
  assert.throws(() => planNewSession({ ...base, subjectProfessorIds: ["otro"] }), /ya no ofrece/);
  assert.throws(() => planNewSession({ ...base, now: START - 10 * 60_000 }), /por comenzar/);
  assert.throws(
    () => planNewSession({ ...base, studentBookings: [{ startAt: START + H, endAt: END + H, status: "ACTIVE" }] }),
    /se cruza/,
  );
  // una reserva cancelada en ese horario no bloquea
  planNewSession({ ...base, studentBookings: [{ startAt: START, endAt: END, status: "CANCELLED" }] });
});

/* ---------------- Unirse / cupos ---------------- */

test("unirse: ocupa el último cupo y la monitoría pasa a FULL", () => {
  const r = planJoinSession({ session: session(), existingBooking: null, studentId: "beto", studentBookings: [], now: NOW });
  assert.deepEqual(r.participantIds, ["ana", "beto"]);
  assert.equal(r.status, "FULL");
});

test("unirse: no se supera la capacidad (simula el segundo de dos intentos simultáneos)", () => {
  // Estado que ve la transacción reintentada después de que otro estudiante tomó el último cupo.
  const afterFirst = session({ status: "FULL", participantIds: ["ana", "beto"] });
  assert.throws(
    () => planJoinSession({ session: afterFirst, existingBooking: null, studentId: "carla", studentBookings: [], now: NOW }),
    /cupos/,
  );
  // Aun si el estado dijera OPEN, el conteo lo impide.
  assert.throws(
    () => planJoinSession({ session: session({ participantIds: ["ana", "beto"] }), existingBooking: null, studentId: "carla", studentBookings: [], now: NOW }),
    /cupos/,
  );
});

test("unirse: no permite inscribirse dos veces ni en monitorías confirmadas/canceladas", () => {
  const base = { existingBooking: null, studentBookings: [], now: NOW };
  assert.throws(() => planJoinSession({ ...base, session: session(), studentId: "ana" }), /Ya estás inscrito/);
  assert.throws(
    () => planJoinSession({ ...base, session: session(), existingBooking: { status: "ACTIVE" }, studentId: "beto" }),
    /Ya estás inscrito/,
  );
  assert.throws(() => planJoinSession({ ...base, session: session({ status: "CONFIRMED" }), studentId: "beto" }), /confirmada/);
  assert.throws(() => planJoinSession({ ...base, session: session({ status: "CANCELLED" }), studentId: "beto" }), DomainError);
  assert.throws(() => planJoinSession({ ...base, session: session(), studentId: "prof" }), /propia/);
  // quien se retiró antes puede volver a unirse
  const r = planJoinSession({ ...base, session: session(), existingBooking: { status: "CANCELLED" }, studentId: "beto" });
  assert.equal(r.status, "FULL");
});

/* ---------------- Retirarse / cancelaciones ---------------- */

test("retirarse: libera cupo (FULL → OPEN)", () => {
  const r = planLeaveSession({
    session: session({ status: "FULL", participantIds: ["ana", "beto"] }),
    booking: { status: "ACTIVE", studentId: "beto" },
    now: NOW,
  });
  assert.deepEqual(r.participantIds, ["ana"]);
  assert.equal(r.status, "OPEN");
  assert.equal(r.cancelSession, false);
});

test("retirarse: si no quedan participantes, se cancela la monitoría (y la franja se libera)", () => {
  const r = planLeaveSession({ session: session(), booking: { status: "ACTIVE", studentId: "ana" }, now: NOW });
  assert.equal(r.cancelSession, true);
  assert.equal(r.status, "CANCELLED");
});

test("retirarse: una monitoría confirmada sigue confirmada; no se cancela tras el inicio", () => {
  const r = planLeaveSession({
    session: session({ status: "CONFIRMED", participantIds: ["ana", "beto"] }),
    booking: { status: "ACTIVE", studentId: "beto" },
    now: NOW,
  });
  assert.equal(r.status, "CONFIRMED");
  assert.throws(
    () => planLeaveSession({ session: session(), booking: { status: "ACTIVE", studentId: "ana" }, now: START + 1 }),
    /ya comenzó/,
  );
  assert.throws(
    () => planLeaveSession({ session: session(), booking: { status: "CANCELLED", studentId: "ana" }, now: NOW }),
    /no está activa/,
  );
});

test("profesor: cancelar solo antes del inicio; cerrar solo después del inicio", () => {
  assertCanCancelByProfessor({ status: "OPEN", startAt: START }, NOW);
  assert.throws(() => assertCanCancelByProfessor({ status: "OPEN", startAt: START }, START), /ya comenzó/);
  assert.throws(() => assertCanCancelByProfessor({ status: "COMPLETED", startAt: START }, NOW), DomainError);

  assert.throws(() => planComplete({ status: "FULL", startAt: START, participantIds: ["ana"] }, ["ana"], NOW), /a partir/);
  const r = planComplete({ status: "FULL", startAt: START, participantIds: ["ana", "beto"] }, ["ana", "intruso"], START + H);
  assert.deepEqual(r, { attended: ["ana"], absent: ["beto"] });
});

/* ---------------- Enlace de videoconferencia ---------------- */

test("enlace: solo profesor, participantes activos y administrador", () => {
  const s = { status: "OPEN" as const, professorId: "prof", participantIds: ["ana"] };
  assert.equal(canViewMeeting({ session: s, viewerId: "prof", isAdmin: false, viewerBookingStatus: null }), true);
  assert.equal(canViewMeeting({ session: s, viewerId: "ana", isAdmin: false, viewerBookingStatus: "ACTIVE" }), true);
  assert.equal(canViewMeeting({ session: s, viewerId: "intruso", isAdmin: false, viewerBookingStatus: null }), false);
  assert.equal(canViewMeeting({ session: s, viewerId: "ana", isAdmin: false, viewerBookingStatus: "CANCELLED" }), false);
  assert.equal(canViewMeeting({ session: s, viewerId: "admin", isAdmin: true, viewerBookingStatus: null }), true);
  assert.equal(
    canViewMeeting({ session: { ...s, status: "CANCELLED" }, viewerId: "ana", isAdmin: false, viewerBookingStatus: "ACTIVE" }),
    false,
  );
});

test("enlace: editable solo mientras la monitoría esté vigente", () => {
  assertMeetingEditable({ status: "CONFIRMED", endAt: END }, NOW);
  assert.throws(() => assertMeetingEditable({ status: "COMPLETED", endAt: END }, NOW), DomainError);
  assert.throws(() => assertMeetingEditable({ status: "OPEN", endAt: END }, END), /terminó/);
});

/* ---------------- Clasificación ---------------- */

test("clasificación de monitorías y reservas", () => {
  assert.equal(sessionBucket({ status: "OPEN", endAt: END }, NOW), "upcoming");
  assert.equal(sessionBucket({ status: "OPEN", endAt: END }, END + 1), "pendingClose");
  assert.equal(sessionBucket({ status: "COMPLETED", endAt: END }, NOW), "completed");
  assert.equal(bookingBucket({ status: "ACTIVE" }, { status: "CANCELLED", endAt: END }, NOW), "cancelled");
  assert.equal(bookingBucket({ status: "ATTENDED" }, { status: "COMPLETED", endAt: END }, NOW), "completed");
});
