"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthShell } from "@/components/layout/AuthShell";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { loginWithGoogle, registerWithEmail } from "@/lib/auth/client";
import { createSessionFromIdToken, ensureUserProfile } from "@/server/actions/auth";

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  async function handleRegister() {
    setError(null);
    setLoading(true);
    try {
      const cred = await registerWithEmail(name.trim() || "Sin nombre", email.trim(), password);
      const idToken = await cred.user.getIdToken();
      await createSessionFromIdToken(idToken);
      await ensureUserProfile({
        uid: cred.user.uid,
        name: cred.user.displayName ?? (name.trim() || "Sin nombre"),
        email: cred.user.email ?? email.trim(),
      });
      // redirigir a la página de inicio en lugar del dashboard
      router.push("/");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo registrar.");
    } finally {
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
      await ensureUserProfile({
        uid: cred.user.uid,
        name: cred.user.displayName ?? "Sin nombre",
        email: cred.user.email ?? "sin-email@local",
      });
      // después del registro con Google enviamos al home
      router.push("/");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo registrar con Google.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title="Crear cuenta" subtitle="Registro con correo y contraseña (o Google).">
      <div className="space-y-5">
        {error ? <Alert variant="danger">{error}</Alert> : null}

        <div className="space-y-2">
          <label className="text-sm font-medium">Nombre</label>
          <Input
            type="text"
            placeholder="Tu nombre"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

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
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="space-y-3">
          <Button type="button" className="w-full" onClick={handleRegister} disabled={loading}>
            {loading ? "Creando..." : "Crear cuenta"}
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

        <div className="text-sm text-zinc-600 dark:text-zinc-300">
          ¿Ya tienes cuenta?{" "}
          <Link className="font-medium text-zinc-900 hover:underline dark:text-white" href="/login">
            Inicia sesión
          </Link>
        </div>
      </div>
    </AuthShell>
  );
}

