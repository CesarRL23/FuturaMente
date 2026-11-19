import { requestNow } from "@/lib/time";
import type { Metadata } from "next";
import { TableCard, Td, Th } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { SessionStatusBadge } from "@/components/ui/StatusBadge";
import { requireRole } from "@/lib/auth/session";
import { loadProfessorSessionsView } from "@/lib/data/views";
import { sessionBucket } from "@/lib/domain/sessionRules";
import { formatCOP, formatDuration, formatShortDate, formatTimeRange } from "@/lib/format";
import { Roles } from "@/models/roles";

export const metadata: Metadata = { title: "Historial" };

export default async function ProfessorHistoryPage() {
  const { profile } = await requireRole([Roles.PROFESSOR]);
  const now = requestNow();
  const view = await loadProfessorSessionsView(profile.id);
  const history = view.sessions.filter((s) => {
    const b = sessionBucket(s, now);
    return b === "completed" || b === "cancelled";
  });

  return (
    <>
      <PageHeader title="Historial" description="Monitorías realizadas y canceladas." />
      {history.length === 0 ? (
        <EmptyState
          icon="history"
          title="Sin historial todavía"
          description="Cuando cierres o canceles monitorías, aparecerán aquí."
        />
      ) : (
        <TableCard>
          <thead>
            <tr>
              <Th>Fecha</Th>
              <Th>Materia</Th>
              <Th>Participantes</Th>
              <Th>Tu parte</Th>
              <Th>Estado</Th>
            </tr>
          </thead>
          <tbody>
            {history.map((s) => (
              <tr key={s.id}>
                <Td>
                  <span className="font-medium text-slate-900">{formatShortDate(s.startAt)}</span>
                  <br />
                  <span className="text-xs text-slate-500">
                    {formatTimeRange(s.startAt, s.endAt)} · {formatDuration(s.durationMinutes)}
                  </span>
                </Td>
                <Td>{view.subjectName(s.subjectId)}</Td>
                <Td>
                  {s.participantIds.length}/{s.capacity}
                </Td>
                <Td>{s.status === "COMPLETED" ? formatCOP(s.pricing.professorAmount) : "—"}</Td>
                <Td>
                  <SessionStatusBadge status={s.status} />
                </Td>
              </tr>
            ))}
          </tbody>
        </TableCard>
      )}
    </>
  );
}
