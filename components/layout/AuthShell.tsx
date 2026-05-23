import { Card } from "@/components/ui/Card";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <main className="mx-auto grid max-w-6xl gap-10 px-6 py-12 md:grid-cols-2 md:items-start">
        <div className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
          {subtitle ? (
            <p className="text-zinc-600 dark:text-zinc-300">{subtitle}</p>
          ) : null}
          <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
            <div className="font-medium text-zinc-900 dark:text-white">Roles</div>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Administrador: usuarios, roles, materias.</li>
              <li>Profesor: notas semanales, observaciones.</li>
              <li>Estudiante: consulta y gráficos de progreso.</li>
            </ul>
          </div>
        </div>

        <Card className="p-6">{children}</Card>
      </main>
    </div>
  );
}

