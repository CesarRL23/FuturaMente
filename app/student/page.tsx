import { requestNow } from "@/lib/time";
import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { buttonClasses } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { requireRole } from "@/lib/auth/session";
import { loadStudentReservationsView } from "@/lib/data/views";
import { bookingBucket } from "@/lib/domain/sessionRules";
import { formatShortDate, formatTimeRange } from "@/lib/format";
import { Roles } from "@/models/roles";

export default async function StudentHome() {
  const { profile } = await requireRole([Roles.STUDENT]);
  const now = requestNow();
  const view = await loadStudentReservationsView(profile.id);

  const buckets = view.reservations.map((r) => ({ r, b: bookingBucket(r.booking, r.session, now) }));
  const upcoming = buckets
    .filter((x) => x.b === "upcoming")
    .map((x) => x.r)
    .sort((a, b) => a.session.startAt - b.session.startAt);
  const completed = buckets.filter((x) => x.b === "completed").length;
  const cancelled = buckets.filter((x) => x.b === "cancelled").length;

  // Materias de interés: las de sus reservas (no canceladas), por frecuencia.
  const interest = new Map<string, number>();
  for (const { r, b } of buckets) {
    if (b !== "cancelled") interest.set(r.session.subjectId, (interest.get(r.session.subjectId) ?? 0) + 1);
  }
  const interestSubjects = [...interest.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);

  return (
    <>
      <PageHeader
        title={`Hola, ${profile.name}`}
        description="Tus monitorías y acceso rápido para reservar."
        actions={
          <Link href="/student/search" className={buttonClasses({ size: "sm" })}>
            <Icon name="search" className="h-4 w-4" />
            Buscar monitorías
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Reservas activas" value={upcoming.length} icon="bookmark" />
        <StatCard label="Monitorías realizadas" value={completed} icon="check" />
        <StatCard label="Reservas canceladas" value={cancelled} icon="x" />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Próximas monitorías</CardTitle>
            <Link href="/student/bookings" className="text-sm font-medium text-brand-600 hover:text-brand-700">
              Ver todas
            </Link>
          </CardHeader>
          {upcoming.length === 0 ? (
            <EmptyState
              icon="calendar"
              title="No tienes monitorías próximas"
              description="Encuentra un profesor y reserva el horario que te sirva."
            >
              <Link href="/student/search" className="text-sm font-medium text-brand-600 hover:text-brand-700">
                Buscar monitorías
              </Link>
            </EmptyState>
          ) : (
            <ul className="divide-y divide-slate-100">
              {upcoming.slice(0, 5).map(({ session }) => {
                const prof = view.professorOf(session.professorId);
                return (
                  <li key={session.id} className="flex items-center gap-3 py-3">
                    <Avatar name={prof.name} photoURL={prof.photoURL} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-slate-900">{view.subjectName(session.subjectId)}</p>
                      <p className="text-sm text-slate-600">
                        {formatShortDate(session.startAt)} · {formatTimeRange(session.startAt, session.endAt)} · {prof.name}
                      </p>
                    </div>
                    {view.meetings.has(session.id) ? (
                      <span className="text-xs font-medium text-emerald-700">Enlace listo</span>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Materias de interés</CardTitle>
          </CardHeader>
          {interestSubjects.length === 0 ? (
            <p className="text-sm text-slate-500">Aparecerán aquí las materias en las que reserves monitorías.</p>
          ) : (
            <ul className="space-y-2">
              {interestSubjects.map(([subjectId, count]) => (
                <li key={subjectId}>
                  <Link
                    href={`/student/search?materia=${encodeURIComponent(subjectId)}`}
                    className="flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-slate-50"
                  >
                    <span className="font-medium text-slate-800">{view.subjectName(subjectId)}</span>
                    <span className="text-xs text-slate-500">{count} monitoría(s)</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
