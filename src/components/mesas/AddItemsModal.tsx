import CategoryFilter from "@/src/components/pos/CategoryFilter";
import ProductCard from "@/src/components/pos/ProductCard";
import type { CartItemData } from "@/src/components/pos/CartItem";
import type { Categoria } from "@/src/services/categorias-rtdb";
import type { Producto } from "@/src/services/productos-rtdb";
import { showAlert } from "@/src/utils/errorHandler";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface Props {
  visible: boolean;
  mesaLabel: string;
  productos: Producto[];
  categorias: Categoria[];
  processing: boolean;
  onClose: () => void;
  onConfirm: (items: CartItemData[]) => void;
}

// Modal para agregar ítems nuevos (ronda adicional) a una mesa
export default function AddItemsModal({
  visible,
  mesaLabel,
  productos,
  categorias,
  processing,
  onClose,
  onConfirm,
}: Props) {
  const [cart, setCart] = useState<CartItemData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) {
      setCart([]);
      setSelectedCategory(null);
    }
  }, [visible]);

  const filtered = productos.filter(
    (p) => !selectedCategory || p.categoryId === selectedCategory,
  );

  const getCartQuantity = (productId: string) => {
    const item = cart.find((i) => i.product.id === productId);
    return item ? item.quantity : 0;
  };

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

  const handleRemove = (productId: string) => {
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const total = cart.reduce(
    (sum, i) => sum + i.product.price * i.quantity,
    0,
  );

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 bg-black/50">
        <View className="flex-1 mt-auto bg-white rounded-t-3xl max-h-[90%]">
          <View className="flex-row items-center justify-between px-6 pt-6 pb-3">
            <Text className="text-h3 text-text-primary">
              Agregar a {mesaLabel}
            </Text>
            <TouchableOpacity onPress={onClose} disabled={processing}>
              <Text className="text-body text-text-muted">✕</Text>
            </TouchableOpacity>
          </View>

          <CategoryFilter
            categorias={categorias}
            selected={selectedCategory}
            onSelect={setSelectedCategory}
          />

          <FlatList
            data={filtered}
            numColumns={2}
            keyExtractor={(item) => item.id}
            columnWrapperStyle={{ paddingHorizontal: 8, gap: 8 }}
            contentContainerStyle={{ paddingBottom: 160 }}
            renderItem={({ item }) => (
              <ProductCard
                product={item}
                cartQuantity={getCartQuantity(item.id)}
                onAdd={handleAddToCart}
              />
            )}
            ListEmptyComponent={
              <View className="items-center py-12">
                <Text className="text-4xl mb-2">📦</Text>
                <Text className="text-body text-text-muted">
                  No hay productos en esta categoría
                </Text>
              </View>
            }
          />

          <View className="px-6 py-4 border-t border-border">
            <ScrollView className="mb-3" style={{ maxHeight: 120 }}>
              {cart.length === 0 ? (
                <Text className="text-small text-text-muted">
                  Selecciona productos para agregar
                </Text>
              ) : (
                cart.map(({ product, quantity }) => (
                  <View
                    key={product.id}
                    className="flex-row items-center justify-between py-1"
                  >
                    <Text
                      className="text-small text-text-primary flex-1"
                      numberOfLines={1}
                    >
                      {product.name} × {quantity}
                    </Text>
                    <View className="flex-row items-center gap-2 ml-2">
                      <TouchableOpacity
                        onPress={() => handleIncrement(product.id)}
                        className="w-6 h-6 bg-surface rounded border border-border items-center justify-center"
                      >
                        <Text className="text-small font-bold">+</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDecrement(product.id)}
                        className="w-6 h-6 bg-surface rounded border border-border items-center justify-center"
                      >
                        <Text className="text-small font-bold">-</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleRemove(product.id)}
                      >
                        <Text className="text-small text-error">✕</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>

            <TouchableOpacity
              onPress={() => onConfirm(cart)}
              disabled={processing || cart.length === 0}
              className="bg-primary py-3 rounded-xl items-center"
              style={{ opacity: processing || cart.length === 0 ? 0.5 : 1 }}
            >
              {processing ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-body-bold text-white">
                  Agregar (S/. {total.toFixed(2)})
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
