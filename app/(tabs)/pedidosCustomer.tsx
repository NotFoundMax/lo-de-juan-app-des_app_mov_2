import LoadingSpinner from "@/src/components/LoadingSpinner";
import OrderStepper from "@/src/components/orders/OrderStepper";
import {
    DELIVERY_CONFIG,
    DELIVERY_FEE,
    formatDate,
    PAYMENT_LABELS,
    STATUS_CONFIG,
} from "@/src/components/orders/shared";
import PageHeader from "@/src/components/PageHeader";
import { useAuth } from "@/src/contexts/AuthContext";
import { sucursales } from "@/src/data/sucursales";
import {
    getOrdersByCustomerId,
    Order,
    updateOrder,
} from "@/src/services/pedidos-rtdb";
import { useEffect, useState } from "react";
import {
    Alert,
    FlatList,
    Platform,
    RefreshControl,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

// Tarjeta de pedido del cliente con detalle expandible
function OrderCard({
  order,
  onCancel,
}: {
  order: Order;
  onCancel: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const status = STATUS_CONFIG[order.status];
  const sucursal =
    order.deliveryMode === "recoger" && order.sucursalId
      ? (sucursales.find((s) => s.id === order.sucursalId) ?? null)
      : null;

  return (
    <TouchableOpacity
      onPress={() => setExpanded(!expanded)}
      className="bg-surface-hover rounded-xl p-4 mb-3 border border-border active:opacity-80"
    >
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1">
          <View className="flex-row items-center">
            {order.ticketNumber && (
              <>
                <Text className="text-caption text-text-muted font-bold">
                  #{order.ticketNumber}
                </Text>
                <Text className="text-caption text-text-muted mx-1">·</Text>
              </>
            )}
            <Text className="text-caption text-text-muted">
              {formatDate(order.createdAt)}
            </Text>
          </View>
          <Text className="text-body-bold text-text-primary mt-0.5">
            {order.items.length} producto{order.items.length !== 1 ? "s" : ""}
          </Text>
          {order.deliveryMode && DELIVERY_CONFIG[order.deliveryMode] && (
            <View className="flex-row items-center mt-1">
              <View
                className="flex-row items-center px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: `${DELIVERY_CONFIG[order.deliveryMode].tint}15`,
                }}
              >
                <Text className="text-small mr-1">
                  {DELIVERY_CONFIG[order.deliveryMode].icon}
                </Text>
                <Text
                  className="text-small font-bold"
                  style={{ color: DELIVERY_CONFIG[order.deliveryMode].tint }}
                >
                  {DELIVERY_CONFIG[order.deliveryMode].label}
                </Text>
              </View>
              {order.deliveryMode === "delivery" && (
                <Text className="text-small text-text-muted ml-2">
                  +S/.{DELIVERY_FEE.toFixed(2)}
                </Text>
              )}
            </View>
          )}
        </View>
        <View
          className="px-3 py-1 rounded-full"
          style={{ backgroundColor: status.bg }}
        >
          <Text className="text-small font-bold" style={{ color: status.text }}>
            {status.label}
          </Text>
        </View>
      </View>

      <View className="flex-row justify-between items-center">
        <Text className="text-label text-text-secondary">
          {PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}
        </Text>
        <Text className="text-h3 text-primary">
          S/.{order.total.toFixed(2)}
        </Text>
      </View>

      {expanded && (
        <View className="mt-3 pt-3 border-t border-border">
          {order.items.map((item, i) => (
            <View key={i} className="flex-row justify-between mb-1">
              <Text className="text-body text-text-primary flex-1">
                {item.quantity}x {item.name}
              </Text>
              <Text className="text-body-bold text-text-primary">
                S/.{item.subtotal.toFixed(2)}
              </Text>
            </View>
          ))}
          {order.deliveryMode === "delivery" && (
            <View className="flex-row justify-between mb-1">
              <Text className="text-body text-text-muted flex-1">
                Costo de delivery
              </Text>
              <Text className="text-body text-text-muted">
                +S/.{DELIVERY_FEE.toFixed(2)}
              </Text>
            </View>
          )}
          {order.deliveryMode === "delivery" && order.deliveryAddress && (
            <Text className="text-caption text-text-muted mt-2">
              📍 {order.deliveryAddress}
            </Text>
          )}
          {sucursal && (
            <Text className="text-caption text-text-muted mt-2">
              🏪 {sucursal.address}
            </Text>
          )}
          {order.deliveryMode === "mesa" && order.tableNumber && (
            <Text className="text-caption text-text-muted mt-2">
              🪑 Mesa {order.tableNumber}
            </Text>
          )}
          <OrderStepper
            status={order.status}
            deliveryMode={order.deliveryMode ?? "recoger"}
          />
          {order.status === "pending" && (
            <TouchableOpacity
              onPress={() => onCancel(order.id)}
              className="bg-error-light rounded-xl py-3 items-center mt-3 active:opacity-70"
            >
              <Text className="text-body-bold text-error">Cancelar pedido</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

// Pantalla de pedidos del cliente
export default function PedidosCustomerScreen() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Carga los pedidos del cliente
  const load = async () => {
    if (!user?.uid) return;
    try {
      const data = await getOrdersByCustomerId(user.uid);
      setOrders(data);
    } catch (e) {
      console.error("Error loading customers orders:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Cancela un pedido pendiente
  const handleCancel = (orderId: string) => {
    const doCancel = async () => {
      try {
        await updateOrder(orderId, {
          status: "cancelled",
        });
        load();
      } catch {
        Alert.alert("Error", "No se pudo cancelar el pedido.");
      }
    };

    if (Platform.OS === "web") {
      if (window.confirm("¿Cancelar este pedido? No se puede deshacer.")) {
        doCancel();
      }
    } else {
      Alert.alert("Cancelar pedido", "¿Estás seguro? No se puede deshacer.", [
        { text: "No", style: "cancel" },
        { text: "Sí, cancelar", style: "destructive", onPress: doCancel },
      ]);
    }
  };

  useEffect(() => {
    load();
  }, [user?.uid]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <View className="flex-1 bg-white">
      <PageHeader
        title="Mis Pedidos"
        subtitle="Sigue el estado de tus pedidos"
        pt={40}
      />

      <FlatList
        data={orders}
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
          <View className="items-center mt-20">
            <Text className="text-5xl mb-4">📋</Text>
            <Text className="text-subtitle text-text-secondary text-center">
              No tienes pedidos todavía
            </Text>
            <Text className="text-body text-text-muted text-center mt-2">
              Haz tu primer pedido desde el catálogo
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <OrderCard order={item} onCancel={handleCancel} />
        )}
      />
    </View>
  );
}
