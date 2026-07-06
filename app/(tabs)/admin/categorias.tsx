import LoadingSpinner from "@/src/components/LoadingSpinner";
import {
    Categoria,
    deleteCategoria,
    getCategorias,
} from "@/src/services/categorias-rtdb";
import { showError } from "@/src/utils/errorHandler";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
    Alert,
    FlatList,
    Image,
    RefreshControl,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

// Categories management list
export default function CategoriasScreen() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Carga la lista de categorías
  const load = async () => {
    try {
      const data = await getCategorias();
      setCategorias(data);
    } catch (e) {
      showError(e, "categorias");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    load();
  }, []);

  // Confirma la eliminación de la categoría
  const handleDelete = (id: string, name: string) => {
    Alert.alert("Eliminar", `¿Eliminar categoría "${name}"?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          await deleteCategoria(id);
          load();
        },
      },
    ]);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <View className="flex-1 bg-white">
      <FlatList
        data={categorias}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load();
            }}
          />
        }
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <Text className="text-center text-text-secondary mt-10">
            No hay categoría
          </Text>
        }
        renderItem={({ item }) => (
          <View className="flex-row items-center bg-surface-hover p-4 rounded-xl mb-3 border border-border">
            {item.imageUrl ? (
              <Image
                source={{ uri: item.imageUrl }}
                className="w-16 h-16 rounded-xl mr-3"
                resizeMode="cover"
              />
            ) : null}
            <View className="flex-1">
              <Text className="text-h3 text-text-primary">{item.name}</Text>
              <Text className="text-caption text-text-secondary">
                {item.description}
              </Text>
              <Text className="text-small text-text-muted">
                Orden: {item.order}
              </Text>
            </View>
            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: "/(tabs)/admin/categoria-form",
                    params: { id: item.id },
                  })
                }
              >
                <Ionicons name="create-outline" size={20} color="#f84d3f" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDelete(item.id, item.name)}
              >
                <Ionicons name="trash-outline" size={20} color="#dc2626" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
      <TouchableOpacity
        className="bg-primary py-3 mx-4 mb-4 rounded-xl items-center"
        onPress={() => router.push("/(tabs)/admin/categoria-form")}
      >
        <Text className="text-subtitle text-text-inverse">
          + Nueva Categoría
        </Text>
      </TouchableOpacity>
    </View>
  );
}
