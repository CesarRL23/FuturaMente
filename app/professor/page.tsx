import Link from "next/link";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { hasRole, requireRole } from "@/lib/auth/session";
import { Roles } from "@/models/roles";

export default async function ProfessorHome() {
  const { profile } = await requireRole([Roles.PROFESSOR]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-6">
      <div className="mb-10 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Panel de Profesor
            </h1>
            <p className="mt-1 text-zinc-500 dark:text-zinc-400">
              Bienvenido, {profile.name}. Gestiona tus clases con acceso rapido.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {hasRole(profile, Roles.STUDENT) ? (
              <Link
                className="inline-flex h-10 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-100 px-4 text-sm font-semibold transition-all hover:bg-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700"
                href="/student"
              >
                Ir a panel de estudiante
              </Link>
            ) : null}
            <Link
              className="inline-flex h-10 items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 text-sm font-semibold transition-all hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
              href="/dashboard"
            >
              Inicio general
            </Link>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between mb-10">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">Herramientas docentes</h2>
          <p className="mt-2 text-lg text-zinc-500 dark:text-zinc-400">Selecciona una tarea para continuar.</p>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {/* Card: Calificaciones */}
        <Link href="/professor/grades" className="group">
          <Card className="h-full border-none shadow-lg transition-all hover:shadow-2xl hover:-translate-y-1 bg-gradient-to-br from-zinc-900 to-zinc-800 text-white dark:from-zinc-100 dark:to-zinc-200 dark:text-zinc-900 overflow-hidden relative">
            <div className="absolute right-[-20px] top-[-20px] opacity-10 group-hover:opacity-20 transition-opacity">
                <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
            </div>
            <CardHeader className="p-8">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 dark:bg-zinc-900/10">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
              </div>
              <CardTitle className="text-2xl font-bold">Calificaciones Semanales</CardTitle>
              <CardDescription className="text-zinc-300 dark:text-zinc-600 mt-2 text-base leading-relaxed">
                Registra notas, edita registros existentes y añade observaciones integradas en una sola vista rápida.
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        {/* Card: Progreso Estudiantil */}
        <Link href="/professor/progress" className="group">
          <Card className="h-full border-none shadow-lg transition-all hover:shadow-2xl hover:-translate-y-1 bg-white dark:bg-zinc-900 overflow-hidden relative border border-zinc-100 dark:border-zinc-800">
            <div className="absolute right-[-20px] top-[-20px] opacity-5 group-hover:opacity-10 transition-opacity text-zinc-900 dark:text-zinc-100">
                <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
            </div>
            <CardHeader className="p-8">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
              </div>
              <CardTitle className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Progreso Académico</CardTitle>
              <CardDescription className="text-zinc-500 dark:text-zinc-400 mt-2 text-base leading-relaxed">
                Analiza las tendencias de aprendizaje y el rendimiento general de tus grupos y estudiantes.
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        {/* Placeholder para futura sección o Card de Ajustes rápida */}
        <div className="h-full rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 p-8 flex flex-col items-center justify-center text-center">
            <div className="mb-4 rounded-full bg-zinc-50 dark:bg-zinc-950 p-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-300"><path d="M12 17h.01"/><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>
            </div>
            <p className="text-sm font-semibold text-zinc-400">Más herramientas próximamente</p>
        </div>
      </div>
    </div>
  );
}

