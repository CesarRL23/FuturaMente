import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { TableCard, Td, Th } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { requireRole } from "@/lib/auth/session";
import { listSubjects } from "@/lib/data/subjects";
import { listUsersByRole } from "@/lib/data/users";
import { formatDate } from "@/lib/format";
import { Roles } from "@/models/roles";

export const metadata: Metadata = { title: "Profesores" };

export default async function AdminProfessorsPage() {
  await requireRole([Roles.ADMIN]);
  const [professors, subjects] = await Promise.all([
    listUsersByRole(Roles.PROFESSOR),
    listSubjects(),
  ]);

  return (
    <>
      <PageHeader
        title="Profesores"
        description="Profesores registrados y materias en las que ofrecen monitorías."
      />

      {professors.length === 0 ? (
        <EmptyState
          icon="presentation"
          title="Aún no hay profesores"
          description="Asigna el rol de profesor a un usuario desde Usuarios y permisos."
        >
          <Link href="/admin/users" className="text-sm font-medium text-brand-600 hover:text-brand-700">
            Ir a Usuarios y permisos
          </Link>
        </EmptyState>
      ) : (
        <TableCard>
          <thead>
            <tr>
              <Th>Nombre</Th>
              <Th>Correo</Th>
              <Th>Materias</Th>
              <Th>Registro</Th>
            </tr>
          </thead>
          <tbody>
            {professors.map((p) => {
              const mySubjects = subjects.filter((s) => s.professorIds.includes(p.id));
              return (
                <tr key={p.id}>
                  <Td className="font-medium text-slate-900">{p.name}</Td>
                  <Td>{p.email}</Td>
                  <Td>
                    {mySubjects.length === 0 ? (
                      <span className="text-slate-400">Sin materias</span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {mySubjects.map((s) => (
                          <Badge key={s.id} variant="brand">
                            {s.name}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </Td>
                  <Td>{formatDate(p.createdAt)}</Td>
                </tr>
              );
            })}
          </tbody>
        </TableCard>
      )}
    </>
  );
}
