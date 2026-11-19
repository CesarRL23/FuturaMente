import type { Metadata } from "next";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { requireRole } from "@/lib/auth/session";
import { Roles } from "@/models/roles";

export const metadata: Metadata = { title: "Reservas" };

export default async function AdminBookingsPage() {
  await requireRole([Roles.ADMIN]);

  return (
    <>
      <PageHeader title="Reservas" description="Reservas realizadas por los estudiantes." />
      <EmptyState
        icon="bookmark"
        upcoming
        title="Aún no hay reservas"
        description="El sistema de reservas se habilitará en la próxima fase. Aquí verás todas las reservas y su estado."
      />
    </>
  );
}
