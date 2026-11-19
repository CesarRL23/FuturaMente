import Link from "next/link";
import { buttonClasses } from "@/components/ui/Button";
import { Icon, type IconName } from "@/components/ui/Icon";
import { getSessionUser, getUserProfile, roleLanding } from "@/lib/auth/session";

const steps: { icon: IconName; title: string; text: string }[] = [
  {
    icon: "search",
    title: "Busca la materia",
    text: "Explora las materias disponibles y los profesores que ofrecen monitorías en cada una.",
  },
  {
    icon: "calendar",
    title: "Elige un horario",
    text: "Consulta la disponibilidad del profesor y selecciona el espacio que te sirva.",
  },
  {
    icon: "graduation",
    title: "Aprende con apoyo",
    text: "Recibe tu monitoría y refuerza los temas que más necesitas.",
  },
];

const audiences: { icon: IconName; title: string; items: string[] }[] = [
  {
    icon: "graduation",
    title: "Para estudiantes",
    items: [
      "Encuentra refuerzo en las materias que necesitas",
      "Reserva monitorías con profesores de la plataforma",
      "Consulta tus reservas e historial en un solo lugar",
    ],
  },
  {
    icon: "presentation",
    title: "Para profesores",
    items: [
      "Publica las materias que enseñas",
      "Define tu disponibilidad semanal",
      "Gestiona tus monitorías y tu historial",
    ],
  },
];

export default async function Home() {
  const session = await getSessionUser();
  const profile = session ? await getUserProfile(session.uid) : null;

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-sm font-medium text-brand-700 ring-1 ring-inset ring-brand-200">
              <Icon name="graduation" className="h-4 w-4" />
              Monitorías académicas
            </span>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              El refuerzo que necesitas, con el profesor indicado.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
              MONLINE conecta a estudiantes que buscan apoyo académico con profesores que ofrecen
              monitorías en distintas materias.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              {profile ? (
                <Link href={roleLanding(profile.roles)} className={buttonClasses({ className: "px-6" })}>
                  Ir a mi panel
                  <Icon name="arrowRight" className="h-4 w-4" />
                </Link>
              ) : (
                <>
                  <Link href="/register" className={buttonClasses({ className: "px-6" })}>
                    Crear cuenta
                    <Icon name="arrowRight" className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/login"
                    className={buttonClasses({ variant: "secondary", className: "px-6" })}
                  >
                    Ya tengo cuenta
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          ¿Cómo funciona?
        </h2>
        <p className="mt-2 text-slate-600">Tres pasos para recibir apoyo académico.</p>
        <ol className="mt-10 grid gap-6 md:grid-cols-3">
          {steps.map((step, i) => (
            <li key={step.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <Icon name={step.icon} />
                </span>
                <span className="text-sm font-semibold text-slate-400">Paso {i + 1}</span>
              </div>
              <h3 className="mt-4 font-semibold text-slate-900">{step.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Audiencias */}
      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-16 sm:px-6 sm:py-20 md:grid-cols-2">
          {audiences.map((a) => (
            <div key={a.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-8">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white">
                <Icon name={a.icon} />
              </span>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">{a.title}</h3>
              <ul className="mt-4 space-y-3">
                {a.items.map((item) => (
                  <li key={item} className="flex gap-3 text-sm text-slate-700">
                    <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-slate-200">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-8 text-sm text-slate-500 sm:flex-row sm:justify-between sm:px-6">
          <p>© {new Date().getFullYear()} MONLINE</p>
          <p>Plataforma de monitorías académicas</p>
        </div>
      </footer>
    </div>
  );
}
