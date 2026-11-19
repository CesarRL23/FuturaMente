import { requestNow } from "@/lib/time";
import type { Metadata } from "next";
import Link from "next/link";
import { StudentReservationCard } from "@/components/sessions/StudentReservationCard";
import { Alert } from "@/components/ui/Alert";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { LinkTabs } from "@/components/ui/Tabs";
import { requireRole } from "@/lib/auth/session";
import { loadStudentReservationsView } from "@/lib/data/views";
import { bookingBucket } from "@/lib/domain/sessionRules";
import { Roles } from "@/models/roles";

export const metadata: Metadata = { title: "Mis reservas" };

const TABS = [
  { key: "proximas", label: "Próximas" },
  { key: "realizadas", label: "Realizadas" },
  { key: "canceladas", label: "Canceladas" },
] as const;

const SUCCESS: Record<string, string> = {
  individual: "¡Reserva confirmada! Tu monitoría individual quedó registrada.",
  grupal: "¡Reserva confirmada! Creaste una monitoría grupal; los demás cupos quedan disponibles para otros estudiantes.",
  union: "¡Te uniste a la monitoría grupal!",
};

export default async function StudentBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; reserva?: string }>;
}) {
  const { profile } = await requireRole([Roles.STUDENT]);
  const { tab, reserva } = await searchParams;
  const active = TABS.find((t) => t.key === tab)?.key ?? "proximas";

  const now = requestNow();
  const view = await loadStudentReservationsView(profile.id);
  const withBucket = view.reservations.map((r) => ({ r, bucket: bookingBucket(r.booking, r.session, now) }));
  const groups = {
    proximas: withBucket
      .filter((x) => x.bucket === "upcoming" || x.bucket === "pendingClose")
      .sort((a, b) => a.r.session.startAt - b.r.session.startAt),
    realizadas: withBucket.filter((x) => x.bucket === "completed"),
    canceladas: withBucket.filter((x) => x.bucket === "cancelled"),
  };
  const list = groups[active];

  return (
    <>
      <PageHeader title="Mis reservas" description="Tus monitorías reservadas y su enlace de conexión." />

      {reserva && SUCCESS[reserva] ? (
        <Alert variant="success" className="mb-4">
          {SUCCESS[reserva]} El enlace de conexión aparecerá aquí cuando el profesor lo registre.
        </Alert>
      ) : null}

      <LinkTabs
        active={active}
        tabs={TABS.map((t) => ({
          key: t.key,
          label: t.label,
          href: `/student/bookings?tab=${t.key}`,
          count: groups[t.key].length,
        }))}
      />

      {list.length === 0 ? (
        <EmptyState
          icon="bookmark"
          title={
            active === "proximas"
              ? "No tienes monitorías próximas"
              : active === "realizadas"
                ? "Aún no tienes monitorías realizadas"
                : "No tienes reservas canceladas"
          }
          description="Busca una materia y reserva un horario con un profesor."
        >
          {active === "proximas" ? (
            <Link href="/student/search" className="text-sm font-medium text-brand-600 hover:text-brand-700">
              Buscar monitorías
            </Link>
          ) : null}
        </EmptyState>
      ) : (
        <ul className="space-y-4">
          {list.map(({ r }) => (
            <li key={r.booking.id}>
              <StudentReservationCard
                booking={r.booking}
                session={r.session}
                subjectName={view.subjectName(r.session.subjectId)}
                professor={view.professorOf(r.session.professorId)}
                meeting={view.meetings.get(r.session.id)}
                now={now}
              />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
