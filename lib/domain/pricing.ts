import {
  CURRENCY,
  MAX_GROUP_CAPACITY,
  PLATFORM_SHARE_PERCENT,
  PRICE_TIERS,
  PROFESSOR_SHARE_PERCENT,
} from "./config.ts";
import { DomainError } from "./errors.ts";

export type SessionModality = "INDIVIDUAL" | "GROUP";

export type SessionPricing = {
  currency: string;
  /** Capacidad usada para elegir la tarifa. */
  participants: number;
  modality: SessionModality;
  tierLabel: string;
  totalPrice: number;
  professorPercent: number;
  platformPercent: number;
  professorAmount: number;
  platformAmount: number;
};

export function assertValidCapacity(capacity: number) {
  if (!Number.isInteger(capacity) || capacity < 1) {
    throw new DomainError("La cantidad de participantes debe ser un número entero mayor que cero.");
  }
  if (capacity > MAX_GROUP_CAPACITY) {
    throw new DomainError(`El máximo de participantes por monitoría es ${MAX_GROUP_CAPACITY}.`);
  }
}

export function modalityFor(capacity: number): SessionModality {
  return capacity === 1 ? "INDIVIDUAL" : "GROUP";
}

/**
 * Calcula precio y distribución de una monitoría. Todo en pesos enteros:
 * el valor del profesor se redondea y MONLINE recibe el resto, así ambos suman el total exacto.
 */
export function calculatePricing(capacity: number): SessionPricing {
  assertValidCapacity(capacity);
  const tier = PRICE_TIERS.find((t) => capacity >= t.minParticipants);
  if (!tier) throw new DomainError("No hay una tarifa para esa cantidad de participantes.");

  const professorAmount = Math.round((tier.price * PROFESSOR_SHARE_PERCENT) / 100);
  return {
    currency: CURRENCY,
    participants: capacity,
    modality: modalityFor(capacity),
    tierLabel: tier.label,
    totalPrice: tier.price,
    professorPercent: PROFESSOR_SHARE_PERCENT,
    platformPercent: PLATFORM_SHARE_PERCENT,
    professorAmount,
    platformAmount: tier.price - professorAmount,
  };
}
