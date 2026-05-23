import Link from "next/link";
import { clearSession } from "@/server/actions/auth";
import { getSessionUser, getUserProfile, roleLanding } from "@/lib/auth/session";
import { redirect } from "next/navigation";

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
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/70">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          FuturaMente
        </Link>

        {session && profile ? (
          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-600 dark:text-zinc-300 hidden sm:inline-block">
              {profile.name} ({profile.role})
            </span>
            <Link 
              href={roleLanding(profile.role)} 
              className="text-sm font-medium hover:text-zinc-600 dark:hover:text-zinc-300"
            >
              Dashboard
            </Link>
            <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-700" />
            <form action={handleLogout}>
              <button 
                type="submit" 
                className="text-sm font-medium text-red-600 hover:text-red-500 dark:text-red-500 dark:hover:text-red-400"
              >
                Cerrar sesión
              </button>
            </form>
          </div>
        ) : (
          <div className="flex items-center gap-4 text-sm font-medium">
            <Link href="/login" className="hover:text-zinc-600 dark:hover:text-zinc-300">
              Iniciar sesión
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
