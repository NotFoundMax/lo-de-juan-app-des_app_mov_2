import LoadingSpinner from "@/src/components/LoadingSpinner";
import { Categoria, getCategorias } from "@/src/services/categorias-rtdb";
import {
    deleteProducto,
    getProductos,
    Producto,
} from "@/src/services/productos-rtdb";
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

// Pantalla de gestión de productos
export default function ProductosScreen() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Record<string, Categoria>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Carga los productos y categorías
  const load = async () => {
    try {
      const [prods, cats] = await Promise.all([
        getProductos(),
        getCategorias(),
      ]);
      setProductos(prods);
      const catMap: Record<string, Categoria> = {};
      cats.forEach((cat) => {
        catMap[cat.id] = cat;
      });
      setCategorias(catMap);
    } catch (e) {
      showError(e, "productos");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    load();
  }, []);

  // Elimina un producto con confirmación
  const handleDelete = (id: string, name: string) => {
    Alert.alert("Eliminar", `¿Eliminar ${name}?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          await deleteProducto(id);
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
        data={productos}
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
            No hay productos
          </Text>
        }
        renderItem={({ item }) => (
          <View className="bg-surface-hover p-4 rounded-xl mb-3 border border-border">
            <View className="flex-row items-start">
              {item.imageUrl ? (
                <Image
                  source={{ uri: item.imageUrl }}
                  className="w-16 h-16 rounded-xl mr-3"
                  resizeMode="cover"
                />
              ) : null}
              <View className="flex-1 mr-4">
                <Text className="text-h3 text-text-primary">{item.name}</Text>
                <Text className="text-caption text-text-secondary mt-1">
                  {item.description}
                </Text>
                <Text className="text-caption text-text-secondary mt-1">
                  Cat: {categorias[item.categoryId]?.name ?? "—"} | Cant.:{" "}
                  {item.stock} | S/.{item.price.toFixed(2)}
                </Text>
                <Text className="text-small text-text-muted mt-1">
                  {item.active ? "Activo" : "Inactivo"} • Mín: {item.minStock}
                </Text>
              </View>
              <View className="flex-row gap-2">
                <TouchableOpacity
                  onPress={() =>
                    router.push({
                      pathname: "/(tabs)/admin/producto-form",
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
          </View>
        )}
      />
      <TouchableOpacity
        className="bg-primary py-3 mx-4 mb-4 rounded-xl items-center"
        onPress={() => router.push("/(tabs)/admin/producto-form")}
      >
        <Text className="text-subtitle text-text-inverse">
          + Nuevo Producto
        </Text>
      </TouchableOpacity>
    </View>
  );
}
