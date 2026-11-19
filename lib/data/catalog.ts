import "server-only";

import { listSubjects } from "@/lib/data/subjects";
import { listUsersByRole } from "@/lib/data/users";
import { Roles } from "@/models/roles";

export type CatalogEntry = {
  id: string;
  name: string;
  description: string | null;
  /** Solo datos públicos del profesor (sin correo). */
  professors: { id: string; name: string }[];
};

/** Materias activas con al menos un profesor, para que los estudiantes las exploren. */
export async function getTutoringCatalog(): Promise<CatalogEntry[]> {
  const [subjects, professors] = await Promise.all([
    listSubjects(),
    listUsersByRole(Roles.PROFESSOR),
  ]);
  const professorById = new Map(professors.map((p) => [p.id, p]));

  return subjects
    .filter((s) => s.active)
    .map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      professors: s.professorIds
        .map((id) => professorById.get(id))
        .filter((p): p is NonNullable<typeof p> => Boolean(p))
        .map((p) => ({ id: p.id, name: p.name })),
    }))
    .filter((s) => s.professors.length > 0);
}
