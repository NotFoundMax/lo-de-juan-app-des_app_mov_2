import LoadingSpinner from "@/src/components/LoadingSpinner";
import {
    deleteMaterial,
    getMateriales,
    Material,
    MATERIAL_CONFIG,
} from "@/src/services/capacitacion-rtdb";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
    Alert,
    FlatList,
    Linking,
    RefreshControl,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

// Lista de materiales de capacitación (admin)
export default function AdminCapacitacionScreen() {
  const [materiales, setMateriales] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Carga todos los materiales de capacitación
  const load = async () => {
    try {
      const data = await getMateriales();
      setMateriales(data);
    } catch (e) {
      console.error("Error loading admin training:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    load();
  }, []);

  // Confirma la eliminación del material
  const handleDelete = (id: string, title: string) => {
    Alert.alert("Eliminar", `¿Eliminar "${title}"?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          await deleteMaterial(id);
          load();
        },
      },
    ]);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <View className="flex-1 bg-surface">
      <FlatList
        data={materiales}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load();
            }}
          />
        }
        ListEmptyComponent={
          <Text className="text-center text-text-secondary mt-10">
            No hay materiales
          </Text>
        }
        renderItem={({ item }) => {
          const config = MATERIAL_CONFIG[item.type];
          return (
            <View className="bg-surface-hover rounded-xl p-4 mb-3 border border-border">
              <View className="flex-row items-start">
                <View
                  className="w-12 h-12 rounded-xl justify-center items-center mr-3"
                  style={{ backgroundColor: `${config.color}15` }}
                >
                  <Text className="text-2xl">{config.icon}</Text>
                </View>
                <View className="flex-1 mr-2">
                  <Text className="text-h3 text-text-primary">
                    {item.title}
                  </Text>
                  <Text
                    className="text-caption text-text-secondary mt-1"
                    numberOfLines={2}
                  >
                    {item.description}
                  </Text>
                  <View className="flex-row items-center mt-2 gap-2">
                    <View
                      className="px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: `${config.color}15` }}
                    >
                      <Text
                        className="text-small font-bold"
                        style={{ color: config.color }}
                      >
                        {config.label}
                      </Text>
                    </View>
                    {item.url && (
                      <TouchableOpacity
                        onPress={() => Linking.openURL(item.url)}
                      >
                        <Text className="text-small text-primary">Abrir</Text>
                      </TouchableOpacity>
                    )}
                    <Text className="text-small text-text-muted">
                      {item.active ? "Activo" : "Inactivo"}
                    </Text>
                  </View>
                </View>
                <View className="flex-row gap-2">
                  <TouchableOpacity
                    onPress={() =>
                      router.push({
                        pathname: "/(tabs)/admin/capacitacion-form",
                        params: { id: item.id },
                      })
                    }
                  >
                    <Ionicons name="create-outline" size={20} color="#f84d3f" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDelete(item.id, item.title)}
                  >
                    <Ionicons name="trash-outline" size={20} color="#dc2626" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        }}
      />
      <TouchableOpacity
        className="bg-primary py-3 mx-4 mb-4 rounded-xl items-center"
        onPress={() => router.push("/(tabs)/admin/capacitacion-form")}
      >
        <Text className="text-subtitle text-text-inverse">
          + Nuevo Material
        </Text>
      </TouchableOpacity>
    </View>
  );
}
