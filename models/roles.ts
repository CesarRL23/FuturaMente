export const Roles = {
  ADMIN: "ADMIN",
  PROFESSOR: "PROFESSOR",
  STUDENT: "STUDENT",
} as const;

export type Role = (typeof Roles)[keyof typeof Roles];

