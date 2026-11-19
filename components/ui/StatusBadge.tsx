import { Badge } from "@/components/ui/Badge";
import type { AvailabilityStatus } from "@/models/availability";
import type { BookingStatus } from "@/models/booking";
import type { SessionStatus } from "@/models/session";

type Variant = "neutral" | "brand" | "success" | "warning";

const slotStatus: Record<AvailabilityStatus, [string, Variant]> = {
  AVAILABLE: ["Disponible", "success"],
  BOOKED: ["Reservada", "brand"],
  CANCELLED: ["Cancelada", "neutral"],
};

const sessionStatus: Record<SessionStatus, [string, Variant]> = {
  OPEN: ["Con cupos", "success"],
  FULL: ["Completa", "brand"],
  CONFIRMED: ["Confirmada", "brand"],
  COMPLETED: ["Realizada", "neutral"],
  CANCELLED: ["Cancelada", "warning"],
};

const bookingStatus: Record<BookingStatus, [string, Variant]> = {
  ACTIVE: ["Activa", "success"],
  CANCELLED: ["Cancelada", "warning"],
  ATTENDED: ["Asististe", "brand"],
  ABSENT: ["No asististe", "neutral"],
};

export function SlotStatusBadge({ status, expired }: { status: AvailabilityStatus; expired?: boolean }) {
  if (expired && status === "AVAILABLE") return <Badge>Vencida</Badge>;
  const [label, variant] = slotStatus[status];
  return <Badge variant={variant}>{label}</Badge>;
}

export function SessionStatusBadge({ status, pendingClose }: { status: SessionStatus; pendingClose?: boolean }) {
  if (pendingClose) return <Badge variant="warning">Por cerrar</Badge>;
  const [label, variant] = sessionStatus[status];
  return <Badge variant={variant}>{label}</Badge>;
}

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  const [label, variant] = bookingStatus[status];
  return <Badge variant={variant}>{label}</Badge>;
}
