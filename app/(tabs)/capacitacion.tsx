import EmptyState from "@/src/components/EmptyState";
import LoadingSpinner from "@/src/components/LoadingSpinner";
import PageHeader from "@/src/components/PageHeader";
import {
    getMaterialesActivos,
    Material,
    MATERIAL_CONFIG,
} from "@/src/services/capacitacion-rtdb";
import { useEffect, useState } from "react";
import {
    FlatList,
    Linking,
    RefreshControl,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

// Pantalla de lista de materiales de capacitación
export default function CapacitacionScreen() {
  const [materiales, setMateriales] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Carga los materiales activos
  const load = async () => {
    try {
      const data = await getMaterialesActivos();
      setMateriales(data);
    } catch (e) {
      console.error("Error loading training:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <View className="flex-1 bg-surface">
      <PageHeader title="Capacitación" subtitle="Manuales y recetas" />
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
          <EmptyState icon="📚" message="No hay materiales disponibles" />
        }
        renderItem={({ item }) => {
          const config = MATERIAL_CONFIG[item.type];
          return (
            <TouchableOpacity
              className="bg-surface-hover rounded-xl p-4 mb-3 border border-border active:opacity-80"
              onPress={() => {
                if (item.url) {
                  Linking.openURL(item.url);
                }
              }}
            >
              <View className="flex-row items-start">
                <View
                  className="w-12 h-12 rounded-xl justify-center items-center mr-3"
                  style={{ backgroundColor: `${config.color}15` }}
                >
                  <Text className="text-2xl">{config.icon}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-h3 text-text-primary">
                    {item.title}
                  </Text>
                  <Text
                    className="text-body text-text-secondary mt-1"
                    numberOfLines={2}
                  >
                    {item.description}
                  </Text>
                  <View
                    className="self-start mt-2 px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: `${config.color}15` }}
                  >
                    <Text
                      className="text-small font-bold"
                      style={{ color: config.color }}
                    >
                      {config.label}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}
