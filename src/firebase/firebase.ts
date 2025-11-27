import admin from "firebase-admin";
import dotenv from "dotenv";
dotenv.config();

// Obtener JSON desde variable de entorno
const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT;

if (!serviceAccountString) {
  throw new Error("❌ FIREBASE_SERVICE_ACCOUNT missing in environment variables");
}

let serviceAccount;
try {
  serviceAccount = JSON.parse(serviceAccountString);
} catch (e) {
  throw new Error("❌ FIREBASE_SERVICE_ACCOUNT is not valid JSON");
}

// Inicializar Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export const db = admin.firestore();
export const auth = admin.auth();

console.log("🔥 Firebase admin initialized");
