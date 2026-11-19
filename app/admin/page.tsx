import { ModuleCard } from "@/components/ui/ModuleCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { requireRole } from "@/lib/auth/session";
import { listSubjects } from "@/lib/data/subjects";
import { countUsers, listUsersByRole } from "@/lib/data/users";
import { Roles } from "@/models/roles";

export default async function AdminHome() {
  const { profile } = await requireRole([Roles.ADMIN]);

  const [totalUsers, professors, students, subjects] = await Promise.all([
    countUsers(),
    listUsersByRole(Roles.PROFESSOR),
    listUsersByRole(Roles.STUDENT),
    listSubjects(),
  ]);
  const subjectsWithoutProfessor = subjects.filter((s) => s.professorIds.length === 0).length;

  return (
    <>
      <PageHeader
        title="Centro de administración"
        description={`Hola, ${profile.name}. Este es el estado actual de MONLINE.`}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Usuarios registrados" value={totalUsers} icon="users" />
        <StatCard label="Profesores" value={professors.length} icon="presentation" />
        <StatCard label="Estudiantes" value={students.length} icon="graduation" />
        <StatCard
          label="Materias"
          value={subjects.length}
          icon="book"
          hint={
            subjectsWithoutProfessor > 0
              ? `${subjectsWithoutProfessor} sin profesor asignado`
              : undefined
          }
        />
      </div>

      <h2 className="mt-10 text-lg font-semibold text-slate-900">Módulos</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <ModuleCard
          href="/admin/professors"
          icon="presentation"
          title="Profesores"
          description="Consulta los profesores y las materias que tienen asignadas."
        />
        <ModuleCard
          href="/admin/students"
          icon="graduation"
          title="Estudiantes"
          description="Consulta los estudiantes registrados en la plataforma."
        />
        <ModuleCard
          href="/admin/subjects"
          icon="book"
          title="Materias"
          description="Crea materias y relaciónalas con uno o varios profesores."
        />
        <ModuleCard
          href="/admin/users"
          icon="shield"
          title="Usuarios y permisos"
          description="Crea cuentas y asigna roles de administrador, profesor o estudiante."
        />
        <ModuleCard
          href="/admin/tutoring"
          icon="layers"
          title="Monitorías"
          description="Supervisa las monitorías reservadas, su estado y su enlace."
        />
        <ModuleCard
          href="/admin/bookings"
          icon="bookmark"
          title="Reservas"
          description="Seguimiento de las reservas realizadas por los estudiantes."
          upcoming
        />
        <ModuleCard
          href="/admin/settlements"
          icon="wallet"
          title="Liquidaciones"
          description="Pagos a profesores y registros financieros."
          upcoming
        />
        <ModuleCard
          href="/admin/reports"
          icon="chart"
          title="Reportes"
          description="Estadísticas de uso, monitorías e ingresos."
          upcoming
        />
        <ModuleCard
          href="/admin/settings"
          icon="settings"
          title="Configuración"
          description="Parámetros generales de la plataforma."
          upcoming
        />
      </div>
    </>
  );
}
