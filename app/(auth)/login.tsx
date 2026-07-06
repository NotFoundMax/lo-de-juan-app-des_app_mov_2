import { signIn } from "@/src/services/auth-rtdb";
import { showError } from "@/src/utils/errorHandler";
import { Link, router } from "expo-router";
import { useRef, useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Formulario de inicio de sesión
export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const passwordRef = useRef<TextInput>(null);
  const insets = useSafeAreaInsets();

  // Procesa el inicio de sesión
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Completa todos los campos");
      return;
    }
    setLoading(true);
    try {
      await signIn(email, password);
      router.replace("/(tabs)");
    } catch (error) {
      showError(error, "login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Encabezado de marca */}
      <View className="bg-primary pb-10 px-8 rounded-b-[32px]" style={{ paddingTop: insets.top + 40 }}>
        <View className="w-16 h-16 bg-secondary rounded-full justify-center items-center mb-4">
          <Text className="text-display">🍗</Text>
        </View>
        <Text className="text-display text-text-inverse">Lo de Juan</Text>
        <Text className="text-body text-text-inverse opacity-90 mt-1">
          Tu pollería de confianza
        </Text>
      </View>

      {/* Formulario */}
      <View className="flex-1 px-6 pt-8">
        <Text className="text-h2 text-text-primary mb-1">Bienvenido</Text>
        <Text className="text-body text-text-secondary mb-6">
          Inicia sesión para continuar
        </Text>

        <Text className="text-label text-text-primary mb-1">
          Correo electrónico
        </Text>
        <TextInput
          className="bg-light-gray px-4 py-3 rounded-lg mb-4 text-text-primary"
          placeholder="tu@correo.com"
          placeholderTextColor="#9e9e9e"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          returnKeyType="next"
          onSubmitEditing={() => passwordRef.current?.focus()}
        />

        <Text className="text-label text-text-primary mb-1">Contraseña</Text>
        <TextInput
          ref={passwordRef}
          className="bg-light-gray px-4 py-3 rounded-lg mb-2 text-text-primary"
          placeholder="••••••••"
          placeholderTextColor="#9e9e9e"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          returnKeyType="go"
          onSubmitEditing={handleLogin}
        />

        <TouchableOpacity
          className="bg-primary py-3 rounded-lg items-center mt-4 active:opacity-80"
          onPress={handleLogin}
          disabled={loading}
        >
          <Text className="text-subtitle text-text-inverse">
            {loading ? "Entrando..." : "Ingresar"}
          </Text>
        </TouchableOpacity>

        <View className="flex-row justify-center mt-6">
          <Text className="text-body text-text-secondary">
            ¿No tienes cuenta?{" "}
          </Text>
          <Link href="/(auth)/register">
            <Text className="text-body text-primary font-semibold">
              Regístrate
            </Text>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
