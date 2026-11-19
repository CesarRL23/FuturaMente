import type { Metadata } from "next";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { requireRole } from "@/lib/auth/session";
import { Roles } from "@/models/roles";

export const metadata: Metadata = { title: "Reportes" };

export default async function AdminReportsPage() {
  await requireRole([Roles.ADMIN]);

  return (
    <>
      <PageHeader title="Reportes" description="Estadísticas de uso de la plataforma." />
      <EmptyState
        icon="chart"
        upcoming
        title="Aún no hay datos para reportar"
        description="Los reportes de monitorías, reservas e ingresos aparecerán cuando esas funciones estén activas."
      />
    </>
  );
}
