import "server-only";

import { cache } from "react";

/**
 * Hora de la petición actual, memoizada por petición: el layout, la página y sus componentes
 * clasifican monitorías (próximas, por cerrar, etc.) con exactamente el mismo instante.
 * Las Server Actions usan Date.now() dentro de su transacción.
 */
export const requestNow = cache((): number => Date.now());
