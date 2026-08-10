import { showDialog } from "@/src/components/dialogs/DialogProvider";
import { getAuthErrorMessage } from "./authErrors";

// Muestra alerta informativa cross-platform
export function showAlert(title: string, message?: string): void {
  showDialog({ title, message, type: "alert" });
}

// Muestra confirmación con botones Cancelar/Acción cross-platform
export function showConfirm(
  title: string,
  message: string,
  onConfirm: () => void,
  onCancel?: () => void,
  opts?: {
    confirmLabel?: string;
    cancelLabel?: string;
    destructive?: boolean;
  },
): void {
  showDialog({
    title,
    message,
    type: "confirm",
    confirmLabel: opts?.confirmLabel,
    cancelLabel: opts?.cancelLabel,
    destructive: opts?.destructive,
    onConfirm,
    onCancel,
  });
}

// Registra error y muestra alerta al usuario
export function showError(e: unknown, context?: string): void {
  const msg = e instanceof Error ? e.message : "Ocurrió un error inesperado";
  console.error(context ? `[${context}]` : "", e);
  showAlert("Error", msg);
}

// Muestra el error con mensaje amigable para flujos de autenticación
export function showAuthError(e: unknown, context?: string): void {
  console.error(context ? `[${context}]` : "", e);
  showAlert("Error", getAuthErrorMessage(e));
}
