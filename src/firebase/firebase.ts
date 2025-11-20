import admin from 'firebase-admin';
import { ServiceAccount } from 'firebase-admin';
import serviceAccountJson from './serviceAccountKey.json';

// Casteamos el JSON como ServiceAccount para TypeScript
const serviceAccount = serviceAccountJson as ServiceAccount;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export const auth = admin.auth();
export const db = admin.firestore();
