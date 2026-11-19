import type { Metadata } from "next";
import { ActionForm } from "@/components/forms/ActionForm";
import { ProfileSummary } from "@/components/profile/ProfileSummary";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input, Label, Select } from "@/components/ui/Input";
import { PageHeader } from "@/components/ui/PageHeader";
import { requireRole } from "@/lib/auth/session";
import { Roles } from "@/models/roles";
import { updateStudentProfile } from "@/server/actions/profile";

export const metadata: Metadata = { title: "Mi perfil" };

const LEVELS = ["Bachillerato", "Técnico / Tecnológico", "Pregrado", "Posgrado", "Otro"];

export default async function StudentProfilePage() {
  const { profile } = await requireRole([Roles.STUDENT]);
  const sp = profile.studentProfile ?? {};

  return (
    <>
      <PageHeader title="Mi perfil" description="Información de tu cuenta en MONLINE." />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <Card>
          <CardHeader>
            <CardTitle>Información personal</CardTitle>
            <CardDescription>
              El correo está asociado a tu cuenta. Tus datos no se muestran a otros estudiantes.
            </CardDescription>
          </CardHeader>
          <ActionForm action={updateStudentProfile} submitLabel="Guardar perfil" pendingLabel="Guardando…" className="space-y-4">
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
                <Input id="phone" name="phone" type="tel" maxLength={20} placeholder="+57 300 000 0000" defaultValue={sp.phone} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="educationLevel">Nivel educativo</Label>
                <Select id="educationLevel" name="educationLevel" defaultValue={sp.educationLevel ?? ""}>
                  <option value="">Sin especificar</option>
                  {LEVELS.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="institution">Institución educativa</Label>
                <Input id="institution" name="institution" maxLength={120} defaultValue={sp.institution} />
              </div>
            </div>
          </ActionForm>
        </Card>
        <ProfileSummary profile={profile} />
      </div>
    </>
  );
}
