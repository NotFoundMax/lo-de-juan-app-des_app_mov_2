import LoadingSpinner from "@/src/components/LoadingSpinner";
import AddItemsModal from "@/src/components/mesas/AddItemsModal";
import ChargeModal from "@/src/components/mesas/ChargeModal";
import type { CartItemData } from "@/src/components/pos/CartItem";
import type { Categoria } from "@/src/services/categorias-rtdb";
import { getCategorias } from "@/src/services/categorias-rtdb";
import type {
  Order,
  OrderItem,
  PaymentMethod,
} from "@/src/services/pedidos-rtdb";
import {
  addItemsToOrder,
  advanceMesaOrder,
  subscribeToOrders,
  updateOrder,
} from "@/src/services/pedidos-rtdb";
import type { Producto } from "@/src/services/productos-rtdb";
import {
  descontarStock,
  getProductosActivos,
} from "@/src/services/productos-rtdb";
import {
  groupByRound,
  hasItemStatus,
  outstandingOf,
  paidAmountOf,
  ROUND_STATUS,
} from "@/src/utils/mesa-items";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Platform,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface MesaGroup {
  tableNumber: string;
  orders: Order[];
  startedAt: string;
}

// Formatea el tiempo transcurrido en la mesa
function elapsedInfo(startedAt: string, now: number) {
  const min = Math.floor(
    Math.max(0, now - new Date(startedAt).getTime()) / 60000,
  );
  const label =
    min < 1
      ? "< 1 min"
      : min < 60
        ? `${min} min`
        : `${Math.floor(min / 60)}h ${min % 60}m`;
  const color =
    min >= 20 ? "text-error" : min >= 10 ? "text-secondary" : "text-text-muted";
  return { label, color };
}

// Pantalla de mesas activas del restaurante
export default function MesasScreen() {
  const insets = useSafeAreaInsets();
  const [orders, setOrders] = useState<Order[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [addModalOrder, setAddModalOrder] = useState<Order | null>(null);
  const [chargeModalOrder, setChargeModalOrder] = useState<Order | null>(null);
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("efectivo");
  const [processingAdd, setProcessingAdd] = useState(false);
  const [processingCharge, setProcessingCharge] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const unsubscribe = subscribeToOrders(setOrders);
    return unsubscribe;
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 10000);
    return () => clearInterval(timer);
  }, []);

  const loadProducts = async () => {
    try {
      const [prods, cats] = await Promise.all([
        getProductosActivos(),
        getCategorias(),
      ]);
      setProductos(prods);
      setCategorias(cats);
    } catch {
      // noop: los productos se reintentan al abrir el modal
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Pedidos de mesa del POS (pagados o no) agrupados por número de mesa
  const mesas = useMemo<MesaGroup[]>(() => {
    const active = orders.filter(
      (o) =>
        o.type === "pos" &&
        o.deliveryMode === "mesa" &&
        !!o.tableNumber &&
        o.status !== "cancelled" &&
        !o.releasedAt,
    );
    const groups = new Map<string, Order[]>();
    for (const o of active) {
      const key = o.tableNumber!;
      groups.set(key, [...(groups.get(key) ?? []), o]);
    }
    return [...groups.entries()]
      .map(([tableNumber, group]) => {
        const sorted = [...group].sort((a, b) =>
          a.createdAt.localeCompare(b.createdAt),
        );
        return {
          tableNumber,
          orders: sorted,
          startedAt: sorted.reduce((earliest, o) => {
            const start = o.servedAt ?? o.createdAt;
            return start < earliest ? start : earliest;
          }, sorted[0].servedAt ?? sorted[0].createdAt),
        };
      })
      .sort((a, b) => a.startedAt.localeCompare(b.startedAt));
  }, [orders]);

  // Marca el pedido como servido en la mesa
  const handleServe = async (order: Order) => {
    try {
      if (hasItemStatus(order.items)) {
        await advanceMesaOrder(order.id, "served");
      } else {
        await updateOrder(order.id, { servedAt: new Date().toISOString() });
      }
    } catch {
      Alert.alert("Error", "No se pudo marcar el pedido como servido.");
    }
  };

  // Libera la mesa para que pueda ser usada de nuevo en el POS
  const handleRelease = async (order: Order) => {
    try {
      await updateOrder(order.id, { releasedAt: new Date().toISOString() });
      const message = `Mesa ${order.tableNumber} liberada. Ya puede ser usada en el POS.`;
      if (Platform.OS === "web") {
        window.alert(`Mesa liberada\n\n${message}`);
      } else {
        Alert.alert("Mesa liberada", message);
      }
    } catch {
      Alert.alert("Error", "No se pudo liberar la mesa.");
    }
  };

  // Agrega ítems como nueva ronda del pedido de mesa
  const handleAddItems = async (cart: CartItemData[]) => {
    const order = addModalOrder;
    if (!order || cart.length === 0) return;
    setProcessingAdd(true);
    try {
      const items: OrderItem[] = cart.map(({ product, quantity }) => ({
        productId: product.id,
        name: product.name,
        quantity,
        unitPrice: product.price,
        subtotal: product.price * quantity,
      }));
      const extraTotal = cart.reduce(
        (sum, i) => sum + i.product.price * i.quantity,
        0,
      );
      await addItemsToOrder(order.id, items, extraTotal);
      await Promise.all(
        cart.map(({ product, quantity }) =>
          descontarStock(product.id, quantity),
        ),
      );
      setAddModalOrder(null);
      const message = `Se agregaron productos a Mesa ${order.tableNumber} por S/. ${extraTotal.toFixed(2)}`;
      if (Platform.OS === "web") {
        window.alert(`Pedido actualizado\n\n${message}`);
      } else {
        Alert.alert("Pedido actualizado", message);
      }
    } catch {
      Alert.alert("Error", "No se pudieron agregar los productos.");
    } finally {
      setProcessingAdd(false);
    }
  };

  // Cobra el saldo pendiente de la mesa seleccionada
  const handleCharge = async () => {
    const order = chargeModalOrder;
    if (!order) return;
    const outstanding = outstandingOf(order);
    setProcessingCharge(true);
    try {
      if (paymentMethod === "yape") {
        await updateOrder(order.id, {
          paymentMethod: "yape",
          paymentStatus: "pending",
        });
      } else {
        await updateOrder(order.id, {
          paymentMethod,
          paymentStatus: "confirmed",
          paidAt: new Date().toISOString(),
          paidAmount: outstandingOf(order) + (order.paidAmount ?? 0),
        });
      }
      setChargeModalOrder(null);
      const message =
        paymentMethod === "yape"
          ? "Pago con Yape registrado. Confírmalo en Pedidos cuando llegue."
          : `Mesa cobrada por S/. ${outstanding.toFixed(2)}`;
      if (Platform.OS === "web") {
        window.alert(`Cobro realizado\n\n${message}`);
      } else {
        Alert.alert("Cobro realizado", message);
      }
    } catch {
      Alert.alert("Error", "No se pudo cobrar la mesa.");
    } finally {
      setProcessingCharge(false);
    }
  };

  const renderOrder = (order: Order) => {
    const itemAware = hasItemStatus(order.items);
    const needsServe = itemAware
      ? order.items.some((i) => i.status === "ready")
      : !order.servedAt && order.status === "ready";
    const paid = paidAmountOf(order);
    const outstanding = outstandingOf(order);
    const yapePending = order.paymentStatus === "pending";
    const canRelease = !yapePending && outstanding <= 0 && !order.releasedAt;

    return (
      <View key={order.id} className="border-t border-border pt-3 mt-3">
        <View className="flex-row justify-between items-center mb-1">
          <Text className="text-small text-text-muted">
            #{order.ticketNumber || order.id.slice(0, 4).toUpperCase()}
          </Text>
          <Text className="text-body-bold text-text-primary">
            S/. {order.total.toFixed(2)}
          </Text>
        </View>

        {itemAware ? (
          groupByRound(order.items).map((g, gi) => (
            <View key={`round-${g.round}`} className={gi === 0 ? "" : "mt-2"}>
              <View className="flex-row items-center mb-0.5">
                <View
                  className="rounded-full px-2 py-0.5 mr-2"
                  style={{ backgroundColor: ROUND_STATUS[g.status].bg }}
                >
                  <Text
                    className="text-[10px] font-bold"
                    style={{ color: ROUND_STATUS[g.status].color }}
                  >
                    Ronda {g.round}
                  </Text>
                </View>
                <Text
                  className="text-[11px] font-bold"
                  style={{ color: ROUND_STATUS[g.status].color }}
                >
                  {ROUND_STATUS[g.status].label}
                </Text>
              </View>
              {g.items.map((item, idx) => (
                <View
                  key={`${item.productId}-${idx}`}
                  className="flex-row items-center justify-between py-0.5"
                >
                  <Text
                    className="text-body text-text-primary flex-1"
                    numberOfLines={1}
                  >
                    {item.name} × {item.quantity}
                  </Text>
                  <Text className="text-small text-text-muted">
                    S/. {item.subtotal.toFixed(2)}
                  </Text>
                </View>
              ))}
            </View>
          ))
        ) : (
          order.items.map((item, idx) => (
            <View
              key={`${item.productId}-${idx}`}
              className="flex-row items-center justify-between py-0.5"
            >
              <Text
                className="text-body text-text-primary flex-1"
                numberOfLines={1}
              >
                {item.name} × {item.quantity}
              </Text>
              <Text className="text-small text-text-muted">
                S/. {item.subtotal.toFixed(2)}
              </Text>
            </View>
          ))
        )}

        <View className="flex-row items-center mt-2">
          {yapePending ? (
            <View className="bg-warning-light rounded-full px-2 py-0.5">
              <Text className="text-[11px] font-bold text-text-secondary">
                💛 Yape por confirmar
              </Text>
            </View>
          ) : paid >= order.total ? (
            <View className="bg-success-light rounded-full px-2 py-0.5">
              <Text className="text-[11px] font-bold text-success">
                ✓ Pagado S/. {paid.toFixed(2)}
              </Text>
            </View>
          ) : paid > 0 ? (
            <View className="flex-row gap-2">
              <View className="bg-light-gray rounded-full px-2 py-0.5">
                <Text className="text-[11px] font-bold text-text-secondary">
                  Pagado S/. {paid.toFixed(2)}
                </Text>
              </View>
              <View className="bg-error-light rounded-full px-2 py-0.5">
                <Text className="text-[11px] font-bold text-error">
                  Falta S/. {outstanding.toFixed(2)}
                </Text>
              </View>
            </View>
          ) : null}
        </View>

        <View className="flex-row gap-2 mt-3">
          {needsServe && (
            <TouchableOpacity
              onPress={() => handleServe(order)}
              className="flex-1 py-2.5 rounded-xl items-center border"
              style={{ borderColor: "#e65100" }}
            >
              <Text className="text-small font-bold" style={{ color: "#e65100" }}>
                Servir
              </Text>
            </TouchableOpacity>
          )}
          {canRelease ? (
            <TouchableOpacity
              onPress={() => handleRelease(order)}
              className="flex-1 py-2.5 rounded-xl items-center"
              style={{ backgroundColor: "#43A047" }}
            >
              <Text className="text-small font-bold text-white">
                Liberar mesa
              </Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity
                onPress={() => setAddModalOrder(order)}
                className="flex-1 py-2.5 rounded-xl items-center border"
                style={{ borderColor: "#1976d2" }}
              >
                <Text className="text-small font-bold" style={{ color: "#1976d2" }}>
                  + Agregar más
                </Text>
              </TouchableOpacity>
              {outstanding > 0 && !yapePending && (
                <TouchableOpacity
                  onPress={() => {
                    setPaymentMethod("efectivo");
                    setChargeModalOrder(order);
                  }}
                  className="flex-1 py-2.5 rounded-xl items-center border"
                  style={{ borderColor: "#43A047" }}
                >
                  <Text
                    className="text-small font-bold"
                    style={{ color: "#43A047" }}
                  >
                    Cobrar S/. {outstanding.toFixed(2)}
                  </Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <View className="flex-1 bg-white">
      <FlatList
        data={mesas}
        keyExtractor={(item) => item.tableNumber}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadProducts();
            }}
          />
        }
        ListHeaderComponent={
          <View
            className="bg-primary pb-4 px-4"
            style={{ paddingTop: insets.top + 16 }}
          >
            <Text className="text-h2 text-text-inverse">Mesas Activas</Text>
            <Text className="text-small text-text-inverse/80">
              {mesas.length === 0
                ? "Sin mesas activas"
                : `${mesas.length} mesa${mesas.length === 1 ? "" : "s"} activa${
                    mesas.length === 1 ? "" : "s"
                  }`}
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View className="items-center py-16 px-6">
            <Text className="text-5xl mb-3">🪑</Text>
            <Text className="text-body-bold text-text-primary mb-1">
              No hay mesas activas
            </Text>
            <Text className="text-body text-text-muted text-center">
              Crea un pedido de mesa en el POS para que aparezca aquí.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const { label, color } = elapsedInfo(item.startedAt, now);
          return (
            <View className="mx-4 mt-4 bg-surface rounded-2xl border border-border p-4">
              <View className="flex-row items-center justify-between mb-1">
                <View className="flex-row items-center">
                  <Text className="text-h3 text-text-primary">
                    Mesa {item.tableNumber}
                  </Text>
                  <View className="bg-light-gray rounded-full px-2.5 py-1 ml-2">
                    <Text className={`text-small font-bold ${color}`}>
                      ⏱ {label}
                    </Text>
                  </View>
                </View>
                <Text
                  className="text-caption text-text-muted"
                  numberOfLines={1}
                >
                  {item.orders[0].customerName}
                </Text>
              </View>
              {item.orders.map(renderOrder)}
            </View>
          );
        }}
      />

      <AddItemsModal
        visible={!!addModalOrder}
        mesaLabel={
          addModalOrder ? `Mesa ${addModalOrder.tableNumber}` : ""
        }
        productos={productos}
        categorias={categorias}
        processing={processingAdd}
        onClose={() => setAddModalOrder(null)}
        onConfirm={handleAddItems}
      />

      <ChargeModal
        visible={!!chargeModalOrder}
        mesaLabel={
          chargeModalOrder ? `Mesa ${chargeModalOrder.tableNumber}` : ""
        }
        total={chargeModalOrder ? outstandingOf(chargeModalOrder) : 0}
        paymentMethod={paymentMethod}
        onPaymentMethodChange={setPaymentMethod}
        processing={processingCharge}
        onClose={() => setChargeModalOrder(null)}
        onConfirm={handleCharge}
      />
    </View>
  );
}
