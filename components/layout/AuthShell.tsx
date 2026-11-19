import { Icon, type IconName } from "@/components/ui/Icon";

const highlights: { icon: IconName; title: string; text: string }[] = [
  {
    icon: "search",
    title: "Encuentra apoyo",
    text: "Explora materias y profesores que ofrecen monitorías.",
  },
  {
    icon: "calendar",
    title: "Agenda a tu ritmo",
    text: "Elige el horario que mejor se ajuste a ti.",
  },
  {
    icon: "shield",
    title: "Profesores registrados",
    text: "Los profesores son habilitados por el equipo de MONLINE.",
  },
];

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
    <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:gap-16">
      <section className="hidden rounded-3xl bg-gradient-to-br from-brand-700 to-brand-900 p-10 text-white shadow-lg lg:block">
        <p className="text-sm font-semibold uppercase tracking-wider text-brand-200">MONLINE</p>
        <h2 className="mt-3 text-3xl font-semibold leading-tight">
          Monitorías académicas con profesores de confianza.
        </h2>
        <ul className="mt-10 space-y-6">
          {highlights.map((h) => (
            <li key={h.title} className="flex gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20">
                <Icon name={h.icon} className="h-5 w-5" />
              </span>
              <div>
                <p className="font-medium">{h.title}</p>
                <p className="text-sm text-brand-100">{h.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto w-full max-w-md">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
          {subtitle ? <p className="mt-1 text-sm text-slate-600">{subtitle}</p> : null}
          <div className="mt-6">{children}</div>
        </div>
      </section>
    </div>
  );
}
