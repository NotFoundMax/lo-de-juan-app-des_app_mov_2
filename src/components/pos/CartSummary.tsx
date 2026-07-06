import type { PaymentMethod } from "@/src/services/pedidos-rtdb";
import { Text, TouchableOpacity, View } from "react-native";

interface Props {
  total: number;
  itemCount: number;
  paymentMethod: PaymentMethod;
  onPaymentMethodChange: (method: PaymentMethod) => void;
  onCheckout: () => void;
}

const METHODS: PaymentMethod[] = ["efectivo", "yape", "tarjeta"];

const METHOD_LABELS: Record<PaymentMethod, string> = {
  efectivo: "Efectivo",
  yape: "Yape",
  tarjeta: "Tarjeta",
};

// Renderiza el pie de resumen del carrito
export default function CartSummary({
  total,
  itemCount,
  paymentMethod,
  onPaymentMethodChange,
  onCheckout,
}: Props) {
  return (
    <View className="px-4 py-3 border-t border-border/50">
      <Text className="text-caption text-text-muted mb-2">Método de pago</Text>

      <View className="flex-row gap-2 mb-3">
        {METHODS.map((method) => (
          <TouchableOpacity
            key={method}
            onPress={() => onPaymentMethodChange(method)}
            className={`flex-1 py-2 rounded-lg border ${
              paymentMethod === method
                ? "bg-primary border-primary"
                : "bg-white border-border"
            }`}
          >
            <Text
              className={`text-center text-caption font-semibold ${
                paymentMethod === method ? "text-white" : "text-text-secondary"
              }`}
            >
              {METHOD_LABELS[method]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-body text-text-muted">
          {itemCount} {itemCount === 1 ? "producto" : "productos"}
        </Text>
        <Text className="text-h3 text-text-primary font-bold">
          S/. {total.toFixed(2)}
        </Text>
      </View>

      <TouchableOpacity
        onPress={onCheckout}
        disabled={itemCount === 0}
        className={`py-3 rounded-xl ${
          itemCount === 0 ? "bg-muted" : "bg-primary"
        }`}
      >
        <Text className="text-center text-body-bold text-white">
          {itemCount === 0 ? "Carrito vacío" : `Cobrar S/. ${total.toFixed(2)}`}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
