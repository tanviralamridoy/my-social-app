import { db, auth } from './firebase-config.js';
import {
  collection, addDoc, serverTimestamp, query, orderBy, onSnapshot,
  doc, updateDoc, arrayUnion, arrayRemove, getDoc, limit
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

export async function createPost(content) {
  const user = auth.currentUser;
  if (!user) throw new Error("লগইন করুন");
  return addDoc(collection(db, "posts"), {
    authorId: user.uid, authorName: user.displayName || "Guest",
    content, createdAt: serverTimestamp(), likes: []
  });
}

export function listenToFeed(callback, limitCount = 50) {
  const q = query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(limitCount));
  return onSnapshot(q, (snap) => {
    const posts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(rankPosts(posts));
  });
}

export async function toggleLike(postId, uid) {
  const ref = doc(db, "posts", postId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const likes = snap.data().likes || [];
  await updateDoc(ref, { likes: likes.includes(uid) ? arrayRemove(uid) : arrayUnion(uid) });
}

// Facebook-ধাঁচের সিম্পল অ্যালগরিদম
function rankPosts(posts) {
  const now = Date.now();
  return posts.sort((a, b) => {
    const ageA = a.createdAt ? (now - a.createdAt.toMillis()) / 3.6e6 : 999;
    const ageB = b.createdAt ? (now - b.createdAt.toMillis()) / 3.6e6 : 999;
    return ((b.likes.length * 2) - ageB) - ((a.likes.length * 2) - ageA);
  });
}
