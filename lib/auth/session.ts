import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getServerEnv, LEGACY_AUTH_COOKIE_NAMES } from "@/lib/env";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";
import { Collections } from "@/models/collections";
import { Roles, type Role } from "@/models/roles";
import type { UserProfile } from "@/models/user";

export type SessionUser = {
  uid: string;
  email?: string;
};

/** Nombres de cookie a revisar: primero el actual y luego los heredados. */
export function sessionCookieNames() {
  const { AUTH_COOKIE_NAME } = getServerEnv();
  return [AUTH_COOKIE_NAME, ...LEGACY_AUTH_COOKIE_NAMES.filter((n) => n !== AUTH_COOKIE_NAME)];
}

/**
 * Usuario de la sesión actual. Memoizado por petición con `cache` para que el layout,
 * la cabecera y la página no repitan la verificación.
 */
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const store = await cookies();

  for (const name of sessionCookieNames()) {
    const value = store.get(name)?.value;
    if (!value) continue;
    try {
      const decoded = await getAdminAuth().verifySessionCookie(value, true);
      return { uid: decoded.uid, email: decoded.email };
    } catch {
      // cookie inválida, expirada o revocada: probar la siguiente
    }
  }
  return null;
});

export const getUserProfile = cache(async (uid: string): Promise<UserProfile | null> => {
  const snap = await getAdminDb().collection(Collections.USERS).doc(uid).get();
  if (!snap.exists) return null;
  return toUserProfile(snap.id, snap.data() as Partial<UserProfile>);
});

/** Normaliza un documento de `users` (incluye compatibilidad con el campo antiguo `role`). */
export function toUserProfile(id: string, data: Partial<UserProfile>): UserProfile {
  return {
    ...data,
    id,
    name: data.name ?? "Sin nombre",
    email: data.email ?? "",
    createdAt: data.createdAt ?? 0,
    roles: normalizeRoles(data),
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

export function normalizeRoles(profile: Partial<Pick<UserProfile, "roles" | "role">>): Role[] {
  if (Array.isArray(profile.roles) && profile.roles.length > 0) {
    return Array.from(new Set(profile.roles));
  }
  if (profile.role) return [profile.role];
  return [Roles.STUDENT];
}

export function hasRole(profile: Partial<Pick<UserProfile, "roles" | "role">>, role: Role) {
  return normalizeRoles(profile).includes(role);
}

function getPreferredRole(roles: Role[]) {
  if (roles.includes(Roles.ADMIN)) return Roles.ADMIN;
  if (roles.includes(Roles.PROFESSOR)) return Roles.PROFESSOR;
  return Roles.STUDENT;
}

function getPrimaryRole(profile: Partial<Pick<UserProfile, "roles" | "role" | "primaryRole">>) {
  if (profile.primaryRole && normalizeRoles(profile).includes(profile.primaryRole)) {
    return profile.primaryRole;
  }
  return getPreferredRole(normalizeRoles(profile));
}
