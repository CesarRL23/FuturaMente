"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";
import { hasRole, requireRole } from "@/lib/auth/session";
import { Collections } from "@/models/collections";
import { Roles, type Role } from "@/models/roles";
import { normalizeSubject, type SubjectDoc } from "@/models/subject";

const roleSchema = z.enum([Roles.ADMIN, Roles.PROFESSOR, Roles.STUDENT]);

/* ------------------------------------------------------------------ */
/* Usuarios y permisos                                                 */
/* ------------------------------------------------------------------ */

const createUserSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email(),
  password: z.string().min(6),
  roles: z.array(roleSchema).min(1),
});

export async function adminCreateUser(formData: FormData) {
  await requireRole([Roles.ADMIN]);
  const parsed = createUserSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    roles: formData.getAll("roles"),
  });
  if (!parsed.success) throw new Error("Datos inválidos para crear usuario.");

  const now = Date.now();
  const userRecord = await getAdminAuth().createUser({
    displayName: parsed.data.name,
    email: parsed.data.email,
    password: parsed.data.password,
  });

  await getAdminDb().collection(Collections.USERS).doc(userRecord.uid).set({
    id: userRecord.uid,
    name: parsed.data.name,
    email: parsed.data.email,
    roles: parsed.data.roles,
    primaryRole: parsed.data.roles[0],
    role: parsed.data.roles[0],
    createdAt: now,
  });

  revalidateUserViews();
}

const setRoleSchema = z.object({
  uid: z.string().min(1),
  roles: z.array(roleSchema).min(1),
});

export async function adminSetUserRole(formData: FormData) {
  const { profile } = await requireRole([Roles.ADMIN]);
  const parsed = setRoleSchema.safeParse({
    uid: formData.get("uid"),
    roles: formData.getAll("roles"),
  });
  if (!parsed.success) throw new Error("Datos inválidos para asignar rol.");

  // Evita que un administrador se quite a sí mismo el acceso de administración.
  if (parsed.data.uid === profile.id && !parsed.data.roles.includes(Roles.ADMIN)) {
    throw new Error("No puedes quitarte tu propio rol de administrador.");
  }

  await getAdminDb().collection(Collections.USERS).doc(parsed.data.uid).set(
    {
      roles: parsed.data.roles,
      primaryRole: parsed.data.roles[0],
      role: parsed.data.roles[0],
      updatedAt: Date.now(),
    },
    { merge: true },
  );
  revalidateUserViews();
}

/* ------------------------------------------------------------------ */
/* Materias (relación muchos-a-muchos con profesores)                  */
/* ------------------------------------------------------------------ */

const createSubjectSchema = z.object({
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().max(500),
  professorIds: z.array(z.string().min(1)).max(50),
});

export async function adminCreateSubject(formData: FormData) {
  await requireRole([Roles.ADMIN]);
  const parsed = createSubjectSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") ?? "",
    professorIds: formData.getAll("professorIds"),
  });
  if (!parsed.success) throw new Error("Datos inválidos para crear materia.");

  const professorIds = Array.from(new Set(parsed.data.professorIds));
  await assertProfessors(professorIds);

  const ref = getAdminDb().collection(Collections.SUBJECTS).doc();
  await ref.set({
    id: ref.id,
    name: parsed.data.name,
    description: parsed.data.description || null,
    professorIds,
    active: true,
    createdAt: Date.now(),
  });
  revalidateSubjectViews();
}

const subjectProfessorSchema = z.object({
  subjectId: z.string().min(1),
  professorId: z.string().min(1),
});

export async function adminAddProfessorToSubject(formData: FormData) {
  await requireRole([Roles.ADMIN]);
  const parsed = subjectProfessorSchema.safeParse({
    subjectId: formData.get("subjectId"),
    professorId: formData.get("professorId"),
  });
  if (!parsed.success) throw new Error("Datos inválidos para asignar profesor.");

  await assertProfessors([parsed.data.professorId]);
  await updateSubjectProfessors(parsed.data.subjectId, (ids) =>
    ids.includes(parsed.data.professorId) ? ids : [...ids, parsed.data.professorId],
  );
  revalidateSubjectViews();
}

export async function adminRemoveProfessorFromSubject(formData: FormData) {
  await requireRole([Roles.ADMIN]);
  const parsed = subjectProfessorSchema.safeParse({
    subjectId: formData.get("subjectId"),
    professorId: formData.get("professorId"),
  });
  if (!parsed.success) throw new Error("Datos inválidos para quitar profesor.");

  await updateSubjectProfessors(parsed.data.subjectId, (ids) =>
    ids.filter((id) => id !== parsed.data.professorId),
  );
  revalidateSubjectViews();
}

/* ------------------------------------------------------------------ */
/* Utilidades internas                                                 */
/* ------------------------------------------------------------------ */

/**
 * Lee la materia (normalizando el campo antiguo `professorId`) y escribe `professorIds`
 * dentro de una transacción para evitar perder cambios concurrentes.
 */
async function updateSubjectProfessors(subjectId: string, update: (ids: string[]) => string[]) {
  const db = getAdminDb();
  const ref = db.collection(Collections.SUBJECTS).doc(subjectId);
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) throw new Error("La materia no existe.");
    const current = normalizeSubject(snap.id, snap.data() as Partial<SubjectDoc>);
    tx.update(ref, { professorIds: update(current.professorIds), updatedAt: Date.now() });
  });
}

async function assertProfessors(uids: string[]) {
  if (uids.length === 0) return;
  const db = getAdminDb();
  const snaps = await db.getAll(...uids.map((uid) => db.collection(Collections.USERS).doc(uid)));
  for (const snap of snaps) {
    if (!snap.exists || !hasRole(snap.data() as { role?: Role; roles?: Role[] }, Roles.PROFESSOR)) {
      throw new Error("Uno de los usuarios seleccionados no existe o no es profesor.");
    }
  }
}

function revalidateUserViews() {
  revalidatePath("/admin", "layout");
}

function revalidateSubjectViews() {
  revalidatePath("/admin", "layout");
  revalidatePath("/professor/subjects");
  revalidatePath("/student/search");
  revalidatePath("/student");
}
