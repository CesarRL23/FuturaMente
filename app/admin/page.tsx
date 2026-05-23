import Link from "next/link";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { requireRole } from "@/lib/auth/session";
import { Roles } from "@/models/roles";

export default async function AdminHome() {
  await requireRole([Roles.ADMIN]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="rounded-2xl border border-zinc-200 bg-gradient-to-r from-zinc-900 to-zinc-700 p-8 text-white shadow-lg dark:border-zinc-800">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Panel de Administrador</h1>
            <p className="mt-2 text-sm text-zinc-200">
              Gestiona usuarios, permisos y materias desde un solo lugar.
            </p>
          </div>
          <Link
            className="inline-flex h-10 items-center justify-center rounded-md border border-white/30 bg-white/10 px-4 text-sm font-medium hover:bg-white/20"
            href="/dashboard"
          >
            Volver al dashboard
          </Link>
        </div>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <Card className="border-zinc-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/50">
          <CardHeader>
            <CardTitle>Usuarios</CardTitle>
            <CardDescription>
              Crea cuentas y asigna uno o varios roles (ADMIN, PROFESSOR, STUDENT).
            </CardDescription>
          </CardHeader>
          <Link className="text-sm font-medium hover:underline" href="/admin/users">
            Administrar usuarios
          </Link>
        </Card>
        <Card className="border-zinc-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/50">
          <CardHeader>
            <CardTitle>Materias</CardTitle>
            <CardDescription>Crear materias y asignar profesores.</CardDescription>
          </CardHeader>
          <Link className="text-sm font-medium hover:underline" href="/admin/subjects">
            Administrar materias
          </Link>
        </Card>
      </div>
    </div>
  );
}

