import { Text, View } from "react-native";

interface Props {
  icon: string;
  message: string;
}

// Placeholder cuando la lista está vacía
export default function EmptyState({ icon, message }: Props) {
  return (
    <View className="items-center mt-20">
      <Text className="text-5xl mb-4">{icon}</Text>
      <Text className="text-subtitle text-text-secondary text-center">
        {message}
      </Text>
    </View>
  );
}
