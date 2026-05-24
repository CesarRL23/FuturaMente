"use client";

import { useState } from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { ProfessorObservationForm } from "@/components/forms/ProfessorObservationForm";
import { professorDeleteObservation } from "@/server/actions/professor";

type Subject = { id: string; name: string };
type Enrollment = { id: string; studentId: string; subjectId: string };
type Student = { id: string; name: string; email?: string };
type Observation = { id: string; studentId: string; comment: string; createdAt: number; date: number };

interface Props {
  subjects: Subject[];
  enrollments: Enrollment[];
  students: Student[];
  recentObservations: Observation[];
}

export function ProfessorObservationsClient({ subjects, enrollments, students, recentObservations }: Props) {
  const [editObservation, setEditObservation] = useState<{ id: string; studentId: string; comment: string } | null>(null);

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>{editObservation ? "Editar observación" : "Nueva observación"}</CardTitle>
          <CardDescription>
            {editObservation
              ? "Modifica el comentario de la observación existente."
              : "Se guarda en la colección `observations`."}
          </CardDescription>
        </CardHeader>

        <div className="px-6 pb-6">
          <ProfessorObservationForm
            subjects={subjects}
            enrollments={enrollments}
            students={students}
            editObservation={editObservation}
            onCancelEdit={() => setEditObservation(null)}
          />
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recientes</CardTitle>
          <CardDescription>Últimas 20 observaciones que registraste.</CardDescription>
        </CardHeader>

        <div className="px-6 pb-6 space-y-3">
          {recentObservations.length === 0 ? (
            <div className="text-sm text-zinc-600 dark:text-zinc-300">Aún no registras observaciones.</div>
          ) : (
            recentObservations.map((o) => {
              const studentName = students.find((s) => s.id === o.studentId)?.name ?? o.studentId;

              return (
                <div key={o.id} className="relative rounded-xl border border-zinc-200 p-4 text-sm dark:border-zinc-800 transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium">{studentName}</div>
                      <div className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">ID: {o.studentId}</div>
                    </div>

                    <div className="flex items-center gap-1 -mr-2 -mt-2">
                      <button
                        type="button"
                        onClick={() => setEditObservation({ id: o.id, studentId: o.studentId, comment: o.comment })}
                        className="rounded p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 transition-colors dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
                        title="Modificar observación"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" /></svg>
                      </button>
                      <form action={professorDeleteObservation}>
                        <input type="hidden" name="id" value={o.id} />
                        <button
                          type="submit"
                          className="rounded p-2 text-zinc-400 hover:bg-red-50 hover:text-red-600 transition-colors dark:hover:bg-red-950/30"
                          title="Eliminar observación"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>
                        </button>
                      </form>
                    </div>
                  </div>
                  <div className="mt-2 whitespace-pre-wrap text-zinc-700 dark:text-zinc-300">{o.comment}</div>
                </div>
              );
            })
          )}
        </div>
      </Card>
    </div>
  );
}
