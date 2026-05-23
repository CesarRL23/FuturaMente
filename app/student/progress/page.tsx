import Link from "next/link";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { ProgressLineChart } from "@/components/charts/ProgressLineChart";
import { requireRole } from "@/lib/auth/session";
import { getAdminDb } from "@/lib/firebase/admin";
import { Roles } from "@/models/roles";

export default async function StudentProgressPage() {
  const { profile } = await requireRole([Roles.STUDENT]);

  const enrollmentsSnap = await getAdminDb()
    .collection("enrollments")
    .where("studentId", "==", profile.id)
    .get();
  const enrolledSubjectIds = enrollmentsSnap.docs.map(
    (d) => (d.data() as { subjectId: string }).subjectId,
  );

  const gradesSnap = await getAdminDb()
    .collection("grades")
    .where("studentId", "==", profile.id)
    .limit(500)
    .get();
  const allGrades = gradesSnap.docs.map((d) => d.data() as { subjectId: string; week: number; grade: number });

  const grades = allGrades.filter((g) => enrolledSubjectIds.includes(g.subjectId));

  // Promedio por semana (si hay varias materias en la misma semana)
  const byWeek = new Map<number, { sum: number; count: number }>();
  for (const g of grades) {
    const current = byWeek.get(g.week) ?? { sum: 0, count: 0 };
    current.sum += Number(g.grade);
    current.count += 1;
    byWeek.set(g.week, current);
  }

  const data = Array.from(byWeek.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([week, v]) => ({ week, value: Math.round((v.sum / v.count) * 100) / 100 }));

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Progreso académico</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
            Gráfico de línea basado en el promedio semanal de tus calificaciones.
          </p>
        </div>
        <Link className="text-sm font-medium hover:underline" href="/student">
          Volver a Estudiante
        </Link>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Promedio por semana</CardTitle>
            <CardDescription>
              Si tienes varias materias en una semana, se promedia.
            </CardDescription>
          </CardHeader>

          {data.length === 0 ? (
            <div className="text-sm text-zinc-600 dark:text-zinc-300">
              Aún no hay datos para graficar.
            </div>
          ) : (
            <ProgressLineChart data={data} />
          )}
        </Card>
      </div>
    </div>
  );
}

