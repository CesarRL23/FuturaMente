import type { Metadata } from "next";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { requireRole } from "@/lib/auth/session";
import { Roles } from "@/models/roles";

export const metadata: Metadata = { title: "Configuración" };

export default async function AdminSettingsPage() {
  await requireRole([Roles.ADMIN]);

  return (
    <>
      <PageHeader title="Configuración" description="Parámetros generales de MONLINE." />
      <EmptyState
        icon="settings"
        upcoming
        title="Configuración en preparación"
        description="Aquí podrás definir parámetros como duración de las monitorías y políticas de cancelación."
      />
    </>
  );
}
