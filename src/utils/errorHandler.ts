import { Alert } from "react-native";

// Registra error y muestra alerta al usuario
export function showError(e: unknown, context?: string): void {
  const msg = e instanceof Error ? e.message : "Ocurrió un error inesperado";
  console.error(context ? `[${context}]` : "", e);
  Alert.alert("Error", msg);
}
