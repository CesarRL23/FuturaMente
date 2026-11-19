import type { Metadata } from "next";
import { TableCard, Td, Th } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { requireRole } from "@/lib/auth/session";
import { listUsersByRole } from "@/lib/data/users";
import { formatDate } from "@/lib/format";
import { Roles } from "@/models/roles";

export const metadata: Metadata = { title: "Estudiantes" };

export default async function AdminStudentsPage() {
  await requireRole([Roles.ADMIN]);
  const students = await listUsersByRole(Roles.STUDENT);

  return (
    <>
      <PageHeader title="Estudiantes" description="Estudiantes registrados en MONLINE." />

      {students.length === 0 ? (
        <EmptyState
          icon="graduation"
          title="Aún no hay estudiantes"
          description="Los usuarios que se registran en la plataforma aparecen aquí automáticamente."
        />
      ) : (
        <TableCard>
          <thead>
            <tr>
              <Th>Nombre</Th>
              <Th>Correo</Th>
              <Th>Registro</Th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id}>
                <Td className="font-medium text-slate-900">{s.name}</Td>
                <Td>{s.email}</Td>
                <Td>{formatDate(s.createdAt)}</Td>
              </tr>
            ))}
          </tbody>
        </TableCard>
      )}
    </>
  );
}
