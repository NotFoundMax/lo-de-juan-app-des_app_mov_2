import LoadingSpinner from "@/src/components/LoadingSpinner";
import PageHeader from "@/src/components/PageHeader";
import { getCategorias } from "@/src/services/categorias-rtdb";
import { getOrders } from "@/src/services/pedidos-rtdb";
import { getProductos } from "@/src/services/productos-rtdb";
import { get, ref } from "firebase/database";
import { rtdb } from "@/src/services/firebase-rtdb";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Tarjeta de estadística del dashboard
function CardBox({
  card,
  half,
}: {
  card: { label: string; value: string | number; color: string; icon: string };
  half?: boolean;
}) {
  return (
    <View
      className={`${card.color} flex-1 rounded-xl p-4 ${half ? "mr-3" : ""}`}
    >
      <Text className="text-display mb-2">{card.icon}</Text>
      <Text className="text-h2 text-text-inverse">{card.value}</Text>
      <Text className="text-caption text-text-inverse opacity-80">
        {card.label}
      </Text>
    </View>
  );
}

// Renderiza las tarjetas de estadísticas en grilla de 2 columnas
function renderCardGrid(
  cards: {
    label: string;
    value: string | number;
    color: string;
    icon: string;
  }[],
) {
  const rows: React.ReactNode[] = [];
  for (let i = 0; i < cards.length; i += 2) {
    rows.push(
      <View key={cards[i].label} className="flex-row mb-3">
        <CardBox card={cards[i]} half />
        {cards[i + 1] && <CardBox card={cards[i + 1]} />}
      </View>,
    );
  }
  return rows;
}

interface DashboardData {
  totalProductos: number;
  totalCategorias: number;
  totalUsuarios: number;
  pedidosPendientes: number;
  ventasHoy: number;
}

// Resumen del panel de administración
export default function AdminScreen() {
  const [data, setData] = useState<DashboardData>({
    totalProductos: 0,
    totalCategorias: 0,
    totalUsuarios: 0,
    pedidosPendientes: 0,
    ventasHoy: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Carga las estadísticas del dashboard
  const load = async () => {
    try {
      const usersSnap = await get(ref(rtdb, "users"));
      const usersCount = usersSnap.exists()
        ? Object.keys(usersSnap.val()).length
        : 0;
      const [productos, categorias, orders] = await Promise.all([
        getProductos(),
        getCategorias(),
        getOrders(),
      ]);

      const today = new Date().toISOString().slice(0, 10);
      const ventasHoy = orders
        .filter(
          (o) => o.createdAt?.startsWith(today) && o.status !== "cancelled",
        )
        .reduce((sum, o) => sum + o.total, 0);

      setData({
        totalProductos: productos.length,
        totalCategorias: categorias.length,
        totalUsuarios: usersCount,
        pedidosPendientes: orders.filter((o) => o.status === "pending").length,
        ventasHoy,
      });
    } catch (e) {
      console.error("Error loading dashboard:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const cards = [
    {
      label: "Productos",
      value: data.totalProductos,
      color: "bg-primary",
      icon: "🍗",
    },
    {
      label: "Categorías",
      value: data.totalCategorias,
      color: "bg-secondary",
      icon: "📂",
    },
    {
      label: "Usuarios",
      value: data.totalUsuarios,
      color: "bg-brown",
      icon: "👥",
    },
    {
      label: "Pedidos Pend.",
      value: data.pedidosPendientes,
      color: "bg-warning",
      icon: "📋",
    },
    {
      label: "Ventas Hoy",
      value: `S/.${data.ventasHoy.toFixed(0)}`,
      color: "bg-success",
      icon: "💰",
    },
  ];

  const links = [
    {
      title: "Productos",
      href: "/(tabs)/admin/productos",
      icon: "🍗",
      desc: "Gestionar catálogo",
    },
    {
      title: "Categorías",
      href: "/(tabs)/admin/categorias",
      icon: "📂",
      desc: "Organizar productos",
    },
    {
      title: "Capacitación",
      href: "/(tabs)/admin/capacitacion",
      icon: "📚",
      desc: "Materiales de formación",
    },
    {
      title: "Usuarios",
      href: "/(tabs)/admin/usuarios",
      icon: "👥",
      desc: "Gestionar empleados",
    },
  ];

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <ScrollView
      className="flex-1 bg-surface"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            load();
          }}
        />
      }
    >
      <PageHeader title="Admin" subtitle="Panel de control" pt={32} />

      <View className="px-4 pt-4">{renderCardGrid(cards)}</View>

      <Text className="text-h3 text-text-primary px-4 mt-4 mb-3">Gestión</Text>
      {links.map((link) => (
        <TouchableOpacity
          key={link.href}
          className="flex-row items-center bg-surface-hover mx-4 p-4 rounded-xl mb-3 border border-border"
          onPress={() => router.push(link.href)}
        >
          <Text className="text-display mr-4">{link.icon}</Text>
          <View>
            <Text className="text-h3 text-text-primary">{link.title}</Text>
            <Text className="text-caption text-text-secondary">
              {link.desc}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}
