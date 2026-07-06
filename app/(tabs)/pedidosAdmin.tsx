import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Platform,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import LoadingSpinner from "@/src/components/LoadingSpinner";
import {
  DELIVERY_FEE,
  PAYMENT_LABELS,
  STATUS_CONFIG,
} from "@/src/components/orders/shared";
import { useAuth } from "@/src/contexts/AuthContext";
import { sucursales } from "@/src/data/sucursales";
import { getOrders, Order, updateOrder } from "@/src/services/pedidos-rtdb";

type FilterStatus = "all" | Order["status"];

const FILTERS: { key: FilterStatus; label: string }[] = [
  { key: "all", label: "Todos" },
  { key: "pending", label: "Pendiente" },
  { key: "preparing", label: "Preparando" },
  { key: "ready", label: "Listo" },
  { key: "delivered", label: "Entregado" },
];

const STATUS_ACTIONS: {
  [key: string]: { next: string; label: string; color: string }
} = {
  pending: { next: "preparing", label: "Aceptar", color: "#1976d2" },
  preparing: { next: "ready", label: "Listo", color: "#43A047" },
  ready: { next: "delivered", label: "Entregar", color: "#9e9e9e" },
};

function MiniStepper({
  steps,
  currentStatus,
}: {
  steps: string[];
  currentStatus: string;
}) {
  const currentIdx = steps.indexOf(currentStatus);
  const els: React.ReactNode[] = [];
  steps.forEach((step, i) => {
    const isCompleted = currentIdx > i;
    const isCurrent = step === currentStatus;
    if (i > 0) {
      els.push(
        <View
          key={`line-${step}`}
          className="h-0.5 mx-0.5"
          style={{
            width: 10,
            backgroundColor:
              isCompleted || isCurrent ? "#22c55e" : "#e5e7eb",
          }}
        />,
      );
    }
    const isTerminal =
      currentStatus === "delivered" || currentStatus === "cancelled";
    const dotColor =
      isCompleted || (isCurrent && isTerminal)
        ? "#22c55e"
        : isCurrent
          ? "#f97316"
          : "#e5e7eb";
    els.push(
      <View
        key={step}
        className="w-2 h-2 rounded-full"
        style={{
          backgroundColor: dotColor,
        }}
      />,
    );
  });
  return <>{els}</>;
}

// ─── Admin OrderCard (compact list + accordion) ───

// Tarjeta de pedido del admin con acordeón
function AdminOrderCard({
  order,
  onStatusChange,
  expanded,
  onToggle,
}: {
  order: Order;
  onStatusChange: (orderId: string, newStatus: Order["status"]) => void;
  expanded: boolean;
  onToggle: () => void;
}) {
  const status = STATUS_CONFIG[order.status];
  const action = STATUS_ACTIONS[order.status];
  const elapsed = useElapsed(order.createdAt, order.readyAt, order.status);
  const urgencyColor = getUrgencyColor(elapsed);
  const ticketNum = order.ticketNumber || order.id.slice(0, 4).toUpperCase();

  const subtotal =
    order.deliveryMode === "delivery"
      ? order.total - DELIVERY_FEE
      : order.total;

  const handleStatusPress = () => {
    if (!action) return;
    const statusLabel = STATUS_CONFIG[action.next].label;
    const doUpdate = () => onStatusChange(order.id, action.next);

    if (Platform.OS === "web") {
      if (window.confirm(`¿Cambiar estado a "${statusLabel}"?`)) doUpdate();
    } else {
      Alert.alert("Cambiar estado", `¿Cambiar estado a "${statusLabel}"?`, [
        { text: "No", style: "cancel" },
        { text: "Sí", onPress: doUpdate },
      ]);
    }
  };

  const miniSteps =
    order.deliveryMode === "delivery"
      ? ["pending", "preparing", "ready", "delivered"]
      : ["pending", "preparing", "ready"];

  const sucursal =
    order.deliveryMode === "recoger" && order.sucursalId
      ? sucursales.find((s) => s.id === order.sucursalId)
      : null;

  const deliveryChip =
    order.deliveryMode === "delivery"
      ? {
          icon: "🚚",
          label: `Delivery +S/.${DELIVERY_FEE}`,
          bg: "#e3f2fd",
          color: "#1976d2",
        }
      : order.deliveryMode === "recoger"
        ? {
            icon: "🏪",
            label: `Recoger ${sucursal?.name ?? ""}`,
            bg: "#f5f5f5",
            color: "#666666",
          }
        : order.deliveryMode === "mesa"
          ? {
              icon: "🪑",
              label: `Mesa ${order.tableNumber || ""}`,
              bg: "#fff3e0",
              color: "#e65100",
            }
          : null;

  return (
    <View className="mb-3 bg-white rounded-xl border border-border overflow-hidden">
      {/* ─── Collapsed row (always visible) ─── */}
      <TouchableOpacity onPress={onToggle} className="active:opacity-80">
        <View className="px-4 py-3">
          {/* Line 1: status dot + ticket + customer + [flex] + timer + total */}
          <View className="flex-row items-center">
            <View
              className="w-2.5 h-2.5 rounded-full mr-2"
              style={{ backgroundColor: status.text }}
            />
            <Text className="text-body-bold text-text-primary mr-2">
              #{ticketNum}
            </Text>
            <Text
              className="text-body text-text-secondary flex-1"
              numberOfLines={1}
            >
              {order.customerName || "Mostrador"}
            </Text>
            <Text
              style={{
                color: urgencyColor,
                fontSize: 12,
                fontWeight: "700",
                marginRight: 8,
              }}
            >
              ⏱ {elapsed}
            </Text>
            <Text className="text-body-bold text-primary">
              S/.{order.total.toFixed(2)}
            </Text>
          </View>

          {/* Line 2: mini stepper dots */}
          <View className="flex-row items-center mt-1.5 ml-4">
            <MiniStepper steps={miniSteps} currentStatus={order.status} />
          </View>

          {/* Line 3: delivery chip + product count */}
          <View className="flex-row items-center mt-1.5 ml-4">
            {deliveryChip && (
              <View
                className="flex-row items-center px-2 py-0.5 rounded-full mr-2"
                style={{ backgroundColor: deliveryChip.bg }}
              >
                <Text className="text-small mr-1">{deliveryChip.icon}</Text>
                <Text
                  className="text-small font-bold"
                  style={{ color: deliveryChip.color }}
                >
                  {deliveryChip.label}
                </Text>
              </View>
            )}
            <Text className="text-small text-text-muted">
              {order.items.length} producto{order.items.length !== 1 ? "s" : ""}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* ─── Expanded section ─── */}
      {expanded && (
        <View className="px-4 pb-4 pt-1">
          {order.items.map((item, i) => (
            <View key={i} className="flex-row justify-between py-1">
              <Text className="text-body text-text-primary flex-1">
                {item.quantity}× {item.name}
              </Text>
              <Text className="text-body-bold text-text-primary">
                S/.{item.subtotal.toFixed(2)}
              </Text>
            </View>
          ))}

          <Separator />

          {order.deliveryMode === "delivery" ? (
            <>
              <View className="flex-row justify-between py-1">
                <Text className="text-body text-text-secondary">Subtotal</Text>
                <Text className="text-body text-text-primary">
                  S/.{subtotal.toFixed(2)}
                </Text>
              </View>
              <View className="flex-row justify-between py-1">
                <Text className="text-body text-text-secondary">
                  🚚 Delivery
                </Text>
                <Text className="text-body text-text-muted">
                  +S/.{DELIVERY_FEE.toFixed(2)}
                </Text>
              </View>
              <View className="flex-row justify-between py-1 border-t border-border mt-1 pt-1">
                <Text className="text-body-bold text-text-primary">Total</Text>
                <Text className="text-h3 text-primary">
                  S/.{order.total.toFixed(2)}
                </Text>
              </View>
            </>
          ) : (
            <View className="flex-row justify-between py-1">
              <Text className="text-body-bold text-text-primary">Total</Text>
              <Text className="text-h3 text-primary">
                S/.{order.total.toFixed(2)}
              </Text>
            </View>
          )}

          <Separator />

          <View className="pt-1">
            <Text className="text-body text-text-secondary">
              💳 {PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}
            </Text>
            {order.deliveryMode === "delivery" && order.deliveryAddress && (
              <Text className="text-body text-text-muted mt-1">
                📍 {order.deliveryAddress}
              </Text>
            )}
            {order.deliveryMode === "recoger" && sucursal && (
              <Text className="text-body text-text-muted mt-1">
                🏪 {sucursal.address}
              </Text>
            )}
            {order.deliveryMode === "mesa" && order.tableNumber && (
              <Text className="text-body text-text-muted mt-1">
                🪑 Mesa {order.tableNumber}
              </Text>
            )}
          </View>

          {action && (
            <TouchableOpacity
              onPress={handleStatusPress}
              className="rounded-xl py-3 items-center mt-3 active:opacity-70"
              style={{ backgroundColor: action.color }}
            >
              <Text className="text-body-bold text-white" style={{ fontFamily: "monospace" }}>{action.label}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

// ─── ComandaCard (employee kitchen ticket) ───

// Hook de temporizador para el tiempo transcurrido
function useElapsed(
  isoDate: string,
  readyAt: string | undefined,
  status: Order["status"],
) {
  const [elapsed, setElapsed] = useState("00:00");

  useEffect(() => {
    const isFrozen =
      status === "ready" || status === "delivered" || status === "cancelled";

    if (isFrozen && readyAt) {
      const diff = new Date(readyAt).getTime() - new Date(isoDate).getTime();
      const m = Math.floor(diff / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setElapsed(`${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
      return;
    }

    const start = new Date(isoDate).getTime();
    const tick = () => {
      const diff = Date.now() - start;
      const m = Math.floor(diff / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setElapsed(`${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [isoDate, readyAt, status]);

  return elapsed;
}

// Formatea la hora de una fecha ISO
function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" });
}

// Determina el color de urgencia según el tiempo
function getUrgencyColor(elapsed: string): string {
  const [m] = elapsed.split(":").map(Number);
  if (m < 5) return "#43A047";
  if (m < 15) return "#ffb804";
  return "#f84d3f";
}

// Línea separadora punteada
function Separator() {
  return (
    <View className="flex-row justify-center items-center py-1 px-2">
      {Array.from({ length: 28 }).map((_, i) => (
        <View
          key={i}
          style={{
            width: 3,
            height: 3,
            borderRadius: 1.5,
            backgroundColor: "#d0d0d0",
            marginHorizontal: 2,
          }}
        />
      ))}
    </View>
  );
}

// Sello de estado rotado
function StatusStamp({
  label,
  color,
  bg,
}: {
  label: string;
  color: string;
  bg: string;
}) {
  return (
    <View
      style={{
        borderWidth: 2,
        borderColor: color,
        borderRadius: 4,
        paddingHorizontal: 8,
        paddingVertical: 2,
        backgroundColor: bg,
      }}
    >
      <Text
        style={{ fontFamily: "monospace", color, fontSize: 11, fontWeight: "700" }}
      >
        {label.toUpperCase()}
      </Text>
    </View>
  );
}

// Comanda estilo ticket de cocina
function ComandaCard({
  order,
  onStatusChange,
}: {
  order: Order;
  onStatusChange: (orderId: string, newStatus: Order["status"]) => void;
}) {
  const elapsed = useElapsed(order.createdAt, order.readyAt, order.status);
  const status = STATUS_CONFIG[order.status];
  const action = STATUS_ACTIONS[order.status];
  const urgencyColor = getUrgencyColor(elapsed);

  const deliveryLabel =
    order.deliveryMode === "delivery"
      ? "DELIVERY"
      : order.deliveryMode === "mesa"
        ? `MESA ${order.tableNumber || ""}`
        : "RECOGER";
  const sucursal =
    order.deliveryMode === "recoger" && order.sucursalId
      ? sucursales.find((s) => s.id === order.sucursalId)
      : null;

  const ticketNum = order.ticketNumber || order.id.slice(0, 4).toUpperCase();

  return (
    <View className="mb-4 bg-white overflow-hidden" style={{ elevation: 2 }}>
      {/* Perforated top edge */}
      <View
        style={{
          backgroundColor: "#c0c0c0",
          height: 8,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        {Array.from({ length: 40 }).map((_, i) => (
          <View
            key={i}
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: "#fff",
              marginLeft: i === 0 ? 0 : 2,
            }}
          />
        ))}
      </View>

      {/* Ticket + Customer + Timer */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          paddingHorizontal: 12,
          paddingTop: 10,
          paddingBottom: 2,
        }}
      >
        <View style={{ flex: 1, marginRight: 12 }}>
          <Text style={{ fontFamily: "monospace", color: "#000", fontSize: 20, fontWeight: "700", marginBottom: 4 }}>
            #{ticketNum}
          </Text>
          <Text style={{ fontFamily: "monospace", color: "#000", fontSize: 14, fontWeight: "700" }}>
            {order.customerName || "Cliente"}
          </Text>
          <View style={{ flexDirection: "row", marginTop: 2, alignItems: "center", flexWrap: "wrap" }}>
            <Text style={{ fontFamily: "monospace", color: "#666", fontSize: 11, backgroundColor: "#f0f0f0", paddingHorizontal: 4, paddingVertical: 1, marginRight: 4, marginBottom: 2 }}>
              {deliveryLabel}
            </Text>
            {sucursal && (
              <Text style={{ fontFamily: "monospace", color: "#1976d2", fontSize: 11, backgroundColor: "#e3f2fd", paddingHorizontal: 4, paddingVertical: 1, marginRight: 4, marginBottom: 2 }}>
                {sucursal.name}
              </Text>
            )}
            <Text style={{ fontFamily: "monospace", color: "#999", fontSize: 11, marginBottom: 2 }}>
              {formatTime(order.createdAt)}
            </Text>
          </View>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <StatusStamp
            label={status.label}
            color={status.text}
            bg={status.bg}
          />
          <Text
            style={{ fontFamily: "monospace", color: urgencyColor, fontSize: 20, fontWeight: "700", marginTop: 2 }}
          >
            ⏱ {elapsed}
          </Text>
          <Text style={{ fontFamily: "monospace", color: "#888", fontSize: 10 }}>TIEMPO</Text>
        </View>
      </View>

      <Separator />

      {/* Items */}
      <View style={{ paddingHorizontal: 12, paddingVertical: 4 }}>
        {order.items.map((item, i) => (
          <View key={i} style={{ marginBottom: 6 }}>
            <View style={{ flexDirection: "row", alignItems: "baseline" }}>
              <Text
                style={{
                  fontFamily: "monospace",
                  color: "#000",
                  fontSize: 14,
                  fontWeight: "700",
                  marginRight: 6,
                  minWidth: 20,
                  textAlign: "right",
                }}
              >
                {item.quantity}×
              </Text>
              <Text
                style={{
                  fontFamily: "monospace",
                  color: "#000",
                  fontSize: 14,
                  flex: 1,
                }}
              >
                {item.name}
              </Text>
            </View>
            {item.notes ? (
              <View
                style={{
                  marginLeft: 26,
                  marginTop: 2,
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                }}
              >
                <Text
                  style={{
                    fontFamily: "monospace",
                    color: "#666",
                    fontSize: 11,
                    fontStyle: "italic",
                  }}
                >
                  ⚠ {item.notes}
                </Text>
              </View>
            ) : null}
          </View>
        ))}
      </View>

      {/* Action button */}
      {action && (
        <>
          <Separator />
          <View style={{ paddingHorizontal: 12, paddingBottom: 12 }}>
            <TouchableOpacity
              onPress={() => onStatusChange(order.id, action.next)}
              style={{
                backgroundColor: action.color,
                borderRadius: 6,
                paddingVertical: 12,
                alignItems: "center",
              }}
              activeOpacity={0.7}
            >
              <Text
                style={{
                  fontFamily: "monospace",
                  color: "#ffffff",
                  fontSize: 14,
                  fontWeight: "700",
                }}
              >
                {action.label.toUpperCase()}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* Perforated bottom edge */}
      <View
        style={{
          backgroundColor: "#c0c0c0",
          height: 8,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        {Array.from({ length: 40 }).map((_, i) => (
          <View
            key={i}
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: "#fff",
              marginLeft: i === 0 ? 0 : 2,
            }}
          />
        ))}
      </View>
    </View>
  );
}

// ─── Main Screen ───

// Pantalla de pedidos para admin y empleados
export default function PedidosAdminScreen() {
  const { isAdmin } = useAuth();
  const insets = useSafeAreaInsets();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [search, setSearch] = useState("");
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // Alterna la tarjeta expandida
  const toggleExpand = (orderId: string) => {
    setExpandedOrderId((prev) => (prev === orderId ? null : orderId));
  };

  // Carga los pedidos del servidor
  const load = async () => {
    try {
      const data = await getOrders();
      if (isAdmin) {
        setOrders(data);
      } else {
        const today = new Date().toISOString().slice(0, 10);
        const todayOrders = data.filter((o) => o.createdAt?.startsWith(today));
        setOrders(todayOrders);
      }
    } catch (e) {
      console.error("Error loading orders:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Actualiza el estado de un pedido
  const handleStatusChange = async (
    orderId: string,
    newStatus: Order["status"],
  ) => {
    try {
      await updateOrder(orderId, {
        status: newStatus,
        ...(newStatus === "ready" ? { readyAt: new Date().toISOString() } : {}),
      });
      load();
    } catch {
      Alert.alert("Error", "No se pudo actualizar el estado.");
    }
  };

  // Auto-refresca cada 30 segundos
  useEffect(() => {
    load();
  }, [isAdmin]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading) {
        load();
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [loading]);

  const filteredOrders = orders
    .filter((o) => filter === "all" || o.status === filter)
    .filter((o) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      const ticketNum = o.id.slice(0, 4).toUpperCase();
      return (
        ticketNum.toLowerCase().includes(q) ||
        (o.customerName && o.customerName.toLowerCase().includes(q))
      );
    });

  const filterCounts = {
    all: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    preparing: orders.filter((o) => o.status === "preparing").length,
    ready: orders.filter((o) => o.status === "ready").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
  };

  const todayLabel = new Date().toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header con buscador integrado */}
      <View className="bg-primary pb-4 px-6" style={{ paddingTop: insets.top + 16 }}>
        <View className="flex-row justify-between items-center">
          <View className="flex-1">
            <Text className="text-h2 text-text-inverse">
              {isAdmin ? "Pedidos" : "Comandas"}
            </Text>
            <Text className="text-body text-text-inverse opacity-80 mt-1">
              {isAdmin ? "Gestión de pedidos" : todayLabel}
            </Text>
          </View>
          <View
            className="flex-row items-center rounded-lg px-3 py-2 ml-3"
            style={{ backgroundColor: "rgba(255,255,255,0.2)", maxWidth: 180 }}
          >
            <Text
              className="text-body mr-2"
              style={{ color: "rgba(255,255,255,0.7)" }}
            >
              🔍
            </Text>
            <TextInput
              className="flex-1 text-body"
              style={{ color: "#ffffff" }}
              placeholder="Buscar..."
              placeholderTextColor="rgba(255,255,255,0.5)"
              value={search}
              onChangeText={setSearch}
              autoCapitalize="characters"
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch("")}>
                <Text style={{ color: "rgba(255,255,255,0.7)" }}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Filter tabs */}
      <View className="flex-row px-4 py-3 bg-white border-b border-border">
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={FILTERS}
          keyExtractor={(item) => item.key}
          renderItem={({ item }) => {
            const isActive = filter === item.key;
            const count = filterCounts[item.key];
            return (
              <TouchableOpacity
                onPress={() => setFilter(item.key)}
                className="mr-2 px-4 py-2 rounded-full"
                style={{
                  backgroundColor: isActive ? "#f84d3f" : "#f5f5f5",
                }}
              >
                <Text
                  className="text-small font-bold"
                  style={{ color: isActive ? "#ffffff" : "#666666" }}
                >
                  {item.label}
                  {count > 0 && ` (${count})`}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      <FlatList
        data={filteredOrders}
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
          <View className="items-center mt-20 px-8">
            <View
              style={{
                borderWidth: 2,
                borderColor: "#d0d0d0",
                borderStyle: "dashed",
                borderRadius: 12,
                padding: 24,
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 40, marginBottom: 12 }}>
                {isAdmin ? "📋" : "🍳"}
              </Text>
              <Text
                style={{
                  color: "#805140",
                  fontSize: 16,
                  fontWeight: "700",
                  textAlign: "center",
                }}
              >
                {isAdmin
                  ? `No hay pedidos ${filter !== "all" ? `"${STATUS_CONFIG[filter].label}"` : ""}`
                  : `Sin pedidos ${filter !== "all" ? `"${STATUS_CONFIG[filter].label}"` : "hoy"}`}
              </Text>
              <Text
                style={{
                  color: "#9e9e9e",
                  fontSize: 13,
                  textAlign: "center",
                  marginTop: 6,
                }}
              >
                {isAdmin
                  ? "Los pedidos aparecerán aquí"
                  : "Las comandas del día aparecerán aquí"}
              </Text>
            </View>
          </View>
        }
        renderItem={({ item }) =>
          isAdmin ? (
            <AdminOrderCard
              order={item}
              onStatusChange={handleStatusChange}
              expanded={expandedOrderId === item.id}
              onToggle={() => toggleExpand(item.id)}
            />
          ) : (
            <ComandaCard order={item} onStatusChange={handleStatusChange} />
          )
        }
      />
    </View>
  );
}
