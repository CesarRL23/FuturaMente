import { Badge } from "@/components/ui/Badge";
import { Icon, type IconName } from "@/components/ui/Icon";

/**
 * Estado vacío. Con `upcoming` indica que la sección se habilitará en una próxima fase
 * (sin botones que aparenten funcionalidades inexistentes).
 */
export function EmptyState({
  icon,
  title,
  description,
  upcoming = false,
  children,
}: {
  icon: IconName;
  title: string;
  description: string;
  upcoming?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
        <Icon name={icon} className="h-6 w-6" />
      </div>
      {upcoming ? (
        <Badge variant="brand" className="mt-4">
          Próxima fase
        </Badge>
      ) : null}
      <h2 className="mt-3 text-base font-semibold text-slate-900">{title}</h2>
      <p className="mt-1 max-w-md text-sm text-slate-600">{description}</p>
      {children ? <div className="mt-6">{children}</div> : null}
    </div>
  );
}
