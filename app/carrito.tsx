import DeliveryModal, { DeliveryInfo } from "@/src/components/DeliveryModal";
import { useCarrito } from "@/src/contexts/CarritoContext";
import { useDelivery } from "@/src/contexts/DeliveryContext";
import { sucursales } from "@/src/data/sucursales";
import { PaymentMethod } from "@/src/services/pedidos-rtdb";
import { router } from "expo-router";
import { useState } from "react";
import {
    Alert,
    FlatList,
    Platform,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const PAYMENT_OPTIONS: { key: PaymentMethod; label: string; icon: string }[] = [
  { key: "yape", label: "Yape", icon: "📱" },
  { key: "tarjeta", label: "Tarjeta", icon: "💳" },
];

// Pantalla del carrito con opciones de pago
export default function CartScreen() {
  const { items, updateQuantity, clearCart, total } = useCarrito();
  const { bottom, top } = useSafeAreaInsets();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(
    null,
  );
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo | null>(null);
  const { setPending } = useDelivery();

  const deliveryFee = deliveryInfo?.mode === "delivery" ? 5 : 0;
  const grandTotal = total + deliveryFee;

  // Formatea el texto resumen del delivery
  const getDeliverySummary = () => {
    if (!deliveryInfo) return null;
    if (deliveryInfo.mode === "recoger") {
      const suc = sucursales.find((s) => s.id === deliveryInfo.sucursalId);
      return suc ? `🏪 ${suc.name}` : "🏪 Recoger en tienda";
    }
    const addr = deliveryInfo.address ?? "";
    const short = addr.length > 40 ? addr.substring(0, 40) + "..." : addr;
    return `🛵 ${short}`;
  };

  // Valida y lanza el proceso de pago
  const handlePagar = () => {
    if (items.length === 0) return;
    if (!paymentMethod) {
      Alert.alert("Selecciona un método de pago");
      return;
    }
    setShowDeliveryModal(true);
  };

  // Confirma el delivery y navega al pago
  const handleDeliveryConfirm = (info: DeliveryInfo) => {
    setDeliveryInfo(info);
    setShowDeliveryModal(false);

    setPending({
      deliveryMode: info.mode,
      sucursalId: info.sucursalId ?? "",
      address: info.address ?? "",
      lat: info.lat ?? 0,
      lng: info.lng ?? 0,
      phone: info.phone ?? "",
      notes: info.notes ?? "",
    });

    if (paymentMethod === "yape") {
      router.push("/pago-yape");
    } else {
      router.push("/pago-tarjeta");
    }
  };

  return (
    <View className="flex-1 bg-white">
      <View className="bg-primary pb-6 px-6" style={{ paddingTop: top + 24 }}>
        <View className="flex-row justify-between items-center">
          <Text className="text-h2 text-text-inverse">Tu Carrito</Text>
          {items.length > 0 && (
            <TouchableOpacity onPress={clearCart}>
              <Text className="text-caption text-text-inverse underline">
                Vaciar
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {items.length === 0 ? (
        <View className="flex-1 justify-center items-center px-6">
          <Text className="text-5xl mb-4">🛒</Text>
          <Text className="text-subtitle text-text-secondary text-center">
            Tu carrito está vacío
          </Text>
          <Text className="text-body text-text-muted text-center mt-2">
            Agrega productos desde el catálogo
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-primary mt-6 py-3 px-8 rounded-xl"
          >
            <Text className="text-text-inverse text-body-bold">
              Ir al catálogo
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={items}
            keyExtractor={(item) => item.productId}
            contentContainerStyle={{ padding: 16 }}
            renderItem={({ item }) => (
              <View className="flex-row items-center bg-surface-hover rounded-xl p-3 mb-2 border border-border">
                <View className="flex-1">
                  <Text className="text-body-bold text-text-primary">
                    {item.name}
                  </Text>
                  <Text className="text-caption text-text-muted">
                    S/.{item.price.toFixed(2)} c/u
                  </Text>
                  <Text className="text-body-bold text-primary mt-1">
                    S/.{(item.price * item.quantity).toFixed(2)}
                  </Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <TouchableOpacity
                    onPress={() =>
                      updateQuantity(item.productId, item.quantity - 1)
                    }
                    style={{ width: 32, height: 32, borderRadius: 16 }}
                    className="bg-light-gray justify-center items-center active:opacity-70"
                  >
                    <Text className="text-body-bold text-text-primary leading-none">
                      −
                    </Text>
                  </TouchableOpacity>
                  <Text className="w-7 text-center text-body-bold text-text-primary">
                    {item.quantity}
                  </Text>
                  <TouchableOpacity
                    onPress={() =>
                      updateQuantity(item.productId, item.quantity + 1)
                    }
                    style={{ width: 32, height: 32, borderRadius: 16 }}
                    className="bg-primary justify-center items-center active:opacity-70"
                  >
                    <Text className="text-text-inverse text-body-bold leading-none">
                      +
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />

          <View className="px-6 py-3 border-t border-border">
            <Text className="text-label text-text-primary mb-3">
              Método de pago
            </Text>
            <View className="flex-row gap-3">
              {PAYMENT_OPTIONS.map((opt) => {
                const selected = paymentMethod === opt.key;
                return (
                  <TouchableOpacity
                    key={opt.key}
                    onPress={() => setPaymentMethod(opt.key)}
                    className="flex-1 py-3 rounded-xl items-center border"
                    style={{
                      backgroundColor: selected ? "#f84d3f" : "#fafafa",
                      borderColor: selected ? "#f84d3f" : "#e0e0e0",
                    }}
                  >
                    <Text className="text-xl mb-1">{opt.icon}</Text>
                    <Text
                      className="text-caption font-bold"
                      style={{
                        color: selected ? "#ffffff" : "#212020",
                      }}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {deliveryInfo && (
              <TouchableOpacity
                onPress={() => setShowDeliveryModal(true)}
                className="mt-3 flex-row items-center bg-surface-hover rounded-xl px-4 py-3 border border-border"
              >
                <Text className="text-caption text-text-muted flex-1">
                  {getDeliverySummary()}
                </Text>
                <Text className="text-caption text-primary font-bold">
                  Cambiar
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <View
            className="border-t border-border px-6 py-4"
            style={{
              paddingBottom: Platform.OS === "android" ? bottom + 8 : 16,
            }}
          >
            <View className="flex-row justify-between items-center mb-1">
              <Text className="text-body text-text-secondary">Subtotal</Text>
              <Text className="text-body text-text-primary">
                S/.{total.toFixed(2)}
              </Text>
            </View>
            {deliveryFee > 0 && (
              <View className="flex-row justify-between items-center mb-1">
                <Text className="text-body text-text-secondary">Delivery</Text>
                <Text className="text-body text-primary">
                  S/.{deliveryFee.toFixed(2)}
                </Text>
              </View>
            )}
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-subtitle text-text-primary">Total</Text>
              <Text className="text-h3 text-primary">
                S/.{grandTotal.toFixed(2)}
              </Text>
            </View>
            <TouchableOpacity
              onPress={handlePagar}
              className="bg-primary py-4 rounded-xl items-center active:opacity-70"
            >
              <Text className="text-text-inverse text-body-bold">
                Pagar S/.{grandTotal.toFixed(2)}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      <DeliveryModal
        visible={showDeliveryModal}
        onClose={() => setShowDeliveryModal(false)}
        onConfirm={handleDeliveryConfirm}
        total={total}
      />
    </View>
  );
}
