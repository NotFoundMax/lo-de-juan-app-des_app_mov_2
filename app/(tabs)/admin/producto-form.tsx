import LoadingSpinner from "@/src/components/LoadingSpinner";
import { Categoria, getCategorias } from "@/src/services/categorias-rtdb";
import {
    createProducto,
    getProducto,
    updateProducto,
} from "@/src/services/productos-rtdb";
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

// Product create/edit form
export default function ProductoFormScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const isEditing = !!id;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [minStock, setMinStock] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [active, setActive] = useState(true);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Carga los datos del producto para edición
  useEffect(() => {
    const load = async () => {
      try {
        const cats = await getCategorias();
        setCategorias(cats);
        if (isEditing) {
          const prod = await getProducto(id);
          if (prod) {
            setName(prod.name);
            setDescription(prod.description);
            setPrice(String(prod.price));
            setStock(String(prod.stock));
            setMinStock(String(prod.minStock));
            setImageUrl(prod.imageUrl);
            setCategoryId(prod.categoryId);
            setActive(prod.active);
          }
        }
      } catch (e) {
        showError(e, "producto-form");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  // Guarda o actualiza el producto
  const handleSave = async () => {
    if (!name || !price || !categoryId) {
      Alert.alert("Error", "Nombre, precio y categoría son obligatorios");
      return;
    }
    setSaving(true);
    try {
      const data = {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock) || 0,
        minStock: parseInt(minStock) || 0,
        imageUrl,
        categoryId,
        active,
        createdAt: new Date().toISOString(),
      };
      if (isEditing) {
        await updateProducto(id, data);
      } else {
        await createProducto(data);
      }
      router.back();
    } catch (e) {
      showError(e, "producto-form");
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
        placeholder="Nombre del producto"
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
        className="bg-light-gray px-4 py-3 rounded-xl mb-3 text-text-primary"
        placeholder="Precio (S/.)"
        placeholderTextColor="#805140"
        value={price}
        onChangeText={setPrice}
        keyboardType="decimal-pad"
      />
      <View className="flex-row gap-3 mb-3">
        <TextInput
          className="flex-1 bg-light-gray px-4 py-3 rounded-xl text-text-primary"
          placeholder="Cantidad en inventario"
          placeholderTextColor="#805140"
          value={stock}
          onChangeText={setStock}
          keyboardType="number-pad"
        />
        <TextInput
          className="flex-1 bg-light-gray px-4 py-3 rounded-xl text-text-primary"
          placeholder="Cantidad mínima"
          placeholderTextColor="#805140"
          value={minStock}
          onChangeText={setMinStock}
          keyboardType="number-pad"
        />
      </View>
      <TextInput
        className="bg-light-gray px-4 py-3 rounded-xl mb-3 text-text-primary"
        placeholder="URL de imagen (opcional)"
        placeholderTextColor="#805140"
        value={imageUrl}
        onChangeText={setImageUrl}
      />
      <Text className="text-caption-bold text-text-primary mb-2">
        Categoría
      </Text>
      <View className="flex-row flex-wrap gap-2 mb-4">
        {categorias.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            className={`px-4 py-2 rounded-full border ${
              categoryId === cat.id
                ? "bg-primary border-primary"
                : "bg-surface border-border"
            }`}
            onPress={() => setCategoryId(cat.id)}
          >
            <Text
              className={
                categoryId === cat.id
                  ? "text-text-inverse"
                  : "text-text-primary"
              }
            >
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <View className="flex-row items-center justify-between mb-6">
        <Text className="text-text-primary text-body-bold">
          Producto activo
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
              : "Crear Producto"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
