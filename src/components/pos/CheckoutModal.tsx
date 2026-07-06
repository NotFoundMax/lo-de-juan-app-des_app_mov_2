import type { DeliveryMode, PaymentMethod } from "@/src/services/pedidos-rtdb";
import {
    ActivityIndicator,
    Modal,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { CartItemData } from "./CartItem";

interface Props {
  visible: boolean;
  cart: CartItemData[];
  total: number;
  paymentMethod: PaymentMethod;
  customerName: string;
  onCustomerNameChange: (name: string) => void;
  deliveryMode: DeliveryMode | null;
  onDeliveryModeChange: (mode: DeliveryMode | null) => void;
  tableNumber: string;
  onTableNumberChange: (num: string) => void;
  onConfirm: () => void;
  onClose: () => void;
  processing: boolean;
}

const METHOD_LABELS: Record<PaymentMethod, string> = {
  efectivo: "Efectivo",
  yape: "Yape",
  tarjeta: "Tarjeta",
};

// Renderiza el modal de confirmación de cobro
export default function CheckoutModal({
  visible,
  cart,
  total,
  paymentMethod,
  customerName,
  onCustomerNameChange,
  deliveryMode,
  onDeliveryModeChange,
  tableNumber,
  onTableNumberChange,
  onConfirm,
  onClose,
  processing,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 bg-black/50 justify-center px-4">
        <View className="bg-white rounded-2xl max-h-[80%]">
          <View className="flex-row items-center justify-between px-6 pt-6 pb-3">
            <Text className="text-h3 text-text-primary">Confirmar venta</Text>
            <TouchableOpacity onPress={onClose} disabled={processing}>
              <Text className="text-body text-text-muted">✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView className="px-6">
            <Text className="text-caption text-text-muted mb-1">
              Nombre del cliente (opcional)
            </Text>
            <TextInput
              className="border border-border rounded-xl px-4 py-3 text-body text-text-primary mb-4"
              placeholder="Mostrador"
              placeholderTextColor="#9e9e9e"
              value={customerName}
              onChangeText={onCustomerNameChange}
              editable={!processing}
            />

            <Text className="text-caption text-text-muted mb-1">
              Modo de entrega
            </Text>
            <View className="flex-row gap-2 mb-4">
              <TouchableOpacity
                onPress={() => {
                  onDeliveryModeChange(null);
                  onTableNumberChange("");
                }}
                className="flex-1 py-2 rounded-xl items-center"
                style={{
                  backgroundColor:
                    deliveryMode === null ? "#f84d3f" : "#f5f5f5",
                }}
              >
                <Text
                  className="text-small font-bold"
                  style={{
                    color: deliveryMode === null ? "#ffffff" : "#666666",
                  }}
                >
                  Mostrador
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => onDeliveryModeChange("mesa")}
                className="flex-1 py-2 rounded-xl items-center"
                style={{
                  backgroundColor:
                    deliveryMode === "mesa" ? "#f84d3f" : "#f5f5f5",
                }}
              >
                <Text
                  className="text-small font-bold"
                  style={{
                    color: deliveryMode === "mesa" ? "#ffffff" : "#666666",
                  }}
                >
                  🪑 Mesa
                </Text>
              </TouchableOpacity>
            </View>

            {deliveryMode === "mesa" && (
              <TextInput
                className="border border-border rounded-xl px-4 py-3 text-body text-text-primary mb-4"
                placeholder="N° de mesa"
                placeholderTextColor="#9e9e9e"
                value={tableNumber}
                onChangeText={onTableNumberChange}
                keyboardType="number-pad"
                editable={!processing}
              />
            )}

            <Text className="text-caption text-text-muted mb-2">Resumen</Text>
            {cart.map(({ product, quantity }) => (
              <View
                key={product.id}
                className="flex-row items-center justify-between py-2 border-b border-border/50"
              >
                <View className="flex-1">
                  <Text
                    className="text-body text-text-primary"
                    numberOfLines={1}
                  >
                    {product.name}
                  </Text>
                  <Text className="text-caption text-text-muted">
                    {quantity} × S/. {product.price.toFixed(2)}
                  </Text>
                </View>
                <Text className="text-body-bold text-text-primary">
                  S/. {(product.price * quantity).toFixed(2)}
                </Text>
              </View>
            ))}
          </ScrollView>

          <View className="px-6 py-4 border-t border-border">
            <View className="flex-row items-center justify-between mb-1">
              <Text className="text-body text-text-muted">Método de pago</Text>
              <Text className="text-body-bold text-text-primary">
                {METHOD_LABELS[paymentMethod]}
              </Text>
            </View>

            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-h3 text-text-primary">Total</Text>
              <Text className="text-h2 text-primary font-bold">
                S/. {total.toFixed(2)}
              </Text>
            </View>

            <TouchableOpacity
              onPress={onConfirm}
              disabled={processing}
              className="bg-primary py-3 rounded-xl items-center"
            >
              {processing ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-body-bold text-white">
                  Confirmar y cobrar
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
