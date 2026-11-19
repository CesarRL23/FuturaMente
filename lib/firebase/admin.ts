import "server-only";

import { getApps, initializeApp, cert, type App, type ServiceAccount } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getServerEnv } from "@/lib/env";

let adminApp: App | undefined;

function initAdmin() {
  if (adminApp) return adminApp;
  if (getApps().length) {
    adminApp = getApps()[0]!;
    return adminApp;
  }

  // Pruebas de integración con el emulador local de Firestore: sin credenciales reales.
  if (process.env.FIRESTORE_EMULATOR_HOST) {
    adminApp = initializeApp({ projectId: process.env.GCLOUD_PROJECT ?? "demo-monline" });
    return adminApp;
  }

  const { FIREBASE_SERVICE_ACCOUNT_JSON } = getServerEnv();
  if (!FIREBASE_SERVICE_ACCOUNT_JSON) {
    throw new Error(
      "Falta `FIREBASE_SERVICE_ACCOUNT_JSON` en `.env.local` para usar Firebase Admin SDK.",
    );
  }

  const serviceAccount = JSON.parse(FIREBASE_SERVICE_ACCOUNT_JSON) as ServiceAccount;

  adminApp = initializeApp({
    credential: cert(serviceAccount),
  });

  return adminApp;
}

export function getAdminAuth() {
  initAdmin();
  return getAuth();
}

export function getAdminDb() {
  initAdmin();
  return getFirestore();
}

