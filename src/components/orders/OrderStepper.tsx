import { DeliveryMode, Order } from "@/src/services/pedidos-rtdb";
import { Text, View } from "react-native";

interface OrderStepperProps {
  status: Order["status"];
  deliveryMode?: DeliveryMode;
}

// Muestra el estado del pedido paso a paso
export default function OrderStepper({
  status,
  deliveryMode,
}: OrderStepperProps) {
  const steps =
    deliveryMode === "delivery"
      ? [
          { key: "pending", label: "Pend." },
          { key: "preparing", label: "Prep." },
          { key: "ready", label: "Listo" },
          { key: "delivered", label: "Entr." },
        ]
      : [
          { key: "pending", label: "Pend." },
          { key: "preparing", label: "Prep." },
          { key: "ready", label: "Listo" },
        ];

  const stepOrder = ["pending", "preparing", "ready", "delivered"];
  const currentIdx = stepOrder.indexOf(status);

  if (status === "cancelled") {
    return (
      <View className="flex-row items-start mt-3">
        <View className="items-center">
          <View className="w-6 h-6 rounded-full bg-success justify-center items-center">
            <Text className="text-white text-small font-bold">✓</Text>
          </View>
          <Text className="text-small text-success mt-1">Pend.</Text>
        </View>
        <View
          className="flex-1 h-0.5 mx-1"
          style={{ backgroundColor: "#22c55e", marginTop: 11 }}
        />
        <View className="items-center">
          <View className="w-6 h-6 rounded-full bg-error justify-center items-center">
            <Text className="text-white text-small font-bold">✕</Text>
          </View>
          <Text className="text-small text-error mt-1">Cancelado</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-row items-start mt-3">
      {steps.flatMap((step, i) => {
        const stepIdx = stepOrder.indexOf(step.key);
        const isCompleted = currentIdx >= 0 && stepIdx < currentIdx;
        const isCurrent = step.key === status;
        const isFuture = currentIdx >= 0 && stepIdx > currentIdx;

        const elements: React.ReactNode[] = [];

        if (i > 0) {
          elements.push(
            <View
              key={`line-${step.key}`}
              className="flex-1 h-0.5 mx-1"
              style={{
                backgroundColor:
                  isCompleted || isCurrent ? "#22c55e" : "#e5e7eb",
                marginTop: 11,
              }}
            />,
          );
        }

        elements.push(
          <View key={`step-${step.key}`} className="items-center">
            <View
              className="w-6 h-6 rounded-full justify-center items-center"
              style={{
                backgroundColor: isCompleted
                  ? "#22c55e"
                  : isCurrent
                    ? "#f97316"
                    : "#ffffff",
                borderWidth: isFuture ? 2 : 0,
                borderColor: "#e5e7eb",
              }}
            >
              {isCompleted && (
                <Text className="text-white text-small font-bold">✓</Text>
              )}
              {isCurrent && <View className="w-2 h-2 rounded-full bg-white" />}
            </View>
            <Text
              className="text-small mt-1"
              style={{
                color: isCompleted
                  ? "#22c55e"
                  : isCurrent
                    ? "#f97316"
                    : "#9ca3af",
              }}
            >
              {step.label}
            </Text>
          </View>,
        );

        return elements;
      })}
    </View>
  );
}
