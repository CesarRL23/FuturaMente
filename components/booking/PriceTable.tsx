import { PRICE_TIERS } from "@/lib/domain/config";
import { formatCOP } from "@/lib/format";

/** Tarifas vigentes (desde la configuración, no valores escritos a mano). */
export function PriceTable() {
  const tiers = [...PRICE_TIERS].sort((a, b) => a.minParticipants - b.minParticipants);
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-slate-900">Tarifas por monitoría</p>
      <p className="text-xs text-slate-500">Precio total de la sesión, no por estudiante.</p>
      <ul className="mt-3 grid gap-2 sm:grid-cols-3">
        {tiers.map((t, i) => {
          const next = tiers[i + 1];
          const who =
            next === undefined
              ? `${t.minParticipants} o más personas`
              : t.minParticipants === 1
                ? "1 persona"
                : `${t.minParticipants} personas`;
          return (
            <li key={t.minParticipants} className="rounded-lg bg-slate-50 px-3 py-2">
              <p className="text-xs text-slate-500">{who}</p>
              <p className="font-semibold text-slate-900">{formatCOP(t.price)}</p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
