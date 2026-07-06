import { useAuth } from "@/src/contexts/AuthContext";
import { useCarrito } from "@/src/contexts/CarritoContext";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Platform, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  index: "home",
  pos: "cash",
  pedidosCustomer: "receipt",
  pedidosAdmin: "list",
  capacitacion: "book",
  perfil: "person",
  admin: "settings",
};

const isAndroid = Platform.OS === "android";

// Ícono con badge para la barra de tabs
function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const { itemCount } = useCarrito();
  const showBadge = name === "index" && itemCount > 0;

  return (
    <View className="items-center">
      <Ionicons
        name={ICONS[name] || "document"}
        size={focused ? 24 : 20}
        color={focused ? "#f84d3f" : "#805140"}
      />
      {showBadge && (
        <View className="absolute -top-1 -right-3 bg-primary rounded-full min-w-[18px] h-[18px] justify-center items-center px-1">
          <Text className="text-text-inverse text-[10px] font-bold">
            {itemCount > 99 ? "99+" : itemCount}
          </Text>
        </View>
      )}
    </View>
  );
}

// Layout principal de navegación por tabs
export default function TabLayout() {
  const { isAdmin, isEmployee, isCustomer } = useAuth();
  const { bottom } = useSafeAreaInsets();

  const initialRoute =
    isAdmin ? "pos"
    : isEmployee ? "pedidosAdmin"
    : "index";

  return (
    <Tabs
      initialRouteName={initialRoute}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#f84d3f",
        tabBarInactiveTintColor: "#805140",
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopColor: "#ffb804",
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: isAndroid ? bottom + 4 : 0,
          height: isAndroid ? 64 + bottom : 64,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Inicio",
          href: isAdmin || isEmployee ? null : undefined,
          tabBarIcon: ({ focused }) => (
            <TabIcon name="index" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="pos"
        options={{
          title: "POS",
          href: isAdmin ? undefined : null,
          tabBarIcon: ({ focused }) => <TabIcon name="pos" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="pedidosCustomer"
        options={{
          title: "Pedidos",
          href: isCustomer ? undefined : null,
          tabBarIcon: ({ focused }) => (
            <TabIcon name="pedidosCustomer" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="pedidosAdmin"
        options={{
          title: isAdmin ? "Pedidos" : "Comandas",
          href: isAdmin || isEmployee ? undefined : null,
          tabBarIcon: ({ focused }) => (
            <TabIcon name="pedidosAdmin" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="capacitacion"
        options={{
          title: "Capacitación",
          href: isEmployee ? undefined : null,
          tabBarIcon: ({ focused }) => (
            <TabIcon name="capacitacion" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="admin"
        options={{
          title: "Admin",
          href: isAdmin ? undefined : null,
          tabBarIcon: ({ focused }) => (
            <TabIcon name="admin" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: "Perfil",
          tabBarIcon: ({ focused }) => (
            <TabIcon name="perfil" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
