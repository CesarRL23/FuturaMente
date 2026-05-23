import * as React from "react";

type Variant = "info" | "success" | "warning" | "danger";

const variants: Record<Variant, string> = {
  info: "border-zinc-200 bg-zinc-50 text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900/30 dark:text-zinc-50",
  success:
    "border-emerald-200 bg-emerald-50 text-emerald-950 dark:border-emerald-900/50 dark:bg-emerald-900/20 dark:text-emerald-100",
  warning:
    "border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-100",
  danger:
    "border-red-200 bg-red-50 text-red-950 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-100",
};

export function Alert({
  variant = "info",
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { variant?: Variant }) {
  return (
    <div
      role="alert"
      className={[
        "rounded-xl border px-4 py-3 text-sm",
        variants[variant],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
}

