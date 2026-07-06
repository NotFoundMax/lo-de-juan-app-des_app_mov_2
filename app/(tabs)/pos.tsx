import LoadingSpinner from "@/src/components/LoadingSpinner";
import type { CartItemData } from "@/src/components/pos/CartItem";
import CartPanel from "@/src/components/pos/CartPanel";
import CategoryFilter from "@/src/components/pos/CategoryFilter";
import CheckoutModal from "@/src/components/pos/CheckoutModal";
import ProductCard from "@/src/components/pos/ProductCard";
import type { Categoria } from "@/src/services/categorias-rtdb";
import { getCategorias } from "@/src/services/categorias-rtdb";
import type {
    DeliveryMode,
    OrderItem,
    PaymentMethod,
} from "@/src/services/pedidos-rtdb";
import { createOrder } from "@/src/services/pedidos-rtdb";
import type { Producto } from "@/src/services/productos-rtdb";
import { descontarStock, getProductosActivos } from "@/src/services/productos-rtdb";
import { useEffect, useState } from "react";
import {
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    RefreshControl,
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
  const [refreshing, setRefreshing] = useState(false);

  // Carga los datos del POS
  const load = async () => {
    try {
      const [prods, cats] = await Promise.all([
        getProductosActivos(),
        getCategorias(),
      ]);
      setProductos(prods);
      setCategorias(cats);
    } catch (e) {
      console.error("Error loading POS:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
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
          Alert.alert(
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
        Alert.alert("Sin stock", `${product.name} no tiene stock disponible`);
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
        Alert.alert(
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
  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setProcessing(true);

    try {
      const items: OrderItem[] = cart.map(({ product, quantity }) => ({
        productId: product.id,
        name: product.name,
        quantity,
        unitPrice: product.price,
        subtotal: product.price * quantity,
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
        paidAt: new Date().toISOString(),
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

      Alert.alert(
        "Venta registrada",
        `Pedido creado con éxito por S/. ${total.toFixed(2)}`,
      );
    } catch {
      Alert.alert("Error", "No se pudo completar la venta. Intenta de nuevo.");
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load();
            }}
          />
        }
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
        onConfirm={handleCheckout}
        onClose={() => setShowCheckout(false)}
        processing={processing}
      />
    </KeyboardAvoidingView>
  );
}
