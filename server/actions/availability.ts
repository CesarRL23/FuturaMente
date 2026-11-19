"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { runAction, formString, type ActionState } from "@/lib/actions";
import { requireRole } from "@/lib/auth/session";
import { DomainError } from "@/lib/domain/errors";
import { createSlot, deleteSlot, updateSlot } from "@/lib/services/availability";
import { Roles } from "@/models/roles";

const slotSchema = z.object({
  subjectId: z.string().min(1, "Selecciona una materia."),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Selecciona una fecha."),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Selecciona la hora de inicio."),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Selecciona la hora de finalización."),
});

function parseSlotForm(formData: FormData) {
  const parsed = slotSchema.safeParse({
    subjectId: formString(formData, "subjectId"),
    date: formString(formData, "date"),
    startTime: formString(formData, "startTime"),
    endTime: formString(formData, "endTime"),
  });
  if (!parsed.success) throw new DomainError(parsed.error.issues[0]?.message ?? "Datos inválidos.");
  return parsed.data;
}

function revalidateAvailabilityViews() {
  revalidatePath("/professor", "layout");
  revalidatePath("/student/search");
}

export async function createAvailability(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return runAction(async () => {
    const { profile } = await requireRole([Roles.PROFESSOR]);
    await createSlot(profile.id, parseSlotForm(formData));
    revalidateAvailabilityViews();
    return "Disponibilidad publicada.";
  });
}

export async function updateAvailability(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return runAction(async () => {
    const { profile } = await requireRole([Roles.PROFESSOR]);
    await updateSlot(profile.id, formString(formData, "slotId"), parseSlotForm(formData));
    revalidateAvailabilityViews();
    return "Franja actualizada.";
  });
}

export async function deleteAvailability(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return runAction(async () => {
    const { profile } = await requireRole([Roles.PROFESSOR]);
    await deleteSlot(profile.id, formString(formData, "slotId"));
    revalidateAvailabilityViews();
    return "Franja eliminada.";
  });
}
