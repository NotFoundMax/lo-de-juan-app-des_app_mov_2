import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import AppDialog, { type DialogOptions } from "./AppDialog";

// Referencia global para API imperativa (patrón singleton, como react-native-toast-message)
let showDialogFn: ((options: DialogOptions) => void) | null = null;

const DialogContext = createContext<{
  show: (options: DialogOptions) => void;
} | null>(null);

// API imperativa usada por showAlert/showConfirm/showError
export function showDialog(options: DialogOptions): void {
  if (showDialogFn) showDialogFn(options);
}

// Hook para componentes que necesiten el diálogo directamente
export function useDialog(): { show: (options: DialogOptions) => void } {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error("useDialog debe usarse dentro de DialogProvider");
  return ctx;
}

// Provee el diálogo cross-platform y lo expone como singleton
export default function DialogProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [options, setOptions] = useState<DialogOptions | null>(null);

  const show = useCallback((opts: DialogOptions) => {
    setOptions(opts);
  }, []);

  showDialogFn = show;

  const handleClose = useCallback(() => {
    setOptions(null);
  }, []);

  return (
    <DialogContext.Provider value={{ show }}>
      {children}
      <AppDialog options={options} onClose={handleClose} />
    </DialogContext.Provider>
  );
}
