import { DeliveryMode } from "@/src/services/pedidos-rtdb";
import { createContext, ReactNode, useContext, useState } from "react";

export interface PendingDelivery {
  deliveryMode: DeliveryMode;
  sucursalId: string;
  address: string;
  lat: number;
  lng: number;
  phone: string;
  notes: string;
}

interface DeliveryContextType {
  pending: PendingDelivery | null;
  setPending: (data: PendingDelivery) => void;
  clearPending: () => void;
}

const DeliveryContext = createContext<DeliveryContextType | undefined>(
  undefined,
);

// Provee el contexto de delivery a los hijos
export function DeliveryProvider({ children }: { children: ReactNode }) {
  const [pending, setPendingState] = useState<PendingDelivery | null>(null);

  // Establece los datos del delivery pendiente
  const setPending = (data: PendingDelivery) => setPendingState(data);
  // Limpia los datos del delivery pendiente
  const clearPending = () => setPendingState(null);

  return (
    <DeliveryContext.Provider value={{ pending, setPending, clearPending }}>
      {children}
    </DeliveryContext.Provider>
  );
}

// Consume el contexto de delivery de forma segura
export function useDelivery() {
  const context = useContext(DeliveryContext);
  if (!context) {
    throw new Error("useDelivery must be used within DeliveryProvider");
  }
  return context;
}
