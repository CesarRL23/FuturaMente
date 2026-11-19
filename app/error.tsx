"use client";

import Link from "next/link";
import { Button, buttonClasses } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
        <Icon name="x" className="h-6 w-6" />
      </span>
      <h1 className="mt-4 text-xl font-semibold text-slate-900">Algo salió mal</h1>
      <p className="mt-2 text-sm text-slate-600">
        {error.message || "No se pudo completar la operación."}
      </p>
      <div className="mt-6 flex gap-2">
        <Button onClick={reset}>Intentar de nuevo</Button>
        <Link href="/dashboard" className={buttonClasses({ variant: "secondary" })}>
          Ir a mi panel
        </Link>
      </div>
    </div>
  );
}
