import Image from "next/image";
import Link from "next/link";

export const APP_NAME = "MONLINE";

/**
 * Logo de la marca. Imágenes en `public/brand/`:
 * - `logo-nombre.png`: logo horizontal con el nombre (uso principal).
 * - `logo.png`: isotipo cuadrado (favicon / espacios pequeños).
 * `inverted` lo coloca sobre una pastilla blanca para que se lea en fondos oscuros.
 */
export function Logo({ href = "/", inverted = false }: { href?: string; inverted?: boolean }) {
  return (
    <Link
      href={href}
      className={[
        "inline-flex items-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
        inverted ? "bg-white px-2 py-1" : "",
      ].join(" ")}
      aria-label={`${APP_NAME} — inicio`}
    >
      <Image
        src="/brand/logo-nombre.png"
        alt={APP_NAME}
        width={816}
        height={306}
        priority
        className="h-12 w-auto"
      />
    </Link>
  );
}
