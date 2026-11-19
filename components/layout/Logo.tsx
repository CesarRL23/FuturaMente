import Link from "next/link";
import { Icon } from "@/components/ui/Icon";

export const APP_NAME = "MONLINE";

export function Logo({ href = "/", inverted = false }: { href?: string; inverted?: boolean }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
      aria-label={`${APP_NAME} — inicio`}
    >
      <span
        className={[
          "flex h-8 w-8 items-center justify-center rounded-lg",
          inverted ? "bg-white text-brand-700" : "bg-brand-600 text-white",
        ].join(" ")}
      >
        <Icon name="graduation" className="h-[18px] w-[18px]" />
      </span>
      <span
        className={[
          "text-lg font-bold tracking-tight",
          inverted ? "text-white" : "text-slate-900",
        ].join(" ")}
      >
        MON<span className={inverted ? "text-brand-200" : "text-brand-600"}>LINE</span>
      </span>
    </Link>
  );
}
