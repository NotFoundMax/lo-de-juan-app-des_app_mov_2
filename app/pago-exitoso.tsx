import { useAuth } from "@/src/contexts/AuthContext";
import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

// Pantalla de confirmación de pago exitoso
export default function ExitosoScreen() {
  const { isCustomer } = useAuth();

  return (
    <View className="flex-1 bg-white justify-center items-center px-8">
      <View className="w-20 h-20 bg-success rounded-full justify-center items-center mb-6">
        <Text className="text-4xl">✓</Text>
      </View>

      <Text className="text-h2 text-text-primary text-center mb-2">
        ¡Pedido confirmado!
      </Text>
      <Text className="text-body text-text-secondary text-center mb-8">
        Tu pedido fue registrado. En unos minutos empezamos a prepararlo.
      </Text>

      <View className="w-full bg-success-light rounded-xl p-4 mb-8">
        <Text className="text-caption font-bold text-success text-center">
          Puedes ver el estado de tu pedido desde la pantalla Pedidos
        </Text>
      </View>

      <TouchableOpacity
        onPress={() =>
          router.replace(
            isCustomer ? "/(tabs)/pedidosCustomer" : "/(tabs)/pedidosAdmin",
          )
        }
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
