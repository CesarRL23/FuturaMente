import Link from "next/link";
import { hasRole, requireRole } from "@/lib/auth/session";
import { getAdminDb } from "@/lib/firebase/admin";
import { Roles } from "@/models/roles";
import { ProfessorProgressView } from "@/components/ProfessorProgressView";

export default async function ProfessorProgressPage() {
  const { profile } = await requireRole([Roles.PROFESSOR]);

  const subjectsSnap = await getAdminDb()
    .collection("subjects")
    .where("professorId", "==", profile.id)
    .get();
  const subjects = subjectsSnap.docs.map((d) => d.data() as { id: string; name: string });

  const enrollmentsSnap = await getAdminDb().collection("enrollments").get();
  const allEnrollments = enrollmentsSnap.docs.map(
    (d) => d.data() as { id: string; studentId: string; subjectId: string },
  );

  const studentsByArraySnap = await getAdminDb().collection("users").where("roles", "array-contains", Roles.STUDENT).get();
  const studentsByLegacySnap = await getAdminDb().collection("users").where("role", "==", Roles.STUDENT).get();
  const allStudents = [...studentsByArraySnap.docs, ...studentsByLegacySnap.docs]
    .map((d) => d.data() as { id: string; name: string; email: string; role?: string; roles?: string[] })
    .filter((value, index, self) => self.findIndex((st) => st.id === value.id) === index)
    .filter((st) => hasRole(st, Roles.STUDENT));

  const gradesSnap = await getAdminDb()
    .collection("grades")
    .where("professorId", "==", profile.id)
    .get();
  const grades = gradesSnap.docs.map(
    (d) => d.data() as { studentId: string; subjectId: string; week: number; grade: number },
  );

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Progreso de estudiantes</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
            Revisa el rendimiento académico de tus alumnos.
          </p>
        </div>
        <Link className="text-sm font-medium hover:underline" href="/professor">
          Volver a Profesor
        </Link>
      </div>

      <div className="mt-8">
        <ProfessorProgressView
          subjects={subjects}
          enrollments={allEnrollments}
          students={allStudents}
          grades={grades}
        />
      </div>
    </div>
  );
}
