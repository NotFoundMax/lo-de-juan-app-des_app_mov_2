import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "./AuthContext";
import {
  ChatMeta,
  listenAllChatMeta,
  markChatRead,
  unreadForRole,
} from "@/src/services/chat-rtdb";

interface ChatContextType {
  // No leídos de un pedido para el rol actual
  unread: (orderId: string) => number;
  // Total de no leídos para el rol actual
  totalUnread: number;
  // Marca el chat como leído para el rol actual
  markRead: (orderId: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Provee los contadores de mensajes no leídos del chat
export function ChatProvider({ children }: { children: ReactNode }) {
  const { role } = useAuth();
  const [metaMap, setMetaMap] = useState<Record<string, ChatMeta>>({});

  useEffect(() => {
    return listenAllChatMeta(setMetaMap);
  }, []);

  const unread = (orderId: string) => unreadForRole(metaMap[orderId], role);

  const totalUnread = useMemo(
    () => Object.values(metaMap).reduce((sum, meta) => sum + unreadForRole(meta, role), 0),
    [metaMap, role],
  );

  const markRead = async (orderId: string) => {
    if (!role) return;
    const field = role === "customer" ? "customerUnread" : "adminUnread";
    setMetaMap((prev) => ({
      ...prev,
      [orderId]: { ...prev[orderId], [field]: 0 },
    }));
    await markChatRead(orderId, role);
  };

  return (
    <ChatContext.Provider value={{ unread, totalUnread, markRead }}>
      {children}
    </ChatContext.Provider>
  );
}

// Consume el contexto del chat de forma segura
export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within ChatProvider");
  }
  return context;
}
