"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/session";
import { getAdminDb } from "@/lib/firebase/admin";
import { Roles } from "@/models/roles";

const gradeSchema = z.object({
  studentId: z.string().min(1),
  subjectId: z.string().min(1),
  week: z.coerce.number().int().min(1).max(60),
  grade: z.coerce.number().min(0).max(100),
});

export async function professorUpsertGrade(formData: FormData) {
  const { profile } = await requireRole([Roles.PROFESSOR]);

  const parsed = gradeSchema.safeParse({
    studentId: formData.get("studentId"),
    subjectId: formData.get("subjectId"),
    week: formData.get("week"),
    grade: formData.get("grade"),
  });
  if (!parsed.success) throw new Error("Datos inválidos para registrar nota.");

  const subjectSnap = await getAdminDb().collection("subjects").doc(parsed.data.subjectId).get();
  if (!subjectSnap.exists) throw new Error("La materia no existe.");
  const subject = subjectSnap.data() as { professorId: string | null; name: string };
  if (subject.professorId !== profile.id) throw new Error("No tienes permiso sobre esta materia.");

  const now = Date.now();
  const gradeId = `${parsed.data.studentId}_${parsed.data.subjectId}_${parsed.data.week}`;
  await getAdminDb().collection("grades").doc(gradeId).set(
    {
      id: gradeId,
      studentId: parsed.data.studentId,
      subjectId: parsed.data.subjectId,
      professorId: profile.id,
      week: parsed.data.week,
      grade: parsed.data.grade,
      updatedAt: now,
      createdAt: now,
    },
    { merge: true },
  );

  revalidatePath("/professor/grades");
}

const obsSchema = z.object({
  studentId: z.string().min(1),
  comment: z.string().min(3),
});

export async function professorAddObservation(formData: FormData) {
  const { profile } = await requireRole([Roles.PROFESSOR]);
  const parsed = obsSchema.safeParse({
    studentId: formData.get("studentId"),
    comment: formData.get("comment"),
  });
  if (!parsed.success) throw new Error("Datos inválidos para observación.");

  const ref = getAdminDb().collection("observations").doc();
  const now = Date.now();
  await ref.set({
    id: ref.id,
    studentId: parsed.data.studentId,
    professorId: profile.id,
    comment: parsed.data.comment,
    date: now,
    createdAt: now,
  });

  revalidatePath("/professor/observations");
}

export async function professorDeleteGrade(formData: FormData) {
  const { profile } = await requireRole([Roles.PROFESSOR]);
  const idStr = formData.get("id");
  if (!idStr || typeof idStr !== "string") throw new Error("ID inválido");

  const docRef = getAdminDb().collection("grades").doc(idStr);
  const snap = await docRef.get();
  if (!snap.exists) throw new Error("La nota no existe.");
  
  const data = snap.data();
  if (data?.professorId !== profile.id) throw new Error("No tienes permiso sobre esta nota.");

  await docRef.delete();
  revalidatePath("/professor/grades");
}

export async function professorDeleteObservation(formData: FormData) {
  const { profile } = await requireRole([Roles.PROFESSOR]);
  const idStr = formData.get("id");
  if (!idStr || typeof idStr !== "string") throw new Error("ID inválido");

  const docRef = getAdminDb().collection("observations").doc(idStr);
  const snap = await docRef.get();
  if (!snap.exists) throw new Error("La observación no existe.");
  
  const data = snap.data();
  if (data?.professorId !== profile.id) throw new Error("No tienes permiso sobre esta observación.");

  await docRef.delete();
  revalidatePath("/professor/observations");
}

const updateObsSchema = z.object({
  id: z.string().min(1),
  comment: z.string().min(3),
});

export async function professorUpdateObservation(formData: FormData) {
  const { profile } = await requireRole([Roles.PROFESSOR]);
  const parsed = updateObsSchema.safeParse({
    id: formData.get("id"),
    comment: formData.get("comment"),
  });
  if (!parsed.success) throw new Error("Datos inválidos para actualizar observación.");

  const docRef = getAdminDb().collection("observations").doc(parsed.data.id);
  const snap = await docRef.get();
  if (!snap.exists) throw new Error("La observación no existe.");
  
  const data = snap.data();
  if (data?.professorId !== profile.id) throw new Error("No tienes permiso sobre esta observación.");

  await docRef.update({ 
    comment: parsed.data.comment,
    date: Date.now()
  });
  
  revalidatePath("/professor/observations");
}

