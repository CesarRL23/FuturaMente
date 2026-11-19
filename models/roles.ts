export const Roles = {
  ADMIN: "ADMIN",
  PROFESSOR: "PROFESSOR",
  STUDENT: "STUDENT",
} as const;

export type Role = (typeof Roles)[keyof typeof Roles];

export const ALL_ROLES: Role[] = [Roles.ADMIN, Roles.PROFESSOR, Roles.STUDENT];

/** Nombres visibles de cada rol en la interfaz. */
export const RoleLabels: Record<Role, string> = {
  ADMIN: "Administrador",
  PROFESSOR: "Profesor",
  STUDENT: "Estudiante",
};
