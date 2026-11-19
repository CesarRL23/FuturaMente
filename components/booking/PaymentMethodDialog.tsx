"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

/**
 * Diálogo de selección de método de pago al reservar.
 * DEMOSTRATIVO: solo es visual. No pide datos, no procesa pagos y el método elegido
 * no se envía al servidor; al confirmar, la reserva sigue el flujo normal.
 *
 * Logos opcionales en `public/`: `nequi-logo.png` y `daviplata-logo.png`.
 * Si la imagen no existe, se muestra un recuadro de reemplazo.
 */
type Method = "nequi" | "daviplata" | "card";

const METHODS: { id: Method; label: string; hint: string; logo?: string }[] = [
  { id: "nequi", label: "Nequi", hint: "Paga desde tu app Nequi", logo: "/nequi-logo.png" },
  { id: "daviplata", label: "Daviplata", hint: "Paga desde tu app Daviplata", logo: "/daviplata-logo.png" },
  { id: "card", label: "Tarjeta", hint: "Débito o crédito" },
];

function MethodLogo({ src, label }: { src?: string; label: string }) {
  const [failed, setFailed] = useState(false);

  if (!src) {
    return (
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
        <Icon name="card" className="h-6 w-6" />
      </span>
    );
  }

  return (
    <span className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-dashed border-slate-300 bg-white">
      {failed ? (
        <span className="text-xs font-semibold text-slate-400">{label.slice(0, 2).toUpperCase()}</span>
      ) : (
        <Image
          src={src}
          alt={`Logo de ${label}`}
          fill
          sizes="48px"
          className="object-contain p-1"
          onError={() => setFailed(true)}
        />
      )}
    </span>
  );
}

export function PaymentMethodDialog({
  open,
  onConfirm,
  onCancel,
  summary,
}: {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  summary: React.ReactNode;
}) {
  const id = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [method, setMethod] = useState<Method | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
  }, [open]);

  // Al cerrar (por cualquier vía) se limpia la selección para la próxima vez.
  function cancel() {
    setMethod(null);
    onCancel();
  }

  function confirm() {
    setMethod(null);
    onConfirm();
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={`${id}-title`}
      onCancel={(e) => {
        e.preventDefault();
        cancel();
      }}
      onClick={(e) => {
        // Clic en el fondo oscurecido (fuera del contenido) = cancelar.
        if (e.target === e.currentTarget) cancel();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl bg-white p-0 text-slate-900 shadow-xl backdrop:bg-slate-900/50 backdrop:backdrop-blur-sm"
    >
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id={`${id}-title`} className="text-lg font-semibold">
              Selecciona tu método de pago
            </h2>
            <p className="mt-1 text-sm text-slate-600">{summary}</p>
          </div>
          <button
            type="button"
            onClick={cancel}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            aria-label="Cerrar"
          >
            <Icon name="x" className="h-5 w-5" />
          </button>
        </div>

        <fieldset className="mt-5 space-y-2">
          <legend className="sr-only">Método de pago</legend>
          {METHODS.map((m) => (
            <label
              key={m.id}
              className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-3 transition-colors hover:bg-slate-50 has-[:checked]:border-brand-500 has-[:checked]:bg-brand-50 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-500"
            >
              <input
                type="radio"
                name={`${id}-method`}
                value={m.id}
                checked={method === m.id}
                onChange={() => setMethod(m.id)}
                className="sr-only"
              />
              <MethodLogo src={m.logo} label={m.label} />
              <span className="flex-1">
                <span className="block font-medium">{m.label}</span>
                <span className="block text-xs text-slate-500">{m.hint}</span>
              </span>
              <span
                className={[
                  "flex h-5 w-5 items-center justify-center rounded-full border",
                  method === m.id ? "border-brand-600 bg-brand-600 text-white" : "border-slate-300",
                ].join(" ")}
              >
                {method === m.id ? <Icon name="check" className="h-3 w-3" /> : null}
              </span>
            </label>
          ))}
        </fieldset>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={cancel}>
            Cancelar
          </Button>
          <Button type="button" onClick={confirm} disabled={!method}>
            Confirmar y pagar
          </Button>
        </div>
      </div>
    </dialog>
  );
}
