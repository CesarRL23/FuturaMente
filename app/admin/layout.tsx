import type { Metadata } from "next";
import { PanelShell } from "@/components/layout/PanelShell";
import { requireRole } from "@/lib/auth/session";
import { adminNav } from "@/lib/navigation";
import { Roles } from "@/models/roles";

export const metadata: Metadata = { title: "Administración" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Cada página vuelve a llamar a requireRole: el layout no sustituye la verificación por página.
  const { profile } = await requireRole([Roles.ADMIN]);
  return (
    <PanelShell role={Roles.ADMIN} title="Administración" nav={adminNav} userRoles={profile.roles}>
      {children}
    </PanelShell>
  );
}
