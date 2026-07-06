import { Text, View } from "react-native";

interface Props {
  title: string;
  subtitle?: string;
  pt?: number;
}

// Encabezado de página reutilizable
export default function PageHeader({ title, subtitle, pt = 48 }: Props) {
  return (
    <View className="bg-primary pb-6 px-6" style={{ paddingTop: pt }}>
      <Text className="text-h2 text-text-inverse">{title}</Text>
      {subtitle && (
        <Text className="text-body text-text-inverse opacity-80 mt-1">
          {subtitle}
        </Text>
      )}
    </View>
  );
}
