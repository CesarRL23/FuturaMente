import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { Input, Label, Select, Textarea } from "@/components/ui/Input";
import { PageHeader } from "@/components/ui/PageHeader";
import { requireRole } from "@/lib/auth/session";
import { listSubjects } from "@/lib/data/subjects";
import { listUsersByRole } from "@/lib/data/users";
import { Roles } from "@/models/roles";
import {
  adminAddProfessorToSubject,
  adminCreateSubject,
  adminRemoveProfessorFromSubject,
} from "@/server/actions/admin";

export const metadata: Metadata = { title: "Materias" };

export default async function AdminSubjectsPage() {
  await requireRole([Roles.ADMIN]);
  const [subjects, professors] = await Promise.all([
    listSubjects(),
    listUsersByRole(Roles.PROFESSOR),
  ]);
  const professorById = new Map(professors.map((p) => [p.id, p]));

  return (
    <>
      <PageHeader
        title="Materias"
        description="Cada materia puede tener varios profesores, y un profesor puede dictar varias materias."
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
        {/* Crear materia */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Nueva materia</CardTitle>
            <CardDescription>Puedes asignar profesores ahora o más adelante.</CardDescription>
          </CardHeader>
          <form action={adminCreateSubject} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="subject-name">Nombre</Label>
              <Input id="subject-name" name="name" placeholder="Ej. Cálculo diferencial" required minLength={2} maxLength={80} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="subject-description">Descripción (opcional)</Label>
              <Textarea
                id="subject-description"
                name="description"
                maxLength={500}
                placeholder="Temas que cubre la monitoría"
              />
            </div>
            <fieldset className="space-y-1.5">
              <legend className="text-sm font-medium text-slate-700">Profesores</legend>
              {professors.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No hay profesores registrados.{" "}
                  <Link href="/admin/users" className="font-medium text-brand-600 hover:text-brand-700">
                    Asigna el rol
                  </Link>{" "}
                  primero.
                </p>
              ) : (
                <div className="max-h-48 space-y-1 overflow-y-auto rounded-lg border border-slate-200 p-2">
                  {professors.map((p) => (
                    <label
                      key={p.id}
                      className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-slate-50"
                    >
                      <input
                        type="checkbox"
                        name="professorIds"
                        value={p.id}
                        className="h-4 w-4 accent-brand-600"
                      />
                      <span className="text-slate-800">{p.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </fieldset>
            <Button type="submit" className="w-full">
              <Icon name="plus" className="h-4 w-4" />
              Crear materia
            </Button>
          </form>
        </Card>

        {/* Listado */}
        <div className="space-y-4">
          {subjects.length === 0 ? (
            <EmptyState
              icon="book"
              title="Aún no hay materias"
              description="Crea la primera materia con el formulario."
            />
          ) : (
            subjects.map((subject) => {
              const available = professors.filter((p) => !subject.professorIds.includes(p.id));
              return (
                <Card key={subject.id}>
                  <div className="flex flex-col gap-1">
                    <h2 className="font-semibold text-slate-900">{subject.name}</h2>
                    {subject.description ? (
                      <p className="text-sm text-slate-600">{subject.description}</p>
                    ) : null}
                  </div>

                  <div className="mt-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Profesores ({subject.professorIds.length})
                    </p>
                    {subject.professorIds.length === 0 ? (
                      <p className="mt-2 text-sm text-slate-500">Sin profesores asignados.</p>
                    ) : (
                      <ul className="mt-2 flex flex-wrap gap-2">
                        {subject.professorIds.map((pid) => {
                          const prof = professorById.get(pid);
                          return (
                            <li key={pid}>
                              <form action={adminRemoveProfessorFromSubject}>
                                <input type="hidden" name="subjectId" value={subject.id} />
                                <input type="hidden" name="professorId" value={pid} />
                                <Badge variant={prof ? "brand" : "warning"} className="py-1 pr-1">
                                  {prof ? prof.name : "Usuario sin rol de profesor"}
                                  <button
                                    type="submit"
                                    className="rounded-full p-0.5 hover:bg-brand-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                                    aria-label={`Quitar a ${prof?.name ?? "este usuario"} de ${subject.name}`}
                                  >
                                    <Icon name="x" className="h-3.5 w-3.5" />
                                  </button>
                                </Badge>
                              </form>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>

                  {available.length > 0 ? (
                    <form
                      action={adminAddProfessorToSubject}
                      className="mt-4 flex flex-col gap-2 border-t border-slate-100 pt-4 sm:flex-row"
                    >
                      <input type="hidden" name="subjectId" value={subject.id} />
                      <label htmlFor={`add-${subject.id}`} className="sr-only">
                        Profesor a agregar
                      </label>
                      <Select id={`add-${subject.id}`} name="professorId" required defaultValue="" className="sm:flex-1">
                        <option value="" disabled>
                          Selecciona un profesor…
                        </option>
                        {available.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </Select>
                      <Button type="submit" variant="secondary">
                        Agregar profesor
                      </Button>
                    </form>
                  ) : null}
                </Card>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
