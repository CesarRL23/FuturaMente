import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getServerEnv } from "@/lib/env";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";
import { Roles, type Role } from "@/models/roles";
import type { UserProfile } from "@/models/user";

export type SessionUser = {
  uid: string;
  email?: string;
};

export async function getSessionUser(): Promise<SessionUser | null> {
  const { AUTH_COOKIE_NAME } = getServerEnv();
  const cookie = (await cookies()).get(AUTH_COOKIE_NAME);
  if (!cookie?.value) return null;

  try {
    const decoded = await getAdminAuth().verifySessionCookie(cookie.value, true);
    return { uid: decoded.uid, email: decoded.email };
  } catch {
    return null;
  }
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getAdminDb().collection("users").doc(uid).get();
  if (!snap.exists) return null;
  return snap.data() as UserProfile;
}

export async function requireAuth() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireRole(roles: Role[]) {
  const user = await requireAuth();
  const profile = await getUserProfile(user.uid);
  if (!profile) redirect("/login");
  if (!roles.includes(profile.role)) redirect("/dashboard");
  return { user, profile };
}

export function roleLanding(role: Role) {
  switch (role) {
    case Roles.ADMIN:
      return "/admin";
    case Roles.PROFESSOR:
      return "/professor";
    case Roles.STUDENT:
    default:
      return "/student";
  }
}

