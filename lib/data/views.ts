import "server-only";

import {
  getAuthorizedMeetings,
  listProfessorSessions,
  listStudentReservations,
} from "@/lib/data/sessions";
import { getSubjectsByIds } from "@/lib/data/subjects";
import { getUsersByIds } from "@/lib/data/users";

/** Todo lo que necesita la vista de monitorías del profesor (solo sus monitorías). */
export async function loadProfessorSessionsView(professorId: string) {
  const sessions = await listProfessorSessions(professorId);
  const [subjects, students, meetings] = await Promise.all([
    getSubjectsByIds(sessions.map((s) => s.subjectId)),
    getUsersByIds(sessions.flatMap((s) => s.participantIds)),
    getAuthorizedMeetings({ viewerId: professorId, isAdmin: false, sessions }),
  ]);
  return {
    sessions,
    subjectName: (id: string) => subjects.get(id)?.name ?? "Materia eliminada",
    participantsOf: (ids: string[]) =>
      ids.map((id) => ({ id, name: students.get(id)?.name ?? "Estudiante" })),
    meetings,
  };
}

/**
 * Vista de reservas del estudiante. Solo incluye sus propias participaciones; de los demás
 * participantes solo se expone el conteo (no nombres ni correos). Del profesor, nombre y foto.
 */
export async function loadStudentReservationsView(studentId: string) {
  const reservations = await listStudentReservations(studentId);
  const sessions = reservations.map((r) => r.session);
  const bookingStatusBySession = new Map(reservations.map((r) => [r.session.id, r.booking.status]));

  const [subjects, professors, meetings] = await Promise.all([
    getSubjectsByIds(sessions.map((s) => s.subjectId)),
    getUsersByIds(sessions.map((s) => s.professorId)),
    getAuthorizedMeetings({ viewerId: studentId, isAdmin: false, sessions, bookingStatusBySession }),
  ]);

  return {
    reservations,
    subjectName: (id: string) => subjects.get(id)?.name ?? "Materia eliminada",
    professorOf: (id: string) => {
      const p = professors.get(id);
      return { name: p?.name ?? "Profesor", photoURL: p?.professorProfile?.photoURL || null };
    },
    meetings,
  };
}
