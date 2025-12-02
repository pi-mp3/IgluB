/**
 * firebase.ts
 *
 * Initializes Firebase Admin using a local JSON service account file.
 * Works with Google login and avoids broken private_key issues.
 * 
 * Documentation: English comments
 * User messages: Español (N/A here)
 */

import admin from "firebase-admin";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

/* -------------------------------------------
 * Load service account from local file path
 * ------------------------------------------- */
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

if (!serviceAccountPath) {
  throw new Error("❌ Missing FIREBASE_SERVICE_ACCOUNT_PATH in .env");
}

if (!fs.existsSync(serviceAccountPath)) {
  throw new Error(`❌ Service account file not found at: ${serviceAccountPath}`);
}

const serviceAccount = JSON.parse(
  fs.readFileSync(serviceAccountPath, "utf8")
);

/* -------------------------------------------
 * Initialize Firebase Admin
 * ------------------------------------------- */
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  });

  console.log("🔥 Firebase Admin initialized successfully");
}

/* -------------------------------------------
 * Exports
 * ------------------------------------------- */
export const db = admin.firestore();
export const auth = admin.auth();

export default admin;
