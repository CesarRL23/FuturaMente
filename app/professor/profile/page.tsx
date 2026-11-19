import type { Metadata } from "next";
import { ActionForm } from "@/components/forms/ActionForm";
import { ProfileSummary } from "@/components/profile/ProfileSummary";
import { Badge } from "@/components/ui/Badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input, Label, Textarea } from "@/components/ui/Input";
import { PageHeader } from "@/components/ui/PageHeader";
import { requireRole } from "@/lib/auth/session";
import { listSubjectsByProfessor } from "@/lib/data/subjects";
import { Roles } from "@/models/roles";
import { updateProfessorProfile } from "@/server/actions/profile";

export const metadata: Metadata = { title: "Mi perfil" };

export default async function ProfessorProfilePage() {
  const { profile } = await requireRole([Roles.PROFESSOR]);
  const subjects = await listSubjectsByProfessor(profile.id);
  const pp = profile.professorProfile ?? {};

  return (
    <>
      <PageHeader
        title="Mi perfil"
        description="Esta información la verán los estudiantes al buscar monitorías."
      />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <Card>
          <CardHeader>
            <CardTitle>Información personal</CardTitle>
            <CardDescription>El correo está asociado a tu cuenta y no se puede cambiar aquí.</CardDescription>
          </CardHeader>
          <ActionForm
            action={updateProfessorProfile}
            submitLabel="Guardar perfil"
            pendingLabel="Guardando…"
            className="space-y-4"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="name">Nombre completo</Label>
                <Input id="name" name="name" required minLength={2} maxLength={120} defaultValue={profile.name} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input id="email" type="email" value={profile.email} disabled readOnly />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Teléfono</Label>
                <Input id="phone" name="phone" type="tel" maxLength={20} placeholder="+57 300 000 0000" defaultValue={pp.phone} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="photoURL">Foto de perfil (URL https)</Label>
                <Input id="photoURL" name="photoURL" type="url" maxLength={500} placeholder="https://…" defaultValue={pp.photoURL} />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="headline">Titular</Label>
                <Input
                  id="headline"
                  name="headline"
                  maxLength={120}
                  placeholder="Ej. Ingeniero civil, monitor de Cálculo y Física"
                  defaultValue={pp.headline}
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="bio">Presentación</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  maxLength={1000}
                  placeholder="Cuéntales a los estudiantes sobre tu experiencia y tu forma de enseñar."
                  defaultValue={pp.bio}
                  className="min-h-32"
                />
              </div>
            </div>
          </ActionForm>
        </Card>

        <div className="space-y-6">
          <ProfileSummary profile={profile} photoURL={pp.photoURL} />
          <Card>
            <CardHeader>
              <CardTitle>Materias asignadas</CardTitle>
              <CardDescription>Las asigna el administrador.</CardDescription>
            </CardHeader>
            {subjects.length === 0 ? (
              <p className="text-sm text-slate-500">Aún no tienes materias asignadas.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {subjects.map((s) => (
                  <Badge key={s.id} variant="brand">
                    {s.name}
                  </Badge>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
