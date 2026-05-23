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
  const data = snap.data() as UserProfile;
  const roles = normalizeRoles(data);
  return {
    ...data,
    roles,
    primaryRole: getPrimaryRole(data),
  };
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
  const userRoles = normalizeRoles(profile);
  if (!roles.some((role) => userRoles.includes(role))) redirect("/dashboard");
  return { user, profile };
}

export function roleLanding(roleOrRoles: Role | Role[]) {
  const role = Array.isArray(roleOrRoles) ? getPreferredRole(roleOrRoles) : roleOrRoles;
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

export function normalizeRoles(profile: Pick<UserProfile, "roles" | "role">) {
  if (Array.isArray(profile.roles) && profile.roles.length > 0) {
    return Array.from(new Set(profile.roles));
  }
  if (profile.role) return [profile.role];
  return [Roles.STUDENT];
}

export function hasRole(profile: Pick<UserProfile, "roles" | "role">, role: Role) {
  return normalizeRoles(profile).includes(role);
}

function getPreferredRole(roles: Role[]) {
  if (roles.includes(Roles.ADMIN)) return Roles.ADMIN;
  if (roles.includes(Roles.PROFESSOR)) return Roles.PROFESSOR;
  return Roles.STUDENT;
}

function getPrimaryRole(profile: Pick<UserProfile, "roles" | "role" | "primaryRole">) {
  if (profile.primaryRole && normalizeRoles(profile).includes(profile.primaryRole)) {
    return profile.primaryRole;
  }
  return getPreferredRole(normalizeRoles(profile));
}

