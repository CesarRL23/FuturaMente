"use server";

import { cookies } from "next/headers";
import { z } from "zod";
import { getServerEnv, LEGACY_AUTH_COOKIE_NAMES } from "@/lib/env";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";
import { getSessionUser } from "@/lib/auth/session";
import { Collections } from "@/models/collections";
import { Roles } from "@/models/roles";

const SESSION_EXPIRES_IN = 1000 * 60 * 60 * 24 * 5; // 5 días

export async function createSessionFromIdToken(idToken: string) {
  const parsed = z.string().min(1).safeParse(idToken);
  if (!parsed.success) throw new Error("Token inválido.");

  const { AUTH_COOKIE_NAME } = getServerEnv();
  const sessionCookie = await getAdminAuth().createSessionCookie(parsed.data, {
    expiresIn: SESSION_EXPIRES_IN,
  });

  const store = await cookies();
  store.set(AUTH_COOKIE_NAME, sessionCookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_EXPIRES_IN / 1000,
  });

  // Migración: elimina cookies con nombres anteriores para no dejar sesiones duplicadas.
  for (const legacy of LEGACY_AUTH_COOKIE_NAMES) {
    if (legacy !== AUTH_COOKIE_NAME) store.set(legacy, "", { path: "/", maxAge: 0 });
  }
}

export async function clearSession() {
  const { AUTH_COOKIE_NAME } = getServerEnv();
  const store = await cookies();
  for (const name of [AUTH_COOKIE_NAME, ...LEGACY_AUTH_COOKIE_NAMES]) {
    store.set(name, "", { path: "/", maxAge: 0 });
  }
}

const ensureProfileSchema = z.object({
  name: z.string().trim().min(1).max(120),
});

/**
 * Crea (o actualiza el nombre de) el perfil del usuario autenticado.
 * El uid y el correo se toman de la cookie de sesión verificada, nunca del cliente,
 * para que nadie pueda modificar el perfil de otro usuario.
 */
export async function ensureUserProfile(input: { name: string }) {
  const session = await getSessionUser();
  if (!session) throw new Error("No hay una sesión activa.");

  const parsed = ensureProfileSchema.safeParse(input);
  const name = parsed.success ? parsed.data.name : "Sin nombre";
  const email = session.email ?? "";

  const ref = getAdminDb().collection(Collections.USERS).doc(session.uid);
  const snap = await ref.get();
  const now = Date.now();

  if (!snap.exists) {
    await ref.set({
      id: session.uid,
      name,
      email,
      roles: [Roles.STUDENT],
      primaryRole: Roles.STUDENT,
      role: Roles.STUDENT,
      createdAt: now,
    });
    return;
  }

  await ref.set({ name, email, updatedAt: now }, { merge: true });
}
