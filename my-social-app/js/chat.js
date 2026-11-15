import { rtdb, auth } from './firebase-config.js';
import { ref, push, set, onValue, query, limitToLast }
  from "https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js";

export function sendMessage(chatId, text) {
  const user = auth.currentUser;
  if (!user) return;
  const newMsgRef = push(ref(rtdb, `chats/${chatId}/messages`));
  set(newMsgRef, {
    text, senderId: user.uid,
    senderName: user.displayName || "Guest", timestamp: Date.now()
  });
}

export function listenToMessages(chatId, cb) {
  const q = query(ref(rtdb, `chats/${chatId}/messages`), limitToLast(100));
  return onValue(q, (snap) => {
    const data = snap.val() || {};
    const messages = Object.keys(data).map(k => ({ id: k, ...data[k] }));
    cb(messages.sort((a, b) => a.timestamp - b.timestamp));
  });
}
