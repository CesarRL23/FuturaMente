import "server-only";

import { getAdminDb } from "@/lib/firebase/admin";
import { normalizeRoles, toUserProfile } from "@/lib/auth/session";
import { Collections } from "@/models/collections";
import type { Role } from "@/models/roles";
import type { UserProfile } from "@/models/user";

/**
 * Usuarios con un rol dado. Consulta tanto el campo actual `roles` (array) como el
 * campo antiguo `role` para incluir documentos que aún no se han migrado.
 */
export async function listUsersByRole(role: Role): Promise<UserProfile[]> {
  const users = getAdminDb().collection(Collections.USERS);
  const [byArray, byLegacy] = await Promise.all([
    users.where("roles", "array-contains", role).get(),
    users.where("role", "==", role).get(),
  ]);

  const map = new Map<string, UserProfile>();
  for (const doc of [...byArray.docs, ...byLegacy.docs]) {
    const profile = toUserProfile(doc.id, doc.data() as Partial<UserProfile>);
    if (normalizeRoles(profile).includes(role)) map.set(doc.id, profile);
  }
  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name, "es"));
}

export async function listRecentUsers(limit = 50): Promise<UserProfile[]> {
  const snap = await getAdminDb()
    .collection(Collections.USERS)
    .orderBy("createdAt", "desc")
    .limit(limit)
    .get();
  return snap.docs.map((d) => toUserProfile(d.id, d.data() as Partial<UserProfile>));
}

/** Lee varios usuarios por id en una sola llamada (sin duplicados). */
export async function getUsersByIds(ids: string[]): Promise<Map<string, UserProfile>> {
  const unique = Array.from(new Set(ids.filter(Boolean)));
  const result = new Map<string, UserProfile>();
  if (unique.length === 0) return result;
  const db = getAdminDb();
  const snaps = await db.getAll(...unique.map((id) => db.collection(Collections.USERS).doc(id)));
  for (const snap of snaps) {
    if (snap.exists) result.set(snap.id, toUserProfile(snap.id, snap.data() as Partial<UserProfile>));
  }
  return result;
}

export async function countUsers(): Promise<number> {
  const snap = await getAdminDb().collection(Collections.USERS).count().get();
  return snap.data().count;
}
