import { useAuth } from "@/src/contexts/AuthContext";
import { useCarrito } from "@/src/contexts/CarritoContext";
import { useDelivery } from "@/src/contexts/DeliveryContext";
import { createOrder } from "@/src/services/pedidos-rtdb";
import { saveUserAddress } from "@/src/services/usuarios-rtdb";
import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system/legacy";
import { router } from "expo-router";
import * as Sharing from "expo-sharing";
import { useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Platform,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Pantalla de pago con Yape
export default function YapeScreen() {
  const { items, clearCart, total } = useCarrito();
  const { user } = useAuth();
  const { bottom, top } = useSafeAreaInsets();
  const { pending, clearPending } = useDelivery();
  const [processing, setProcessing] = useState(false);
  const [saving, setSaving] = useState(false);
  const lastTap = useRef<number>(0);

  const deliveryFee = pending?.deliveryMode === "delivery" ? 5 : 0;
  const grandTotal = total + deliveryFee;

  // Comparte la imagen del código QR
  const saveQRToGallery = async () => {
    try {
      setSaving(true);

      const [{ localUri }] = await Asset.loadAsync(
        require("@/assets/images/qr-code.png"),
      );

      const fileUri = FileSystem.cacheDirectory + "qr-yape.png";
      await FileSystem.copyAsync({ from: localUri, to: fileUri });

      await Sharing.shareAsync(fileUri, {
        mimeType: "image/png",
        dialogTitle: "Guardar código QR de Yape",
      });
    } catch {
      if (e?.message?.includes("User did not share")) return;
      console.error("Error guardando QR:", e);
      Alert.alert("Error", "No se pudo compartir la imagen.");
    } finally {
      setSaving(false);
    }
  };

  // Detecta el doble toque para compartir el QR
  const handleDoubleTap = () => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      saveQRToGallery();
    }
    lastTap.current = now;
  };

  // Procesa el pedido tras confirmar el pago con Yape
  const handleYaPague = async () => {
    if (!pending) {
      Alert.alert("Error", "Faltan datos de entrega. Vuelve al carrito.");
      return;
    }

    setProcessing(true);
    await new Promise((r) => setTimeout(r, 1500));

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
        paymentMethod: "yape",
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
        <Text className="text-h2 text-text-inverse">Paga con Yape</Text>
      </View>

      <View className="flex-1 justify-center items-center px-6">
        <TouchableOpacity
          onPress={handleDoubleTap}
          activeOpacity={0.7}
          className="mb-6"
        >
          <View className="w-48 h-48 rounded-xl border-2 border-border justify-center items-center overflow-hidden">
            {saving ? (
              <ActivityIndicator size="large" color="#f84d3f" />
            ) : (
              <Image
                source={require("@/assets/images/qr-code.png")}
                className="w-full h-full"
                resizeMode="contain"
              />
            )}
          </View>
          <Text className="text-caption text-text-muted text-center mt-2">
            Doble toque para compartir el QR
          </Text>
        </TouchableOpacity>

        <Text className="text-label text-text-primary mb-4">
          Escanea el QR desde tu app Yape
        </Text>

        <View className="w-full bg-surface-hover rounded-xl p-4 mb-6">
          <Text className="text-body-bold text-text-primary mb-3">
            Instrucciones:
          </Text>
          {[
            "Abre Yape en tu celular",
            "Toca 'Pagar con código QR'",
            "Escanea el código de arriba",
            `Verifica el monto: S/.${grandTotal.toFixed(2)}`,
            "Confirma el pago",
            "Regresa y toca 'Ya pagué'",
          ].map((step, i) => (
            <View key={i} className="flex-row items-start mb-2">
              <View className="w-6 h-6 bg-primary rounded-full justify-center items-center mr-3 mt-0.5">
                <Text className="text-text-inverse text-small font-bold">
                  {i + 1}
                </Text>
              </View>
              <Text className="text-body text-text-primary flex-1">{step}</Text>
            </View>
          ))}
        </View>
      </View>

      <View
        className="px-6 py-4 border-t border-border"
        style={{ paddingBottom: Platform.OS === "android" ? bottom + 8 : 16 }}
      >
        <TouchableOpacity
          onPress={handleYaPague}
          disabled={processing}
          className="bg-primary py-4 rounded-xl items-center active:opacity-70 mb-3"
        >
          {processing ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text className="text-text-inverse text-body-bold">
              Ya pagué — S/.{grandTotal.toFixed(2)}
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
