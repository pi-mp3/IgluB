/**
 * Firebase Admin initialization module.
 *
 * Loads the service account JSON and initializes:
 * - Firestore
 * - Firebase Auth
 *
 * Includes debug logs to verify that the JSON path is correct.
 */

import admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';

/**
 * Resolves the absolute path to the service account credential file.
 * This MUST match the real location of the file.
 */
const jsonPath = path.resolve(__dirname, 'serviceAccountKey.json');


console.log('DEBUG: Looking for serviceAccount at ->', jsonPath);
console.log('DEBUG: existsSync:', fs.existsSync(jsonPath));

if (!fs.existsSync(jsonPath)) {
  throw new Error(
    '❌ serviceAccountKey.json NOT FOUND. Fix the path in src/firebase/firebase.ts'
  );
}

/**
 * Loads the service account JSON securely.
 */
const serviceAccount = require(jsonPath) as admin.ServiceAccount;

/**
 * Initializes Firebase Admin SDK.
 */
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export const db = admin.firestore();
export const auth = admin.auth();

console.log('✅ Firebase initialized successfully');
console.log('Project ID loaded:', admin.app().options.projectId);
