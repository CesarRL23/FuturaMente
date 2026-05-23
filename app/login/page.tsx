"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthShell } from "@/components/layout/AuthShell";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { loginWithEmail, loginWithGoogle } from "@/lib/auth/client";
import { createSessionFromIdToken, ensureUserProfile } from "@/server/actions/auth";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  async function handleEmailLogin() {
    setError(null);
    setLoading(true);
    try {
      const cred = await loginWithEmail(email.trim(), password);
      const idToken = await cred.user.getIdToken();
      await createSessionFromIdToken(idToken);
      await ensureUserProfile({
        uid: cred.user.uid,
        name: cred.user.displayName ?? "Sin nombre",
        email: cred.user.email ?? email.trim(),
      });
      window.location.href = "/dashboard";
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo iniciar sesión.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setError(null);
    setLoading(true);
    try {
      const cred = await loginWithGoogle();
      const idToken = await cred.user.getIdToken();
      await createSessionFromIdToken(idToken);
      await ensureUserProfile({
        uid: cred.user.uid,
        name: cred.user.displayName ?? "Sin nombre",
        email: cred.user.email ?? "sin-email@local",
      });
      window.location.href = "/dashboard";
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo iniciar sesión con Google.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title="Iniciar sesión" subtitle="Accede con tu cuenta para ver tu dashboard.">
      <div className="space-y-5">
        {error ? <Alert variant="danger">{error}</Alert> : null}

        <div className="space-y-2">
          <label className="text-sm font-medium">Correo</label>
          <Input
            type="email"
            placeholder="tu@correo.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Contraseña</label>
          <Input
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="space-y-3">
          <Button type="button" className="w-full" onClick={handleEmailLogin} disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </Button>
          <Button
            type="button"
            className="w-full"
            variant="secondary"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            Continuar con Google
          </Button>
        </div>

        <div className="flex items-center justify-between text-sm">
          <Link
            className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white"
            href="/reset-password"
          >
            ¿Olvidaste tu contraseña?
          </Link>
          <Link className="font-medium hover:underline" href="/register">
            Crear cuenta
          </Link>
        </div>
      </div>
    </AuthShell>
  );
}

