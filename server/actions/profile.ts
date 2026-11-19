"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { runAction, formString, type ActionState } from "@/lib/actions";
import { requireRole } from "@/lib/auth/session";
import { DomainError } from "@/lib/domain/errors";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";
import { Collections } from "@/models/collections";
import { Roles } from "@/models/roles";

const nameSchema = z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres.").max(120);
const phoneSchema = z
  .string()
  .trim()
  .max(20)
  .refine((v) => v === "" || /^\+?[\d\s()-]{7,20}$/.test(v), "Ingresa un teléfono válido.");
const httpsUrlSchema = z
  .string()
  .trim()
  .max(500)
  .refine((v) => {
    if (v === "") return true;
    try {
      return new URL(v).protocol === "https:";
    } catch {
      return false;
    }
  }, "La foto debe ser una URL que empiece por https://");

function firstIssue(error: z.ZodError) {
  return error.issues[0]?.message ?? "Datos inválidos.";
}

/**
 * Actualiza el nombre en Firestore y en Firebase Auth (el inicio de sesión sincroniza el
 * perfil con el displayName de Auth). El correo no se modifica: pertenece a la cuenta.
 */
async function saveProfile(uid: string, name: string, extra: Record<string, unknown>) {
  await getAdminDb()
    .collection(Collections.USERS)
    .doc(uid)
    .set({ name, ...extra, updatedAt: Date.now() }, { merge: true });
  await getAdminAuth().updateUser(uid, { displayName: name });
}

const professorSchema = z.object({
  name: nameSchema,
  phone: phoneSchema,
  headline: z.string().trim().max(120, "El titular admite hasta 120 caracteres."),
  bio: z.string().trim().max(1000, "La presentación admite hasta 1000 caracteres."),
  photoURL: httpsUrlSchema,
});

export async function updateProfessorProfile(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return runAction(async () => {
    const { profile } = await requireRole([Roles.PROFESSOR]);
    const parsed = professorSchema.safeParse({
      name: formString(formData, "name"),
      phone: formString(formData, "phone"),
      headline: formString(formData, "headline"),
      bio: formString(formData, "bio"),
      photoURL: formString(formData, "photoURL"),
    });
    if (!parsed.success) throw new DomainError(firstIssue(parsed.error));
    const { name, ...professorProfile } = parsed.data;

    await saveProfile(profile.id, name, { professorProfile });
    revalidatePath("/", "layout");
    return "Perfil actualizado.";
  });
}

const studentSchema = z.object({
  name: nameSchema,
  phone: phoneSchema,
  institution: z.string().trim().max(120, "La institución admite hasta 120 caracteres."),
  educationLevel: z.string().trim().max(60),
});

export async function updateStudentProfile(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return runAction(async () => {
    const { profile } = await requireRole([Roles.STUDENT]);
    const parsed = studentSchema.safeParse({
      name: formString(formData, "name"),
      phone: formString(formData, "phone"),
      institution: formString(formData, "institution"),
      educationLevel: formString(formData, "educationLevel"),
    });
    if (!parsed.success) throw new DomainError(firstIssue(parsed.error));
    const { name, ...studentProfile } = parsed.data;

    await saveProfile(profile.id, name, { studentProfile });
    revalidatePath("/", "layout");
    return "Perfil actualizado.";
  });
}
