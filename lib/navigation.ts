import type { IconName } from "@/components/ui/Icon";
import { Roles, type Role } from "@/models/roles";

export type NavItem = {
  href: string;
  label: string;
  icon: IconName;
  /** Solo marcar activo con coincidencia exacta (para la raíz del panel). */
  exact?: boolean;
};

export const adminNav: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: "home", exact: true },
  { href: "/admin/professors", label: "Profesores", icon: "presentation" },
  { href: "/admin/students", label: "Estudiantes", icon: "graduation" },
  { href: "/admin/subjects", label: "Materias", icon: "book" },
  { href: "/admin/tutoring", label: "Monitorías", icon: "layers" },
  { href: "/admin/bookings", label: "Reservas", icon: "bookmark" },
  { href: "/admin/settlements", label: "Liquidaciones", icon: "wallet" },
  { href: "/admin/reports", label: "Reportes", icon: "chart" },
  { href: "/admin/users", label: "Usuarios y permisos", icon: "shield" },
  { href: "/admin/settings", label: "Configuración", icon: "settings" },
];

export const professorNav: NavItem[] = [
  { href: "/professor", label: "Dashboard", icon: "home", exact: true },
  { href: "/professor/profile", label: "Mi perfil", icon: "user" },
  { href: "/professor/subjects", label: "Mis materias", icon: "book" },
  { href: "/professor/availability", label: "Mi disponibilidad", icon: "calendar" },
  { href: "/professor/sessions", label: "Mis monitorías", icon: "layers" },
  { href: "/professor/history", label: "Historial", icon: "history" },
];

export const studentNav: NavItem[] = [
  { href: "/student", label: "Dashboard", icon: "home", exact: true },
  { href: "/student/search", label: "Buscar monitorías", icon: "search" },
  { href: "/student/bookings", label: "Mis reservas", icon: "bookmark" },
  { href: "/student/history", label: "Historial", icon: "history" },
  { href: "/student/profile", label: "Mi perfil", icon: "user" },
];

export const panelHome: Record<Role, string> = {
  [Roles.ADMIN]: "/admin",
  [Roles.PROFESSOR]: "/professor",
  [Roles.STUDENT]: "/student",
};
