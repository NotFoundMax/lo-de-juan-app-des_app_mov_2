import { ActivityIndicator, View } from "react-native";

interface Props {
  size?: "small" | "large";
  color?: string;
}

// Indicador de carga a pantalla completa
export default function LoadingSpinner({
  size = "large",
  color = "#f84d3f",
}: Props) {
  return (
    <View className="flex-1 justify-center items-center bg-surface">
      <ActivityIndicator size={size} color={color} />
    </View>
  );
}
