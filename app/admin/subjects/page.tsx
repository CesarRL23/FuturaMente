import Link from "next/link";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { requireRole } from "@/lib/auth/session";
import { getAdminDb } from "@/lib/firebase/admin";
import { Roles } from "@/models/roles";
import { adminAssignProfessor, adminCreateSubject, adminAssignStudentToSubject, adminRemoveStudentFromSubject } from "@/server/actions/admin";

export default async function AdminSubjectsPage() {
  await requireRole([Roles.ADMIN]);

  const subjectsSnap = await getAdminDb()
    .collection("subjects")
    .orderBy("createdAt", "desc")
    .limit(50)
    .get();
  const subjects = subjectsSnap.docs.map((d) => d.data() as { id: string; name: string; professorId: string | null });

  const professorsSnap = await getAdminDb()
    .collection("users")
    .where("role", "==", Roles.PROFESSOR)
    .limit(100)
    .get();
  const professors = professorsSnap.docs.map((d) => d.data() as { id: string; name: string; email: string });

  const studentsSnap = await getAdminDb()
    .collection("users")
    .where("role", "==", Roles.STUDENT)
    .limit(500)
    .get();
  const students = studentsSnap.docs.map((d) => d.data() as { id: string; name: string; email: string });

  const enrollmentsSnap = await getAdminDb()
    .collection("enrollments")
    .limit(1000)
    .get();
  const enrollments = enrollmentsSnap.docs.map((d) => d.data() as { id: string; studentId: string; subjectId: string });

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Materias</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
            Crea materias y asigna profesores.
          </p>
        </div>
        <Link className="text-sm font-medium hover:underline" href="/admin">
          Volver a Admin
        </Link>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Crear materia</CardTitle>
            <CardDescription>Opcional: asigna profesor al crearla.</CardDescription>
          </CardHeader>

          <form action={adminCreateSubject} className="space-y-3">
            <div className="space-y-1">
              <label className="text-sm font-medium">Nombre</label>
              <Input name="name" placeholder="Ej: Matemáticas" required />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Profesor (opcional)</label>
              <select
                name="professorId"
                className="h-11 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                defaultValue=""
              >
                <option value="">Sin asignar</option>
                {professors.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.email})
                  </option>
                ))}
              </select>
            </div>
            <Button type="submit" className="w-full">
              Crear
            </Button>
          </form>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lista (últimas 50)</CardTitle>
            <CardDescription>Asignación de profesor por materia.</CardDescription>
          </CardHeader>

          <div className="space-y-4">
            {subjects.length === 0 ? (
              <div className="text-sm text-zinc-600 dark:text-zinc-300">No hay materias aún.</div>
            ) : (
              subjects.map((s) => (
                <div key={s.id} className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
                  <div className="font-medium">{s.name}</div>
                  <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">id: {s.id}</div>
                  <form action={adminAssignProfessor} className="mt-3 flex items-center gap-2">
                    <input type="hidden" name="subjectId" value={s.id} />
                    <select
                      name="professorId"
                      className="h-10 flex-1 rounded-md border border-zinc-300 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                      defaultValue={s.professorId ?? ""}
                      required
                    >
                      <option value="" disabled>
                        Selecciona profesor
                      </option>
                      {professors.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.email})
                        </option>
                      ))}
                    </select>
                    <Button type="submit" variant="secondary">
                      Asignar
                    </Button>
                  </form>

                  <div className="my-4 h-px bg-zinc-200 dark:bg-zinc-800" />

                  <div className="mb-2 text-sm font-medium">Estudiantes inscritos</div>
                  <ul className="mb-3 space-y-1">
                    {enrollments.filter((e) => e.subjectId === s.id).length === 0 ? (
                      <li className="text-xs text-zinc-500">Ningún estudiante inscrito.</li>
                    ) : (
                      enrollments
                        .filter((e) => e.subjectId === s.id)
                        .map((e) => {
                          const st = students.find((st) => st.id === e.studentId);
                          return (
                            <li
                              key={e.id}
                              className="flex items-center justify-between rounded border border-zinc-100 bg-zinc-50 p-2 text-xs dark:border-zinc-800 dark:bg-zinc-900"
                            >
                              <span>{st ? `${st.name} (${st.email})` : e.studentId}</span>
                              <form action={adminRemoveStudentFromSubject}>
                                <input type="hidden" name="subjectId" value={s.id} />
                                <input type="hidden" name="studentId" value={e.studentId} />
                                <Button
                                  type="submit"
                                  variant="ghost"
                                  className="h-6 w-6 p-0 text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                                >
                                  &times;
                                </Button>
                              </form>
                            </li>
                          );
                        })
                    )}
                  </ul>

                  <form action={adminAssignStudentToSubject} className="flex items-center gap-2">
                    <input type="hidden" name="subjectId" value={s.id} />
                    <select
                      name="studentId"
                      className="h-9 flex-1 rounded-md border border-zinc-300 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                      defaultValue=""
                      required
                    >
                      <option value="" disabled>
                        Inscribir estudiante...
                      </option>
                      {students.map((st) => {
                        const isEnrolled = enrollments.some(
                          (e) => e.subjectId === s.id && e.studentId === st.id,
                        );
                        if (isEnrolled) return null;
                        return (
                          <option key={st.id} value={st.id}>
                            {st.name} ({st.email})
                          </option>
                        );
                      })}
                    </select>
                    <Button type="submit" variant="secondary" className="h-9">
                      Añadir
                    </Button>
                  </form>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

