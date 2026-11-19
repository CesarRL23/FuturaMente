"use server";

import { revalidatePath } from "next/cache";
import { runAction, formString, type ActionState } from "@/lib/actions";
import { requireRole } from "@/lib/auth/session";
import {
  cancelSessionFor,
  completeSessionFor,
  confirmSessionFor,
  setMeetingLinkFor,
} from "@/lib/services/sessions";
import { Roles } from "@/models/roles";

function revalidateSessionViews() {
  revalidatePath("/professor", "layout");
  revalidatePath("/student", "layout");
  revalidatePath("/admin/tutoring");
}

export async function setMeetingLink(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return runAction(async () => {
    const { profile } = await requireRole([Roles.PROFESSOR]);
    await setMeetingLinkFor(profile.id, formString(formData, "sessionId"), formString(formData, "url"));
    revalidateSessionViews();
    return "Enlace guardado. Los participantes ya pueden verlo.";
  });
}

export async function confirmSession(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return runAction(async () => {
    const { profile } = await requireRole([Roles.PROFESSOR]);
    await confirmSessionFor(profile.id, formString(formData, "sessionId"));
    revalidateSessionViews();
    return "Monitoría confirmada. Ya no admite nuevos participantes.";
  });
}

export async function cancelSessionByProfessor(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return runAction(async () => {
    const { profile } = await requireRole([Roles.PROFESSOR]);
    const { released } = await cancelSessionFor(profile.id, formString(formData, "sessionId"), {
      release: formString(formData, "release") === "on",
      reason: formString(formData, "reason").trim().slice(0, 300),
    });
    revalidateSessionViews();
    return released
      ? "Monitoría cancelada. El horario volvió a publicarse como disponible."
      : "Monitoría cancelada. Los participantes verán la cancelación en sus reservas.";
  });
}

export async function completeSession(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return runAction(async () => {
    const { profile } = await requireRole([Roles.PROFESSOR]);
    const attended = formData.getAll("attended").filter((v): v is string => typeof v === "string");
    await completeSessionFor(profile.id, formString(formData, "sessionId"), attended);
    revalidateSessionViews();
    return "Monitoría cerrada y asistencia registrada.";
  });
}
