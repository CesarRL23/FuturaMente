"use client";

import { useId, useState } from "react";
import { ActionForm } from "@/components/forms/ActionForm";
import { Input } from "@/components/ui/Input";
import type { ActionState } from "@/lib/actions";
import { MAX_GROUP_CAPACITY } from "@/lib/domain/config";
import { calculatePricing } from "@/lib/domain/pricing";
import { formatCOP } from "@/lib/format";

type Mode = "1" | "2" | "3+";

const OPTIONS: { mode: Mode; title: string; hint: string }[] = [
  { mode: "1", title: "Individual", hint: "1 persona" },
  { mode: "2", title: "Grupal", hint: "2 personas" },
  { mode: "3+", title: "Grupal", hint: "3 o más" },
];

/**
 * Selección de participantes y confirmación. El precio mostrado es solo informativo:
 * el servidor lo recalcula a partir de la capacidad (el cliente no envía precios).
 */
export function BookSlotForm({
  slotId,
  action,
}: {
  slotId: string;
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
}) {
  const id = useId();
  const [mode, setMode] = useState<Mode>("1");
  const [groupSize, setGroupSize] = useState(3);

  const capacity = mode === "1" ? 1 : mode === "2" ? 2 : groupSize;
  const valid = Number.isInteger(capacity) && capacity >= 1 && capacity <= MAX_GROUP_CAPACITY;
  const price = valid ? calculatePricing(capacity).totalPrice : null;

  return (
    <ActionForm
      action={action}
      submitLabel={price ? `Reservar · ${formatCOP(price)}` : "Reservar"}
      pendingLabel="Reservando…"
      className="space-y-3"
      buttonClassName="w-full"
      confirmMessage={
        price
          ? `Vas a reservar una monitoría ${capacity === 1 ? "individual" : `grupal para ${capacity} personas`} por ${formatCOP(price)} (precio total de la monitoría). ¿Confirmas la reserva?`
          : undefined
      }
    >
      <input type="hidden" name="slotId" value={slotId} />
      <input type="hidden" name="capacity" value={capacity} />

      <fieldset>
        <legend className="mb-2 text-sm font-medium text-slate-700">¿Cuántos participantes?</legend>
        <div className="grid grid-cols-3 gap-2">
          {OPTIONS.map((o) => (
            <label
              key={o.mode}
              className="flex cursor-pointer flex-col items-center rounded-lg border border-slate-200 px-2 py-2 text-center text-sm transition-colors hover:bg-slate-50 has-[:checked]:border-brand-500 has-[:checked]:bg-brand-50 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-500"
            >
              <input
                type="radio"
                name={`${id}-mode`}
                value={o.mode}
                checked={mode === o.mode}
                onChange={() => setMode(o.mode)}
                className="sr-only"
              />
              <span className="font-medium text-slate-900">{o.title}</span>
              <span className="text-xs text-slate-500">{o.hint}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {mode === "3+" ? (
        <div className="flex items-center gap-2">
          <label htmlFor={`${id}-size`} className="text-sm text-slate-700">
            Número de participantes
          </label>
          <Input
            id={`${id}-size`}
            type="number"
            min={3}
            max={MAX_GROUP_CAPACITY}
            value={groupSize}
            onChange={(e) => setGroupSize(Number(e.target.value))}
            className="h-9 w-20"
          />
        </div>
      ) : null}

      <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
        {price ? (
          <>
            Precio total de la monitoría: <strong className="text-slate-900">{formatCOP(price)}</strong>
            {capacity > 1 ? ` · ${capacity} cupos (incluido el tuyo)` : null}
          </>
        ) : (
          `Elige entre 3 y ${MAX_GROUP_CAPACITY} participantes.`
        )}
      </p>
    </ActionForm>
  );
}
