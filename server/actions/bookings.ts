"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { runAction, formString, type ActionState } from "@/lib/actions";
import { requireRole } from "@/lib/auth/session";
import { MAX_GROUP_CAPACITY } from "@/lib/domain/config";
import { DomainError } from "@/lib/domain/errors";
import { bookSlotFor, cancelBookingFor, joinSessionFor } from "@/lib/services/bookings";
import { Roles } from "@/models/roles";

function revalidateBookingViews() {
  revalidatePath("/student", "layout");
  revalidatePath("/professor", "layout");
  revalidatePath("/admin/tutoring");
}

/** El cliente solo envía la franja y la capacidad; el precio se calcula en el servidor. */
const bookSchema = z.object({
  slotId: z.string().min(1),
  capacity: z.coerce
    .number()
    .int("La cantidad de participantes debe ser un número entero.")
    .min(1, "Debe haber al menos un participante.")
    .max(MAX_GROUP_CAPACITY, `El máximo de participantes es ${MAX_GROUP_CAPACITY}.`),
});

export async function bookSlot(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return runAction(async () => {
    const { profile } = await requireRole([Roles.STUDENT]);
    const parsed = bookSchema.safeParse({
      slotId: formString(formData, "slotId"),
      capacity: formString(formData, "capacity"),
    });
    if (!parsed.success) throw new DomainError(parsed.error.issues[0]?.message ?? "Datos inválidos.");

    await bookSlotFor(profile.id, parsed.data.slotId, parsed.data.capacity);
    revalidateBookingViews();
    // La franja deja de aparecer en la búsqueda: se lleva al estudiante a sus reservas.
    redirect(`/student/bookings?reserva=${parsed.data.capacity === 1 ? "individual" : "grupal"}`);
  });
}

export async function joinSession(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return runAction(async () => {
    const { profile } = await requireRole([Roles.STUDENT]);
    await joinSessionFor(profile.id, formString(formData, "sessionId"));
    revalidateBookingViews();
    redirect("/student/bookings?reserva=union");
  });
}

export async function cancelMyBooking(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return runAction(async () => {
    const { profile } = await requireRole([Roles.STUDENT]);
    const { sessionCancelled } = await cancelBookingFor(profile.id, formString(formData, "sessionId"));
    revalidateBookingViews();
    return sessionCancelled
      ? "Reserva cancelada. Como no quedaban participantes, la monitoría se canceló y el horario volvió a quedar disponible."
      : "Reserva cancelada.";
  });
}
