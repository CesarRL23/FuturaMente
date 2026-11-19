/**
 * Calificación de un estudiante a una monitoría (`reviews/{id}`).
 * Preparado para fases posteriores; aún no hay operaciones implementadas.
 */
export type Review = {
  id: string;
  bookingId: string;
  studentId: string;
  professorId: string;
  subjectId: string;
  rating: 1 | 2 | 3 | 4 | 5;
  comment?: string;
  createdAt: number;
  updatedAt?: number;
};
