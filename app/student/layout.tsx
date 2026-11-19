import type { Metadata } from "next";
import { PanelShell } from "@/components/layout/PanelShell";
import { requireRole } from "@/lib/auth/session";
import { studentNav } from "@/lib/navigation";
import { Roles } from "@/models/roles";

export const metadata: Metadata = { title: "Panel del estudiante" };

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireRole([Roles.STUDENT]);
  return (
    <PanelShell role={Roles.STUDENT} title="Estudiante" nav={studentNav} userRoles={profile.roles}>
      {children}
    </PanelShell>
  );
}
