import { redirect } from "next/navigation";
import { getSessionUser, getUserProfile, roleLanding } from "@/lib/auth/session";

/** Punto de entrada tras iniciar sesión: redirige al panel según el rol (RBAC). */
export default async function DashboardLanding() {
  const session = await getSessionUser();
  if (!session) redirect("/login");

  const profile = await getUserProfile(session.uid);
  if (!profile) redirect("/login");

  redirect(roleLanding(profile.roles));
}
