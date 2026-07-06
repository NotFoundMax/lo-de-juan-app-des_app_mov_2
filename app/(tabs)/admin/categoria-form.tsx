import LoadingSpinner from "@/src/components/LoadingSpinner";
import {
    createCategoria,
    getCategoria,
    updateCategoria,
} from "@/src/services/categorias-rtdb";
import { showError } from "@/src/utils/errorHandler";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
    Alert,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
} from "react-native";

// Formulario de creación/edición de categoría
export default function CategoriaFormScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const isEditing = !!id;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [order, setOrder] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);

  // Carga los datos de la categoría para edición
  useEffect(() => {
    if (!isEditing) return;
    const load = async () => {
      try {
        const cat = await getCategoria(id);
        if (cat) {
          setName(cat.name);
          setDescription(cat.description);
          setOrder(String(cat.order));
          setImageUrl(cat.imageUrl ?? "");
        }
      } catch (e) {
        showError(e, "categoria-form");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  // Guarda o actualiza la categoría
  const handleSave = async () => {
    if (!name || !order) {
      Alert.alert("Error", "Nombre y orden son obligatorios");
      return;
    }
    setSaving(true);
    try {
      const data = { name, description, order: parseInt(order), imageUrl };
      if (isEditing) {
        await updateCategoria(id, data);
      } else {
        await createCategoria(data);
      }
      router.back();
    } catch (e) {
      showError(e, "categoria-form");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <ScrollView className="flex-1 bg-surface px-4 pt-4">
      <TextInput
        className="bg-light-gray px-4 py-3 rounded-xl mb-3 text-text-primary"
        placeholder="Nombre de la categoría"
        placeholderTextColor="#805140"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        className="bg-light-gray px-4 py-3 rounded-xl mb-3 text-text-primary"
        placeholder="Descripción"
        placeholderTextColor="#805140"
        value={description}
        onChangeText={setDescription}
        multiline
      />
      <TextInput
        className="bg-light-gray px-4 py-3 rounded-xl mb-6 text-text-primary"
        placeholder="Orden (número)"
        placeholderTextColor="#805140"
        value={order}
        onChangeText={setOrder}
        keyboardType="number-pad"
      />
      <TextInput
        className="bg-light-gray px-4 py-3 rounded-xl mb-6 text-text-primary"
        placeholder="URL de imagen (opcional)"
        placeholderTextColor="#805140"
        value={imageUrl}
        onChangeText={setImageUrl}
      />
      <TouchableOpacity
        className="bg-primary py-3 rounded-xl items-center"
        onPress={handleSave}
        disabled={saving}
      >
        <Text className="text-subtitle text-text-inverse">
          {saving
            ? "Guardando..."
            : isEditing
              ? "Actualizar"
              : "Crear Categoría"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
