import { ActionForm } from "@/components/forms/ActionForm";
import { MeetingLinkDisplay } from "@/components/sessions/MeetingLinkDisplay";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { BookingStatusBadge, SessionStatusBadge } from "@/components/ui/StatusBadge";
import { bookingBucket } from "@/lib/domain/sessionRules";
import { formatCOP, formatDuration, formatLongDate, formatTimeRange } from "@/lib/format";
import type { Booking } from "@/models/booking";
import type { Session, SessionMeeting } from "@/models/session";
import { cancelMyBooking } from "@/server/actions/bookings";

export function StudentReservationCard({
  booking,
  session,
  subjectName,
  professor,
  meeting,
  now,
}: {
  booking: Booking;
  session: Session;
  subjectName: string;
  professor: { name: string; photoURL?: string | null };
  meeting: SessionMeeting | undefined;
  now: number;
}) {
  const bucket = bookingBucket(booking, session, now);
  const canCancel = bucket === "upcoming" && booking.status === "ACTIVE" && now < session.startAt;

  return (
    <Card className="p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 gap-3">
          <Avatar name={professor.name} photoURL={professor.photoURL} />
          <div className="min-w-0">
            <p className="font-semibold text-slate-900">{subjectName}</p>
            <p className="text-sm text-slate-600">con {professor.name}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {bucket === "cancelled" && session.status === "CANCELLED" ? (
            <SessionStatusBadge status="CANCELLED" />
          ) : (
            <>
              <BookingStatusBadge status={booking.status} />
              {booking.status === "ACTIVE" ? (
                <SessionStatusBadge status={session.status} pendingClose={bucket === "pendingClose"} />
              ) : null}
            </>
          )}
        </div>
      </div>

      <dl className="mt-4 grid gap-3 border-t border-slate-100 pt-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2">
          <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">Fecha y horario</dt>
          <dd className="mt-0.5 text-slate-800">
            {formatLongDate(session.startAt)}
            <br />
            {formatTimeRange(session.startAt, session.endAt)} · {formatDuration(session.durationMinutes)}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">Participantes</dt>
          <dd className="mt-0.5 text-slate-800">
            {session.modality === "INDIVIDUAL"
              ? "Individual"
              : `Grupal · ${session.participantIds.length} de ${session.capacity}`}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">Precio de la monitoría</dt>
          <dd className="mt-0.5 font-medium text-slate-900">{formatCOP(session.pricing.totalPrice)}</dd>
        </div>
      </dl>

      {bucket === "upcoming" || bucket === "pendingClose" ? (
        <div className="mt-4 border-t border-slate-100 pt-4">
          <MeetingLinkDisplay meeting={meeting} />
        </div>
      ) : null}

      {bucket === "cancelled" && session.status === "CANCELLED" && session.cancellationReason ? (
        <p className="mt-4 border-t border-slate-100 pt-4 text-sm text-slate-600">
          Motivo: {session.cancellationReason}
        </p>
      ) : null}

      {canCancel ? (
        <div className="mt-4 border-t border-slate-100 pt-4">
          <ActionForm
            action={cancelMyBooking}
            submitLabel="Cancelar mi reserva"
            pendingLabel="Cancelando…"
            variant="ghost"
            size="sm"
            buttonClassName="text-red-600 hover:bg-red-50 hover:text-red-700"
            confirmMessage="¿Seguro que quieres cancelar tu reserva en esta monitoría?"
          >
            <input type="hidden" name="sessionId" value={session.id} />
          </ActionForm>
        </div>
      ) : null}
    </Card>
  );
}
