"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";
import { hasRole, requireRole } from "@/lib/auth/session";
import { Roles, type Role } from "@/models/roles";

const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  roles: z.array(z.enum([Roles.ADMIN, Roles.PROFESSOR, Roles.STUDENT])).min(1),
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

  await getAdminDb().collection("users").doc(userRecord.uid).set({
    id: userRecord.uid,
    name: parsed.data.name,
    email: parsed.data.email,
    roles: parsed.data.roles,
    primaryRole: parsed.data.roles[0],
    role: parsed.data.roles[0],
    createdAt: now,
  });

  revalidatePath("/admin/users");
}

const setRoleSchema = z.object({
  uid: z.string().min(1),
  roles: z.array(z.enum([Roles.ADMIN, Roles.PROFESSOR, Roles.STUDENT])).min(1),
});

export async function adminSetUserRole(formData: FormData) {
  await requireRole([Roles.ADMIN]);
  const parsed = setRoleSchema.safeParse({
    uid: formData.get("uid"),
    roles: formData.getAll("roles"),
  });
  if (!parsed.success) throw new Error("Datos inválidos para asignar rol.");

  await getAdminDb().collection("users").doc(parsed.data.uid).set(
    {
      roles: parsed.data.roles,
      primaryRole: parsed.data.roles[0],
      role: parsed.data.roles[0],
      updatedAt: Date.now(),
    },
    { merge: true },
  );
  revalidatePath("/admin/users");
}

const createSubjectSchema = z.object({
  name: z.string().min(2),
  professorId: z.string().optional().nullable(),
});

export async function adminCreateSubject(formData: FormData) {
  await requireRole([Roles.ADMIN]);
  const parsed = createSubjectSchema.safeParse({
    name: formData.get("name"),
    professorId: formData.get("professorId") || null,
  });
  if (!parsed.success) throw new Error("Datos inválidos para crear materia.");

  const ref = getAdminDb().collection("subjects").doc();
  await ref.set({
    id: ref.id,
    name: parsed.data.name,
    professorId: parsed.data.professorId ?? null,
    createdAt: Date.now(),
  });
  revalidatePath("/admin/subjects");
}

const assignProfessorSchema = z.object({
  subjectId: z.string().min(1),
  professorId: z.string().min(1),
});

export async function adminAssignProfessor(formData: FormData) {
  await requireRole([Roles.ADMIN]);
  const parsed = assignProfessorSchema.safeParse({
    subjectId: formData.get("subjectId"),
    professorId: formData.get("professorId"),
  });
  if (!parsed.success) throw new Error("Datos inválidos para asignar profesor.");

  await getAdminDb().collection("subjects").doc(parsed.data.subjectId).set(
    {
      professorId: parsed.data.professorId,
      updatedAt: Date.now(),
    },
    { merge: true },
  );
  revalidatePath("/admin/subjects");
}

const assignStudentSchema = z.object({
  subjectId: z.string().min(1),
  studentId: z.string().min(1),
});

export async function adminAssignStudentToSubject(formData: FormData) {
  await requireRole([Roles.ADMIN]);
  const parsed = assignStudentSchema.safeParse({
    subjectId: formData.get("subjectId"),
    studentId: formData.get("studentId"),
  });
  if (!parsed.success) throw new Error("Datos inválidos para asignar estudiante.");

  const studentSnap = await getAdminDb().collection("users").doc(parsed.data.studentId).get();
  if (
    !studentSnap.exists ||
    !hasRole(studentSnap.data() as { role?: Role; roles?: Role[] }, Roles.STUDENT)
  ) {
    throw new Error("El usuario no existe o no es un estudiante.");
  }

  const enrollmentId = `${parsed.data.studentId}_${parsed.data.subjectId}`;
  await getAdminDb().collection("enrollments").doc(enrollmentId).set(
    {
      id: enrollmentId,
      studentId: parsed.data.studentId,
      subjectId: parsed.data.subjectId,
      createdAt: Date.now(),
    },
    { merge: true },
  );

  revalidatePath("/admin/subjects");
}

export async function adminRemoveStudentFromSubject(formData: FormData) {
  await requireRole([Roles.ADMIN]);
  const parsed = assignStudentSchema.safeParse({
    subjectId: formData.get("subjectId"),
    studentId: formData.get("studentId"),
  });
  if (!parsed.success) throw new Error("Datos inválidos para dar de baja al estudiante.");

  const enrollmentId = `${parsed.data.studentId}_${parsed.data.subjectId}`;
  await getAdminDb().collection("enrollments").doc(enrollmentId).delete();

  revalidatePath("/admin/subjects");
}
