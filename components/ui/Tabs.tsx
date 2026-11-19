import Link from "next/link";

/** Pestañas basadas en enlaces (el estado vive en la URL, sin JavaScript de cliente). */
export function LinkTabs({
  tabs,
  active,
}: {
  tabs: { key: string; label: string; href: string; count?: number }[];
  active: string;
}) {
  return (
    <nav aria-label="Secciones" className="mb-4 flex flex-wrap gap-2">
      {tabs.map((t) => (
        <Link
          key={t.key}
          href={t.href}
          aria-current={active === t.key ? "page" : undefined}
          className={[
            "rounded-full px-3 py-1.5 text-sm font-medium ring-1 ring-inset transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
            active === t.key
              ? "bg-brand-600 text-white ring-brand-600"
              : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50",
          ].join(" ")}
        >
          {t.label}
          {t.count !== undefined ? ` (${t.count})` : ""}
        </Link>
      ))}
    </nav>
  );
}
