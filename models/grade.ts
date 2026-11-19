/**
 * @deprecated Modelo del sistema anterior (gestión de notas).
 * MONLINE ya no usa esta colección; se conserva solo como referencia del histórico en Firestore.
 */
export type Grade = {
  id: string;
  studentId: string;
  subjectId: string;
  week: number;
  grade: number;
  createdAt: number;
  updatedAt?: number;
};

