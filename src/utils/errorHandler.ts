import { Alert } from "react-native";
import { getAuthErrorMessage } from "./authErrors";

// Registra error y muestra alerta al usuario
export function showError(e: unknown, context?: string): void {
  const msg = e instanceof Error ? e.message : "Ocurrió un error inesperado";
  console.error(context ? `[${context}]` : "", e);
  Alert.alert("Error", msg);
}

// Muestra el error con mensaje amigable para flujos de autenticación
export function showAuthError(e: unknown, context?: string): void {
  console.error(context ? `[${context}]` : "", e);
  Alert.alert("Error", getAuthErrorMessage(e));
}
