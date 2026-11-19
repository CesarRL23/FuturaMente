import "server-only";

import type { Transaction } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase/admin";

/**
 * Serializa en Firestore las transacciones de un mismo usuario.
 *
 * Una transacción bloquea los documentos que lee, pero una consulta no bloquea documentos
 * que aún no existen. Para que dos operaciones simultáneas del mismo profesor (o estudiante)
 * no creen franjas o reservas que se crucen, ambas leen y escriben este documento: la segunda
 * espera o se reintenta y vuelve a validar con el estado actualizado.
 *
 * Uso (respetando "todas las lecturas antes que las escrituras"):
 *   const lock = await readLock(tx, "professor", uid);  // lectura
 *   ... más lecturas y validaciones ...
 *   touchLock(tx, lock);                                 // escritura
 */
export type LockHandle = FirebaseFirestore.DocumentReference;

export async function readLock(tx: Transaction, kind: "professor" | "student", uid: string) {
  const ref = getAdminDb().collection("locks").doc(`${kind}_${uid}`);
  await tx.get(ref);
  return ref;
}

export function touchLock(tx: Transaction, ref: LockHandle) {
  tx.set(ref, { updatedAt: Date.now() });
}
