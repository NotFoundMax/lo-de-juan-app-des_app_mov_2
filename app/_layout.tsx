import { AuthProvider } from "@/src/contexts/AuthContext";
import { CarritoProvider } from "@/src/contexts/CarritoContext";
import { DeliveryProvider } from "@/src/contexts/DeliveryContext";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import "../global.css";

export const unstable_settings = {
  anchor: "(tabs)",
};

// Layout raíz con los providers
export default function RootLayout() {
  return (
    <AuthProvider>
      <CarritoProvider>
        <DeliveryProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="carrito" options={{ presentation: "modal" }} />
            <Stack.Screen name="pago-yape" options={{ headerShown: false }} />
            <Stack.Screen
              name="pago-tarjeta"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="pago-exitoso"
              options={{ headerShown: false }}
            />
          </Stack>
          <StatusBar style="auto" />
        </DeliveryProvider>
      </CarritoProvider>
    </AuthProvider>
  );
}
