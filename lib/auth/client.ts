"use client";

import {
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  type UserCredential,
} from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/client";

export async function loginWithEmail(email: string, password: string): Promise<UserCredential> {
  return await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
}

export async function loginWithGoogle(): Promise<UserCredential> {
  const provider = new GoogleAuthProvider();
  return await signInWithPopup(getFirebaseAuth(), provider);
}

export async function registerWithEmail(
  name: string,
  email: string,
  password: string,
): Promise<UserCredential> {
  const cred = await createUserWithEmailAndPassword(getFirebaseAuth(), email, password);
  await updateProfile(cred.user, { displayName: name });
  return cred;
}

export async function resetPassword(email: string) {
  await sendPasswordResetEmail(getFirebaseAuth(), email);
}

