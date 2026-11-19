"use client";

import Link from "next/link";
import { useState } from "react";
import { AuthShell } from "@/components/layout/AuthShell";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { loginWithGoogle, registerWithEmail } from "@/lib/auth/client";
import { createSessionFromIdToken, ensureUserProfile } from "@/server/actions/auth";

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const displayName = name.trim() || "Sin nombre";
      const cred = await registerWithEmail(displayName, email.trim(), password);
      const idToken = await cred.user.getIdToken();
      await createSessionFromIdToken(idToken);
      await ensureUserProfile({ name: cred.user.displayName ?? displayName });
      window.location.href = "/dashboard";
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo registrar.");
      setLoading(false);
    }
  }

  async function handleGoogleRegister() {
    setError(null);
    setLoading(true);
    try {
      const cred = await loginWithGoogle();
      const idToken = await cred.user.getIdToken();
      await createSessionFromIdToken(idToken);
      await ensureUserProfile({ name: cred.user.displayName ?? "Sin nombre" });
      window.location.href = "/dashboard";
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo registrar con Google.");
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Crear cuenta"
      subtitle="Regístrate como estudiante para empezar a buscar monitorías."
    >
      <form className="space-y-5" onSubmit={handleRegister}>
        {error ? <Alert variant="danger">{error}</Alert> : null}

        <div className="space-y-1.5">
          <Label htmlFor="name">Nombre completo</Label>
          <Input
            id="name"
            type="text"
            placeholder="Tu nombre"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

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
          <Label htmlFor="password">Contraseña</Label>
          <Input
            id="password"
            type="password"
            placeholder="Mínimo 6 caracteres"
            autoComplete="new-password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="space-y-3">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creando cuenta..." : "Crear cuenta"}
          </Button>
          <Button
            type="button"
            className="w-full"
            variant="secondary"
            onClick={handleGoogleRegister}
            disabled={loading}
          >
            Continuar con Google
          </Button>
        </div>

        <p className="text-center text-sm text-slate-600">
          ¿Ya tienes cuenta?{" "}
          <Link className="font-medium text-brand-600 hover:text-brand-700" href="/login">
            Inicia sesión
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
