import type { Producto } from "@/src/services/productos-rtdb";
import { Image, Text, TouchableOpacity, View } from "react-native";

interface Props {
  product: Producto;
  cartQuantity: number;
  onAdd: (product: Producto) => void;
}

// Renderiza la tarjeta de un producto
export default function ProductCard({ product, cartQuantity, onAdd }: Props) {
  const stockAfterCart = product.stock - cartQuantity;
  const isOutOfStock = stockAfterCart <= 0;

  return (
    <TouchableOpacity
      onPress={() => onAdd(product)}
      disabled={isOutOfStock}
      className={`flex-1 bg-surface rounded-xl border ${
        isOutOfStock ? "border-error/30 opacity-50" : "border-border"
      } p-3`}
    >
      <View className="w-full h-20 bg-light-gray rounded-lg justify-center items-center mb-2">
        {product.imageUrl ? (
          <Image
            source={{ uri: product.imageUrl }}
            className="w-full h-full rounded-lg"
            resizeMode="cover"
          />
        ) : (
          <Text className="text-3xl">🍗</Text>
        )}
      </View>

      <Text className="text-body-bold text-text-primary" numberOfLines={1}>
        {product.name}
      </Text>

      <Text className="text-caption text-text-muted mb-1">
        S/. {product.price.toFixed(2)}
      </Text>

      <View className="flex-row items-center justify-between">
        <Text className="text-caption text-text-muted">
          {isOutOfStock ? "Agotado" : `Disponible: ${stockAfterCart}`}
        </Text>

        {cartQuantity > 0 && (
          <View className="bg-primary rounded-full w-6 h-6 items-center justify-center">
            <Text className="text-white text-caption font-bold">
              {cartQuantity}
            </Text>
          </View>
        )}
      </View>

      {isOutOfStock && (
        <View className="absolute top-2 right-2 bg-error rounded-md px-2 py-0.5">
          <Text className="text-white text-xs font-bold">AGOTADO</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
