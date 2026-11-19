/**
 * Documento tal como se guarda en Firestore (`subjects/{id}`).
 *
 * Relación muchos-a-muchos materia ↔ profesor mediante `professorIds`.
 * Compatibilidad: los documentos antiguos solo tienen `professorId` (un único profesor).
 * Al leer, `normalizeSubject` convierte ese campo en `professorIds`. Al escribir, MONLINE
 * solo actualiza `professorIds`; el campo `professorId` antiguo no se borra, pero se ignora
 * en cuanto el documento tiene `professorIds`.
 */
export type SubjectDoc = {
  id: string;
  name: string;
  description?: string | null;
  professorIds?: string[];
  /** @deprecated Solo en documentos antiguos. Usar `professorIds`. */
  professorId?: string | null;
  active?: boolean;
  createdAt: number;
  updatedAt?: number;
};

/** Materia normalizada que usa la aplicación. */
export type Subject = {
  id: string;
  name: string;
  description: string | null;
  professorIds: string[];
  active: boolean;
  createdAt: number;
  updatedAt?: number;
};

export function normalizeSubject(id: string, data: Partial<SubjectDoc>): Subject {
  const professorIds = Array.isArray(data.professorIds)
    ? data.professorIds
    : data.professorId
      ? [data.professorId]
      : [];

  return {
    id,
    name: data.name ?? "Sin nombre",
    description: data.description ?? null,
    professorIds: Array.from(new Set(professorIds)),
    active: data.active ?? true,
    createdAt: data.createdAt ?? 0,
    updatedAt: data.updatedAt,
  };
}
