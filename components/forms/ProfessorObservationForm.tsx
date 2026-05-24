"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { professorAddObservation, professorUpdateObservation } from "@/server/actions/professor";

type Subject = { id: string; name: string };
type Enrollment = { id: string; studentId: string; subjectId: string };
type Student = { id: string; name: string; email?: string };

interface Props {
  subjects: Subject[];
  enrollments: Enrollment[];
  students: Student[];
  editObservation: { id: string; studentId: string; comment: string } | null;
  onCancelEdit: () => void;
}

export function ProfessorObservationForm({ subjects, enrollments, students, editObservation, onCancelEdit }: Props) {
  const [subjectId, setSubjectId] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const selectedSubjectId =
    editObservation
      ? (enrollments.find((e) => e.studentId === editObservation.studentId)?.subjectId ?? "")
      : subjectId;

  const enrolledStudents = enrollments
    .filter((e) => e.subjectId === selectedSubjectId)
    .map((e) => students.find((s) => s.id === e.studentId))
    .filter(Boolean) as Student[];

  return (
    <form ref={formRef} action={editObservation ? professorUpdateObservation : professorAddObservation} className="space-y-3">
      {editObservation && (
        <input type="hidden" name="id" value={editObservation.id} />
      )}
      <div className="space-y-1">
        <label className="text-sm font-medium">Materia</label>
        <select
          name="subjectId"
          className="h-11 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-950 disabled:opacity-50"
          value={selectedSubjectId}
          onChange={(e) => setSubjectId(e.target.value)}
          disabled={!!editObservation}
          required={!editObservation}
        >
          <option value="" disabled>
            Selecciona materia
          </option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Estudiante</label>
        <select
          name="studentId"
          className="h-11 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-950 disabled:opacity-50"
          disabled={!selectedSubjectId || !!editObservation}
          defaultValue={editObservation?.studentId ?? ""}
          key={editObservation?.studentId ?? "new"}
          required
        >
          <option value="" disabled>
            {selectedSubjectId ? "Selecciona estudiante" : "Primero selecciona materia"}
          </option>
          {/* Si está en modo edición, obligamos a que el estudiante aparezca aunque no encontremos enrollment perfecto */}
          {editObservation && !enrolledStudents.find(s => s.id === editObservation.studentId) && (
            <option value={editObservation.studentId}>
              {students.find(s => s.id === editObservation.studentId)?.name ?? editObservation.studentId}
            </option>
          )}
          {enrolledStudents.map((st) => (
            <option key={st.id} value={st.id}>
              {st.name} {st.email ? `(${st.email})` : ""}
            </option>
          ))}
        </select>
        {selectedSubjectId && enrolledStudents.length === 0 && !editObservation && (
          <p className="text-xs text-zinc-500 max-w-sm">No hay estudiantes inscritos en esta materia.</p>
        )}
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Comentario</label>
        <textarea
          name="comment"
          className="min-h-28 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-950 dark:focus:border-zinc-400 dark:focus:ring-zinc-800"
          placeholder="Escribe la observación..."
          defaultValue={editObservation?.comment ?? ""}
          key={editObservation?.id ?? "new"}
          required
        />
      </div>

      <div className="flex gap-2 pt-2">
        <Button
          type="submit"
          className="w-full flex-1"
          disabled={subjects.length === 0}
          onClick={() => {
            // Un pequeño timout para resetear el form asumiendo submit exitoso si no hay error
            if (!editObservation) {
              setTimeout(() => { if (formRef.current) formRef.current.reset(); }, 100);
            } else {
              setTimeout(() => onCancelEdit(), 100);
            }
          }}
        >
          {editObservation ? "Guardar cambios" : "Guardar observación"}
        </Button>
        {editObservation && (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancelEdit}
          >
            Cancelar
          </Button>
        )}
      </div>
    </form>
  );
}
