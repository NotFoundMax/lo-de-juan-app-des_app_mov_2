import {
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    GoogleAuthProvider,
    signInWithCredential,
    signInWithEmailAndPassword,
    signInWithPopup,
} from "firebase/auth";
import { get, ref, set } from "firebase/database";
import { Role, ROLES } from "../constants/roles";
import { auth, rtdb } from "./firebase-rtdb";

// Autentica con email y contraseña
export async function signIn(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

// Autentica con Google en web via redirect (funciona con Firebase sin restricción de dominio)
export async function signInWithGoogleWeb() {
  const provider = new GoogleAuthProvider();
  const userCredential = await signInWithPopup(auth, provider);
  const user = userCredential.user;

  const userRef = ref(rtdb, `users/${user.uid}`);
  const snap = await get(userRef);
  if (!snap.exists()) {
    await set(userRef, {
      name: user.displayName ?? user.email?.split("@")[0] ?? "Usuario",
      email: user.email,
      role: ROLES.CUSTOMER,
      createdAt: new Date().toISOString(),
    });
  }
  return userCredential;
}

// Autentica con credencial de Google (id_token desde expo-auth-session)
export async function signInWithGoogle(idToken: string) {
  const credential = GoogleAuthProvider.credential(idToken);
  const userCredential = await signInWithCredential(auth, credential);
  const user = userCredential.user;

  // Crear perfil en RTDB si no existe
  const userRef = ref(rtdb, `users/${user.uid}`);
  const snap = await get(userRef);
  if (!snap.exists()) {
    await set(userRef, {
      name: user.displayName ?? user.email?.split("@")[0] ?? "Usuario",
      email: user.email,
      role: ROLES.CUSTOMER,
      createdAt: new Date().toISOString(),
    });
  }
  return userCredential;
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
