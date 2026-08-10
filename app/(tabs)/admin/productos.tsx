import LoadingSpinner from "@/src/components/LoadingSpinner";
import { Categoria, getCategorias } from "@/src/services/categorias-rtdb";
import {
    deleteProducto,
    deleteProductoPermanente,
    Producto,
    restoreProducto,
    subscribeToProductos,
} from "@/src/services/productos-rtdb";
import { showConfirm, showError } from "@/src/utils/errorHandler";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
    FlatList,
    Image,
    ImageStyle,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

// Pantalla de gestión de productos
export default function ProductosScreen() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Record<string, Categoria>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<
    "todos" | "activos" | "inactivos" | "eliminados"
  >("todos");

  const filtros: {
    key: "todos" | "activos" | "inactivos" | "eliminados";
    label: string;
  }[] = [
    { key: "todos", label: "Todos" },
    { key: "activos", label: "Activos" },
    { key: "inactivos", label: "Inactivos" },
    { key: "eliminados", label: "Eliminados" },
  ];

  const visibleProductos =
    filter === "todos"
      ? productos
      : productos.filter((p) => {
          if (filter === "eliminados") return !!p.deletedAt;
          const noEliminado = !p.deletedAt;
          return (
            noEliminado && (filter === "activos" ? p.active : !p.active)
          );
        });

  // Suscripción en tiempo real a productos + carga de categorías
  useEffect(() => {
    const unsubscribe = subscribeToProductos(setProductos);
    getCategorias()
      .then((cats) => {
        const catMap: Record<string, Categoria> = {};
        cats.forEach((cat) => {
          catMap[cat.id] = cat;
        });
        setCategorias(catMap);
      })
      .catch((e) => showError(e, "productos"))
      .finally(() => setLoading(false));
    return unsubscribe;
  }, []);

  // Elimina un producto con confirmación
  const handleDelete = (id: string, name: string) => {
    showConfirm(
      "Eliminar",
      `¿Eliminar ${name}?`,
      () => {
        deleteProducto(id).catch((e) => showError(e, "productos"));
      },
      undefined,
      { confirmLabel: "Eliminar", destructive: true },
    );
  };

  // Restaura un producto eliminado
  const handleRestore = (id: string) => {
    restoreProducto(id).catch((e) => showError(e, "productos"));
  };

  // Elimina un producto de forma definitiva con confirmación
  const handleDeletePermanente = (id: string, name: string) => {
    showConfirm(
      "Eliminar definitivamente",
      `Se eliminará "${name}" para siempre. Esta acción no se puede deshacer.`,
      () => {
        deleteProductoPermanente(id).catch((e) => showError(e, "productos"));
      },
      undefined,
      { confirmLabel: "Eliminar", destructive: true },
    );
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <View className="flex-1 bg-white">
      <View className="flex-row gap-2 px-4 pt-4">
        {filtros.map((f) => (
          <TouchableOpacity
            key={f.key}
            className={`px-4 py-2 rounded-full border ${
              filter === f.key
                ? "bg-primary border-primary"
                : "bg-surface border-border"
            }`}
            onPress={() => setFilter(f.key)}
          >
            <Text
              className={
                filter === f.key
                  ? "text-text-inverse"
                  : "text-text-primary"
              }
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <FlatList
        data={visibleProductos}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <Text className="text-center text-text-secondary mt-10">
            {filter === "todos"
              ? "No hay productos"
              : filter === "activos"
                ? "No hay productos activos"
                : filter === "inactivos"
                  ? "No hay productos inactivos"
                  : "No hay productos eliminados"}
          </Text>
        }
        renderItem={({ item }) => {
          const isEliminado = !!item.deletedAt;
          const atenuado = !item.active || isEliminado;
          return (
            <View className="bg-surface-hover p-4 rounded-xl mb-3 border border-border">
              <View className="flex-row items-start">
                {item.imageUrl ? (
                  <Image
                    source={{ uri: item.imageUrl }}
                    className="w-16 h-16 rounded-xl mr-3"
                    resizeMode="cover"
                    style={
                      atenuado
                        ? ({ filter: "grayscale(1)" } as unknown as ImageStyle)
                        : undefined
                    }
                  />
                ) : null}
                <View
                  className={`flex-1 mr-4 ${atenuado ? "opacity-50" : ""}`}
                >
                  <Text className="text-h3 text-text-primary">
                    {item.name}
                  </Text>
                  <Text className="text-caption text-text-secondary mt-1">
                    {item.description}
                  </Text>
                  <Text className="text-caption text-text-secondary mt-1">
                    Cat: {categorias[item.categoryId]?.name ?? "—"} | Cant.:{" "}
                    {item.stock} | S/.{item.price.toFixed(2)}
                  </Text>
                  <Text
                    className="text-small text-text-muted mt-1"
                    style={isEliminado ? { color: "#dc2626" } : undefined}
                  >
                    {isEliminado
                      ? "Eliminado"
                      : item.active
                        ? "Activo"
                        : "Inactivo"}{" "}
                    • Mín: {item.minStock}
                  </Text>
                </View>
                {isEliminado ? (
                  <View className="flex-row gap-2">
                    <TouchableOpacity
                      className="px-3 py-2 rounded-lg"
                      style={{ backgroundColor: "#43A047" }}
                      onPress={() => handleRestore(item.id)}
                    >
                      <Text className="text-small text-white">Restaurar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="px-3 py-2 rounded-lg"
                      style={{ backgroundColor: "#dc2626" }}
                      onPress={() => handleDeletePermanente(item.id, item.name)}
                    >
                      <Text className="text-small text-white">Eliminar</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View className="flex-row gap-2">
                    <TouchableOpacity
                      onPress={() =>
                        router.push({
                          pathname: "/(tabs)/admin/producto-form",
                          params: { id: item.id },
                        })
                      }
                    >
                      <Ionicons
                        name="create-outline"
                        size={20}
                        color="#f84d3f"
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDelete(item.id, item.name)}
                    >
                      <Ionicons name="trash-outline" size={20} color="#dc2626" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          );
        }}
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
