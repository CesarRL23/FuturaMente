import { z } from "zod";

const clientSchema = z.object({
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_APP_ID: z.string().min(1),
});

export function getClientEnv() {
  const env = {
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  const parsed = clientSchema.safeParse(env);
  if (!parsed.success) {
    throw new Error(
      "Variables de entorno de Firebase incompletas. Revisa `.env.local` (NEXT_PUBLIC_FIREBASE_*).",
    );
  }
  return parsed.data;
}

const serverSchema = z.object({
  FIREBASE_SERVICE_ACCOUNT_JSON: z.string().optional(),
  AUTH_COOKIE_NAME: z.string().min(1).default("monline_session"),
});

/**
 * Nombres de cookie de sesión usados antes de MONLINE.
 * Se siguen aceptando (solo lectura) para no cerrar la sesión de golpe a quien ya estaba
 * conectado; al iniciar o cerrar sesión se borran. Las cookies duran 5 días, así que esta
 * lista puede vaciarse pasado ese plazo tras el despliegue.
 */
export const LEGACY_AUTH_COOKIE_NAMES = ["acadex_session"] as const;

export function getServerEnv() {
  const parsed = serverSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error("Variables de entorno del servidor inválidas. Revisa `.env.local`.");
  }
  return parsed.data;
}

