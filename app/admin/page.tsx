import Link from "next/link";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { requireRole } from "@/lib/auth/session";
import { Roles } from "@/models/roles";

export default async function AdminHome() {
  await requireRole([Roles.ADMIN]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Panel de Administrador</h1>
        <Link className="text-sm font-medium hover:underline" href="/dashboard">
          Volver
        </Link>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Usuarios</CardTitle>
            <CardDescription>Crear, editar, eliminar y asignar roles.</CardDescription>
          </CardHeader>
          <Link className="text-sm font-medium hover:underline" href="/admin/users">
            Administrar usuarios
          </Link>
        </Card>
        <Card>
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

