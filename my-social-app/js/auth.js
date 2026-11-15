import { auth, db } from './firebase-config.js';
import {
  signInAnonymously, createUserWithEmailAndPassword,
  signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { doc, setDoc, getDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

export function loginAsGuest(displayName = "Guest") {
  return signInAnonymously(auth).then(async (cred) => {
    await updateProfile(cred.user, { displayName });
    await setDoc(doc(db, "users", cred.user.uid), {
      uid: cred.user.uid, displayName, isGuest: true, createdAt: serverTimestamp()
    }, { merge: true });
    return cred.user;
  });
}

export function registerUser(email, password, displayName) {
  return createUserWithEmailAndPassword(auth, email, password).then(async (cred) => {
    await updateProfile(cred.user, { displayName });
    await setDoc(doc(db, "users", cred.user.uid), {
      uid: cred.user.uid, displayName, email, isGuest: false, bio: "", createdAt: serverTimestamp()
    });
    return cred.user;
  });
}

export function loginUser(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

export function logout() { return signOut(auth); }
export function onUserChange(cb) { return onAuthStateChanged(auth, cb); }

export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data() : null;
}

export async function updateUserProfile(uid, data) {
  await setDoc(doc(db, "users", uid), data, { merge: true });
  if (data.displayName) await updateProfile(auth.currentUser, { displayName: data.displayName });
}
