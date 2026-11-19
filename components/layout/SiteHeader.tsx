import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/layout/Logo";
import { buttonClasses } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { getSessionUser, getUserProfile, roleLanding } from "@/lib/auth/session";
import { RoleLabels } from "@/models/roles";
import { clearSession } from "@/server/actions/auth";

export async function SiteHeader() {
  const session = await getSessionUser();
  const profile = session ? await getUserProfile(session.uid) : null;

  const handleLogout = async () => {
    "use server";
    await clearSession();
    redirect("/");
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />

        {session && profile ? (
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden text-right md:block">
              <p className="text-sm font-medium leading-tight text-slate-900">{profile.name}</p>
              <p className="text-xs leading-tight text-slate-500">
                {profile.roles.map((r) => RoleLabels[r]).join(" · ")}
              </p>
            </div>
            <Link
              href={roleLanding(profile.roles)}
              className={buttonClasses({ variant: "secondary", size: "sm" })}
            >
              Mi panel
            </Link>
            <form action={handleLogout}>
              <button
                type="submit"
                className={buttonClasses({ variant: "ghost", size: "sm" })}
                aria-label="Cerrar sesión"
              >
                <Icon name="logout" className="h-4 w-4" />
                <span className="hidden sm:inline">Salir</span>
              </button>
            </form>
          </div>
        ) : (
          <nav className="flex items-center gap-2">
            <Link href="/login" className={buttonClasses({ variant: "ghost", size: "sm" })}>
              Iniciar sesión
            </Link>
            <Link href="/register" className={buttonClasses({ size: "sm" })}>
              Crear cuenta
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
