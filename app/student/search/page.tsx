import { requestNow } from "@/lib/time";
import type { Metadata } from "next";
import Link from "next/link";
import { BookSlotForm } from "@/components/booking/BookSlotForm";
import { PriceTable } from "@/components/booking/PriceTable";
import { ActionForm } from "@/components/forms/ActionForm";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button, buttonClasses } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input, Label, Select } from "@/components/ui/Input";
import { PageHeader } from "@/components/ui/PageHeader";
import { requireRole } from "@/lib/auth/session";
import { searchAvailableSlots } from "@/lib/data/availability";
import { getTutoringCatalog } from "@/lib/data/catalog";
import { searchOpenSessions } from "@/lib/data/sessions";
import { getUsersByIds } from "@/lib/data/users";
import { MAX_DAYS_AHEAD } from "@/lib/domain/config";
import { epochToLocalDate } from "@/lib/domain/schedule";
import { formatCOP, formatDuration, formatLongDate, formatTimeRange } from "@/lib/format";
import { Roles } from "@/models/roles";
import { bookSlot, joinSession } from "@/server/actions/bookings";

export const metadata: Metadata = { title: "Buscar monitorías" };

type Params = { materia?: string; profesor?: string; fecha?: string };

export default async function StudentSearchPage({ searchParams }: { searchParams: Promise<Params> }) {
  const { profile } = await requireRole([Roles.STUDENT]);
  const params = await searchParams;
  const now = requestNow();

  const catalog = await getTutoringCatalog();
  const subjectName = new Map(catalog.map((s) => [s.id, s.name]));
  const professorOptions = Array.from(
    new Map(catalog.flatMap((s) => s.professors).map((p) => [p.id, p])).values(),
  ).sort((a, b) => a.name.localeCompare(b.name, "es"));

  // Solo se aceptan filtros que existan en el catálogo.
  const filters = {
    subjectId: params.materia && subjectName.has(params.materia) ? params.materia : undefined,
    professorId: professorOptions.some((p) => p.id === params.profesor) ? params.profesor : undefined,
    date: params.fecha && /^\d{4}-\d{2}-\d{2}$/.test(params.fecha) ? params.fecha : undefined,
  };

  const [slots, openSessions] = await Promise.all([
    searchAvailableSlots(filters, now),
    searchOpenSessions(filters, now),
  ]);
  const visibleSlots = slots.filter((s) => s.professorId !== profile.id && subjectName.has(s.subjectId));
  const visibleSessions = openSessions.filter(
    (s) => s.professorId !== profile.id && !s.participantIds.includes(profile.id) && subjectName.has(s.subjectId),
  );
  const professors = await getUsersByIds([
    ...visibleSlots.map((s) => s.professorId),
    ...visibleSessions.map((s) => s.professorId),
  ]);
  const professorInfo = (id: string) => {
    const p = professors.get(id);
    return {
      name: p?.name ?? "Profesor",
      photoURL: p?.professorProfile?.photoURL || null,
      headline: p?.professorProfile?.headline || null,
    };
  };

  const hasFilters = Boolean(filters.subjectId || filters.professorId || filters.date);

  return (
    <>
      <PageHeader
        title="Buscar monitorías"
        description="Elige la materia, el profesor y el horario que mejor te sirvan."
      />

      {catalog.length === 0 ? (
        <EmptyState
          icon="search"
          title="Aún no hay monitorías disponibles"
          description="Cuando haya materias con profesores asignados, aparecerán aquí."
        />
      ) : (
        <div className="space-y-6">
          {/* Filtros (GET: el estado vive en la URL) */}
          <Card className="p-5">
            <form method="get" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_12rem_auto] lg:items-end">
              <div className="space-y-1.5">
                <Label htmlFor="materia">Materia</Label>
                <Select id="materia" name="materia" defaultValue={filters.subjectId ?? ""}>
                  <option value="">Todas las materias</option>
                  {catalog.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="profesor">Profesor</Label>
                <Select id="profesor" name="profesor" defaultValue={filters.professorId ?? ""}>
                  <option value="">Todos los profesores</option>
                  {professorOptions.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="fecha">Fecha</Label>
                <Input
                  id="fecha"
                  name="fecha"
                  type="date"
                  min={epochToLocalDate(now)}
                  max={epochToLocalDate(now + MAX_DAYS_AHEAD * 24 * 3600_000)}
                  defaultValue={filters.date}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">Buscar</Button>
                {hasFilters ? (
                  <Link href="/student/search" className={buttonClasses({ variant: "ghost" })}>
                    Limpiar
                  </Link>
                ) : null}
              </div>
            </form>
          </Card>

          <PriceTable />

          {/* Monitorías grupales con cupos */}
          {visibleSessions.length > 0 ? (
            <section>
              <h2 className="text-lg font-semibold text-slate-900">Monitorías grupales con cupos</h2>
              <p className="text-sm text-slate-600">
                Únete a una monitoría que ya reservó otro estudiante. El precio total de la sesión no cambia.
              </p>
              <ul className="mt-4 grid gap-4 lg:grid-cols-2">
                {visibleSessions.map((s) => {
                  const prof = professorInfo(s.professorId);
                  const free = s.capacity - s.participantIds.length;
                  return (
                    <li key={s.id}>
                      <Card className="flex h-full flex-col p-5">
                        <SlotHeader
                          subject={subjectName.get(s.subjectId)!}
                          professor={prof}
                          badge={<Badge variant="success">{free} cupo(s) libre(s)</Badge>}
                        />
                        <SlotDetails
                          startAt={s.startAt}
                          endAt={s.endAt}
                          durationMinutes={s.durationMinutes}
                          extra={`Grupal · ${s.participantIds.length} de ${s.capacity} · ${formatCOP(s.pricing.totalPrice)} la monitoría`}
                        />
                        <ActionForm
                          action={joinSession}
                          submitLabel="Unirme a esta monitoría"
                          pendingLabel="Inscribiendo…"
                          className="mt-auto pt-4"
                          buttonClassName="w-full"
                          confirmMessage={`Te unirás a una monitoría grupal de ${subjectName.get(s.subjectId)} (precio total de la sesión: ${formatCOP(s.pricing.totalPrice)}). ¿Confirmas?`}
                        >
                          <input type="hidden" name="sessionId" value={s.id} />
                        </ActionForm>
                      </Card>
                    </li>
                  );
                })}
              </ul>
            </section>
          ) : null}

          {/* Horarios disponibles */}
          <section>
            <h2 className="text-lg font-semibold text-slate-900">Horarios disponibles</h2>
            {visibleSlots.length === 0 ? (
              <div className="mt-4">
                <EmptyState
                  icon="calendar"
                  title="No hay horarios disponibles"
                  description={
                    hasFilters
                      ? "Prueba con otra materia, profesor o fecha."
                      : "Los profesores aún no han publicado horarios próximos."
                  }
                />
              </div>
            ) : (
              <ul className="mt-4 grid gap-4 lg:grid-cols-2">
                {visibleSlots.map((slot) => (
                  <li key={slot.id}>
                    <Card className="flex h-full flex-col p-5">
                      <SlotHeader
                        subject={subjectName.get(slot.subjectId)!}
                        professor={professorInfo(slot.professorId)}
                        badge={<Badge variant="success">Disponible</Badge>}
                      />
                      <SlotDetails
                        startAt={slot.startAt}
                        endAt={slot.endAt}
                        durationMinutes={slot.durationMinutes}
                      />
                      <div className="mt-auto border-t border-slate-100 pt-4">
                        <BookSlotForm slotId={slot.id} action={bookSlot} />
                      </div>
                    </Card>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </>
  );
}

function SlotHeader({
  subject,
  professor,
  badge,
}: {
  subject: string;
  professor: { name: string; photoURL: string | null; headline: string | null };
  badge: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex min-w-0 gap-3">
        <Avatar name={professor.name} photoURL={professor.photoURL} />
        <div className="min-w-0">
          <p className="font-semibold text-slate-900">{subject}</p>
          <p className="text-sm text-slate-700">{professor.name}</p>
          {professor.headline ? <p className="truncate text-xs text-slate-500">{professor.headline}</p> : null}
        </div>
      </div>
      {badge}
    </div>
  );
}

function SlotDetails({
  startAt,
  endAt,
  durationMinutes,
  extra,
}: {
  startAt: number;
  endAt: number;
  durationMinutes: number;
  extra?: string;
}) {
  return (
    <div className="mt-4 space-y-0.5 text-sm">
      <p className="font-medium text-slate-900">{formatLongDate(startAt)}</p>
      <p className="text-slate-600">
        {formatTimeRange(startAt, endAt)} · {formatDuration(durationMinutes)}
      </p>
      {extra ? <p className="text-slate-600">{extra}</p> : null}
    </div>
  );
}
