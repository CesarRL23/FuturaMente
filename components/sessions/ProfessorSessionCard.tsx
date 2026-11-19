import { ActionForm } from "@/components/forms/ActionForm";
import { MeetingLinkDisplay } from "@/components/sessions/MeetingLinkDisplay";
import { Card } from "@/components/ui/Card";
import { Input, Label, Textarea } from "@/components/ui/Input";
import { SessionStatusBadge } from "@/components/ui/StatusBadge";
import { isSessionActive, sessionBucket } from "@/lib/domain/sessionRules";
import { formatCOP, formatDuration, formatLongDate, formatTimeRange } from "@/lib/format";
import type { Session, SessionMeeting } from "@/models/session";
import {
  cancelSessionByProfessor,
  completeSession,
  confirmSession,
  setMeetingLink,
} from "@/server/actions/sessions";

export function ProfessorSessionCard({
  session,
  subjectName,
  participants,
  meeting,
  now,
}: {
  session: Session;
  subjectName: string;
  participants: { id: string; name: string }[];
  meeting: SessionMeeting | undefined;
  now: number;
}) {
  const bucket = sessionBucket(session, now);
  const active = isSessionActive(session.status);
  const started = now >= session.startAt;
  const canEditLink = active && now < session.endAt;

  return (
    <Card className="p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="font-semibold text-slate-900">{subjectName}</p>
          <p className="mt-1 text-sm text-slate-700">{formatLongDate(session.startAt)}</p>
          <p className="text-sm text-slate-600">
            {formatTimeRange(session.startAt, session.endAt)} · {formatDuration(session.durationMinutes)}
          </p>
        </div>
        <SessionStatusBadge status={session.status} pendingClose={bucket === "pendingClose"} />
      </div>

      <dl className="mt-4 grid gap-3 border-t border-slate-100 pt-4 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">Modalidad</dt>
          <dd className="mt-0.5 text-slate-800">
            {session.modality === "INDIVIDUAL" ? "Individual" : "Grupal"} · {session.participantIds.length}/
            {session.capacity} participantes
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">Precio total</dt>
          <dd className="mt-0.5 text-slate-800">{formatCOP(session.pricing.totalPrice)}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Tu parte ({session.pricing.professorPercent}%)
          </dt>
          <dd className="mt-0.5 font-medium text-slate-900">{formatCOP(session.pricing.professorAmount)}</dd>
        </div>
      </dl>

      <div className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Estudiantes inscritos</p>
        {participants.length === 0 ? (
          <p className="mt-1 text-sm text-slate-500">Sin estudiantes.</p>
        ) : (
          <ul className="mt-1 flex flex-wrap gap-2">
            {participants.map((p) => (
              <li key={p.id} className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">
                {p.name}
              </li>
            ))}
          </ul>
        )}
      </div>

      {session.status !== "CANCELLED" ? (
        <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Enlace de conexión</p>
          <MeetingLinkDisplay meeting={meeting} emptyText="Aún no registras el enlace de esta monitoría." />
          {canEditLink ? (
            <details>
              <summary className="cursor-pointer text-sm font-medium text-brand-600 hover:text-brand-700">
                {meeting ? "Cambiar enlace" : "Registrar enlace de Google Meet o Zoom"}
              </summary>
              <ActionForm
                action={setMeetingLink}
                submitLabel="Guardar enlace"
                pendingLabel="Guardando…"
                variant="secondary"
                className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-start"
              >
                <input type="hidden" name="sessionId" value={session.id} />
                <label htmlFor={`url-${session.id}`} className="sr-only">
                  Enlace de la reunión
                </label>
                <Input
                  id={`url-${session.id}`}
                  name="url"
                  type="url"
                  required
                  placeholder="https://meet.google.com/abc-defg-hij"
                  defaultValue={meeting?.url}
                  className="sm:flex-1"
                />
              </ActionForm>
            </details>
          ) : null}
        </div>
      ) : (
        <p className="mt-4 border-t border-slate-100 pt-4 text-sm text-slate-600">
          {session.cancellationReason ?? "Monitoría cancelada."}
        </p>
      )}

      {active ? (
        <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4">
          {!started && (session.status === "OPEN" || session.status === "FULL") ? (
            <ActionForm
              action={confirmSession}
              submitLabel="Confirmar monitoría"
              pendingLabel="Confirmando…"
              size="sm"
              confirmMessage={
                session.status === "OPEN"
                  ? "Al confirmar, la monitoría deja de admitir nuevos participantes. ¿Continuar?"
                  : undefined
              }
            >
              <input type="hidden" name="sessionId" value={session.id} />
            </ActionForm>
          ) : null}

          {started ? (
            <details open={bucket === "pendingClose"}>
              <summary className="cursor-pointer text-sm font-medium text-brand-600 hover:text-brand-700">
                Cerrar monitoría y registrar asistencia
              </summary>
              <ActionForm
                action={completeSession}
                submitLabel="Marcar como realizada"
                pendingLabel="Guardando…"
                size="sm"
                className="mt-3 space-y-3"
              >
                <input type="hidden" name="sessionId" value={session.id} />
                <fieldset className="space-y-1">
                  <legend className="text-sm text-slate-600">Marca a quienes asistieron:</legend>
                  {participants.map((p) => (
                    <label key={p.id} className="flex items-center gap-2 text-sm text-slate-800">
                      <input
                        type="checkbox"
                        name="attended"
                        value={p.id}
                        defaultChecked
                        className="h-4 w-4 accent-brand-600"
                      />
                      {p.name}
                    </label>
                  ))}
                </fieldset>
              </ActionForm>
            </details>
          ) : (
            <details>
              <summary className="cursor-pointer text-sm font-medium text-red-600 hover:text-red-700">
                Cancelar monitoría
              </summary>
              <ActionForm
                action={cancelSessionByProfessor}
                submitLabel="Cancelar monitoría"
                pendingLabel="Cancelando…"
                variant="danger"
                size="sm"
                className="mt-3 space-y-3"
                confirmMessage="Se cancelará la monitoría para todos los participantes. ¿Continuar?"
              >
                <input type="hidden" name="sessionId" value={session.id} />
                <div className="space-y-1.5">
                  <Label htmlFor={`reason-${session.id}`}>Motivo (lo verán los estudiantes)</Label>
                  <Textarea id={`reason-${session.id}`} name="reason" maxLength={300} className="min-h-16" />
                </div>
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input type="checkbox" name="release" className="h-4 w-4 accent-brand-600" />
                  Volver a publicar el horario como disponible
                </label>
              </ActionForm>
            </details>
          )}
        </div>
      ) : null}
    </Card>
  );
}
