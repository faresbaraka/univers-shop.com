import { initializeApp } from "firebase/app";
import { initializeFirestore, doc, getDocFromServer } from "firebase/firestore";

const firebaseConfig = {
  projectId: "tactical-mesh-sw532",
  appId: "1:568516653008:web:c6e9bde600b8724c5f93d5",
  apiKey: "AIzaSyCwwWlQL0r1CB6Y1n-1uKCxxYCMYCpEhlE",
  authDomain: "tactical-mesh-sw532.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-ed33c53e-455a-4d8b-89a3-f72e759241cd",
  storageBucket: "tactical-mesh-sw532.firebasestorage.app",
  messagingSenderId: "568516653008",
  measurementId: ""
};

// Initialize Firebase with Long Polling enabled for robust connection in iframe sandboxes
const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, firebaseConfig.firestoreDatabaseId);

// Connectivity validation
async function testConnection() {
  try {
    // Check path permitted by security rules (products)
    await getDocFromServer(doc(db, "products", "_connection_test"));
  } catch (error) {
    // Avoid console.error flags for transient offline state, as Firestore automatically handles offline sync gracefully
    console.warn("Remarque: Connexion initiale Firebase Firestore en mode autonome ou hors ligne.", error);
  }
}
testConnection();
