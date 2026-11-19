import type { Role } from "@/models/roles";

/**
 * Información adicional del profesor (se completará en próximas fases).
 * Se guarda como sub-objeto opcional dentro del documento `users/{uid}`.
 */
export type ProfessorProfile = {
  headline?: string; // p. ej. "Ingeniero de sistemas, monitor de Cálculo"
  bio?: string;
  phone?: string;
  photoURL?: string;
  verified?: boolean;
};

/** Información adicional del estudiante (se completará en próximas fases). */
export type StudentProfile = {
  phone?: string;
  institution?: string;
  educationLevel?: string;
};

export type UserProfile = {
  id: string; // uid
  name: string;
  email: string;
  roles: Role[];
  primaryRole?: Role;
  role?: Role; // compatibilidad con documentos antiguos
  professorProfile?: ProfessorProfile;
  studentProfile?: StudentProfile;
  createdAt: number; // epoch ms
  updatedAt?: number;
};
