import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen">

      <main className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div className="space-y-5">
            <h1 className="text-4xl font-semibold leading-tight tracking-tight">
              Plataforma Web para Gestión Académica y Visualización de Progreso
            </h1>
            <p className="text-lg leading-8 text-zinc-600 dark:text-zinc-300">
              Administra usuarios y materias, registra calificaciones semanales y observaciones, y
              muestra el progreso del estudiante con gráficos interactivos.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                className="inline-flex h-11 items-center justify-center rounded-md bg-zinc-900 px-4 font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
                href="/login"
              >
                Entrar
              </Link>
              <Link
                className="inline-flex h-11 items-center justify-center rounded-md border border-zinc-300 bg-white px-4 font-medium text-zinc-900 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900"
                href="/dashboard"
              >
                Ir al dashboard
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-900/40">
                <div className="text-sm font-medium">RBAC</div>
                <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                  Admin, Profesor y Estudiante con permisos separados.
                </div>
              </div>
              <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-900/40">
                <div className="text-sm font-medium">Notas semanales</div>
                <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                  Historial por semana para gráficos de evolución.
                </div>
              </div>
              <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-900/40">
                <div className="text-sm font-medium">Observaciones</div>
                <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                  Comentarios académicos y conductuales por estudiante.
                </div>
              </div>
              <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-900/40">
                <div className="text-sm font-medium">Gráficos</div>
                <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                  Visualización clara del desempeño en el tiempo.
                </div>
              </div>
            </div>
            <p className="mt-5 text-xs text-zinc-500 dark:text-zinc-400">
              Nota: primero configuraremos Firebase (Auth + Firestore) para habilitar todas las
              funciones.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
