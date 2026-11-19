import type { Metadata } from "next";
import { PanelShell } from "@/components/layout/PanelShell";
import { requireRole } from "@/lib/auth/session";
import { professorNav } from "@/lib/navigation";
import { Roles } from "@/models/roles";

export const metadata: Metadata = { title: "Panel del profesor" };

export default async function ProfessorLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireRole([Roles.PROFESSOR]);
  return (
    <PanelShell
      role={Roles.PROFESSOR}
      title="Profesor"
      nav={professorNav}
      userRoles={profile.roles}
    >
      {children}
    </PanelShell>
  );
}
