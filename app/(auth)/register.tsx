import { signUp } from "@/src/services/auth-rtdb";
import { showError } from "@/src/utils/errorHandler";
import { Link, router } from "expo-router";
import { useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";

// Formulario de registro de usuario
export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Procesa el registro del usuario
  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert("Error", "Completa todos los campos");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Error", "La contraseña debe tener al menos 6 caracteres");
      return;
    }
    setLoading(true);
    try {
      await signUp(email, password, name);
      router.replace("/(tabs)");
    } catch (error) {
      showError(error, "register");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white justify-center px-8">
      <Text className="text-h1 text-center text-text-primary mb-2">
        Crear cuenta
      </Text>
      <Text className="text-body text-center text-text-secondary mb-8">
        Regístrate en Lo de Juan
      </Text>

      <TextInput
        className="bg-light-gray px-4 py-3 rounded-xl mb-4 text-text-primary"
        placeholder="Nombre"
        placeholderTextColor="#805140"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        className="bg-light-gray px-4 py-3 rounded-xl mb-4 text-text-primary"
        placeholder="Correo electrónico"
        placeholderTextColor="#805140"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        className="bg-light-gray px-4 py-3 rounded-xl mb-6 text-text-primary"
        placeholder="Contraseña (mín. 6 caracteres)"
        placeholderTextColor="#805140"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity
        className="bg-primary py-3 rounded-xl items-center"
        onPress={handleRegister}
        disabled={loading}
      >
        <Text className="text-subtitle text-text-inverse">
          {loading ? "Creando..." : "Registrarse"}
        </Text>
      </TouchableOpacity>

      <Link href="/(auth)/login" className="mt-4 text-center">
        <Text className="text-body text-primary">
          ¿Ya tienes cuenta? Inicia sesión
        </Text>
      </Link>
    </View>
  );
}
