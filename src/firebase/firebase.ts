/**
 * firebase.ts
 *
 * Initializes Firebase Admin using a JSON service account stored
 * directly in the FIREBASE_SERVICE_ACCOUNT environment variable.
 *
 * Documentation: English comments
 */

import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

/* -------------------------------------------
 * Load service account JSON from environment
 * ------------------------------------------- */
const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;

if (!serviceAccountJson) {
  throw new Error("❌ Missing FIREBASE_SERVICE_ACCOUNT in .env");
}

let serviceAccount: admin.ServiceAccount;

try {
  serviceAccount = JSON.parse(serviceAccountJson);
} catch (err) {
  throw new Error("❌ FIREBASE_SERVICE_ACCOUNT is not valid JSON");
}

/* -------------------------------------------
 * Initialize Firebase Admin
 * ------------------------------------------- */
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log("🔥 Firebase Admin initialized successfully");
}

/* -------------------------------------------
 * Exports
 * ------------------------------------------- */
export const db = admin.firestore();
export const auth = admin.auth();

export default admin;
