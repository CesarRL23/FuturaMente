/**
 * Nombres de las colecciones de Firestore usadas por MONLINE.
 * Usar estas constantes en lugar de strings sueltos.
 */
export const Collections = {
  USERS: "users",
  SUBJECTS: "subjects",
  AVAILABILITY: "availability",
  SESSIONS: "sessions",
  BOOKINGS: "bookings",
  PAYMENTS: "payments",
  REVIEWS: "reviews",
} as const;

/**
 * Colecciones del sistema anterior (gestión de notas).
 * MONLINE ya no las lee ni escribe; se conservan intactas en Firestore como histórico.
 */
export const LegacyCollections = {
  GRADES: "grades",
  ENROLLMENTS: "enrollments",
  OBSERVATIONS: "observations",
} as const;
