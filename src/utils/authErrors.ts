// Mapeo de códigos de error de Firebase Auth a mensajes claros para el usuario.
const AUTH_ERROR_MESSAGES: Record<string, string> = {
  "auth/invalid-credential": "Usuario o contraseña incorrectos",
  "auth/invalid-email": "El correo electrónico no es válido",
  "auth/user-not-found": "No existe una cuenta con ese correo",
  "auth/wrong-password": "Contraseña incorrecta",
  "auth/too-many-requests":
    "Demasiados intentos. Esperá un momento y probá de nuevo",
  "auth/network-request-failed":
    "Sin conexión a internet. Comprobá tu red e intentá de nuevo",
  "auth/email-already-in-use": "Ese correo ya está registrado",
  "auth/weak-password": "La contraseña debe tener al menos 6 caracteres",
  "auth/popup-closed-by-user": "Cancelaste el inicio de sesión con Google",
  "auth/cancelled-popup-request": "Cancelaste el inicio de sesión con Google",
  "auth/popup-blocked":
    "El navegador bloqueó la ventana de Google. Permití las ventanas emergentes e intentá de nuevo",
  "auth/unauthorized-continue-uri":
    "Error de autenticación. Volvé a intentar",
  "auth/account-exists-with-different-credential":
    "Ese correo ya está registrado con otro método",
  "auth/operation-not-allowed":
    "Este método de inicio de sesión está deshabilitado",
};

function extractCode(error: unknown): string | null {
  if (error instanceof Error) {
    const raw = (error as Error & { code?: string }).code;
    if (typeof raw === "string") return raw;
    const match = error.message.match(/auth\/[\w-]+/);
    if (match) return match[0];
  }
  return null;
}

// Devuelve un mensaje amigable para errores de Firebase Auth
export function getAuthErrorMessage(error: unknown): string {
  const code = extractCode(error);
  if (code && AUTH_ERROR_MESSAGES[code]) {
    return AUTH_ERROR_MESSAGES[code];
  }
  return "Ocurrió un error inesperado. Intentá de nuevo";
}
