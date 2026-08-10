import type { PaymentMethod } from "@/src/services/pedidos-rtdb";
import {
  ActivityIndicator,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface Props {
  visible: boolean;
  mesaLabel: string;
  total: number;
  paymentMethod: PaymentMethod;
  onPaymentMethodChange: (method: PaymentMethod) => void;
  processing: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const METHODS: { id: PaymentMethod; label: string; icon: string }[] = [
  { id: "efectivo", label: "Efectivo", icon: "💵" },
  { id: "yape", label: "Yape", icon: "📱" },
  { id: "tarjeta", label: "Tarjeta", icon: "💳" },
];

// Modal para cobrar una mesa activa
export default function ChargeModal({
  visible,
  mesaLabel,
  total,
  paymentMethod,
  onPaymentMethodChange,
  processing,
  onClose,
  onConfirm,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 bg-black/50 justify-center px-4">
        <View className="bg-white rounded-2xl p-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-h3 text-text-primary">
              Cobrar {mesaLabel}
            </Text>
            <TouchableOpacity onPress={onClose} disabled={processing}>
              <Text className="text-body text-text-muted">✕</Text>
            </TouchableOpacity>
          </View>

          <Text className="text-h2 text-text-primary mb-1">
            Saldo a cobrar
          </Text>
          <Text className="text-h1 text-primary font-bold mb-6">
            S/. {total.toFixed(2)}
          </Text>

          <Text className="text-caption text-text-muted mb-2">
            Método de pago
          </Text>
          <View className="flex-row gap-2 mb-4">
            {METHODS.map((m) => {
              const active = paymentMethod === m.id;
              return (
                <TouchableOpacity
                  key={m.id}
                  onPress={() => onPaymentMethodChange(m.id)}
                  disabled={processing}
                  className="flex-1 py-3 rounded-xl items-center"
                  style={{
                    backgroundColor: active ? "#f84d3f" : "#f5f5f5",
                  }}
                >
                  <Text className="text-xl mb-1">{m.icon}</Text>
                  <Text
                    className="text-small font-bold"
                    style={{ color: active ? "#ffffff" : "#666666" }}
                  >
                    {m.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {paymentMethod === "yape" && (
            <View className="bg-warning-light rounded-xl px-3 py-2 mb-4">
              <Text className="text-small text-text-secondary">
                El pago quedará en estado pendiente hasta confirmar el Yape en
                Pedidos.
              </Text>
            </View>
          )}

          <TouchableOpacity
            onPress={onConfirm}
            disabled={processing}
            className="bg-primary py-3 rounded-xl items-center"
            style={{ opacity: processing ? 0.5 : 1 }}
          >
            {processing ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-body-bold text-white">
                Cobrar S/. {total.toFixed(2)}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
