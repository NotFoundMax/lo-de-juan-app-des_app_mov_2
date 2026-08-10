import LoadingSpinner from "@/src/components/LoadingSpinner";
import type { CartItemData } from "@/src/components/pos/CartItem";
import CartPanel from "@/src/components/pos/CartPanel";
import CategoryFilter from "@/src/components/pos/CategoryFilter";
import CheckoutModal from "@/src/components/pos/CheckoutModal";
import ProductCard from "@/src/components/pos/ProductCard";
import { router } from "expo-router";
import type { Categoria } from "@/src/services/categorias-rtdb";
import { getCategorias } from "@/src/services/categorias-rtdb";
import type {
    DeliveryMode,
    Order,
    OrderItem,
    PaymentMethod,
} from "@/src/services/pedidos-rtdb";
import { createOrder, subscribeToOrders } from "@/src/services/pedidos-rtdb";
import type { Producto } from "@/src/services/productos-rtdb";
import { descontarStock, subscribeToProductosActivos } from "@/src/services/productos-rtdb";
import { isMesaOcupada } from "@/src/utils/mesa-items";
import { showAlert, showConfirm } from "@/src/utils/errorHandler";
import { useEffect, useState } from "react";
import {
    FlatList,
    KeyboardAvoidingView,
    Platform,
    Text,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Pantalla POS para ventas en caja
export default function PosScreen() {
  const insets = useSafeAreaInsets();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [cart, setCart] = useState<CartItemData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [cartExpanded, setCartExpanded] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("efectivo");
  const [customerName, setCustomerName] = useState("");
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode | null>(null);
  const [tableNumber, setTableNumber] = useState("");
  const [processing, setProcessing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);

  // Suscripción en tiempo real a productos activos + carga de categorías
  useEffect(() => {
    const unsubscribe = subscribeToProductosActivos(setProductos);
    getCategorias()
      .then(setCategorias)
      .catch((e) => console.error("Error loading POS categories:", e))
      .finally(() => setLoading(false));
    return unsubscribe;
  }, []);

  // Mantiene las órdenes al día para saber qué mesas están ocupadas
  useEffect(() => {
    return subscribeToOrders(setOrders);
  }, []);

  // Obtiene la cantidad del producto en el carrito
  const getCartQuantity = (productId: string) => {
    const item = cart.find((i) => i.product.id === productId);
    return item ? item.quantity : 0;
  };

  // Agrega el producto verificando stock
  const handleAddToCart = (product: Producto) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);

      if (existing) {
        const newQty = existing.quantity + 1;
        if (newQty > product.stock) {
          showAlert(
            "Stock insuficiente",
            `Solo hay ${product.stock} unidades disponibles de ${product.name}`,
          );
          return prev;
        }
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: newQty } : i,
        );
      }

      if (product.stock <= 0) {
        showAlert("Sin stock", `${product.name} no tiene stock disponible`);
        return prev;
      }

      return [...prev, { product, quantity: 1 }];
    });
  };

  // Incrementa la cantidad del ítem
  const handleIncrement = (productId: string) => {
    setCart((prev) => {
      const item = prev.find((i) => i.product.id === productId);
      if (!item) return prev;
      if (item.quantity + 1 > item.product.stock) {
        showAlert(
          "Stock insuficiente",
          `Solo hay ${item.product.stock} unidades disponibles`,
        );
        return prev;
      }
      return prev.map((i) =>
        i.product.id === productId ? { ...i, quantity: i.quantity + 1 } : i,
      );
    });
  };

  // Decrementa la cantidad del ítem
  const handleDecrement = (productId: string) => {
    setCart((prev) => {
      const item = prev.find((i) => i.product.id === productId);
      if (!item) return prev;
      if (item.quantity <= 1) {
        return prev.filter((i) => i.product.id !== productId);
      }
      return prev.map((i) =>
        i.product.id === productId ? { ...i, quantity: i.quantity - 1 } : i,
      );
    });
  };

  // Elimina un ítem del carrito del POS
  const handleRemove = (productId: string) => {
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
  };

  // Procesa el cobro del POS
  // Procesa el cobro del POS. charge=false crea el pedido sin cobrar (mesa)
  const handleCheckout = async (charge: boolean) => {
    if (cart.length === 0) return;

    // Mostrador: el nombre del cliente es obligatorio
    if (deliveryMode === null && !customerName.trim()) {
      showAlert(
        "Nombre requerido",
        "Ingresa el nombre del cliente para pedidos de mostrador.",
      );
      return;
    }

    // Mesa: el número de mesa es obligatorio
    if (deliveryMode === "mesa" && !tableNumber.trim()) {
      showAlert(
        "Número de mesa requerido",
        "Ingresa el número de mesa para pedidos de mesa.",
      );
      return;
    }

    // Mesa: no se puede usar una mesa ocupada sin liberar
    if (deliveryMode === "mesa") {
      const mesa = tableNumber.trim();
      if (isMesaOcupada(orders, mesa)) {
        const message = `Mesa ${mesa} está ocupada. Libérala desde el tab Mesas para poder usarla.`;
        showAlert("Mesa ocupada", message);
        return;
      }
    }

    setProcessing(true);

    try {
      const items: OrderItem[] = cart.map(({ product, quantity }) => ({
        productId: product.id,
        name: product.name,
        quantity,
        unitPrice: product.price,
        subtotal: product.price * quantity,
        round: 1,
        status: "pending",
      }));

      const total = items.reduce((sum, i) => sum + i.subtotal, 0);

      await createOrder({
        customerId: null,
        customerName: customerName.trim() || "Mostrador",
        items,
        total,
        status: "pending",
        type: "pos",
        paymentMethod,
        deliveryMode: deliveryMode ?? "recoger",
        ...(deliveryMode === "mesa" && tableNumber.trim()
          ? { tableNumber: tableNumber.trim() }
          : {}),
        paidAt: charge ? new Date().toISOString() : undefined,
        createdAt: new Date().toISOString(),
      });

      await Promise.all(
        cart.map(({ product, quantity }) =>
          descontarStock(product.id, quantity),
        ),
      );

      setCart([]);
      setShowCheckout(false);
      setCartExpanded(false);
      setCustomerName("");
      setDeliveryMode(null);
      setTableNumber("");

      const successMessage = charge
        ? `Pedido creado y cobrado por S/. ${total.toFixed(2)}`
        : "Pedido registrado sin cobro. Se cobrará al cierre de la mesa.";

      showConfirm(
        "Pedido realizado",
        successMessage,
        () => router.replace("/(tabs)/pedidosAdmin"),
        undefined,
        { confirmLabel: "OK" },
      );
    } catch {
      showAlert("Error", "No se pudo completar la venta. Intenta de nuevo.");
    } finally {
      setProcessing(false);
    }
  };

  const filtered = productos.filter((p) => {
    return !selectedCategory || p.categoryId === selectedCategory;
  });

  const total = cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-white"
    >
      <FlatList
        data={filtered}
        numColumns={2}
        keyExtractor={(item) => item.id}
        columnWrapperStyle={{ paddingHorizontal: 8, gap: 8 }}
        contentContainerStyle={{ paddingBottom: cartExpanded ? 420 : 80 }}
        ListHeaderComponent={
          <>
            <View className="bg-primary pb-4 px-4" style={{ paddingTop: insets.top + 16 }}>
              <Text className="text-h2 text-text-inverse">Punto de Venta</Text>
            </View>
            <CategoryFilter
              categorias={categorias}
              selected={selectedCategory}
              onSelect={setSelectedCategory}
            />
            {filtered.length === 0 && (
              <View className="items-center py-12">
                <Text className="text-4xl mb-2">📦</Text>
                <Text className="text-body text-text-muted">
                  No hay productos en esta categoría
                </Text>
              </View>
            )}
          </>
        }
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            cartQuantity={getCartQuantity(item.id)}
            onAdd={handleAddToCart}
          />
        )}
      />

      <CartPanel
        cart={cart}
        expanded={cartExpanded}
        onToggle={() => setCartExpanded(!cartExpanded)}
        onIncrement={handleIncrement}
        onDecrement={handleDecrement}
        onRemove={handleRemove}
        onCheckout={() => setShowCheckout(true)}
        paymentMethod={paymentMethod}
        onPaymentMethodChange={setPaymentMethod}
      />

      <CheckoutModal
        visible={showCheckout}
        cart={cart}
        total={total}
        paymentMethod={paymentMethod}
        customerName={customerName}
        onCustomerNameChange={setCustomerName}
        deliveryMode={deliveryMode}
        onDeliveryModeChange={setDeliveryMode}
        tableNumber={tableNumber}
        onTableNumberChange={setTableNumber}
        onConfirm={() => handleCheckout(true)}
        onConfirmPedido={() => handleCheckout(false)}
        onClose={() => setShowCheckout(false)}
        processing={processing}
      />
    </KeyboardAvoidingView>
  );
}
