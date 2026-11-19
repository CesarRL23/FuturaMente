/**
 * Pruebas de integración del flujo principal contra el EMULADOR de Firestore
 * (nunca contra el proyecto real: register.mjs aborta si no hay FIRESTORE_EMULATOR_HOST).
 *
 * Ejecutan los mismos servicios transaccionales que usan las Server Actions.
 * La autenticación (requireRole) no se ejecuta aquí: se pasa el uid como lo haría la acción.
 */
import { before, describe, test } from "node:test";
import assert from "node:assert/strict";
import { getAdminDb } from "@/lib/firebase/admin";
import { searchAvailableSlots } from "@/lib/data/availability";
import {
  getAuthorizedMeetings,
  getSessionsByIds,
  listProfessorSessions,
  listStudentReservations,
  searchOpenSessions,
} from "@/lib/data/sessions";
import { epochToLocalDate } from "@/lib/domain/schedule";
import { DomainError } from "@/lib/domain/errors";
import { createSlot, deleteSlot, updateSlot } from "@/lib/services/availability";
import { bookSlotFor, cancelBookingFor, joinSessionFor } from "@/lib/services/bookings";
import { cancelSessionFor, confirmSessionFor, setMeetingLinkFor } from "@/lib/services/sessions";

const db = getAdminDb();
const DAY = 24 * 3600_000;
const day = (n: number) => epochToLocalDate(Date.now() + n * DAY);

async function slotStatus(id: string) {
  return (await db.collection("availability").doc(id).get()).data()?.status;
}
async function session(id: string) {
  return (await getSessionsByIds([id])).get(id)!;
}

before(async () => {
  const users = [
    { id: "prof", name: "Juan Pérez", roles: ["PROFESSOR"] },
    { id: "prof2", name: "Laura Gómez", roles: ["PROFESSOR"] },
    { id: "ana", name: "Ana", roles: ["STUDENT"] },
    { id: "beto", name: "Beto", roles: ["STUDENT"] },
    { id: "carla", name: "Carla", roles: ["STUDENT"] },
    { id: "dani", name: "Dani", roles: ["STUDENT"] },
  ];
  for (const u of users) {
    await db.collection("users").doc(u.id).set({ ...u, email: `${u.id}@test.local`, createdAt: 1 });
  }
  await db.collection("subjects").doc("calc").set({ id: "calc", name: "Cálculo", professorIds: ["prof"], active: true, createdAt: 1 });
  // Documento con el formato antiguo (professorId) para verificar compatibilidad.
  await db.collection("subjects").doc("fis").set({ id: "fis", name: "Física", professorId: "prof", createdAt: 1 });
  await db.collection("subjects").doc("quim").set({ id: "quim", name: "Química", professorIds: ["prof2"], active: true, createdAt: 1 });
});

describe("1–3. Disponibilidad del profesor", () => {
  test("1. publica disponibilidad (también en materia con formato antiguo)", async () => {
    const id = await createSlot("prof", { subjectId: "calc", date: day(2), startTime: "08:00", endTime: "10:00" });
    assert.equal(await slotStatus(id), "AVAILABLE");
    await createSlot("prof", { subjectId: "fis", date: day(3), startTime: "08:00", endTime: "09:00" });
  });

  test("2. no publica en materias no asignadas", async () => {
    await assert.rejects(
      createSlot("prof", { subjectId: "quim", date: day(2), startTime: "14:00", endTime: "15:00" }),
      (e) => e instanceof DomainError && /asignó el administrador/.test(e.message),
    );
  });

  test("3. no publica horarios duplicados ni cruzados", async () => {
    await assert.rejects(
      createSlot("prof", { subjectId: "calc", date: day(2), startTime: "08:00", endTime: "10:00" }),
      /exactamente/,
    );
    await assert.rejects(
      createSlot("prof", { subjectId: "calc", date: day(2), startTime: "09:00", endTime: "11:00" }),
      /se cruza/,
    );
    // Otro profesor sí puede usar ese mismo horario.
    await createSlot("prof2", { subjectId: "quim", date: day(2), startTime: "09:00", endTime: "11:00" });
  });

  test("3b. dos publicaciones simultáneas que se cruzan: solo una se guarda", async () => {
    const input = { subjectId: "calc", date: day(4), startTime: "10:00", endTime: "12:00" };
    const results = await Promise.allSettled([
      createSlot("prof", input),
      createSlot("prof", { ...input, startTime: "11:00", endTime: "13:00" }),
    ]);
    assert.equal(results.filter((r) => r.status === "fulfilled").length, 1);
  });

  test("editar/eliminar: solo el dueño y solo si no está reservada", async () => {
    const id = await createSlot("prof", { subjectId: "calc", date: day(5), startTime: "08:00", endTime: "09:00" });
    await assert.rejects(updateSlot("prof2", id, { subjectId: "calc", date: day(5), startTime: "09:00", endTime: "10:00" }), /No encontramos/);
    await assert.rejects(deleteSlot("prof2", id), /No encontramos/);
    await updateSlot("prof", id, { subjectId: "calc", date: day(5), startTime: "09:00", endTime: "10:00" });
    await deleteSlot("prof", id);
    assert.equal((await db.collection("availability").doc(id).get()).exists, false);
  });
});

describe("4–10. Búsqueda, reservas, tarifas y cupos", () => {
  test("4. el estudiante consulta disponibilidades con filtros", async () => {
    const all = await searchAvailableSlots({}, Date.now());
    assert.ok(all.length >= 3);
    const calc = await searchAvailableSlots({ subjectId: "calc" }, Date.now());
    assert.ok(calc.every((s) => s.subjectId === "calc" && s.status === "AVAILABLE"));
    const byDate = await searchAvailableSlots({ date: day(2) }, Date.now());
    assert.ok(byDate.every((s) => s.date === day(2)));
  });

  test("5, 7, 8. reserva individual: $65.000 → 39.000 / 26.000; la franja deja de aparecer", async () => {
    const slotId = await createSlot("prof", { subjectId: "calc", date: day(6), startTime: "08:00", endTime: "10:00" });
    const sessionId = await bookSlotFor("ana", slotId, 1);
    const s = await session(sessionId);
    assert.equal(s.status, "FULL");
    assert.equal(s.modality, "INDIVIDUAL");
    assert.deepEqual(
      [s.pricing.totalPrice, s.pricing.professorAmount, s.pricing.platformAmount, s.pricing.professorPercent, s.pricing.platformPercent],
      [65_000, 39_000, 26_000, 60, 40],
    );
    assert.equal(await slotStatus(slotId), "BOOKED");
    const visible = await searchAvailableSlots({}, Date.now());
    assert.ok(!visible.some((v) => v.id === slotId), "una franja reservada no aparece en la búsqueda");
  });

  test("6, 7, 8. reservas grupales: 2 → $75.000 (45/30); 3+ → $85.000 (51/34)", async () => {
    const s2 = await createSlot("prof", { subjectId: "calc", date: day(7), startTime: "08:00", endTime: "10:00" });
    const s4 = await createSlot("prof", { subjectId: "calc", date: day(7), startTime: "14:00", endTime: "16:00" });
    const g2 = await session(await bookSlotFor("ana", s2, 2));
    const g4 = await session(await bookSlotFor("beto", s4, 4));
    assert.deepEqual([g2.status, g2.capacity, g2.pricing.totalPrice, g2.pricing.professorAmount, g2.pricing.platformAmount], ["OPEN", 2, 75_000, 45_000, 30_000]);
    assert.deepEqual([g4.status, g4.capacity, g4.pricing.totalPrice, g4.pricing.professorAmount, g4.pricing.platformAmount], ["OPEN", 4, 85_000, 51_000, 34_000]);
    const open = await searchOpenSessions({}, Date.now());
    assert.ok(open.some((o) => o.id === g2.id) && open.some((o) => o.id === g4.id));
  });

  test("9. dos estudiantes compiten por el último cupo: solo uno lo obtiene", async () => {
    const slotId = await createSlot("prof", { subjectId: "calc", date: day(8), startTime: "08:00", endTime: "10:00" });
    const sessionId = await bookSlotFor("ana", slotId, 2); // queda 1 cupo
    const results = await Promise.allSettled([joinSessionFor("beto", sessionId), joinSessionFor("carla", sessionId)]);
    assert.equal(results.filter((r) => r.status === "fulfilled").length, 1, "solo una inscripción");
    const s = await session(sessionId);
    assert.equal(s.status, "FULL");
    assert.equal(s.participantIds.length, 2);
    assert.equal(s.participantCount, 2);
    await assert.rejects(joinSessionFor("dani", sessionId), /cupos/);
  });

  test("10. no se puede reservar dos veces el mismo espacio", async () => {
    const slotId = await createSlot("prof", { subjectId: "calc", date: day(9), startTime: "08:00", endTime: "10:00" });
    const results = await Promise.allSettled([bookSlotFor("beto", slotId, 1), bookSlotFor("carla", slotId, 1)]);
    assert.equal(results.filter((r) => r.status === "fulfilled").length, 1, "una sola monitoría por franja");
    const sessions = await db.collection("sessions").where("availabilityId", "==", slotId).get();
    assert.equal(sessions.size, 1);
    // Mismo estudiante en la misma monitoría grupal: rechazado.
    const g = await createSlot("prof", { subjectId: "calc", date: day(9), startTime: "14:00", endTime: "16:00" });
    const gid = await bookSlotFor("dani", g, 3);
    await assert.rejects(joinSessionFor("dani", gid), /Ya estás inscrito/);
  });
});

describe("11–14. Enlaces, privacidad, cancelaciones y vista del profesor", () => {
  let sessionId = "";

  before(async () => {
    const slotId = await createSlot("prof", { subjectId: "calc", date: day(10), startTime: "08:00", endTime: "10:00" });
    sessionId = await bookSlotFor("ana", slotId, 3);
    await joinSessionFor("beto", sessionId);
  });

  test("11. los participantes ven el mismo enlace; otros no", async () => {
    await assert.rejects(setMeetingLinkFor("prof", sessionId, "http://meet.google.com/abc-defg-hij"), /HTTPS/);
    await assert.rejects(setMeetingLinkFor("prof2", sessionId, "https://meet.google.com/abc-defg-hij"), /No encontramos/);
    await setMeetingLinkFor("prof", sessionId, "https://meet.google.com/abc-defg-hij");

    const s = await session(sessionId);
    const forStudent = async (uid: string) =>
      (await getAuthorizedMeetings({ viewerId: uid, isAdmin: false, sessions: [s], bookingStatusBySession: new Map(s.participantIds.includes(uid) ? [[s.id, "ACTIVE" as const]] : []) })).get(s.id)?.url;

    assert.equal(await forStudent("ana"), "https://meet.google.com/abc-defg-hij");
    assert.equal(await forStudent("beto"), "https://meet.google.com/abc-defg-hij");
    assert.equal(await forStudent("carla"), undefined, "un no participante no recibe el enlace");
    assert.equal((await getAuthorizedMeetings({ viewerId: "prof2", isAdmin: false, sessions: [s] })).size, 0);
    assert.equal((await getAuthorizedMeetings({ viewerId: "admin", isAdmin: true, sessions: [s] })).size, 1);
  });

  test("12. un usuario no accede ni modifica información de otro", async () => {
    const carla = await listStudentReservations("carla");
    assert.ok(carla.every((r) => r.booking.studentId === "carla"));
    assert.ok(!carla.some((r) => r.session.id === sessionId));
    await assert.rejects(cancelBookingFor("carla", sessionId), /No encontramos esa reserva/);
    await assert.rejects(confirmSessionFor("prof2", sessionId), /No encontramos/);
    await assert.rejects(cancelSessionFor("prof2", sessionId, { release: true, reason: "" }), /No encontramos/);
  });

  test("13a. si todos los participantes cancelan, la monitoría se cancela y la franja vuelve a estar disponible", async () => {
    const slotId = await createSlot("prof", { subjectId: "calc", date: day(11), startTime: "08:00", endTime: "10:00" });
    const sid = await bookSlotFor("carla", slotId, 1);
    assert.equal(await slotStatus(slotId), "BOOKED");
    await assert.rejects(updateSlot("prof", slotId, { subjectId: "calc", date: day(11), startTime: "09:00", endTime: "10:00" }), /reservada/);
    await assert.rejects(deleteSlot("prof", slotId), /reservada/);

    const { sessionCancelled } = await cancelBookingFor("carla", sid);
    assert.equal(sessionCancelled, true);
    assert.equal((await session(sid)).status, "CANCELLED");
    assert.equal(await slotStatus(slotId), "AVAILABLE");
    assert.ok((await searchAvailableSlots({}, Date.now())).some((s) => s.id === slotId));
  });

  test("13b. un participante que se retira libera su cupo (FULL → OPEN)", async () => {
    const slotId = await createSlot("prof", { subjectId: "calc", date: day(12), startTime: "08:00", endTime: "10:00" });
    const sid = await bookSlotFor("ana", slotId, 2);
    await joinSessionFor("dani", sid);
    assert.equal((await session(sid)).status, "FULL");
    await cancelBookingFor("dani", sid);
    const s = await session(sid);
    assert.deepEqual([s.status, s.participantIds], ["OPEN", ["ana"]]);
    assert.equal(await slotStatus(slotId), "BOOKED", "la franja sigue ocupada por la monitoría");
  });

  test("13c. cancelación del profesor: sin liberar → franja CANCELLED; liberando → AVAILABLE", async () => {
    const a = await createSlot("prof", { subjectId: "calc", date: day(13), startTime: "08:00", endTime: "10:00" });
    const b = await createSlot("prof", { subjectId: "calc", date: day(13), startTime: "14:00", endTime: "16:00" });
    const sa = await bookSlotFor("ana", a, 1);
    const sb = await bookSlotFor("beto", b, 1);

    assert.deepEqual(await cancelSessionFor("prof", sa, { release: false, reason: "Incapacidad" }), { released: false });
    assert.equal(await slotStatus(a), "CANCELLED");
    assert.deepEqual(await cancelSessionFor("prof", sb, { release: true, reason: "" }), { released: true });
    assert.equal(await slotStatus(b), "AVAILABLE");

    const ana = await listStudentReservations("ana");
    const r = ana.find((x) => x.session.id === sa)!;
    assert.deepEqual([r.booking.status, r.session.status, r.session.cancellationReason], ["CANCELLED", "CANCELLED", "Incapacidad"]);
  });

  test("14. el profesor consulta sus monitorías (solo las suyas)", async () => {
    const mine = await listProfessorSessions("prof");
    assert.ok(mine.length >= 5);
    assert.ok(mine.every((s) => s.professorId === "prof"));
    assert.ok(mine.some((s) => s.id === sessionId));
    assert.equal((await listProfessorSessions("prof2")).length, 0);
  });
});
