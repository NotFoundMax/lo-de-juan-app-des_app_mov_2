import {
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { get, ref, set } from "firebase/database";
import { ROLES, Role } from "../constants/roles";
import { auth, rtdb } from "./firebase-rtdb";

// Autentica con email y contraseña
export async function signIn(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

// Registra usuario en Auth y RTDB
export async function signUp(
  email: string,
  password: string,
  name: string,
  role: Role = ROLES.CUSTOMER,
) {
  const credential = await createUserWithEmailAndPassword(
    auth,
    email,
    password,
  );
  await set(ref(rtdb, `users/${credential.user.uid}`), {
    name,
    email,
    role,
    createdAt: new Date().toISOString(),
  });
  return credential;
}

// Cierra la sesión del usuario actual
export async function signOut() {
  return firebaseSignOut(auth);
}

// Obtiene el rol del usuario desde RTDB
export async function getUserRole(uid: string): Promise<Role> {
  const snap = await get(ref(rtdb, `users/${uid}`));
  if (!snap.exists()) return ROLES.CUSTOMER;
  return snap.val().role as Role;
}
