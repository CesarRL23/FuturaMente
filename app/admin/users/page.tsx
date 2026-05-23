import Link from "next/link";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { requireRole } from "@/lib/auth/session";
import { getAdminDb } from "@/lib/firebase/admin";
import { Roles } from "@/models/roles";
import { adminCreateUser, adminSetUserRole } from "@/server/actions/admin";

function hasUserRole(user: { role?: string; roles?: string[] }, role: string) {
  if (Array.isArray(user.roles) && user.roles.length > 0) return user.roles.includes(role);
  return user.role === role;
}

export default async function AdminUsersPage() {
  await requireRole([Roles.ADMIN]);

  const usersSnap = await getAdminDb().collection("users").orderBy("createdAt", "desc").limit(50).get();
  const users = usersSnap.docs.map(
    (d) => d.data() as { id: string; name: string; email: string; role?: string; roles?: string[] },
  );

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Gestión de usuarios</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
            Crea cuentas y asigna uno o varios roles por usuario.
          </p>
        </div>
        <Link className="text-sm font-medium hover:underline" href="/admin">
          Volver a Admin
        </Link>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="border-zinc-200 bg-white/90 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40">
          <CardHeader>
            <CardTitle>Crear usuario</CardTitle>
            <CardDescription>Se crea en Firebase Auth y en Firestore con múltiples roles.</CardDescription>
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
            <div className="space-y-2">
              <label className="text-sm font-medium">Roles</label>
              <div className="grid grid-cols-1 gap-2 rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="roles" value={Roles.ADMIN} className="h-4 w-4" />
                  <span>ADMIN</span>
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="roles" value={Roles.PROFESSOR} className="h-4 w-4" />
                  <span>PROFESSOR</span>
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name="roles"
                    value={Roles.STUDENT}
                    defaultChecked
                    className="h-4 w-4"
                  />
                  <span>STUDENT</span>
                </label>
              </div>
            </div>
            <Button type="submit" className="w-full">
              Crear
            </Button>
          </form>
        </Card>

        <Card className="border-zinc-200 bg-white/90 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40">
          <CardHeader>
            <CardTitle>Lista (últimos 50)</CardTitle>
            <CardDescription>Solo el administrador puede actualizar los roles.</CardDescription>
          </CardHeader>

          <div className="space-y-4">
            {users.length === 0 ? (
              <div className="text-sm text-zinc-600 dark:text-zinc-300">No hay usuarios aún.</div>
            ) : (
              users.map((u) => (
                <div
                  key={u.id}
                  className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950/50"
                >
                  <div className="flex flex-col gap-1">
                    <div className="font-medium">{u.name}</div>
                    <div className="text-sm text-zinc-600 dark:text-zinc-300">{u.email}</div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">uid: {u.id}</div>
                  </div>
                  <form action={adminSetUserRole} className="mt-3 space-y-3">
                    <input type="hidden" name="uid" value={u.id} />
                    <div className="grid grid-cols-1 gap-2 rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          name="roles"
                          value={Roles.ADMIN}
                          defaultChecked={hasUserRole(u, Roles.ADMIN)}
                          className="h-4 w-4"
                        />
                        <span>ADMIN</span>
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          name="roles"
                          value={Roles.PROFESSOR}
                          defaultChecked={hasUserRole(u, Roles.PROFESSOR)}
                          className="h-4 w-4"
                        />
                        <span>PROFESSOR</span>
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          name="roles"
                          value={Roles.STUDENT}
                          defaultChecked={hasUserRole(u, Roles.STUDENT)}
                          className="h-4 w-4"
                        />
                        <span>STUDENT</span>
                      </label>
                    </div>
                    <Button type="submit" variant="secondary">
                      Guardar roles
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

