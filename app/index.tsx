import LoadingSpinner from "@/src/components/LoadingSpinner";
import { useAuth } from "@/src/contexts/AuthContext";
import { Redirect } from "expo-router";

// Redirige según el estado de autenticación y rol
export default function Index() {
  const { isAuthenticated, loading, isAdmin, isEmployee } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  if (isAdmin) {
    return <Redirect href="/(tabs)/pos" />;
  }

  if (isEmployee) {
    return <Redirect href="/(tabs)/pedidosAdmin" />;
  }

  return <Redirect href="/(tabs)" />;
}
