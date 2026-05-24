"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { professorUpsertGrade, professorAddObservation } from "@/server/actions/professor";

type Subject = { id: string; name: string };
type Enrollment = { id: string; studentId: string; subjectId: string };
type Student = { id: string; name: string; email?: string };
type Grade = { id: string; studentId: string; subjectId: string; week: number; grade: number };
type Observation = { id: string; studentId: string; comment: string; createdAt: number };

interface Props {
  subjects: Subject[];
  enrollments: Enrollment[];
  students: Student[];
  allGrades: Grade[];
  allObservations: Observation[];
}

export function ProfessorGradeForm({ subjects, enrollments, students, allGrades, allObservations }: Props) {
  const [subjectId, setSubjectId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // States for new entries
  const [newWeek, setNewWeek] = useState("");
  const [newGrade, setNewGrade] = useState("");
  const [observation, setObservation] = useState("");

  const weekInputRef = useRef<HTMLInputElement>(null);

  // Auto-clear feedback
  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  const enrolledStudents = enrollments
    .filter((e) => e.subjectId === subjectId)
    .map((e) => students.find((s) => s.id === e.studentId))
    .filter(Boolean) as Student[];

  const currentGrades = allGrades
    .filter((g) => g.subjectId === subjectId && g.studentId === studentId)
    .sort((a, b) => a.week - b.week);

  const currentObservation = allObservations.find(o => o.studentId === studentId);

  const handleSaveGrade = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!subjectId || !studentId || !newWeek || !newGrade) return;

    const formData = new FormData();
    formData.append("subjectId", subjectId);
    formData.append("studentId", studentId);
    formData.append("week", newWeek);
    formData.append("grade", newGrade);

    startTransition(async () => {
      try {
        await professorUpsertGrade(formData);
        setFeedback({ type: "success", message: `Nota guardada: Semana ${newWeek}` });
        setNewWeek("");
        setNewGrade("");
        weekInputRef.current?.focus();
      } catch (err) {
        setFeedback({ type: "error", message: "Error al guardar la nota." });
      }
    });
  };

  const handleSaveObservation = async () => {
    if (!studentId || !observation) return;

    const formData = new FormData();
    formData.append("studentId", studentId);
    formData.append("comment", observation);

    startTransition(async () => {
      try {
        await professorAddObservation(formData);
        setFeedback({ type: "success", message: "Observación guardada." });
        setObservation("");
      } catch (err) {
        setFeedback({ type: "error", message: "Error al guardar la observación." });
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      handleSaveGrade();
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-[600px]">
      {/* SIDEBAR DE SELECCIÓN */}
      <div className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-zinc-200 dark:border-zinc-800 p-6 bg-white dark:bg-zinc-950 rounded-t-2xl lg:rounded-tr-none lg:rounded-l-2xl">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">1. Seleccionar Materia</label>
            <select
              className="w-full h-11 rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-sm font-medium focus:ring-2 focus:ring-zinc-900 transition-all dark:border-zinc-800 dark:bg-zinc-900 dark:focus:ring-zinc-100"
              value={subjectId}
              onChange={(e) => {
                setSubjectId(e.target.value);
                setStudentId("");
              }}
            >
              <option value="">Elegir materia...</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2 text-wrap">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">2. Seleccionar Estudiante</label>
            <div className="max-h-[300px] overflow-y-auto space-y-1 pr-2 custom-scrollbar">
              {!subjectId ? (
                <p className="text-sm text-zinc-400 italic py-4 text-center">Selecciona una materia primero</p>
              ) : enrolledStudents.length === 0 ? (
                <p className="text-sm text-zinc-400 italic py-4 text-center">No hay estudiantes inscritos</p>
              ) : (
                enrolledStudents.map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setStudentId(st.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all ${studentId === st.id
                        ? "bg-zinc-900 text-white shadow-lg dark:bg-zinc-100 dark:text-zinc-900"
                        : "hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400"
                      }`}
                  >
                    <div className="font-semibold truncate">{st.name}</div>
                    <div className={`text-[10px] ${studentId === st.id ? "text-zinc-300 dark:text-zinc-600" : "text-zinc-400"}`}>
                      {st.email}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ÁREA DE TRABAJO PRINCIPAL */}
      <div className="flex-1 p-6 md:p-10 relative">
        {feedback && (
          <div className={`absolute top-4 right-10 z-50 animate-in fade-in slide-in-from-top-4 px-4 py-2 rounded-lg text-sm font-bold shadow-xl ${feedback.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
            }`}>
            {feedback.message}
          </div>
        )}

        {!studentId ? (
          <div className="h-full flex flex-col items-center justify-center text-zinc-400">
            <div className="rounded-full bg-zinc-100 p-6 mb-4 dark:bg-zinc-900">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
            </div>
            <p className="text-lg font-medium">Selecciona un estudiante para comenzar</p>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* Cabecera de Contexto */}
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-6">
              <div>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  {students.find(s => s.id === studentId)?.name}
                </h2>
                <p className="text-sm text-zinc-500 font-medium">
                  Materia: <span className="text-zinc-900 dark:text-zinc-100">{subjects.find(s => s.id === subjectId)?.name}</span>
                </p>
              </div>
              <div className="hidden md:block">
                <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700 dark:bg-green-950 dark:text-green-400">
                  Sustema de Calificación Activo
                </span>
              </div>
            </div>

            <div className="grid lg:grid-cols-5 gap-8">
              {/* Formulario e Historial a la izquierda */}
              <div className="lg:col-span-3 space-y-8">
                {/* Inputs de Entrada Rápida */}
                <div className="bg-zinc-100/50 p-6 rounded-2xl dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-800/50">
                  <h3 className="text-sm font-bold mb-4 uppercase tracking-widest text-zinc-500">Entrada Rápida de Notas</h3>
                  <div className="flex flex-wrap items-end gap-4" onKeyDown={handleKeyDown}>
                    <div className="flex-1 min-w-[120px]">
                      <label className="text-[10px] font-bold uppercase mb-1 block ml-1">Semana</label>
                      <Input
                        ref={weekInputRef}
                        type="number"
                        placeholder="1"
                        value={newWeek}
                        onChange={(e) => setNewWeek(e.target.value)}
                        className="h-12 text-lg font-bold rounded-xl border-zinc-200 dark:border-zinc-800"
                      />
                    </div>
                    <div className="flex-1 min-w-[120px]">
                      <label className="text-[10px] font-bold uppercase mb-1 block ml-1">Calificación (0-100)</label>
                      <Input
                        type="number"
                        placeholder="85"
                        value={newGrade}
                        onChange={(e) => setNewGrade(e.target.value)}
                        className="h-12 text-lg font-bold rounded-xl border-zinc-200 dark:border-zinc-800"
                      />
                    </div>
                    <Button
                      onClick={() => handleSaveGrade()}
                      className="h-12 px-8 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold shadow-lg transition-all active:scale-95 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                      disabled={isPending || !newWeek || !newGrade}
                    >
                      {isPending ? "Guardando..." : "Guardar Nota"}
                    </Button>
                  </div>
                  <p className="mt-2 text-[10px] text-zinc-400 font-medium ml-1 flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded border border-zinc-200 bg-white dark:bg-zinc-800 dark:border-zinc-700">Enter</kbd> para guardar rápidamente
                  </p>
                </div>

                {/* Tabla de Notas */}
                <div>
                  <h3 className="text-sm font-bold mb-4 uppercase tracking-widest text-zinc-500 flex items-center justify-between">
                    Notas Registradas
                    <span className="text-[10px] font-normal lowercase bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                      {currentGrades.length} registros
                    </span>
                  </h3>
                  <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800">
                        <tr>
                          <th className="px-6 py-3 font-bold text-zinc-700 dark:text-zinc-300">Semana</th>
                          <th className="px-6 py-3 font-bold text-zinc-700 dark:text-zinc-300">Calificación</th>
                          <th className="px-6 py-3 font-bold text-zinc-700 dark:text-zinc-300 text-right">Estado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                        {currentGrades.length === 0 ? (
                          <tr>
                            <td colSpan={3} className="px-6 py-10 text-center text-zinc-400 italic">No hay notas para este estudiante en esta materia.</td>
                          </tr>
                        ) : (
                          currentGrades.map((g) => (
                            <tr key={g.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 transition-colors">
                              <td className="px-6 py-4 font-semibold text-zinc-900 dark:text-zinc-100">Semana {g.week}</td>
                              <td className="px-6 py-4">
                                <span className={`text-base font-bold ${g.grade >= 70 ? 'text-green-600' : 'text-amber-600'}`}>
                                  {g.grade}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                {g.grade >= 70 ? (
                                  <span className="text-[10px] font-bold text-green-600 dark:text-green-400">Aprobado</span>
                                ) : (
                                  <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">En Progreso</span>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Panel de Observaciones a la derecha */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm flex flex-col h-full">
                  <h3 className="text-sm font-bold mb-4 uppercase tracking-widest text-zinc-500">Observaciones del Estudiante</h3>

                  <div className="flex-1 space-y-4">
                    {currentObservation && (
                      <div className="bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 mb-4">
                        <div className="text-[10px] font-bold text-blue-600 dark:text-blue-400 mb-1 uppercase">Última Observación:</div>
                        {currentObservation.comment}
                      </div>
                    )}

                    <textarea
                      placeholder="Escribe una nueva observación o comentario para el estudiante..."
                      className="w-full min-h-[200px] h-full rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm focus:ring-2 focus:ring-zinc-900 transition-all dark:border-zinc-800 dark:bg-zinc-900 dark:focus:ring-zinc-100 resize-none"
                      value={observation}
                      onChange={(e) => setObservation(e.target.value)}
                    />
                  </div>

                  <Button
                    onClick={handleSaveObservation}
                    variant="secondary"
                    className="mt-4 w-full h-11 rounded-xl border-zinc-300 dark:border-zinc-700 font-semibold"
                    disabled={isPending || !observation}
                  >
                    Guardar Observación
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
