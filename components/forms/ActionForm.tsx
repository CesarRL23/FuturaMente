"use client";

import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import type { ActionState } from "@/lib/actions";

type Action = (prev: ActionState, formData: FormData) => Promise<ActionState>;

/**
 * Formulario que ejecuta una Server Action y muestra su resultado.
 * - No borra lo escrito si hay un error (envío manual en lugar de `<form action>`).
 * - `resetOnSuccess` limpia el formulario cuando la acción termina bien.
 * - `confirmMessage` pide confirmación antes de acciones destructivas.
 * - `renderConfirm` reemplaza esa confirmación nativa por un diálogo propio: el envío
 *   queda en espera hasta que el diálogo llame a `onConfirm`.
 */
export type ConfirmRenderProps = { open: boolean; onConfirm: () => void; onCancel: () => void };

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
  renderConfirm,
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
  renderConfirm?: (props: ConfirmRenderProps) => React.ReactNode;
}) {
  const [state, formAction, pending] = useActionState(action, null);
  const formRef = useRef<HTMLFormElement>(null);
  // Datos del envío en espera de confirmación (diálogo abierto mientras no sea null).
  const [pendingData, setPendingData] = useState<FormData | null>(null);

  useEffect(() => {
    if (state?.ok && resetOnSuccess) formRef.current?.reset();
  }, [state, resetOnSuccess]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    if (renderConfirm) {
      setPendingData(data);
      return;
    }
    if (confirmMessage && !window.confirm(confirmMessage)) return;
    startTransition(() => formAction(data));
  }

  function handleConfirm() {
    const data = pendingData;
    setPendingData(null);
    if (data) startTransition(() => formAction(data));
  }

  function handleCancel() {
    setPendingData(null);
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
      {renderConfirm
        ? renderConfirm({ open: pendingData !== null, onConfirm: handleConfirm, onCancel: handleCancel })
        : null}
    </form>
  );
}
