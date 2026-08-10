import LoadingSpinner from "@/src/components/LoadingSpinner";
import { Categoria, getCategorias } from "@/src/services/categorias-rtdb";
import {
    createProducto,
    existsByName,
    getProducto,
    updateProducto,
} from "@/src/services/productos-rtdb";
import { showAlert, showError } from "@/src/utils/errorHandler";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
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
  const [fieldErrors, setFieldErrors] = useState<string[]>([]);

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
    const trimmedName = name.trim();
    const trimmedPrice = price.trim();

    const missing: string[] = [];
    if (!trimmedName) missing.push("Nombre");
    if (!trimmedPrice) missing.push("Precio");
    if (!categoryId) missing.push("Categoría");
    if (missing.length > 0) {
      setFieldErrors(missing);
      showAlert("Completa los campos", `Faltan: ${missing.join(", ")}`);
      return;
    }
    setFieldErrors([]);

    const duplicado = await existsByName(
      trimmedName,
      isEditing ? id : undefined,
    );
    if (duplicado) {
      showAlert(
        "Producto ya creado",
        `Ya existe un producto llamado "${trimmedName}"`,
      );
      return;
    }

    setSaving(true);
    try {
      const data = {
        name: trimmedName,
        description: description.trim(),
        price: parseFloat(trimmedPrice),
        stock: parseInt(stock) || 0,
        minStock: parseInt(minStock) || 0,
        imageUrl: imageUrl.trim(),
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
      <Text className="text-caption text-text-muted mb-1">
        Nombre del producto
      </Text>
      <TextInput
        className={`bg-light-gray px-4 py-3 rounded-xl mb-3 text-text-primary ${
          fieldErrors.includes("Nombre") ? "border border-[#dc2626]" : ""
        }`}
        placeholder="Nombre del producto"
        placeholderTextColor="#805140"
        value={name}
        onChangeText={setName}
      />
      <Text className="text-caption text-text-muted mb-1">
        Descripción (opcional)
      </Text>
      <TextInput
        className="bg-light-gray px-4 py-3 rounded-xl mb-3 text-text-primary"
        placeholder="Descripción"
        placeholderTextColor="#805140"
        value={description}
        onChangeText={setDescription}
        multiline
      />
      <Text className="text-caption text-text-muted mb-1">Precio (S/.)</Text>
      <TextInput
        className={`bg-light-gray px-4 py-3 rounded-xl mb-3 text-text-primary ${
          fieldErrors.includes("Precio") ? "border border-[#dc2626]" : ""
        }`}
        placeholder="Precio (S/.)"
        placeholderTextColor="#805140"
        value={price}
        onChangeText={setPrice}
        keyboardType="decimal-pad"
      />
      <View className="flex-row gap-3 mb-3">
        <View className="flex-1">
          <Text className="text-caption text-text-muted mb-1">
            Cantidad en inventario (opcional)
          </Text>
          <TextInput
            className="bg-light-gray px-4 py-3 rounded-xl text-text-primary"
            placeholder="Inventario"
            placeholderTextColor="#805140"
            value={stock}
            onChangeText={setStock}
            keyboardType="number-pad"
          />
        </View>
        <View className="flex-1">
          <Text className="text-caption text-text-muted mb-1">
            Cantidad mínima (opcional)
          </Text>
          <TextInput
            className="bg-light-gray px-4 py-3 rounded-xl text-text-primary"
            placeholder="Mínimo"
            placeholderTextColor="#805140"
            value={minStock}
            onChangeText={setMinStock}
            keyboardType="number-pad"
          />
        </View>
      </View>
      <Text className="text-caption text-text-muted mb-1">
        URL de imagen (opcional)
      </Text>
      <TextInput
        className="bg-light-gray px-4 py-3 rounded-xl mb-3 text-text-primary"
        placeholder="https://ejemplo.com/imagen.jpg"
        placeholderTextColor="#805140"
        value={imageUrl}
        onChangeText={setImageUrl}
      />
      <Text className="text-caption-bold text-text-primary mb-2">
        Categoría
        {fieldErrors.includes("Categoría") ? (
          <Text className="text-caption text-[#dc2626]"> (requerida)</Text>
        ) : null}
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
