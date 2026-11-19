import { Icon } from "@/components/ui/Icon";
import { meetingProviderLabel } from "@/lib/domain/meeting";
import type { SessionMeeting } from "@/models/session";

/** Muestra el enlace solo si el servidor lo entregó (es decir, el usuario está autorizado). */
export function MeetingLinkDisplay({
  meeting,
  emptyText = "El profesor aún no ha registrado el enlace de la monitoría.",
}: {
  meeting: SessionMeeting | undefined;
  emptyText?: string;
}) {
  if (!meeting) {
    return (
      <p className="flex items-center gap-2 text-sm text-slate-500">
        <Icon name="clock" className="h-4 w-4" />
        {emptyText}
      </p>
    );
  }
  return (
    <a
      href={meeting.url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex max-w-full items-center gap-2 rounded-lg bg-brand-50 px-3 py-2 text-sm font-medium text-brand-700 ring-1 ring-inset ring-brand-200 hover:bg-brand-100"
    >
      <Icon name="arrowRight" className="h-4 w-4 shrink-0" />
      <span className="truncate">Entrar por {meetingProviderLabel(meeting.provider)}</span>
    </a>
  );
}
