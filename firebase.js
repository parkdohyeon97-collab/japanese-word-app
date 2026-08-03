import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged,
  signInAnonymously
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

import {
  getFirestore,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  writeBatch
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBLnuj2FAWI1mqLG_82KACdkefCxDHixRw",
  authDomain: "japanese-word-app.firebaseapp.com",
  projectId: "japanese-word-app",
  storageBucket: "japanese-word-app.firebasestorage.app",
  messagingSenderId: "941313122107",
  appId: "1:941313122107:web:0d5ec53a2dbbcf8996e11e"
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);
const sharedItemsCollection = collection(db, "sharedItems");

let currentUser = null;

function simpleHash(text) {
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

function normalizeKey(value) {
  return String(value || "")
    .normalize("NFKC")
    .trim()
    .replace(/[\s　]+/g, "")
    .toLocaleLowerCase("ja");
}

function makeDocumentId(category, word) {
  return `${category}-${simpleHash(`${category}::${normalizeKey(word)}`)}`;
}

export function waitForFirebaseReady() {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async user => {
        try {
          if (!user) {
            await signInAnonymously(auth);
            return;
          }

          currentUser = user;
          unsubscribe();
          resolve(user);
        } catch (error) {
          unsubscribe();
          reject(error);
        }
      },
      reject
    );
  });
}

export function listenToSharedItems(onItemsChanged, onError) {
  const sharedItemsQuery = query(
    sharedItemsCollection,
    orderBy("createdAt", "asc")
  );

  return onSnapshot(
    sharedItemsQuery,
    snapshot => {
      const items = snapshot.docs.map(itemDocument => ({
        id: itemDocument.id,
        shared: true,
        ...itemDocument.data()
      }));
      onItemsChanged(items);
    },
    error => {
      console.error("공유 항목 불러오기 실패:", error);
      if (onError) onError(error);
    }
  );
}

export async function addSharedItem(item) {
  if (!currentUser) await waitForFirebaseReady();

  const category = item.category || "word";
  const word = String(item.word || "").trim();

  if (!word) throw new Error("단어나 표현을 입력해 주세요.");

  const itemId = makeDocumentId(category, word);
  const itemReference = doc(db, "sharedItems", itemId);

  await setDoc(itemReference, {
    category,
    word,
    reading: String(item.reading || "").trim(),
    meaning: String(item.meaning || "").trim(),
    example: String(item.example || "").trim(),
    addedBy: String(item.addedBy || "도현").trim(),
    createdByUid: currentUser.uid,
    createdAt: serverTimestamp()
  });

  return itemId;
}

export async function addSharedItems(items) {
  if (!currentUser) await waitForFirebaseReady();

  const chunks = [];
  for (let index = 0; index < items.length; index += 450) {
    chunks.push(items.slice(index, index + 450));
  }

  for (const chunk of chunks) {
    const batch = writeBatch(db);

    chunk.forEach(item => {
      const category = item.category || "word";
      const word = String(item.word || "").trim();
      const itemId = makeDocumentId(category, word);
      const itemReference = doc(db, "sharedItems", itemId);

      batch.set(itemReference, {
        category,
        word,
        reading: String(item.reading || "").trim(),
        meaning: String(item.meaning || "").trim(),
        example: String(item.example || "").trim(),
        addedBy: String(item.addedBy || "도현").trim(),
        createdByUid: currentUser.uid,
        createdAt: serverTimestamp()
      });
    });

    await batch.commit();
  }
}

export async function removeSharedItem(itemId) {
  if (!currentUser) await waitForFirebaseReady();
  if (!itemId) throw new Error("삭제할 항목의 ID가 없습니다.");
  await deleteDoc(doc(db, "sharedItems", itemId));
}
