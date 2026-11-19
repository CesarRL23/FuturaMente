"use client";

import Link from "next/link";
import { useState } from "react";
import { AuthShell } from "@/components/layout/AuthShell";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { loginWithEmail, loginWithGoogle } from "@/lib/auth/client";
import { createSessionFromIdToken, ensureUserProfile } from "@/server/actions/auth";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const cred = await loginWithEmail(email.trim(), password);
      const idToken = await cred.user.getIdToken();
      await createSessionFromIdToken(idToken);
      await ensureUserProfile({ name: cred.user.displayName ?? "Sin nombre" });
      window.location.href = "/dashboard";
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo iniciar sesión.");
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
      await ensureUserProfile({ name: cred.user.displayName ?? "Sin nombre" });
      window.location.href = "/dashboard";
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo iniciar sesión con Google.");
      setLoading(false);
    }
  }

  return (
    <AuthShell title="Iniciar sesión" subtitle="Accede a tu cuenta de MONLINE.">
      <form className="space-y-5" onSubmit={handleEmailLogin}>
        {error ? <Alert variant="danger">{error}</Alert> : null}

        <div className="space-y-1.5">
          <Label htmlFor="email">Correo electrónico</Label>
          <Input
            id="email"
            type="email"
            placeholder="tu@correo.com"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Contraseña</Label>
            <Link
              className="text-sm font-medium text-brand-600 hover:text-brand-700"
              href="/reset-password"
            >
              ¿La olvidaste?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="space-y-3">
          <Button type="submit" className="w-full" disabled={loading}>
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

        <p className="text-center text-sm text-slate-600">
          ¿No tienes cuenta?{" "}
          <Link className="font-medium text-brand-600 hover:text-brand-700" href="/register">
            Crear cuenta
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
