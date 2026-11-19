import "server-only";

import { getAdminDb } from "@/lib/firebase/admin";
import { Collections } from "@/models/collections";
import { normalizeSubject, type Subject, type SubjectDoc } from "@/models/subject";

function sortByName(subjects: Subject[]) {
  return subjects.sort((a, b) => a.name.localeCompare(b.name, "es"));
}

export async function listSubjects(): Promise<Subject[]> {
  const snap = await getAdminDb().collection(Collections.SUBJECTS).get();
  return sortByName(snap.docs.map((d) => normalizeSubject(d.id, d.data() as Partial<SubjectDoc>)));
}

/** Lee varias materias por id en una sola llamada. */
export async function getSubjectsByIds(ids: string[]): Promise<Map<string, Subject>> {
  const unique = Array.from(new Set(ids.filter(Boolean)));
  const result = new Map<string, Subject>();
  if (unique.length === 0) return result;
  const db = getAdminDb();
  const snaps = await db.getAll(...unique.map((id) => db.collection(Collections.SUBJECTS).doc(id)));
  for (const snap of snaps) {
    if (snap.exists) result.set(snap.id, normalizeSubject(snap.id, snap.data() as Partial<SubjectDoc>));
  }
  return result;
}

/**
 * Materias de un profesor. Consulta `professorIds` (modelo actual) y `professorId`
 * (documentos antiguos) y descarta duplicados.
 */
export async function listSubjectsByProfessor(professorId: string): Promise<Subject[]> {
  const subjects = getAdminDb().collection(Collections.SUBJECTS);
  const [byArray, byLegacy] = await Promise.all([
    subjects.where("professorIds", "array-contains", professorId).get(),
    subjects.where("professorId", "==", professorId).get(),
  ]);

  const map = new Map<string, Subject>();
  for (const doc of [...byArray.docs, ...byLegacy.docs]) {
    const subject = normalizeSubject(doc.id, doc.data() as Partial<SubjectDoc>);
    if (subject.professorIds.includes(professorId)) map.set(doc.id, subject);
  }
  return sortByName(Array.from(map.values()));
}
