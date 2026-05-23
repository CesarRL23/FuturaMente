"use client";

import { useState } from "react";
import { ProgressLineChart } from "@/components/charts/ProgressLineChart";

type Subject = { id: string; name: string };
type Enrollment = { id: string; studentId: string; subjectId: string };
type Student = { id: string; name: string; email?: string };
type Grade = { studentId: string; subjectId: string; week: number; grade: number };

interface Props {
  subjects: Subject[];
  enrollments: Enrollment[];
  students: Student[];
  grades: Grade[];
}

export function ProfessorProgressView({ subjects, enrollments, students, grades }: Props) {
  const [subjectId, setSubjectId] = useState("");
  const [studentId, setStudentId] = useState("");

  const enrolledStudents = enrollments
    .filter((e) => e.subjectId === subjectId)
    .map((e) => students.find((s) => s.id === e.studentId))
    .filter(Boolean) as Student[];

  // Prepare chart data for the selected student and subject
  let chartData: { week: number; value: number }[] = [];
  if (subjectId && studentId) {
    const studentGrades = grades.filter(
      (g) => g.studentId === studentId && g.subjectId === subjectId,
    ).sort((a, b) => a.week - b.week);

    chartData = studentGrades.map((g) => ({
      week: g.week,
      value: g.grade,
    }));
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="text-sm font-medium">Materia</label>
          <select
            className="h-11 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            value={subjectId}
            onChange={(e) => {
              setSubjectId(e.target.value);
              setStudentId(""); // Reset student
            }}
          >
            <option value="">Selecciona materia</option>
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
            className="h-11 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            disabled={!subjectId}
          >
            <option value="">
              {subjectId ? "Selecciona estudiante" : "Primero selecciona materia"}
            </option>
            {enrolledStudents.map((st) => (
              <option key={st.id} value={st.id}>
                {st.name} {st.email ? `(${st.email})` : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        {!studentId ? (
          <div className="py-10 text-center text-sm text-zinc-500">
            Selecciona una materia y un estudiante para ver su progreso.
          </div>
        ) : chartData.length === 0 ? (
          <div className="py-10 text-center text-sm text-zinc-500">
            El estudiante aún no tiene calificaciones en esta materia.
          </div>
        ) : (
          <div className="h-[300px]">
            <ProgressLineChart data={chartData} />
          </div>
        )}
      </div>
    </div>
  );
}
