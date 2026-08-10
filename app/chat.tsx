import { useLocalSearchParams, router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  FlatList,
  Keyboard,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/src/contexts/AuthContext";
import {
  ChatMessage,
  listenMessages,
  markChatRead,
  sendMessage,
} from "@/src/services/chat-rtdb";
import { Order, subscribeToOrderById, updateOrder } from "@/src/services/pedidos-rtdb";
import { showAlert, showConfirm } from "@/src/utils/errorHandler";

export default function ChatScreen() {
  const { orderId, orderName } = useLocalSearchParams<{
    orderId: string;
    orderName: string;
  }>();
  const { user, role } = useAuth();
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [order, setOrder] = useState<Order | null>(null);
  const [text, setText] = useState("");
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", (e) =>
      setKeyboardHeight(e.endCoordinates.height),
    );
    const hideSub = Keyboard.addListener("keyboardDidHide", () =>
      setKeyboardHeight(0),
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    if (!orderId) return;
    const unsub = listenMessages(orderId, setMessages);
    return unsub;
  }, [orderId]);

  useEffect(() => {
    if (!orderId) return;
    const unsub = subscribeToOrderById(orderId, setOrder);
    return unsub;
  }, [orderId]);

  // Marca el chat como leído al abrirlo
  useEffect(() => {
    if (!orderId || !role) return;
    markChatRead(orderId, role);
  }, [orderId, role]);

  useEffect(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 200);
  }, [messages]);

  // El chat es solo para delivery; se cierra manualmente (chatClosed) o al cancelar
  const readOnly = order
    ? order.deliveryMode !== "delivery" ||
      order.chatClosed === true ||
      order.status === "cancelled"
    : false;
  const lockMessage = order
    ? order.deliveryMode !== "delivery"
      ? "El chat solo está disponible para pedidos a domicilio."
      : order.status === "cancelled"
        ? "Este pedido fue cancelado. Chat en modo lectura."
        : order.chatClosed === true
          ? "Este pedido se cerró. Chat en modo lectura."
          : null
    : null;

  // El admin/empleado cierra el chat manualmente cuando el pedido está entregado
  const canCloseChat =
    !!order &&
    order.deliveryMode === "delivery" &&
    order.status === "delivered" &&
    order.chatClosed !== true &&
    role !== "customer";

  const handleCloseChat = () => {
    if (!orderId || !canCloseChat) return;
    showConfirm(
      "Cerrar chat",
      "¿Cerrar el chat de este pedido? Ambos lados quedarán en modo lectura.",
      async () => {
        try {
          await updateOrder(orderId, { chatClosed: true });
        } catch {
          showAlert("Error", "No se pudo cerrar el chat.");
        }
      },
      undefined,
      { confirmLabel: "Cerrar" },
    );
  };

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || !orderId || !user || readOnly) return;

    await sendMessage(orderId, {
      text: trimmed,
      senderId: user.uid,
      senderName:
        user.displayName || user.email?.split("@")[0] || "Usuario",
      senderRole: role || "customer",
    });
    setText("");
  };

  const isMyMessage = (msg: ChatMessage) => msg.senderId === user?.uid;

  const roleBadge = (msg: ChatMessage) => {
    if (msg.senderRole === "admin") return "Admin";
    if (msg.senderRole === "employee") return "Empleado";
    return null;
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View
        className="bg-primary pb-4 px-4 flex-row items-center"
        style={{ paddingTop: insets.top + 16 }}
      >
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Text className="text-body-bold text-text-inverse">←</Text>
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-body-bold text-text-inverse">
            Chat del pedido
          </Text>
          <Text className="text-small text-text-inverse opacity-70">
            #{orderName || orderId?.slice(0, 8).toUpperCase()}
          </Text>
        </View>
      </View>

      {canCloseChat && (
        <TouchableOpacity
          onPress={handleCloseChat}
          className="mx-4 mt-3 bg-error rounded-xl py-3 items-center active:opacity-70"
        >
          <Text className="text-body-bold text-white">
            🔒 Cerrar chat
          </Text>
        </TouchableOpacity>
      )}

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        className="flex-1"
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerClassName="px-4 py-3"
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
        ListEmptyComponent={
          <View className="items-center mt-20">
            <Text className="text-4xl mb-3">💬</Text>
            <Text className="text-body text-text-muted text-center">
              No hay mensajes aún. Escribe el primero.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const mine = isMyMessage(item);
          const badge = roleBadge(item);
          return (
            <View
              className={`mb-3 max-w-[80%] ${mine ? "self-end" : "self-start"}`}
            >
              {!mine && (
                <Text className="text-small text-text-muted mb-1 ml-1">
                  {item.senderName}
                  {badge ? ` · ${badge}` : ""}
                </Text>
              )}
              <View
                className={`rounded-2xl px-4 py-3 ${
                  mine
                    ? "bg-primary rounded-br-md"
                    : "bg-surface-hover rounded-bl-md"
                }`}
              >
                <Text
                  className={`text-body ${
                    mine ? "text-text-inverse" : "text-text-primary"
                  }`}
                >
                  {item.text}
                </Text>
              </View>
              <Text
                className={`text-small text-text-muted mt-1 ${
                  mine ? "text-right mr-1" : "ml-1"
                }`}
              >
                {new Date(item.createdAt).toLocaleTimeString("es-PE", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </View>
          );
        }}
      />

      {/* Input bar */}
      <View style={{ paddingBottom: keyboardHeight }}>
        {lockMessage && (
          <View className="px-4 py-2 bg-warning-light border-t border-border">
            <Text className="text-small text-text-primary text-center">
              🔒 {lockMessage}
            </Text>
          </View>
        )}
        <View
          className="flex-row items-center px-4 py-3 border-t border-border bg-white"
          style={{ paddingBottom: insets.bottom + 12 }}
        >
          <TextInput
            className="flex-1 bg-surface-hover rounded-full px-4 py-3 text-body text-text-primary"
            style={{ color: "#212020" }}
            placeholder="Escribe un mensaje..."
            placeholderTextColor="#9e9e9e"
            value={text}
            onChangeText={setText}
            multiline
            editable={!readOnly}
          />
          <TouchableOpacity
            onPress={handleSend}
            className={`ml-2 rounded-full w-11 h-11 items-center justify-center ${
              text.trim() && !readOnly ? "bg-primary" : "bg-border"
            }`}
            disabled={!text.trim() || readOnly}
          >
            <Text className="text-body-bold text-text-inverse">↑</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
