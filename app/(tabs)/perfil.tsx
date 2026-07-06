import { useAuth } from "@/src/contexts/AuthContext";
import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

// User profile with logout
export default function PerfilScreen() {
  const { user, role, logout } = useAuth();

  // Cierra sesión y redirige al login
  const handleLogout = async () => {
    await logout();
    router.replace("/(auth)/login");
  };

  return (
    <View className="flex-1 bg-white justify-center items-center px-8">
      <View className="w-24 h-24 bg-secondary rounded-full justify-center items-center mb-4">
        <Text className="text-h1 text-text-inverse">
          {user?.email?.charAt(0).toUpperCase()}
        </Text>
      </View>
      <Text className="text-h3 text-text-primary">{user?.email}</Text>
      <Text className="text-body text-text-secondary mt-1 capitalize">
        {role}
      </Text>

      <TouchableOpacity
        className="bg-primary py-3 px-8 rounded-xl mt-8"
        onPress={handleLogout}
      >
        <Text className="text-subtitle text-text-inverse">Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
}
