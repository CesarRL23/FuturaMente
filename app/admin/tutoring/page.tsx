import { requestNow } from "@/lib/time";
import type { Metadata } from "next";
import { MeetingLinkDisplay } from "@/components/sessions/MeetingLinkDisplay";
import { TableCard, Td, Th } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { SessionStatusBadge } from "@/components/ui/StatusBadge";
import { requireRole } from "@/lib/auth/session";
import { getAuthorizedMeetings, listRecentSessions } from "@/lib/data/sessions";
import { getSubjectsByIds } from "@/lib/data/subjects";
import { getUsersByIds } from "@/lib/data/users";
import { sessionBucket } from "@/lib/domain/sessionRules";
import { formatCOP, formatShortDate, formatTimeRange } from "@/lib/format";
import { Roles } from "@/models/roles";

export const metadata: Metadata = { title: "Monitorías" };

export default async function AdminTutoringPage() {
  const { profile } = await requireRole([Roles.ADMIN]);
  const now = requestNow();
  const sessions = await listRecentSessions(100);
  const [subjects, professors, meetings] = await Promise.all([
    getSubjectsByIds(sessions.map((s) => s.subjectId)),
    getUsersByIds(sessions.map((s) => s.professorId)),
    getAuthorizedMeetings({ viewerId: profile.id, isAdmin: true, sessions }),
  ]);

  return (
    <>
      <PageHeader
        title="Monitorías"
        description="Últimas 100 monitorías de la plataforma (vista de supervisión, solo lectura)."
      />
      {sessions.length === 0 ? (
        <EmptyState
          icon="layers"
          title="Aún no hay monitorías"
          description="Aparecerán cuando los estudiantes reserven horarios publicados por los profesores."
        />
      ) : (
        <TableCard>
          <thead>
            <tr>
              <Th>Fecha</Th>
              <Th>Materia / Profesor</Th>
              <Th>Participantes</Th>
              <Th>Precio · Profesor / MONLINE</Th>
              <Th>Estado</Th>
              <Th>Enlace</Th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((s) => (
              <tr key={s.id}>
                <Td>
                  <span className="font-medium text-slate-900">{formatShortDate(s.startAt)}</span>
                  <br />
                  <span className="text-xs text-slate-500">{formatTimeRange(s.startAt, s.endAt)}</span>
                </Td>
                <Td>
                  <span className="font-medium text-slate-900">{subjects.get(s.subjectId)?.name ?? "—"}</span>
                  <br />
                  <span className="text-xs text-slate-500">{professors.get(s.professorId)?.name ?? "—"}</span>
                </Td>
                <Td>
                  {s.participantIds.length}/{s.capacity}
                </Td>
                <Td>
                  {formatCOP(s.pricing.totalPrice)}
                  <br />
                  <span className="text-xs text-slate-500">
                    {formatCOP(s.pricing.professorAmount)} / {formatCOP(s.pricing.platformAmount)}
                  </span>
                </Td>
                <Td>
                  <SessionStatusBadge status={s.status} pendingClose={sessionBucket(s, now) === "pendingClose"} />
                </Td>
                <Td>
                  {s.status === "CANCELLED" ? (
                    <span className="text-slate-400">—</span>
                  ) : (
                    <MeetingLinkDisplay meeting={meetings.get(s.id)} emptyText="Sin enlace" />
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
