/**
 * Registro financiero (`payments/{id}`).
 * Preparado para fases posteriores (pagos y liquidaciones); aún no hay operaciones implementadas.
 */

export const PaymentTypes = [
  "STUDENT_CHARGE", // cobro al estudiante por una reserva
  "PROFESSOR_PAYOUT", // liquidación al profesor
] as const;
export type PaymentType = (typeof PaymentTypes)[number];

export const PaymentStatuses = ["PENDING", "PAID", "FAILED", "REFUNDED"] as const;
export type PaymentStatus = (typeof PaymentStatuses)[number];

export type Payment = {
  id: string;
  type: PaymentType;
  status: PaymentStatus;
  /** Valor en la unidad mínima de la moneda (entero), para evitar errores de redondeo. */
  amount: number;
  currency: string; // ISO 4217, p. ej. "COP"
  bookingId?: string;
  studentId?: string;
  professorId?: string;
  method?: string;
  reference?: string; // referencia externa de la pasarela
  paidAt?: number;
  createdAt: number;
  updatedAt?: number;
};
