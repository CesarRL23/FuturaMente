import { requestNow } from "@/lib/time";
import type { Metadata } from "next";
import { TableCard, Td, Th } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { BookingStatusBadge, SessionStatusBadge } from "@/components/ui/StatusBadge";
import { requireRole } from "@/lib/auth/session";
import { loadStudentReservationsView } from "@/lib/data/views";
import { bookingBucket } from "@/lib/domain/sessionRules";
import { formatCOP, formatShortDate, formatTimeRange } from "@/lib/format";
import { Roles } from "@/models/roles";

export const metadata: Metadata = { title: "Historial" };

export default async function StudentHistoryPage() {
  const { profile } = await requireRole([Roles.STUDENT]);
  const now = requestNow();
  const view = await loadStudentReservationsView(profile.id);
  const history = view.reservations.filter((r) => {
    const b = bookingBucket(r.booking, r.session, now);
    return b === "completed" || b === "cancelled";
  });

  return (
    <>
      <PageHeader title="Historial" description="Monitorías realizadas y reservas canceladas." />
      {history.length === 0 ? (
        <EmptyState icon="history" title="Sin historial todavía" description="Aquí verás tus monitorías pasadas." />
      ) : (
        <TableCard>
          <thead>
            <tr>
              <Th>Fecha</Th>
              <Th>Materia</Th>
              <Th>Profesor</Th>
              <Th>Precio</Th>
              <Th>Estado</Th>
            </tr>
          </thead>
          <tbody>
            {history.map(({ booking, session }) => (
              <tr key={booking.id}>
                <Td>
                  <span className="font-medium text-slate-900">{formatShortDate(session.startAt)}</span>
                  <br />
                  <span className="text-xs text-slate-500">{formatTimeRange(session.startAt, session.endAt)}</span>
                </Td>
                <Td>{view.subjectName(session.subjectId)}</Td>
                <Td>{view.professorOf(session.professorId).name}</Td>
                <Td>{formatCOP(session.pricing.totalPrice)}</Td>
                <Td>
                  {session.status === "CANCELLED" ? (
                    <SessionStatusBadge status="CANCELLED" />
                  ) : (
                    <BookingStatusBadge status={booking.status} />
                  )}
                </Td>
              </tr>
            ))}
          </tbody>
        </TableCard>
      )}
    </>
  );
}
