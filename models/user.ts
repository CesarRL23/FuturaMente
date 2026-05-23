import type { Role } from "@/models/roles";

export type UserProfile = {
  id: string; // uid
  name: string;
  email: string;
  roles: Role[];
  primaryRole?: Role;
  role?: Role; // compatibilidad con documentos antiguos
  createdAt: number; // epoch ms
};

