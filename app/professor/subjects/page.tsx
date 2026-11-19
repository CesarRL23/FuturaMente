import { requestNow } from "@/lib/time";
import type { Metadata } from "next";
import Link from "next/link";
import { buttonClasses } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { PageHeader } from "@/components/ui/PageHeader";
import { requireRole } from "@/lib/auth/session";
import { listProfessorSlots } from "@/lib/data/availability";
import { listSubjectsByProfessor } from "@/lib/data/subjects";
import { Roles } from "@/models/roles";

export const metadata: Metadata = { title: "Mis materias" };

export default async function ProfessorSubjectsPage() {
  const { profile } = await requireRole([Roles.PROFESSOR]);
  const now = requestNow();
  const [subjects, slots] = await Promise.all([
    listSubjectsByProfessor(profile.id),
    listProfessorSlots(profile.id, now),
  ]);
  const openBySubject = new Map<string, number>();
  for (const slot of slots) {
    if (slot.status === "AVAILABLE" && slot.startAt > now) {
      openBySubject.set(slot.subjectId, (openBySubject.get(slot.subjectId) ?? 0) + 1);
    }
  }

  return (
    <>
      <PageHeader
        title="Mis materias"
        description="Materias en las que estás habilitado para ofrecer monitorías. Las asigna el administrador."
      />

      {subjects.length === 0 ? (
        <EmptyState
          icon="book"
          title="Aún no tienes materias asignadas"
          description="Cuando el administrador te asigne materias, aparecerán aquí y podrás publicar horarios."
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {subjects.map((s) => {
            const open = openBySubject.get(s.id) ?? 0;
            return (
              <li key={s.id}>
                <Card className="flex h-full flex-col p-5">
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                      <Icon name="book" />
                    </span>
                    <div>
                      <h2 className="font-semibold text-slate-900">{s.name}</h2>
                      <p className="mt-1 text-sm text-slate-600">{s.description ?? "Sin descripción."}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                    <p className="text-sm text-slate-600">
                      {open === 0 ? "Sin horarios publicados" : `${open} horario(s) disponible(s)`}
                    </p>
                    <Link href="/professor/availability" className={buttonClasses({ variant: "secondary", size: "sm" })}>
                      Publicar horario
                    </Link>
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
