function initials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join("") || "?"
  );
}

const sizes = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-16 w-16 text-lg",
};

/** Foto del usuario (URL HTTPS validada en servidor) o sus iniciales. */
export function Avatar({
  name,
  photoURL,
  size = "md",
}: {
  name: string;
  photoURL?: string | null;
  size?: keyof typeof sizes;
}) {
  if (photoURL) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- URL externa arbitraria del usuario
      <img
        src={photoURL}
        alt={`Foto de ${name}`}
        referrerPolicy="no-referrer"
        className={`${sizes[size]} shrink-0 rounded-full object-cover ring-1 ring-slate-200`}
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      className={`${sizes[size]} flex shrink-0 items-center justify-center rounded-full bg-brand-600 font-semibold text-white`}
    >
      {initials(name)}
    </span>
  );
}
