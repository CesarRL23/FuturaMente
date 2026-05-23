import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { requireRole } from "@/lib/auth/session";
import { getAdminDb } from "@/lib/firebase/admin";
import { Roles } from "@/models/roles";
import { ProgressLineChart } from "@/components/charts/ProgressLineChart";
import { SubjectBarChart } from "@/components/charts/SubjectBarChart";
import { SubjectRadarChart } from "@/components/charts/SubjectRadarChart";

export default async function StudentHome() {
  const { profile } = await requireRole([Roles.STUDENT]);

  const db = getAdminDb();

  // 1. Obtener inscripciones para saber qué materias cursa
  const enrollmentsSnap = await db
    .collection("enrollments")
    .where("studentId", "==", profile.id)
    .get();
  const enrolledSubjectIds = enrollmentsSnap.docs.map(
    (d) => (d.data() as { subjectId: string }).subjectId,
  );

  // 2. Obtener todas las calificaciones
  const gradesSnap = await db
    .collection("grades")
    .where("studentId", "==", profile.id)
    .limit(500)
    .get();
  const allGrades = gradesSnap.docs.map(
    (d) => d.data() as { subjectId: string; week: number; grade: number },
  );

  // Filtrar solo las que pertenecen a materias inscritas (por si acaso)
  const grades = allGrades.filter((g) => enrolledSubjectIds.includes(g.subjectId));

  // 3. Obtener nombres de materias
  const subjectsSnap = await db.collection("subjects").get();
  const subjectsMap = new Map<string, string>();
  subjectsSnap.docs.forEach((d) => {
    subjectsMap.set(d.id, d.data().name as string);
  });

  // --- PROCESAMIENTO PARA GRÁFICAS ---

  // A. Promedio por Semana (Line Chart)
  const byWeek = new Map<number, { sum: number; count: number }>();
  for (const g of grades) {
    const current = byWeek.get(g.week) ?? { sum: 0, count: 0 };
    current.sum += Number(g.grade);
    current.count += 1;
    byWeek.set(g.week, current);
  }
  const weekData = Array.from(byWeek.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([week, v]) => ({ week, value: Math.round((v.sum / v.count) * 10) / 10 }));

  // B. Promedio por Materia (Bar & Radar Charts)
  const bySubject = new Map<string, { sum: number; count: number }>();
  for (const g of grades) {
    const current = bySubject.get(g.subjectId) ?? { sum: 0, count: 0 };
    current.sum += Number(g.grade);
    current.count += 1;
    bySubject.set(g.subjectId, current);
  }
  const subjectData = Array.from(bySubject.entries()).map(([id, v]) => ({
    subjectName: subjectsMap.get(id) || "Desconocida",
    average: Math.round((v.sum / v.count) * 10) / 10,
  }));

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            ¡Hola, {profile.name}!
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            Aquí tienes un resumen de tu desempeño académico.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            className="inline-flex h-9 items-center justify-center rounded-md border border-zinc-200 bg-white px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
            href="/student/grades"
          >
            Ver mis notas
          </Link>
          <Link
            className="inline-flex h-9 items-center justify-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-50 shadow transition-colors hover:bg-zinc-900/90 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-50/90"
            href="/dashboard"
          >
            Volver
          </Link>
        </div>
      </div>

      {grades.length === 0 ? (
        <div className="mt-12 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-200 py-20 dark:border-zinc-800">
          <p className="text-lg font-medium text-zinc-500">Aún no tienes calificaciones registradas.</p>
          <p className="text-sm text-zinc-400">Tus gráficas aparecerán aquí en cuanto empieces a recibir notas.</p>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Card 1: Evolución Semanal */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Evolución del Promedio</CardTitle>
              <CardDescription>
                Esta gráfica muestra tu promedio general de todas las materias semana tras semana. 
                Te ayuda a visualizar si tu rendimiento está mejorando o descendiendo con el tiempo.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProgressLineChart data={weekData} />
            </CardContent>
          </Card>

          {/* Card 2: Radar de Competencias (Materias) */}
          <Card>
            <CardHeader>
              <CardTitle>Fortalezas por Materia</CardTitle>
              <CardDescription>
                Representa tu desempeño actual en cada asignatura de forma radial. 
                Cuanto más se extienda el área hacia una materia, mayor es tu fortaleza en ella.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SubjectRadarChart data={subjectData} />
            </CardContent>
          </Card>

          {/* Card 3: Comparativa de Materias */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Promedio por Asignatura</CardTitle>
              <CardDescription>
                Compara directamente tus promedios actuales entre las diferentes materias. 
                Ideal para identificar rápidamente las asignaturas que requieren mayor atención.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SubjectBarChart data={subjectData} />
            </CardContent>
          </Card>
        </div>
      )}

      <div className="mt-12">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Acceso rápido</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/student/grades"
            className="group block rounded-xl border border-zinc-200 p-4 transition-all hover:border-zinc-400 hover:shadow-md dark:border-zinc-800 dark:hover:border-zinc-600"
          >
            <div className="font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400">Ver todas las notas</div>
            <div className="text-sm text-zinc-500">Revisa el detalle y comentarios de tus profesores.</div>
          </Link>
          <Link
            href="/student/progress"
            className="group block rounded-xl border border-zinc-200 p-4 transition-all hover:border-zinc-400 hover:shadow-md dark:border-zinc-800 dark:hover:border-zinc-600"
          >
            <div className="font-semibold group-hover:text-green-600 dark:group-hover:text-green-400">Reporte detallado</div>
            <div className="text-sm text-zinc-500">Visualiza tu progreso histórico completo.</div>
          </Link>
        </div>
      </div>
    </div>
  );
}

