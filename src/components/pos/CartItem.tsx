import type { Producto } from "@/src/services/productos-rtdb";
import { Text, TouchableOpacity, View } from "react-native";

export interface CartItemData {
  product: Producto;
  quantity: number;
}

interface Props {
  item: CartItemData;
  onIncrement: (productId: string) => void;
  onDecrement: (productId: string) => void;
  onRemove: (productId: string) => void;
}

// Renderiza la fila de un ítem del carrito
export default function CartItem({
  item,
  onIncrement,
  onDecrement,
  onRemove,
}: Props) {
  return (
    <View className="flex-row items-center py-3 px-4 border-b border-border/50">
      <View className="flex-1">
        <Text className="text-body-bold text-text-primary" numberOfLines={1}>
          {item.product.name}
        </Text>
        <Text className="text-caption text-text-muted">
          S/. {item.product.price.toFixed(2)} c/u
        </Text>
      </View>

      <View className="flex-row items-center gap-3">
        <View className="flex-row items-center border border-border rounded-lg">
          <TouchableOpacity
            onPress={() => onDecrement(item.product.id)}
            className="px-3 py-2"
          >
            <Text className="text-body-bold text-text-primary">-</Text>
          </TouchableOpacity>

          <Text className="px-3 py-2 text-body-bold text-text-primary min-w-[24px] text-center">
            {item.quantity}
          </Text>

          <TouchableOpacity
            onPress={() => onIncrement(item.product.id)}
            disabled={item.quantity >= item.product.stock}
            className={`px-3 py-2 ${
              item.quantity >= item.product.stock ? "opacity-30" : ""
            }`}
          >
            <Text className="text-body-bold text-text-primary">+</Text>
          </TouchableOpacity>
        </View>

        <Text className="text-body-bold text-primary min-w-[64px] text-right">
          S/. {(item.product.price * item.quantity).toFixed(2)}
        </Text>

        <TouchableOpacity
          onPress={() => onRemove(item.product.id)}
          className="p-1"
        >
          <Text className="text-body text-error">✕</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
