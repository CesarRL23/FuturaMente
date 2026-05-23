"use server";

import { cookies } from "next/headers";
import { getServerEnv } from "@/lib/env";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";
import { Roles } from "@/models/roles";

export async function createSessionFromIdToken(idToken: string) {
  const { AUTH_COOKIE_NAME } = getServerEnv();
  const expiresIn = 1000 * 60 * 60 * 24 * 5; // 5 días

  const sessionCookie = await getAdminAuth().createSessionCookie(idToken, { expiresIn });
  (await cookies()).set(AUTH_COOKIE_NAME, sessionCookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: expiresIn / 1000,
  });
}

export async function clearSession() {
  const { AUTH_COOKIE_NAME } = getServerEnv();
  (await cookies()).set(AUTH_COOKIE_NAME, "", { path: "/", maxAge: 0 });
}

export async function ensureUserProfile(input: { uid: string; name: string; email: string }) {
  const ref = getAdminDb().collection("users").doc(input.uid);
  const snap = await ref.get();
  const now = Date.now();
  if (!snap.exists) {
    await ref.set({
      id: input.uid,
      name: input.name,
      email: input.email,
      role: Roles.STUDENT,
      createdAt: now,
    });
    return;
  }
  await ref.set(
    {
      name: input.name,
      email: input.email,
      updatedAt: now,
    },
    { merge: true },
  );
}

