import type { Role } from "@/models/roles";

export type UserProfile = {
  id: string; // uid
  name: string;
  email: string;
  role: Role;
  createdAt: number; // epoch ms
};

