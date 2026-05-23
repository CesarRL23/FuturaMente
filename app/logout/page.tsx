"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { clearSession } from "@/server/actions/auth";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        await clearSession();
      } catch {
        // ignore
      }
      try {
        await signOut(getFirebaseAuth());
      } catch {
        // ignore
      }
      router.replace("/login");
      router.refresh();
    })();
  }, [router]);

  return (
    <div className="mx-auto max-w-2xl px-6 py-16 text-sm text-zinc-600 dark:text-zinc-300">
      Cerrando sesión...
    </div>
  );
}

