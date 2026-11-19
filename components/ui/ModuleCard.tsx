import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Icon, type IconName } from "@/components/ui/Icon";

/** Acceso a una sección del panel, indicando si ya está disponible o llega en otra fase. */
export function ModuleCard({
  href,
  icon,
  title,
  description,
  upcoming = false,
}: {
  href: string;
  icon: IconName;
  title: string;
  description: string;
  upcoming?: boolean;
}) {
  return (
    <Link
      href={href}
      className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-brand-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
          <Icon name={icon} />
        </span>
        {upcoming ? <Badge>Próxima fase</Badge> : <Badge variant="success">Disponible</Badge>}
      </div>
      <h3 className="mt-4 font-semibold text-slate-900 group-hover:text-brand-700">{title}</h3>
      <p className="mt-1 text-sm text-slate-600">{description}</p>
    </Link>
  );
}
