import { Stack } from "expo-router";

// Navegador stack del panel admin
export default function AdminLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#f84d3f" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "bold" },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Admin" }} />
      <Stack.Screen name="productos" options={{ title: "Productos" }} />
      <Stack.Screen
        name="producto-form"
        options={{ title: "Nuevo Producto" }}
      />
      <Stack.Screen name="categorias" options={{ title: "Categorías" }} />
      <Stack.Screen
        name="categoria-form"
        options={{ title: "Nueva Categoría" }}
      />
      <Stack.Screen name="capacitacion" options={{ title: "Capacitación" }} />
      <Stack.Screen
        name="capacitacion-form"
        options={{ title: "Nuevo Material" }}
      />
      <Stack.Screen name="usuarios" options={{ title: "Usuarios" }} />
    </Stack>
  );
}
