/**
 * @deprecated Modelo del sistema anterior (gestión de notas).
 * MONLINE ya no usa esta colección; se conserva solo como referencia del histórico en Firestore.
 */
export type Observation = {
  id: string;
  studentId: string;
  professorId: string;
  comment: string;
  date: number; // epoch ms
  createdAt: number;
};

