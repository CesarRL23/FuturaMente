import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { getSessionUser, getUserProfile, roleLanding } from "@/lib/auth/session";

export default async function DashboardLanding() {
  const session = await getSessionUser();
  if (session) {
    const profile = await getUserProfile(session.uid);
    if (profile) redirect(roleLanding(profile.roles));
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/70">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link className="text-xl font-bold tracking-tight" href="/">
            FuturaMente
          </Link>
          <nav className="flex items-center gap-3 text-sm">
            <Link className="rounded-md px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-900" href="/login">
              Iniciar sesión
            </Link>
            <Link className="rounded-md px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-900" href="/register">
              Crear cuenta
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Administrador</CardTitle>
              <CardDescription>Usuarios, roles, materias, asignaciones.</CardDescription>
            </CardHeader>
            <Link className="text-sm font-medium hover:underline" href="/admin">
              Ir a Admin
            </Link>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Profesor</CardTitle>
              <CardDescription>Registrar notas semanales y observaciones.</CardDescription>
            </CardHeader>
            <Link className="text-sm font-medium hover:underline" href="/professor">
              Ir a Profesor
            </Link>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Estudiante</CardTitle>
              <CardDescription>Ver notas, observaciones y gráficos.</CardDescription>
            </CardHeader>
            <Link className="text-sm font-medium hover:underline" href="/student">
              Ir a Estudiante
            </Link>
          </Card>
        </div>

        <p className="mt-8 text-sm text-zinc-600 dark:text-zinc-300">
          Inicia sesión para que el sistema te redirija automáticamente según tu rol (RBAC).
        </p>
      </main>
    </div>
  );
}

