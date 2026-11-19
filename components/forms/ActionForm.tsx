"use client";

import { startTransition, useActionState, useEffect, useRef } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import type { ActionState } from "@/lib/actions";

type Action = (prev: ActionState, formData: FormData) => Promise<ActionState>;

/**
 * Formulario que ejecuta una Server Action y muestra su resultado.
 * - No borra lo escrito si hay un error (envío manual en lugar de `<form action>`).
 * - `resetOnSuccess` limpia el formulario cuando la acción termina bien.
 * - `confirmMessage` pide confirmación antes de acciones destructivas.
 */
export function ActionForm({
  action,
  children,
  submitLabel,
  pendingLabel = "Procesando…",
  variant = "primary",
  size = "md",
  className,
  buttonClassName,
  resetOnSuccess = false,
  confirmMessage,
  hideSuccess = false,
}: {
  action: Action;
  children?: React.ReactNode;
  submitLabel: React.ReactNode;
  pendingLabel?: string;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
  className?: string;
  buttonClassName?: string;
  resetOnSuccess?: boolean;
  confirmMessage?: string;
  hideSuccess?: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok && resetOnSuccess) formRef.current?.reset();
  }, [state, resetOnSuccess]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (confirmMessage && !window.confirm(confirmMessage)) return;
    const data = new FormData(e.currentTarget);
    startTransition(() => formAction(data));
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className={className}>
      {children}
      <Button type="submit" variant={variant} size={size} disabled={pending} className={buttonClassName}>
        {pending ? pendingLabel : submitLabel}
      </Button>
      {state && !(state.ok && hideSuccess) ? (
        <Alert variant={state.ok ? "success" : "danger"} className="mt-3" aria-live="polite">
          {state.message}
        </Alert>
      ) : null}
    </form>
  );
}
