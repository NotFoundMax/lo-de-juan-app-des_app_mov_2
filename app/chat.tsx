import { useLocalSearchParams, router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "@/src/contexts/AuthContext";
import {
  ChatMessage,
  listenMessages,
  sendMessage,
} from "@/src/services/chat-rtdb";

export default function ChatScreen() {
  const { orderId, orderName } = useLocalSearchParams<{
    orderId: string;
    orderName: string;
  }>();
  const { user, role } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (!orderId) return;
    const unsub = listenMessages(orderId, setMessages);
    return unsub;
  }, [orderId]);

  useEffect(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 200);
  }, [messages]);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || !orderId || !user) return;

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
      <View className="bg-primary pt-12 pb-4 px-4 flex-row items-center">
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

      {/* Messages */}
      <FlatList
        ref={flatListRef}
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
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={90}
      >
        <View className="flex-row items-center px-4 py-3 border-t border-border bg-white">
          <TextInput
            className="flex-1 bg-surface-hover rounded-full px-4 py-3 text-body"
            placeholder="Escribe un mensaje..."
            placeholderTextColor="#9e9e9e"
            value={text}
            onChangeText={setText}
            multiline
          />
          <TouchableOpacity
            onPress={handleSend}
            className={`ml-2 rounded-full w-11 h-11 items-center justify-center ${
              text.trim() ? "bg-primary" : "bg-border"
            }`}
            disabled={!text.trim()}
          >
            <Text className="text-body-bold text-text-inverse">↑</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
