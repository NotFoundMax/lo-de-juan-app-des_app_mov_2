import LoadingSpinner from "@/src/components/LoadingSpinner";
import {
    createMaterial,
    getMaterial,
    MATERIAL_CONFIG,
    MaterialType,
    updateMaterial,
} from "@/src/services/capacitacion-rtdb";
import { showError } from "@/src/utils/errorHandler";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
    Alert,
    ScrollView,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const TYPES = Object.entries(MATERIAL_CONFIG).map(([key, v]) => ({
  key: key as MaterialType,
  label: v.label,
  icon: v.icon,
}));

// Formulario de creación/edición de material de capacitación
export default function CapacitacionFormScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const isEditing = !!id;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<MaterialType>("manual");
  const [url, setUrl] = useState("");
  const [active, setActive] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Carga los datos del material para edición
  useEffect(() => {
    const load = async () => {
      try {
        if (isEditing) {
          const mat = await getMaterial(id);
          if (mat) {
            setTitle(mat.title);
            setDescription(mat.description);
            setType(mat.type);
            setUrl(mat.url);
            setActive(mat.active);
          }
        }
      } catch (e) {
        console.error("Error loading training:", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  // Guarda o actualiza el material
  const handleSave = async () => {
    if (!title || !description) {
      Alert.alert("Error", "Título y descripción son obligatorios");
      return;
    }
    setSaving(true);
    try {
      const data = {
        title,
        description,
        type,
        url,
        active,
        createdAt: new Date().toISOString(),
      };
      if (isEditing) {
        await updateMaterial(id, data);
      } else {
        await createMaterial(data);
      }
      router.back();
    } catch (e) {
      showError(e, "capacitacion-form");
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
        placeholder="Título del material"
        placeholderTextColor="#805140"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        className="bg-light-gray px-4 py-3 rounded-xl mb-3 text-text-primary"
        placeholder="Descripción"
        placeholderTextColor="#805140"
        value={description}
        onChangeText={setDescription}
        multiline
      />
      <Text className="text-caption-bold text-text-primary mb-2">
        Tipo de material
      </Text>
      <View className="flex-row gap-2 mb-4">
        {TYPES.map((t) => (
          <TouchableOpacity
            key={t.key}
            onPress={() => setType(t.key)}
            className="flex-1 py-3 rounded-xl items-center"
            style={{
              backgroundColor: type === t.key ? "#f84d3f" : "#f5f5f5",
            }}
          >
            <Text className="text-xl mb-1">{t.icon}</Text>
            <Text
              className="text-small font-bold"
              style={{ color: type === t.key ? "#ffffff" : "#666666" }}
            >
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <TextInput
        className="bg-light-gray px-4 py-3 rounded-xl mb-3 text-text-primary"
        placeholder="URL del material (PDF, imagen o video)"
        placeholderTextColor="#805140"
        value={url}
        onChangeText={setUrl}
      />
      <View className="flex-row items-center justify-between mb-6">
        <Text className="text-text-primary text-body-bold">
          Material activo
        </Text>
        <Switch
          value={active}
          onValueChange={setActive}
          trackColor={{ false: "#ccc", true: "#f84d3f" }}
          thumbColor="#fff"
        />
      </View>
      <TouchableOpacity
        className="bg-primary py-3 rounded-xl items-center mb-8"
        onPress={handleSave}
        disabled={saving}
      >
        <Text className="text-subtitle text-text-inverse">
          {saving
            ? "Guardando..."
            : isEditing
              ? "Actualizar"
              : "Crear Material"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
