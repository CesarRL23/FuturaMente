"use client";

import Link from "next/link";
import { useState } from "react";
import { AuthShell } from "@/components/layout/AuthShell";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { resetPassword } from "@/lib/auth/client";

export default function ResetPasswordPage() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSend() {
    setMessage(null);
    setError(null);
    setLoading(true);
    try {
      await resetPassword(email.trim());
      setMessage("Listo. Revisa tu correo para restablecer la contraseña.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo enviar el correo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title="Recuperar contraseña" subtitle="Te enviaremos un enlace al correo.">
      <div className="space-y-5">
        {message ? <Alert variant="info">{message}</Alert> : null}
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

        <Button type="button" className="w-full" onClick={handleSend} disabled={loading}>
          {loading ? "Enviando..." : "Enviar enlace"}
        </Button>

        <div className="text-sm">
          <Link className="font-medium hover:underline" href="/login">
            Volver a iniciar sesión
          </Link>
        </div>
      </div>
    </AuthShell>
  );
}

