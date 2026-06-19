import { auth, db } from "../firebase.js";

import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "firebase/auth";

import {
  doc,
  getDoc
} from "firebase/firestore";

export async function loginWithEmail(email, password) {
  if (!email || !password) {
    throw new Error("Preencha e-mail e senha.");
  }

  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );

  return userCredential.user;
}

export async function logoutUser() {
  await signOut(auth);
}

export function watchAuthState(callback) {
  return onAuthStateChanged(auth, callback);
}

export async function getAdminProfile(user) {
  if (!user) return null;

  const adminRef = doc(db, "adminUsers", user.uid);
  const adminSnap = await getDoc(adminRef);

  if (!adminSnap.exists()) {
    return null;
  }

  const adminData = adminSnap.data();

  if (adminData.active !== true) {
    return null;
  }

  return {
    uid: user.uid,
    email: user.email,
    role: adminData.role || "editor",
    active: adminData.active
  };
}