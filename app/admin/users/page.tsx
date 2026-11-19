import type { Metadata } from "next";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input, Label } from "@/components/ui/Input";
import { PageHeader } from "@/components/ui/PageHeader";
import { requireRole } from "@/lib/auth/session";
import { listRecentUsers } from "@/lib/data/users";
import { ALL_ROLES, RoleLabels, Roles, type Role } from "@/models/roles";
import { adminCreateUser, adminSetUserRole } from "@/server/actions/admin";

export const metadata: Metadata = { title: "Usuarios y permisos" };

function RoleCheckboxes({ selected, idPrefix }: { selected: Role[]; idPrefix: string }) {
  return (
    <div className="flex flex-wrap gap-2">
      {ALL_ROLES.map((role) => (
        <label
          key={role}
          htmlFor={`${idPrefix}-${role}`}
          className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 has-[:checked]:border-brand-300 has-[:checked]:bg-brand-50 has-[:checked]:text-brand-800"
        >
          <input
            id={`${idPrefix}-${role}`}
            type="checkbox"
            name="roles"
            value={role}
            defaultChecked={selected.includes(role)}
            className="h-4 w-4 accent-brand-600"
          />
          {RoleLabels[role]}
        </label>
      ))}
    </div>
  );
}

export default async function AdminUsersPage() {
  const { profile: me } = await requireRole([Roles.ADMIN]);
  const users = await listRecentUsers(50);

  return (
    <>
      <PageHeader
        title="Usuarios y permisos"
        description="Crea cuentas y asigna uno o varios roles a cada usuario."
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Crear usuario</CardTitle>
            <CardDescription>Se crea en Firebase Authentication y en la base de datos.</CardDescription>
          </CardHeader>
          <form action={adminCreateUser} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="new-name">Nombre</Label>
              <Input id="new-name" name="name" placeholder="Nombre completo" required minLength={2} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-email">Correo</Label>
              <Input id="new-email" name="email" type="email" placeholder="correo@dominio.com" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-password">Contraseña</Label>
              <Input
                id="new-password"
                name="password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>
            <fieldset className="space-y-1.5">
              <legend className="text-sm font-medium text-slate-700">Roles</legend>
              <RoleCheckboxes selected={[Roles.STUDENT]} idPrefix="new" />
            </fieldset>
            <Button type="submit" className="w-full">
              Crear usuario
            </Button>
          </form>
        </Card>

        <div>
          <p className="mb-3 text-sm text-slate-500">Últimos 50 usuarios registrados.</p>
          {users.length === 0 ? (
            <EmptyState icon="users" title="No hay usuarios" description="Crea el primero con el formulario." />
          ) : (
            <ul className="space-y-3">
              {users.map((u) => (
                <li key={u.id}>
                  <Card className="p-5">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900">
                          {u.name}
                          {u.id === me.id ? (
                            <Badge variant="brand" className="ml-2 align-middle">
                              Tú
                            </Badge>
                          ) : null}
                        </p>
                        <p className="truncate text-sm text-slate-600">{u.email}</p>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {u.roles.map((r) => (
                          <Badge key={r}>{RoleLabels[r]}</Badge>
                        ))}
                      </div>
                    </div>
                    <form
                      action={adminSetUserRole}
                      className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <input type="hidden" name="uid" value={u.id} />
                      <RoleCheckboxes selected={u.roles} idPrefix={u.id} />
                      <Button type="submit" variant="secondary" size="sm">
                        Guardar roles
                      </Button>
                    </form>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
