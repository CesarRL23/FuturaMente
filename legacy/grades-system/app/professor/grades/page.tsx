
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import { hasRole, requireRole } from "@/lib/auth/session";
import { getAdminDb } from "@/lib/firebase/admin";
import { Roles, type Role } from "@/models/roles";
import { ProfessorGradeForm } from "@/components/forms/ProfessorGradeForm";

export default async function ProfessorGradesPage() {
  const { profile } = await requireRole([Roles.PROFESSOR]);

  const subjectsSnap = await getAdminDb()
    .collection("subjects")
    .where("professorId", "==", profile.id)
    .limit(50)
    .get();
  const subjects = subjectsSnap.docs.map((d) => d.data() as { id: string; name: string });

  const enrollmentsSnap = await getAdminDb().collection("enrollments").get();
  const allEnrollments = enrollmentsSnap.docs.map(
    (d) => d.data() as { id: string; studentId: string; subjectId: string },
  );

  const studentsByArraySnap = await getAdminDb()
    .collection("users")
    .where("roles", "array-contains", Roles.STUDENT)
    .get();
  const studentsByLegacySnap = await getAdminDb().collection("users").where("role", "==", Roles.STUDENT).get();
  const allStudents = [...studentsByArraySnap.docs, ...studentsByLegacySnap.docs]
    .map((d) => d.data() as { id: string; name: string; email: string; role?: Role; roles?: Role[] })
    .filter((value, index, self) => self.findIndex((st) => st.id === value.id) === index)
    .filter((st) => hasRole(st, Roles.STUDENT));

  const allGradesSnap = await getAdminDb()
    .collection("grades")
    .where("professorId", "==", profile.id)
    .limit(500)
    .get();
  const allGrades = allGradesSnap.docs.map(
    (d) =>
      d.data() as {
        id: string;
        studentId: string;
        subjectId: string;
        week: number;
        grade: number;
        updatedAt: number;
      },
  );

  const allObservationsSnap = await getAdminDb()
    .collection("observations")
    .where("professorId", "==", profile.id)
    .limit(500)
    .get();

  const allObservations = allObservationsSnap.docs
    .map((d) => d.data() as { id: string; studentId: string; comment: string; createdAt: number })
    .sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Centro de Calificaciones</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Gestiona notas y observaciones en una sola vista centralizada.
          </p>
        </div>
        <Link
          className="inline-flex h-10 items-center justify-center rounded-lg border border-zinc-200 bg-white px-5 py-2 text-sm font-semibold shadow-sm transition-all hover:bg-zinc-50 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
          href="/professor"
        >
          Volver al Panel
        </Link>
      </div>

      <div className="grid gap-8">
        <div className="w-full">
          <Card className="border-none shadow-xl bg-zinc-50/30 dark:bg-zinc-900/10">
            <CardContent className="p-0">
              <ProfessorGradeForm
                subjects={subjects}
                enrollments={allEnrollments}
                students={allStudents}
                allGrades={allGrades}
                allObservations={allObservations}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

