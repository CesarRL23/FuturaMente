import Link from "next/link";
import { buttonClasses } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
      <p className="text-sm font-semibold text-brand-600">404</p>
      <h1 className="mt-2 text-2xl font-semibold text-slate-900">Página no encontrada</h1>
      <p className="mt-2 text-sm text-slate-600">La página que buscas no existe o fue movida.</p>
      <Link href="/" className={buttonClasses({ className: "mt-6" })}>
        Volver al inicio
      </Link>
    </div>
  );
}
