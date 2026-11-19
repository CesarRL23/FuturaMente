import Link from "next/link";
import { PanelNav } from "@/components/layout/PanelNav";
import { panelHome, type NavItem } from "@/lib/navigation";
import { RoleLabels, type Role } from "@/models/roles";

/**
 * Estructura común de los paneles por rol: navegación lateral (horizontal en móvil)
 * y, si el usuario tiene varios roles, accesos para cambiar de panel.
 */
export function PanelShell({
  role,
  title,
  nav,
  userRoles,
  children,
}: {
  role: Role;
  title: string;
  nav: NavItem[];
  userRoles: Role[];
  children: React.ReactNode;
}) {
  const otherRoles = userRoles.filter((r) => r !== role);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:gap-10 lg:py-10">
      <aside className="lg:w-60 lg:shrink-0">
        <div className="lg:sticky lg:top-24">
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
            {title}
          </p>
          <PanelNav items={nav} />

          {otherRoles.length > 0 ? (
            <div className="mt-4 border-t border-slate-200 pt-4">
              <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Cambiar de panel
              </p>
              <div className="flex flex-wrap gap-2 px-3 lg:flex-col lg:gap-1 lg:px-0">
                {otherRoles.map((r) => (
                  <Link
                    key={r}
                    href={panelHome[r]}
                    className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 ring-1 ring-slate-200 transition-colors hover:bg-slate-100 hover:text-slate-900 lg:ring-0"
                  >
                    Panel de {RoleLabels[r].toLowerCase()}
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </aside>

      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
