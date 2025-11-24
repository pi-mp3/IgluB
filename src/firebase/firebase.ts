/**
 * Module for initializing Firebase Admin SDK.
 *
 * Responsibilities:
 * - Load service account JSON file.
 * - Initialize Firebase Admin with Auth and Firestore.
 * - Provide debug logs to verify project configuration.
 */

import admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

/**
 * Absolute path to the Firebase service account JSON file.
 * Make sure the filename is correct.
 * @constant {string}
 */
const jsonPath = path.resolve(
  __dirname,
  'iglu-2025-firebase-adminsdk-fbsvc-d91253ddfa.json'
);

console.log('DEBUG: Looking for serviceAccount at ->', jsonPath);
console.log('DEBUG: existsSync:', fs.existsSync(jsonPath));

if (!fs.existsSync(jsonPath)) {
  throw new Error('❌ serviceAccount JSON NOT FOUND. Check the file path.');
}

/**
 * The service account credentials loaded from the JSON file, used to authenticate admin SDK.
 * @type {object}
 */
const serviceAccount = require(jsonPath);

/**
 * Initialize Firebase Admin SDK using the service account credentials.
 * Uses `admin.credential.cert(...)` as specified in the Admin SDK documentation. :contentReference[oaicite:0]{index=0}
 */
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

/**
 * Logs the project ID read from the service account JSON file and from environment variable.
 * Helps verifying that the correct project is being used.
 * @returns {void}
 */
console.log('Project ID (from JSON):', (serviceAccount as any).project_id);
console.log('Project ID (from .env):', process.env.FIREBASE_PROJECT_ID);

/**
 * Firestore database instance from Firebase Admin.
 * @type {FirebaseFirestore.Firestore}
 */
export const db = admin.firestore();

/**
 * Authentication service instance from Firebase Admin.
 * @type {admin.auth.Auth}
 */
export const auth = admin.auth();

console.log('✅ Firebase initialized successfully');
