import { requestNow } from "@/lib/time";
import Link from "next/link";
import { buttonClasses } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { SessionStatusBadge } from "@/components/ui/StatusBadge";
import { requireRole } from "@/lib/auth/session";
import { listProfessorSlots } from "@/lib/data/availability";
import { listSubjectsByProfessor } from "@/lib/data/subjects";
import { loadProfessorSessionsView } from "@/lib/data/views";
import { sessionBucket } from "@/lib/domain/sessionRules";
import { formatShortDate, formatTimeRange } from "@/lib/format";
import { Roles } from "@/models/roles";

function formatHours(minutes: number) {
  const h = minutes / 60;
  return Number.isInteger(h) ? `${h} h` : `${h.toFixed(1).replace(".", ",")} h`;
}

export default async function ProfessorHome() {
  const { profile } = await requireRole([Roles.PROFESSOR]);
  const now = requestNow();
  const [view, slots, subjects] = await Promise.all([
    loadProfessorSessionsView(profile.id),
    listProfessorSlots(profile.id, now),
    listSubjectsByProfessor(profile.id),
  ]);

  const buckets = view.sessions.map((s) => ({ s, b: sessionBucket(s, now) }));
  const upcoming = buckets.filter((x) => x.b === "upcoming").map((x) => x.s).sort((a, b) => a.startAt - b.startAt);
  const pendingClose = buckets.filter((x) => x.b === "pendingClose").length;
  const completed = buckets.filter((x) => x.b === "completed").length;
  const cancelled = buckets.filter((x) => x.b === "cancelled").length;
  const scheduledMinutes = upcoming.reduce((sum, s) => sum + s.durationMinutes, 0);
  const enrolledStudents = new Set(upcoming.flatMap((s) => s.participantIds)).size;
  const publishedSlots = slots.filter((s) => s.status === "AVAILABLE" && s.startAt > now).length;

  return (
    <>
      <PageHeader
        title={`Hola, ${profile.name}`}
        description="Resumen de tus monitorías y tu disponibilidad."
        actions={
          <Link href="/professor/availability" className={buttonClasses({ size: "sm" })}>
            Publicar disponibilidad
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Próximas monitorías" value={upcoming.length} icon="layers" />
        <StatCard label="Horas programadas" value={formatHours(scheduledMinutes)} icon="clock" hint="En monitorías próximas" />
        <StatCard label="Estudiantes inscritos" value={enrolledStudents} icon="users" hint="En monitorías próximas" />
        <StatCard
          label="Horarios publicados"
          value={publishedSlots}
          icon="calendar"
          hint={subjects.length === 0 ? "Sin materias asignadas" : "Disponibles para reservar"}
        />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Próximas monitorías</CardTitle>
            <Link href="/professor/sessions" className="text-sm font-medium text-brand-600 hover:text-brand-700">
              Ver todas
            </Link>
          </CardHeader>
          {upcoming.length === 0 ? (
            <EmptyState
              icon="layers"
              title="No tienes monitorías próximas"
              description="Publica horarios para que los estudiantes puedan reservar."
            />
          ) : (
            <ul className="divide-y divide-slate-100">
              {upcoming.slice(0, 5).map((s) => (
                <li key={s.id} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium text-slate-900">{view.subjectName(s.subjectId)}</p>
                    <p className="text-sm text-slate-600">
                      {formatShortDate(s.startAt)} · {formatTimeRange(s.startAt, s.endAt)} ·{" "}
                      {s.participantIds.length}/{s.capacity} estudiantes
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {!s.hasMeetingLink ? <span className="text-xs text-amber-700">Sin enlace</span> : null}
                    <SessionStatusBadge status={s.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Resumen de actividad</CardTitle>
          </CardHeader>
          <dl className="space-y-3 text-sm">
            {[
              ["Monitorías realizadas", completed],
              ["Por cerrar (registrar asistencia)", pendingClose],
              ["Monitorías canceladas", cancelled],
              ["Total de monitorías", view.sessions.length],
              ["Materias asignadas", subjects.length],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-3">
                <dt className="text-slate-600">{label}</dt>
                <dd className="font-semibold text-slate-900">{value}</dd>
              </div>
            ))}
          </dl>
          {pendingClose > 0 ? (
            <Link
              href="/professor/sessions"
              className="mt-4 block text-sm font-medium text-amber-700 hover:text-amber-800"
            >
              Tienes {pendingClose} monitoría(s) por cerrar →
            </Link>
          ) : null}
        </Card>
      </div>
    </>
  );
}
