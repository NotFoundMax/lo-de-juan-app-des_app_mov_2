import LoadingSpinner from "@/src/components/LoadingSpinner";
import { useAuth } from "@/src/contexts/AuthContext";
import { useCarrito } from "@/src/contexts/CarritoContext";
import { Categoria, getCategorias } from "@/src/services/categorias-rtdb";
import {
    Producto,
    subscribeToProductosActivos,
} from "@/src/services/productos-rtdb";
import { Image } from "expo-image";
import { Redirect, router } from "expo-router";
import { useEffect, useState } from "react";
import {
    FlatList,
    RefreshControl,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const PLACEHOLDER = require("../../assets/images/icon.png");

// Tarjeta de producto con controles del carrito
function ProductCard({
  product,
  role,
  cartQuantity,
  onAdd,
  onIncrease,
  onDecrease,
}: {
  product: Producto;
  role: string;
  cartQuantity: number;
  onAdd: () => void;
  onIncrease: () => void;
  onDecrease: () => void;
}) {
  return (
    <View className="flex-row items-center bg-surface-hover rounded-xl p-3 mb-2 border border-border">
      <View className="w-16 h-16 bg-light-gray rounded-xl justify-center items-center mr-3 overflow-hidden">
        {product.imageUrl ? (
          <Image
            source={{ uri: product.imageUrl }}
            placeholder={{ blurhash: "LKO2?U%2Tw=w]~RBVZRi};RPxuwH" }}
            contentFit="cover"
            transition={200}
            style={{ width: 64, height: 64, borderRadius: 12 }}
          />
        ) : (
          <Text className="text-2xl">🍗</Text>
        )}
      </View>
      <View className="flex-1 justify-center">
        <Text className="text-body-bold text-text-primary">{product.name}</Text>
        <Text className="text-caption text-text-secondary" numberOfLines={1}>
          {product.description}
        </Text>
        <Text className="text-body-bold text-primary mt-1">
          S/.{product.price.toFixed(2)}
        </Text>
      </View>
      {role === "customer" &&
        (cartQuantity === 0 ? (
          <TouchableOpacity
            onPress={onAdd}
            style={{ width: 32, height: 32, borderRadius: 16 }}
            className="bg-primary justify-center items-center self-center ml-2 active:opacity-70"
          >
            <Text className="text-text-inverse text-body-bold leading-none">
              +
            </Text>
          </TouchableOpacity>
        ) : (
          <View className="flex-col items-center self-center ml-2">
            <TouchableOpacity
              onPress={onIncrease}
              style={{ width: 28, height: 28, borderRadius: 14 }}
              className="bg-primary justify-center items-center active:opacity-70"
            >
              <Text className="text-text-inverse text-caption font-bold leading-none">
                +
              </Text>
            </TouchableOpacity>
            <Text className="w-6 text-center text-caption font-bold text-text-primary">
              {cartQuantity}
            </Text>
            <TouchableOpacity
              onPress={onDecrease}
              style={{ width: 28, height: 28, borderRadius: 14 }}
              className="bg-light-gray justify-center items-center active:opacity-70"
            >
              <Text className="text-caption font-bold text-text-primary leading-none">
                −
              </Text>
            </TouchableOpacity>
          </View>
        ))}
    </View>
  );
}

// Catálogo principal con categorías
export default function HomeScreen() {
  const { role, isAdmin, isEmployee } = useAuth();
  const { items, addItem, updateQuantity, itemCount } = useCarrito();
  const insets = useSafeAreaInsets();

  if (isAdmin) {
    return <Redirect href="/(tabs)/pos" />;
  }
  if (isEmployee) {
    return <Redirect href="/(tabs)/pedidosAdmin" />;
  }
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Carga las categorías una sola vez (sin tiempo real)
  useEffect(() => {
    getCategorias().then(setCategorias).catch(console.error);
  }, []);

  // Suscripción en tiempo real a productos activos
  useEffect(() => {
    const unsubscribe = subscribeToProductosActivos((prods) => {
      setProductos(prods);
      setLoading(false);
      setRefreshing(false);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  const grouped = categorias
    .map((cat) => ({
      ...cat,
      items: productos.filter((p) => p.categoryId === cat.id),
    }))
    .filter((g) => g.items.length > 0);

  // Agrega el producto al carrito
  const handleAddItem = (product: Producto) =>
    addItem({
      productId: product.id!,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
    });

  // Obtiene la cantidad del producto en el carrito
  const getCartQty = (productId: string) =>
    items.find((i) => i.productId === productId)?.quantity ?? 0;

  return (
    <View className="flex-1 bg-white">
      <View
        className="bg-primary pb-6 px-6"
        style={{ paddingTop: insets.top + 24 }}
      >
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-h2 text-text-inverse">Lo de Juan</Text>
            <Text className="text-body text-text-inverse opacity-80 mt-1">
              {role === "admin"
                ? "Panel de Administración"
                : role === "employee"
                  ? "Panel de Trabajo"
                  : "¡Elige tu pedido!"}
            </Text>
          </View>
          {role === "customer" && itemCount > 0 && (
            <TouchableOpacity
              onPress={() => router.push("/carrito")}
              className="bg-secondary rounded-full px-4 py-2 flex-row items-center active:opacity-70"
            >
              <Text className="text-text-primary text-body-bold mr-1">🛒</Text>
              <Text className="text-text-primary text-body-bold">
                {itemCount}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={grouped}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => setRefreshing(true)}
          />
        }
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <View className="items-center mt-20">
            <Text className="text-4xl mb-4">🍗</Text>
            <Text className="text-subtitle text-text-secondary text-center">
              {role === "admin"
                ? "No hay productos. Agrega productos desde el panel Admin."
                : "No hay productos disponibles"}
            </Text>
          </View>
        }
        renderItem={({ item: category }) => (
          <View className="mb-6">
            {category.imageUrl ? (
              category.name === "Promociones" ? (
                <View className="w-full h-32 rounded-xl mb-3 overflow-hidden bg-surface-hover">
                  <Image
                    source={{ uri: category.imageUrl }}
                    placeholder={PLACEHOLDER}
                    contentFit="cover"
                    transition={300}
                    style={{ width: "143%", height: "100%", marginLeft: -20 }}
                  />
                </View>
              ) : (
                <Image
                  source={{ uri: category.imageUrl }}
                  placeholder={PLACEHOLDER}
                  contentFit="cover"
                  transition={300}
                  style={{
                    width: "100%",
                    height: 128,
                    borderRadius: 12,
                    marginBottom: 12,
                  }}
                />
              )
            ) : null}
            <Text className="text-h3 text-text-primary mb-3 ml-1">
              {category.name}
            </Text>
            {category.items.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                role={role}
                cartQuantity={getCartQty(product.id)}
                onAdd={() => handleAddItem(product)}
                onIncrease={() => handleAddItem(product)}
                onDecrease={() =>
                  updateQuantity(product.id!, getCartQty(product.id) - 1)
                }
              />
            ))}
          </View>
        )}
      />
    </View>
  );
}
