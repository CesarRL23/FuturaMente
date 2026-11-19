import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { hasRole, requireRole } from "@/lib/auth/session";
import { getAdminDb } from "@/lib/firebase/admin";
import { Roles, type Role } from "@/models/roles";

export default async function StudentGradesPage() {
  const { profile } = await requireRole([Roles.STUDENT]);

  const db = getAdminDb();

  // 1. Materias inscritas
  const enrollmentsSnap = await db
    .collection("enrollments")
    .where("studentId", "==", profile.id)
    .get();
  const enrolledSubjectIds = enrollmentsSnap.docs.map(
    (d) => (d.data() as { subjectId: string }).subjectId,
  );

  // 2. Calificaciones
  const gradesSnap = await db
    .collection("grades")
    .where("studentId", "==", profile.id)
    .limit(300)
    .get();
  const allGrades = gradesSnap.docs.map(
    (d) => d.data() as { id: string; subjectId: string; week: number; grade: number },
  );
  const grades = allGrades.filter((g) => enrolledSubjectIds.includes(g.subjectId));

  // 3. Observaciones
  const obsSnap = await db
    .collection("observations")
    .where("studentId", "==", profile.id)
    .limit(50)
    .get();
  const observations = obsSnap.docs
    .map((d) => d.data() as { id: string; professorId: string; comment: string; createdAt: number })
    .sort((a, b) => b.createdAt - a.createdAt);

  // 4. Mapas de referencia
  const subjectsSnap = await db.collection("subjects").get();
  const subjectsMap = new Map<string, string>();
  subjectsSnap.docs.forEach((d) => {
    subjectsMap.set(d.id, d.data().name as string);
  });

  const profsByArraySnap = await db.collection("users").where("roles", "array-contains", Roles.PROFESSOR).get();
  const profsByLegacySnap = await db.collection("users").where("role", "==", Roles.PROFESSOR).get();
  const profsMap = new Map<string, string>();
  [...profsByArraySnap.docs, ...profsByLegacySnap.docs]
    .map((d) => d.data() as { id: string; name: string; role?: Role; roles?: Role[] })
    .filter((value, index, self) => self.findIndex((p) => p.id === value.id) === index)
    .filter((p) => hasRole(p, Roles.PROFESSOR))
    .forEach((p) => {
      profsMap.set(p.id, p.name);
    });

  // --- AGRUPAMIENTO POR MATERIA ---
  const gradesBySubject = new Map<string, typeof grades>();
  enrolledSubjectIds.forEach((sid) => {
    gradesBySubject.set(sid, grades.filter((g) => g.subjectId === sid).sort((a, b) => a.week - b.week));
  });

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Mis Calificaciones</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Consulta tu progreso detallado y los comentarios de tus docentes.
          </p>
        </div>
        <Link
          className="inline-flex h-9 items-center justify-center rounded-md border border-zinc-200 bg-white px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
          href="/student"
        >
          Volver al Panel
        </Link>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        {/* Columna de Notas Izquierda/Centro */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Calificaciones por Materia</h2>

          {enrolledSubjectIds.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center text-zinc-500">
                No estás inscrito en ninguna materia actualmente.
              </CardContent>
            </Card>
          ) : (
            Array.from(gradesBySubject.entries()).map(([sid, subjectGrades]) => {
              const subjectName = subjectsMap.get(sid) || "Materia desconocida";
              const avg = subjectGrades.length > 0
                ? (subjectGrades.reduce((sum, g) => sum + Number(g.grade), 0) / subjectGrades.length).toFixed(1)
                : "N/A";

              return (
                <Card key={sid} className="overflow-hidden">
                  <div className="flex items-center justify-between border-b border-zinc-100 bg-zinc-50/50 px-6 py-3 dark:border-zinc-800 dark:bg-zinc-900/50">
                    <h3 className="font-bold text-zinc-900 dark:text-zinc-100">{subjectName}</h3>
                    <div className="rounded-full bg-zinc-900 px-3 py-1 text-xs font-bold text-white dark:bg-zinc-100 dark:text-zinc-900">
                      Promedio: {avg}
                    </div>
                  </div>
                  <CardContent className="p-0">
                    {subjectGrades.length === 0 ? (
                      <div className="p-6 text-sm text-zinc-400 italic text-center">Sin calificaciones registradas</div>
                    ) : (
                      <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                        {subjectGrades.map((g) => (
                          <div key={g.id} className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/40">
                            <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Semana {g.week}</span>
                            <span className={`text-base font-bold ${Number(g.grade) >= 70 ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
                              {g.grade}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Columna de Observaciones Derecha */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Observaciones</h2>

          <div className="space-y-4">
            {observations.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-sm text-zinc-500 italic">
                  Aún no tienes observaciones registradas.
                </CardContent>
              </Card>
            ) : (
              observations.map((o) => (
                <Card key={o.id} className="relative overflow-hidden border-l-4 border-l-blue-500 transition-all hover:translate-x-1">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                        {profsMap.get(o.professorId) || "Docente"}
                      </span>
                      <span className="text-[10px] text-zinc-400">
                        {new Date(o.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                      {o.comment}
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

