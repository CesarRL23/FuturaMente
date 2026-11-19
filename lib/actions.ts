import "server-only";

import { unstable_rethrow } from "next/navigation";
import { DomainError } from "@/lib/domain/errors";

/** Resultado que las Server Actions devuelven a los formularios (useActionState). */
export type ActionState = { ok: boolean; message: string } | null;

/**
 * Ejecuta la lógica de una Server Action y convierte los errores en mensajes comprensibles.
 * - DomainError → su mensaje (regla de negocio, seguro de mostrar).
 * - Redirecciones de Next (p. ej. requireRole) → se propagan.
 * - Cualquier otro error → mensaje genérico; el detalle queda en el log del servidor.
 */
export async function runAction(fn: () => Promise<string>): Promise<ActionState> {
  try {
    const message = await fn();
    return { ok: true, message };
  } catch (error) {
    unstable_rethrow(error);
    if (error instanceof DomainError) return { ok: false, message: error.message };
    console.error("[MONLINE] Error inesperado en Server Action:", error);
    return { ok: false, message: "Ocurrió un error inesperado. Intenta de nuevo en unos minutos." };
  }
}

export function formString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}
