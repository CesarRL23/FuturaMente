import Link from "next/link";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { requireRole } from "@/lib/auth/session";
import { getAdminDb } from "@/lib/firebase/admin";
import { Roles } from "@/models/roles";
import { adminCreateUser, adminSetUserRole } from "@/server/actions/admin";

export default async function AdminUsersPage() {
  await requireRole([Roles.ADMIN]);

  const usersSnap = await getAdminDb().collection("users").orderBy("createdAt", "desc").limit(50).get();
  const users = usersSnap.docs.map((d) => d.data() as { id: string; name: string; email: string; role: string });

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Usuarios</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
            Crea usuarios y asigna roles (ADMIN / PROFESSOR / STUDENT).
          </p>
        </div>
        <Link className="text-sm font-medium hover:underline" href="/admin">
          Volver a Admin
        </Link>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Crear usuario</CardTitle>
            <CardDescription>Se crea en Firebase Auth y en la colección `users`.</CardDescription>
          </CardHeader>

          <form action={adminCreateUser} className="space-y-3">
            <div className="space-y-1">
              <label className="text-sm font-medium">Nombre</label>
              <Input name="name" placeholder="Nombre" required />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Correo</label>
              <Input name="email" type="email" placeholder="correo@dominio.com" required />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Contraseña</label>
              <Input name="password" type="password" placeholder="mínimo 6 caracteres" required />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Rol</label>
              <select
                name="role"
                className="h-11 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                defaultValue={Roles.STUDENT}
              >
                <option value={Roles.ADMIN}>ADMIN</option>
                <option value={Roles.PROFESSOR}>PROFESSOR</option>
                <option value={Roles.STUDENT}>STUDENT</option>
              </select>
            </div>
            <Button type="submit" className="w-full">
              Crear
            </Button>
          </form>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lista (últimos 50)</CardTitle>
            <CardDescription>Asigna rol editando cada usuario.</CardDescription>
          </CardHeader>

          <div className="space-y-4">
            {users.length === 0 ? (
              <div className="text-sm text-zinc-600 dark:text-zinc-300">No hay usuarios aún.</div>
            ) : (
              users.map((u) => (
                <div
                  key={u.id}
                  className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800"
                >
                  <div className="flex flex-col gap-1">
                    <div className="font-medium">{u.name}</div>
                    <div className="text-sm text-zinc-600 dark:text-zinc-300">{u.email}</div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">uid: {u.id}</div>
                  </div>
                  <form action={adminSetUserRole} className="mt-3 flex items-center gap-2">
                    <input type="hidden" name="uid" value={u.id} />
                    <select
                      name="role"
                      className="h-10 flex-1 rounded-md border border-zinc-300 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                      defaultValue={u.role}
                    >
                      <option value={Roles.ADMIN}>ADMIN</option>
                      <option value={Roles.PROFESSOR}>PROFESSOR</option>
                      <option value={Roles.STUDENT}>STUDENT</option>
                    </select>
                    <Button type="submit" variant="secondary">
                      Guardar
                    </Button>
                  </form>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

