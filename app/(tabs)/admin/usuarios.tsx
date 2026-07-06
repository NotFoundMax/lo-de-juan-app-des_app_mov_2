import LoadingSpinner from "@/src/components/LoadingSpinner";
import { get, ref } from "firebase/database";
import { rtdb } from "@/src/services/firebase-rtdb";
import { useEffect, useState } from "react";
import { FlatList, RefreshControl, Text, View } from "react-native";

interface UserRow {
  id: string;
  email: string;
  role: string;
  createdAt: string;
}

// Pantalla de gestión de usuarios
export default function UsuariosScreen() {
  const [usuarios, setUsuarios] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Carga los usuarios desde RTDB
  const load = async () => {
    try {
      const snap = await get(ref(rtdb, "users"));
      const rows: UserRow[] = snap.exists()
        ? (Object.entries(snap.val()) as [string, any][])
            .map(([id, data]) => ({
              id,
              email: data.email ?? "—",
              role: data.role ?? "customer",
              createdAt: data.createdAt ?? "",
            }))
            .sort(
              (a, b) =>
                b.createdAt?.localeCompare(a.createdAt ?? "") ?? 0,
            )
        : [];
      setUsuarios(rows);
    } catch (e) {
      console.error("Error loading users:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    load();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <View className="flex-1 bg-surface">
      <FlatList
        data={usuarios}
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
            No hay usuarios
          </Text>
        }
        renderItem={({ item }) => (
          <View className="bg-surface-hover rounded-xl p-4 mb-3 border border-border">
            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-secondary rounded-full justify-center items-center mr-3">
                <Text className="text-body-bold text-text-inverse">
                  {item.email.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-h3 text-text-primary">{item.email}</Text>
                <View className="flex-row items-center gap-2 mt-1">
                  <View
                    className="px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor:
                        item.role === "admin"
                          ? "#f84d3f15"
                          : item.role === "employee"
                            ? "#e6510015"
                            : "#1976d215",
                    }}
                  >
                    <Text
                      className="text-small font-bold capitalize"
                      style={{
                        color:
                          item.role === "admin"
                            ? "#f84d3f"
                            : item.role === "employee"
                              ? "#e65100"
                              : "#1976d2",
                      }}
                    >
                      {item.role}
                    </Text>
                  </View>
                  {item.createdAt && (
                    <Text className="text-small text-text-muted">
                      {new Date(item.createdAt).toLocaleDateString("es-PE")}
                    </Text>
                  )}
                </View>
              </View>
            </View>
          </View>
        )}
      />
    </View>
  );
}
