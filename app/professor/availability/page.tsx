import { requestNow } from "@/lib/time";
import type { Metadata } from "next";
import Link from "next/link";
import { SlotFields } from "@/components/availability/SlotFields";
import { ActionForm } from "@/components/forms/ActionForm";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { PageHeader } from "@/components/ui/PageHeader";
import { SlotStatusBadge } from "@/components/ui/StatusBadge";
import { requireRole } from "@/lib/auth/session";
import { listProfessorSlots } from "@/lib/data/availability";
import { listSubjectsByProfessor } from "@/lib/data/subjects";
import { MAX_DAYS_AHEAD, SLOT_MAX_MINUTES, SLOT_MIN_MINUTES } from "@/lib/domain/config";
import { epochToLocalDate } from "@/lib/domain/schedule";
import { formatDuration, formatLongDate, formatTimeRange } from "@/lib/format";
import type { AvailabilityStatus } from "@/models/availability";
import { Roles } from "@/models/roles";
import { createAvailability, deleteAvailability, updateAvailability } from "@/server/actions/availability";

export const metadata: Metadata = { title: "Mi disponibilidad" };

const FILTERS: { key: "all" | AvailabilityStatus; label: string }[] = [
  { key: "all", label: "Todas" },
  { key: "AVAILABLE", label: "Disponibles" },
  { key: "BOOKED", label: "Reservadas" },
  { key: "CANCELLED", label: "Canceladas" },
];

export default async function ProfessorAvailabilityPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>;
}) {
  const { profile } = await requireRole([Roles.PROFESSOR]);
  const { estado } = await searchParams;
  const filter = FILTERS.find((f) => f.key === estado)?.key ?? "all";

  const now = requestNow();
  const [subjects, slots] = await Promise.all([
    listSubjectsByProfessor(profile.id),
    listProfessorSlots(profile.id, now),
  ]);
  const subjectName = new Map(subjects.map((s) => [s.id, s.name]));
  const minDate = epochToLocalDate(now);
  const maxDate = epochToLocalDate(now + MAX_DAYS_AHEAD * 24 * 3600_000);

  const counts = {
    all: slots.length,
    AVAILABLE: slots.filter((s) => s.status === "AVAILABLE").length,
    BOOKED: slots.filter((s) => s.status === "BOOKED").length,
    CANCELLED: slots.filter((s) => s.status === "CANCELLED").length,
  };
  const visible = filter === "all" ? slots : slots.filter((s) => s.status === filter);

  return (
    <>
      <PageHeader
        title="Mi disponibilidad"
        description="Publica los horarios en los que puedes dar monitorías. Los estudiantes los verán al buscar."
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Publicar horario</CardTitle>
            <CardDescription>
              Entre {formatDuration(SLOT_MIN_MINUTES)} y {formatDuration(SLOT_MAX_MINUTES)}, hasta{" "}
              {MAX_DAYS_AHEAD} días adelante. Hora de Colombia.
            </CardDescription>
          </CardHeader>
          {subjects.length === 0 ? (
            <p className="text-sm text-slate-600">
              Aún no tienes materias asignadas. El administrador debe asignarte al menos una antes de
              publicar disponibilidad.
            </p>
          ) : (
            <ActionForm
              action={createAvailability}
              submitLabel={
                <>
                  <Icon name="plus" className="h-4 w-4" />
                  Publicar disponibilidad
                </>
              }
              pendingLabel="Publicando…"
              resetOnSuccess
              className="space-y-4"
              buttonClassName="w-full"
            >
              <SlotFields idPrefix="new" subjects={subjects} minDate={minDate} maxDate={maxDate} />
            </ActionForm>
          )}
        </Card>

        <div className="min-w-0">
          <nav aria-label="Filtrar por estado" className="mb-4 flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <Link
                key={f.key}
                href={f.key === "all" ? "/professor/availability" : `/professor/availability?estado=${f.key}`}
                aria-current={filter === f.key ? "page" : undefined}
                className={[
                  "rounded-full px-3 py-1.5 text-sm font-medium ring-1 ring-inset transition-colors",
                  filter === f.key
                    ? "bg-brand-600 text-white ring-brand-600"
                    : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50",
                ].join(" ")}
              >
                {f.label} ({counts[f.key]})
              </Link>
            ))}
          </nav>

          {visible.length === 0 ? (
            <EmptyState
              icon="calendar"
              title={filter === "all" ? "Aún no has publicado horarios" : "No hay franjas con este estado"}
              description="Las franjas de los últimos 7 días y las futuras aparecen aquí."
            />
          ) : (
            <ul className="space-y-3">
              {visible.map((slot) => {
                const expired = slot.startAt <= now;
                const editable = slot.status === "AVAILABLE" && !expired;
                return (
                  <li key={slot.id}>
                    <Card className="p-5">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900">
                            {subjectName.get(slot.subjectId) ?? "Materia no asignada"}
                          </p>
                          <p className="mt-1 text-sm text-slate-700">{formatLongDate(slot.startAt)}</p>
                          <p className="text-sm text-slate-600">
                            {formatTimeRange(slot.startAt, slot.endAt)} · {formatDuration(slot.durationMinutes)}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <SlotStatusBadge status={slot.status} expired={expired} />
                          {slot.status === "BOOKED" ? (
                            <Link
                              href="/professor/sessions"
                              className="text-sm font-medium text-brand-600 hover:text-brand-700"
                            >
                              Ver monitoría
                            </Link>
                          ) : null}
                        </div>
                      </div>

                      {editable ? (
                        <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4">
                          <details className="group">
                            <summary className="cursor-pointer text-sm font-medium text-brand-600 hover:text-brand-700">
                              Editar franja
                            </summary>
                            <ActionForm
                              action={updateAvailability}
                              submitLabel="Guardar cambios"
                              pendingLabel="Guardando…"
                              className="mt-4 space-y-4"
                              variant="secondary"
                            >
                              <input type="hidden" name="slotId" value={slot.id} />
                              <SlotFields
                                idPrefix={`edit-${slot.id}`}
                                subjects={subjects}
                                minDate={minDate}
                                maxDate={maxDate}
                                defaults={{
                                  subjectId: slot.subjectId,
                                  date: slot.date,
                                  startTime: slot.startTime,
                                  endTime: slot.endTime,
                                }}
                              />
                            </ActionForm>
                          </details>
                          <ActionForm
                            action={deleteAvailability}
                            submitLabel="Eliminar franja"
                            pendingLabel="Eliminando…"
                            variant="ghost"
                            size="sm"
                            buttonClassName="text-red-600 hover:bg-red-50 hover:text-red-700"
                            confirmMessage="¿Eliminar esta franja de disponibilidad?"
                          >
                            <input type="hidden" name="slotId" value={slot.id} />
                          </ActionForm>
                        </div>
                      ) : null}
                    </Card>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
