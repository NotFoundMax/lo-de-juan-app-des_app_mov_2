import type { Categoria } from "@/src/services/categorias-rtdb";
import { ScrollView, Text, TouchableOpacity } from "react-native";

interface Props {
  categorias: Categoria[];
  selected: string | null;
  onSelect: (id: string | null) => void;
}

// Renderiza la barra de filtro de categorías
export default function CategoryFilter({
  categorias,
  selected,
  onSelect,
}: Props) {
  const isAll = selected === null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="py-3 px-4"
      contentContainerStyle={{ gap: 8 }}
    >
      <TouchableOpacity
        onPress={() => onSelect(null)}
        className={`px-4 py-2 rounded-full border ${
          isAll ? "bg-primary border-primary" : "bg-white border-border"
        }`}
      >
        <Text
          className={`text-caption font-semibold ${
            isAll ? "text-white" : "text-text-secondary"
          }`}
        >
          Todas
        </Text>
      </TouchableOpacity>

      {categorias.map((cat) => {
        const active = selected === cat.id;
        return (
          <TouchableOpacity
            key={cat.id}
            onPress={() => onSelect(cat.id)}
            className={`px-4 py-2 rounded-full border ${
              active ? "bg-primary border-primary" : "bg-white border-border"
            }`}
          >
            <Text
              className={`text-caption font-semibold ${
                active ? "text-white" : "text-text-secondary"
              }`}
            >
              {cat.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}
