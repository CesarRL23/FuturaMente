import Link from "next/link";
import { clearSession } from "@/server/actions/auth";
import { getSessionUser, getUserProfile, hasRole, roleLanding } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { Roles } from "@/models/roles";

export async function SiteHeader() {
  const session = await getSessionUser();
  let profile = null;

  if (session) {
    profile = await getUserProfile(session.uid);
  }

  const handleLogout = async () => {
    "use server";
    await clearSession();
    redirect("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-black/95 backdrop-blur text-white">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold text-white">
          FuturaMente
        </Link>

        {session && profile ? (
          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-300 hidden sm:inline-block">
              {profile.name} ({profile.roles.join(" / ")})
            </span>
            <Link 
              href={roleLanding(profile.roles)} 
              className="text-sm font-medium text-zinc-300 hover:text-white transition-colors"
            >
              Dashboard
            </Link>
            {hasRole(profile, Roles.PROFESSOR) && hasRole(profile, Roles.STUDENT) ? (
              <>
                <div className="h-4 w-px bg-zinc-700" />
                <Link
                  href="/professor"
                  className="text-sm font-medium text-zinc-300 hover:text-white transition-colors"
                >
                  Panel profesor
                </Link>
                <Link
                  href="/student"
                  className="text-sm font-medium text-zinc-300 hover:text-white transition-colors"
                >
                  Panel estudiante
                </Link>
              </>
            ) : null}
            <div className="h-4 w-px bg-zinc-700" />
            <form action={handleLogout}>
              <button 
                type="submit" 
                className="text-sm font-medium text-red-400 hover:text-red-300 transition-colors"
              >
                Cerrar sesión
              </button>
            </form>
          </div>
        ) : (
          <div className="flex items-center gap-4 text-sm font-medium">
            <Link href="/login" className="text-zinc-300 hover:text-white transition-colors">
              Iniciar sesión
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
