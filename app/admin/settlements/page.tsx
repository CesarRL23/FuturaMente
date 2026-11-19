import type { Metadata } from "next";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { requireRole } from "@/lib/auth/session";
import { Roles } from "@/models/roles";

export const metadata: Metadata = { title: "Liquidaciones" };

export default async function AdminSettlementsPage() {
  await requireRole([Roles.ADMIN]);

  return (
    <>
      <PageHeader title="Liquidaciones" description="Pagos a profesores y registros financieros." />
      <EmptyState
        icon="wallet"
        upcoming
        title="Liquidaciones no disponibles todavía"
        description="Las liquidaciones se calcularán a partir de las monitorías dictadas cuando se habiliten los pagos."
      />
    </>
  );
}
