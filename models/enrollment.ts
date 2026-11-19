/**
 * @deprecated Modelo del sistema anterior (gestión de notas).
 * MONLINE ya no usa esta colección; se conserva solo como referencia del histórico en Firestore.
 */
export interface Enrollment {
  id: string;
  studentId: string;
  subjectId: string;
  createdAt: number;
}
