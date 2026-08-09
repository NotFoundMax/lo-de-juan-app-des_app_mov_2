import LoadingSpinner from "@/src/components/LoadingSpinner";
import {
    Order,
    subscribeToOrderById,
} from "@/src/services/pedidos-rtdb";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

// Pantalla de pago con Yape en espera de confirmación del local
export default function PagoPendienteScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);

  // Sigue el pedido en tiempo real hasta que el local confirme el pago
  useEffect(() => {
    if (!orderId) return;
    const unsubscribe = subscribeToOrderById(orderId, setOrder);
    return unsubscribe;
  }, [orderId]);

  if (!order) {
    return <LoadingSpinner />;
  }

  // El local rechazó el pago
  if (order.status === "cancelled") {
    return (
      <View className="flex-1 bg-white justify-center items-center px-8">
        <View className="w-20 h-20 bg-error-light rounded-full justify-center items-center mb-6">
          <Text className="text-4xl">✕</Text>
        </View>
        <Text className="text-h2 text-text-primary text-center mb-2">
          Pedido cancelado
        </Text>
        <Text className="text-body text-text-secondary text-center mb-8">
          El local no pudo confirmar tu pago con Yape. Si ya realizaste el
          pago, contáctate con el local para resolverlo.
        </Text>
        <TouchableOpacity
          onPress={() => router.replace("/(tabs)")}
          className="bg-primary py-4 rounded-xl items-center w-full active:opacity-70"
        >
          <Text className="text-text-inverse text-body-bold">
            Volver al inicio
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // El pago aún no fue confirmado
  const isPending = order.paymentStatus === "pending";

  if (isPending) {
    return (
      <View className="flex-1 bg-white justify-center items-center px-8">
        <View className="w-20 h-20 bg-warning-light rounded-full justify-center items-center mb-6">
          <ActivityIndicator size="large" color="#ffb804" />
        </View>
        <Text className="text-h2 text-text-primary text-center mb-2">
          Pedido pendiente de confirmación
        </Text>
        <Text className="text-body text-text-secondary text-center mb-8">
          Ya registramos tu pago con Yape. El local está verificando el
          pago y lo confirmará en breve. Te avisamos apenas esté listo.
        </Text>
        <View className="w-full bg-warning-light rounded-xl p-4 mb-8">
          <Text className="text-caption font-bold text-warning text-center">
            No cierres esta pantalla, se actualiza sola
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.replace("/(tabs)")}
          className="py-3 items-center"
        >
          <Text className="text-body text-text-secondary underline">
            Seguir mirando el catálogo
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Pago confirmado
  return (
    <View className="flex-1 bg-white justify-center items-center px-8">
      <View className="w-20 h-20 bg-success rounded-full justify-center items-center mb-6">
        <Text className="text-4xl">✓</Text>
      </View>
      <Text className="text-h2 text-text-primary text-center mb-2">
        ¡Pago confirmado!
      </Text>
      <Text className="text-body text-text-secondary text-center mb-8">
        El local confirmó tu pago con Yape. En unos minutos empezamos a
        prepararlo.
      </Text>
      <View className="w-full bg-success-light rounded-xl p-4 mb-8">
        <Text className="text-caption font-bold text-success text-center">
          Puedes ver el estado de tu pedido desde la pantalla Pedidos
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => router.replace("/(tabs)/pedidosCustomer")}
        className="bg-primary py-4 rounded-xl items-center w-full mb-3 active:opacity-70"
      >
        <Text className="text-text-inverse text-body-bold">
          Ver mis pedidos
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => router.replace("/(tabs)")}
        className="py-3 items-center"
      >
        <Text className="text-body text-text-secondary underline">
          Seguir comprando
        </Text>
      </TouchableOpacity>
    </View>
  );
}
