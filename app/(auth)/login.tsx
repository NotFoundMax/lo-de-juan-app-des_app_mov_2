import {
  signIn,
  signInWithGoogle,
  signInWithGoogleWeb,
} from "@/src/services/auth-rtdb";
import { showError } from "@/src/utils/errorHandler";
import * as Google from "expo-auth-session/providers/google";
import { Link, router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useRef, useState } from "react";
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

// Necesario para cerrar la ventana del navegador al volver a la app
WebBrowser.maybeCompleteAuthSession();

// Formulario de inicio de sesión
export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const passwordRef = useRef<TextInput>(null);
  const insets = useSafeAreaInsets();

  // useIdTokenAuthRequest — preparado para cuando se active en mobile con build nativo
  const [_request, _response, _promptAsync] = Google.useIdTokenAuthRequest({
    clientId:
      "747406714275-3fhnk9uqmifsf9jtadlti6jm2f9ikg0r.apps.googleusercontent.com",
    redirectUri: "https://auth.expo.io/@notfoundmax/lo-de-juan",
  });

  // Procesa la respuesta de Google OAuth (preparado para mobile con build nativo)
  useEffect(() => {
    if (!_response) return;
    if (_response.type === "success") {
      const id_token = _response.params?.id_token;
      if (!id_token) {
        Alert.alert("Error", "No se recibió el token de Google.");
        return;
      }
      setGoogleLoading(true);
      signInWithGoogle(id_token)
        .then(() => router.replace("/(tabs)"))
        .catch((error) => showError(error, "google-login"))
        .finally(() => setGoogleLoading(false));
    } else if (_response.type === "error") {
      Alert.alert("Error", "No se pudo iniciar sesión con Google.");
    }
  }, [_response]);

  // Maneja el login con Google según la plataforma
  const handleGoogleLogin = async () => {
    if (Platform.OS === "web") {
      // En web usa signInWithPopup directamente — funciona sin tunnel
      setGoogleLoading(true);
      try {
        await signInWithGoogleWeb();
        router.replace("/(tabs)");
      } catch (error: any) {
        showError(error, "google-login");
      } finally {
        setGoogleLoading(false);
      }
    } else {
      // En Expo Go el flujo de redirección no está soportado
      Alert.alert(
        "Google Sign-In",
        "El inicio de sesión con Google está disponible en la versión web o en el build nativo de la app.",
      );
    }
  };

  // Procesa el inicio de sesión con email/password
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
      <View
        className="bg-primary pb-10 px-8 rounded-b-[32px]"
        style={{ paddingTop: insets.top + 40 }}
      >
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
          disabled={loading || googleLoading}
        >
          <Text className="text-subtitle text-text-inverse">
            {loading ? "Entrando..." : "Ingresar"}
          </Text>
        </TouchableOpacity>

        {/* Separador */}
        <View className="flex-row items-center my-5">
          <View className="flex-1 h-px bg-border" />
          <Text className="mx-3 text-body text-text-muted">o</Text>
          <View className="flex-1 h-px bg-border" />
        </View>

        {/* Botón de Google — funciona en web, muestra aviso en mobile Expo Go */}
        <TouchableOpacity
          className="border border-border py-3 rounded-lg items-center flex-row justify-center active:opacity-80"
          style={{ backgroundColor: "#ffffff" }}
          onPress={handleGoogleLogin}
          disabled={loading || googleLoading}
        >
          <Text className="text-xl mr-2">G</Text>
          <Text className="text-subtitle text-text-primary">
            {googleLoading ? "Conectando..." : "Continuar con Google"}
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
