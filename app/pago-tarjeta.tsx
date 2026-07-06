import { useAuth } from "@/src/contexts/AuthContext";
import { useCarrito } from "@/src/contexts/CarritoContext";
import { useDelivery } from "@/src/contexts/DeliveryContext";
import { createOrder } from "@/src/services/pedidos-rtdb";
import { saveUserAddress } from "@/src/services/usuarios-rtdb";
import { router } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type CardType = "debito" | "credito";

// Pantalla de pago simulado con tarjeta (nunca transmite PAN/CVV)
export default function TarjetaScreen() {
  const { items, clearCart, total } = useCarrito();
  const { user } = useAuth();
  const { bottom, top } = useSafeAreaInsets();
  const { pending, clearPending } = useDelivery();
  const [cardType, setCardType] = useState<CardType>("debito");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [processing, setProcessing] = useState(false);

  const deliveryFee = pending?.deliveryMode === "delivery" ? 5 : 0;
  const grandTotal = total + deliveryFee;

  // Formatea el número de tarjeta mientras se escribe
  const formatCardNumber = (text: string) => {
    const digits = text.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
  };

  // Formatea la fecha de vencimiento mientras se escribe
  const formatExpiry = (text: string) => {
    const digits = text.replace(/\D/g, "").slice(0, 4);
    if (digits.length > 2) {
      return digits.slice(0, 2) + "/" + digits.slice(2);
    }
    return digits;
  };

  // Valida y procesa el pago con tarjeta
  const handlePagar = async () => {
    if (!pending) {
      Alert.alert("Error", "Faltan datos de entrega. Vuelve al carrito.");
      return;
    }
    if (
      !cardNumber.trim() ||
      !expiry.trim() ||
      !cvv.trim() ||
      !cardName.trim()
    ) {
      Alert.alert("Completa todos los campos de la tarjeta");
      return;
    }
    const digits = cardNumber.replace(/\s/g, "");
    if (digits.length < 16) {
      Alert.alert("Número de tarjeta inválido");
      return;
    }
    if (cvv.length < 3) {
      Alert.alert("Código de seguridad inválido");
      return;
    }

    setProcessing(true);
    await new Promise((r) => setTimeout(r, 2000));

    try {
      await createOrder({
        customerId: user?.uid ?? null,
        customerName: user?.email?.split("@")[0] ?? "Cliente",
        items: items.map((i) => ({
          productId: i.productId,
          name: i.name,
          quantity: i.quantity,
          unitPrice: i.price,
          subtotal: i.price * i.quantity,
        })),
        total: grandTotal,
        status: "pending",
        type: "online",
        paymentMethod: "tarjeta",
        deliveryMode: pending.deliveryMode,
        sucursalId: pending.sucursalId || undefined,
        deliveryAddress: pending.address || undefined,
        deliveryLat: pending.lat || undefined,
        deliveryLng: pending.lng || undefined,
        deliveryPhone: pending.phone || undefined,
        deliveryNotes: pending.notes || undefined,
        paidAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      });

      if (user?.uid && pending.deliveryMode === "delivery" && pending.address) {
        await saveUserAddress(user.uid, {
          address: pending.address,
          lat: pending.lat,
          lng: pending.lng,
          phone: pending.phone,
          notes: pending.notes,
          isDefault: true,
        });
      }

      setCardNumber("");
      setExpiry("");
      setCvv("");
      setCardName("");
      clearCart();
      clearPending();
      router.replace("/pago-exitoso");
    } catch (e) {
      console.error("Error creando pedido:", e);
      Alert.alert("Error", "No se pudo procesar el pago. Intenta de nuevo.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <View className="bg-primary pb-6 px-6" style={{ paddingTop: top + 24 }}>
        <Text className="text-h2 text-text-inverse">Paga con Tarjeta</Text>
      </View>

      <ScrollView className="flex-1 px-6 pt-6">
        <View className="flex-row mb-6">
          <TouchableOpacity
            onPress={() => setCardType("debito")}
            className="flex-1 py-3 rounded-xl items-center border mr-2"
            style={{
              backgroundColor: cardType === "debito" ? "#f84d3f" : "#fafafa",
              borderColor: cardType === "debito" ? "#f84d3f" : "#e0e0e0",
            }}
          >
            <Text
              style={{ color: cardType === "debito" ? "#ffffff" : "#212020" }}
              className="text-body-bold"
            >
              Débito
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setCardType("credito")}
            className="flex-1 py-3 rounded-xl items-center border"
            style={{
              backgroundColor: cardType === "credito" ? "#f84d3f" : "#fafafa",
              borderColor: cardType === "credito" ? "#f84d3f" : "#e0e0e0",
            }}
          >
            <Text
              style={{ color: cardType === "credito" ? "#ffffff" : "#212020" }}
              className="text-body-bold"
            >
              Crédito
            </Text>
          </TouchableOpacity>
        </View>

        <Text className="text-label text-text-secondary mb-2">
          Nombre en la tarjeta
        </Text>
        <TextInput
          value={cardName}
          onChangeText={setCardName}
          placeholder="Juan Pérez"
          placeholderTextColor="#9e9e9e"
          className="bg-surface-hover border border-border rounded-xl px-4 py-3 mb-4 text-body text-text-primary"
        />

        <Text className="text-label text-text-secondary mb-2">
          Número de tarjeta
        </Text>
        <TextInput
          value={cardNumber}
          onChangeText={(t) => setCardNumber(formatCardNumber(t))}
          placeholder="1234 5678 9012 3456"
          placeholderTextColor="#9e9e9e"
          keyboardType="number-pad"
          maxLength={19}
          className="bg-surface-hover border border-border rounded-xl px-4 py-3 mb-4 text-body text-text-primary"
        />

        <View className="flex-row gap-4 mb-6">
          <View className="flex-1">
            <Text className="text-label text-text-secondary mb-2">
              Vencimiento
            </Text>
            <TextInput
              value={expiry}
              onChangeText={(t) => setExpiry(formatExpiry(t))}
              placeholder="MM/AA"
              placeholderTextColor="#9e9e9e"
              keyboardType="number-pad"
              maxLength={5}
              className="bg-surface-hover border border-border rounded-xl px-4 py-3 text-body text-text-primary"
            />
          </View>
          <View className="flex-1">
            <Text className="text-label text-text-secondary mb-2">CVV</Text>
            <TextInput
              value={cvv}
              onChangeText={(t) => setCvv(t.replace(/\D/g, "").slice(0, 4))}
              placeholder="123"
              placeholderTextColor="#9e9e9e"
              keyboardType="number-pad"
              maxLength={4}
              className="bg-surface-hover border border-border rounded-xl px-4 py-3 text-body text-text-primary"
            />
          </View>
        </View>
      </ScrollView>

      <View
        className="px-6 py-4 border-t border-border"
        style={{ paddingBottom: Platform.OS === "android" ? bottom + 8 : 16 }}
      >
        <TouchableOpacity
          onPress={handlePagar}
          disabled={processing}
          className="bg-primary py-4 rounded-xl items-center active:opacity-70 mb-3"
        >
          {processing ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text className="text-text-inverse text-body-bold">
              Pagar S/.{grandTotal.toFixed(2)}
            </Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.back()}
          className="py-3 items-center"
        >
          <Text className="text-body text-text-secondary underline">
            Volver al carrito
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
