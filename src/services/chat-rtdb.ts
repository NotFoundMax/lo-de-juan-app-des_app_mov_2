import { increment, off, onValue, push, ref, update } from "firebase/database";
import { rtdb } from "./firebase-rtdb";

export interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  senderRole: "admin" | "employee" | "customer";
  createdAt: string;
}

// Contadores de mensajes no leídos por rol
export interface ChatMeta {
  adminUnread?: number;
  customerUnread?: number;
}

export function unreadForRole(meta: ChatMeta | undefined, role: string | null | undefined): number {
  if (!meta) return 0;
  const count = role === "customer" ? meta.customerUnread : meta.adminUnread;
  return typeof count === "number" ? count : 0;
}

export function listenMessages(
  orderId: string,
  callback: (messages: ChatMessage[]) => void,
): () => void {
  const messagesRef = ref(rtdb, `chats/${orderId}/messages`);

  const unsubscribe = onValue(messagesRef, (snap) => {
    const data = snap.val() as Record<string, Omit<ChatMessage, "id">> | null;
    if (!data) {
      callback([]);
      return;
    }
    const messages: ChatMessage[] = Object.entries(data)
      .map(([id, msg]) => ({ id, ...msg }))
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    callback(messages);
  });

  return () => off(messagesRef, "value", unsubscribe);
}

export async function sendMessage(
  orderId: string,
  data: {
    text: string;
    senderId: string;
    senderName: string;
    senderRole: "admin" | "employee" | "customer";
  },
): Promise<void> {
  const messagesRef = ref(rtdb, `chats/${orderId}/messages`);
  await push(messagesRef, {
    ...data,
    createdAt: new Date().toISOString(),
  });

  // Incrementa el contador del receptor: el emisor ya sabe que envió
  const metaRef = ref(rtdb, `chats/${orderId}/meta`);
  const field = data.senderRole === "customer" ? "adminUnread" : "customerUnread";
  await update(metaRef, { [field]: increment(1) });
}

export function listenChatMeta(
  orderId: string,
  callback: (meta: ChatMeta) => void,
): () => void {
  const metaRef = ref(rtdb, `chats/${orderId}/meta`);
  const unsubscribe = onValue(metaRef, (snap) => {
    callback((snap.val() as ChatMeta) ?? {});
  });
  return () => off(metaRef, "value", unsubscribe);
}

// Escucha los contadores de todos los chats (para el badge global del tab)
export function listenAllChatMeta(
  callback: (map: Record<string, ChatMeta>) => void,
): () => void {
  const chatsRef = ref(rtdb, "chats");
  const unsubscribe = onValue(chatsRef, (snap) => {
    const data = snap.val() as Record<string, { meta?: ChatMeta }> | null;
    if (!data) {
      callback({});
      return;
    }
    const map: Record<string, ChatMeta> = {};
    Object.entries(data).forEach(([orderId, chat]) => {
      map[orderId] = chat?.meta ?? {};
    });
    callback(map);
  });
  return () => off(chatsRef, "value", unsubscribe);
}

export async function markChatRead(orderId: string, role: string): Promise<void> {
  const metaRef = ref(rtdb, `chats/${orderId}/meta`);
  const field = role === "customer" ? "customerUnread" : "adminUnread";
  await update(metaRef, { [field]: 0 });
}
