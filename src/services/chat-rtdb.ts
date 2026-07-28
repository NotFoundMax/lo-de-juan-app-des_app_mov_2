import { off, onValue, push, ref } from "firebase/database";
import { rtdb } from "./firebase-rtdb";

export interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  senderRole: "admin" | "employee" | "customer";
  createdAt: string;
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
}
