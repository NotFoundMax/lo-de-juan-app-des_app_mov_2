import type { PaymentMethod } from "@/src/services/pedidos-rtdb";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import CartItem, { CartItemData } from "./CartItem";
import CartSummary from "./CartSummary";

interface Props {
  cart: CartItemData[];
  expanded: boolean;
  onToggle: () => void;
  onIncrement: (productId: string) => void;
  onDecrement: (productId: string) => void;
  onRemove: (productId: string) => void;
  onCheckout: () => void;
  paymentMethod: PaymentMethod;
  onPaymentMethodChange: (method: PaymentMethod) => void;
}

// Renderiza el panel lateral del carrito
export default function CartPanel({
  cart,
  expanded,
  onToggle,
  onIncrement,
  onDecrement,
  onRemove,
  onCheckout,
  paymentMethod,
  onPaymentMethodChange,
}: Props) {
  const itemCount = cart.reduce((sum, i) => sum + i.quantity, 0);
  const total = cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  return (
    <View className="border-t border-border bg-white">
      <TouchableOpacity
        onPress={onToggle}
        className="flex-row items-center justify-between px-4 py-3"
      >
        <View className="flex-row items-center gap-2">
          <Text className="text-lg">🛒</Text>
          <Text className="text-body-bold text-text-primary">
            {itemCount} {itemCount === 1 ? "producto" : "productos"}
          </Text>
        </View>

        <View className="flex-row items-center gap-3">
          <Text className="text-body-bold text-primary">
            S/. {total.toFixed(2)}
          </Text>
          <Text className="text-caption text-text-muted">
            {expanded ? "▼" : "▲"}
          </Text>
        </View>
      </TouchableOpacity>

      {expanded && (
        <View className="max-h-96">
          <FlatList
            data={cart}
            keyExtractor={(item) => item.product.id}
            renderItem={({ item }) => (
              <CartItem
                item={item}
                onIncrement={onIncrement}
                onDecrement={onDecrement}
                onRemove={onRemove}
              />
            )}
            ListEmptyComponent={
              <View className="py-8 items-center">
                <Text className="text-body text-text-muted">Carrito vacío</Text>
              </View>
            }
          />

          <CartSummary
            total={total}
            itemCount={itemCount}
            paymentMethod={paymentMethod}
            onPaymentMethodChange={onPaymentMethodChange}
            onCheckout={onCheckout}
          />
        </View>
      )}
    </View>
  );
}
