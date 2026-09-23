import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit as fsLimit,
  serverTimestamp,
  type Firestore,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

//
console.log("Firebase config check:", {
  apiKey: Boolean(firebaseConfig.apiKey),
  authDomain: Boolean(firebaseConfig.authDomain),
  projectId: Boolean(firebaseConfig.projectId),
  storageBucket: Boolean(firebaseConfig.storageBucket),
  messagingSenderId: Boolean(firebaseConfig.messagingSenderId),
  appId: Boolean(firebaseConfig.appId),
});

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.appId,
);

let app: FirebaseApp | undefined;
let db: Firestore | undefined;

if (isFirebaseConfigured) {
  try {
    app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
    db = getFirestore(app);
  } catch (err) {
    console.error("Firebase failed to initialize", err);
    app = undefined;
    db = undefined;
  }
}

export { app, db };

export type FirestoreSafetyReport = {
  id: string;
  lat: number;
  lon: number;
  type: string;
  description: string;
  createdAt: string;
};

const REPORTS_COLLECTION = "safetyReports";

export async function addReportToFirestore(report: {
  lat: number;
  lon: number;
  type: string;
  description: string;
}) {
  if (!db) throw new Error("Firebase is not configured");
  const ref = await addDoc(collection(db, REPORTS_COLLECTION), {
    ...report,
    createdAt: serverTimestamp(),
    createdAtClient: new Date().toISOString(),
  });
  return ref.id;
}

export async function getReportsFromFirestore(): Promise<FirestoreSafetyReport[]> {
  if (!db) throw new Error("Firebase is not configured");
  const q = query(
    collection(db, REPORTS_COLLECTION),
    orderBy("createdAt", "desc"),
    fsLimit(200),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => {
    const data = doc.data() as any;
    return {
      id: doc.id,
      lat: Number(data.lat),
      lon: Number(data.lon),
      type: String(data.type || ""),
      description: String(data.description || ""),
      createdAt: data.createdAtClient || new Date().toISOString(),
    };
  });
}
