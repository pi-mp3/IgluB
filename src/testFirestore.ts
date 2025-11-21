import { db } from './firebase/firebase';

async function initFirestore() {
  try {
    // Creamos un documento de prueba en la colección "users"
    const docRef = db.collection('users').doc('testUser');
    await docRef.set({
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedpassword', // solo de prueba
      authProvider: 'manual',
      createdAt: new Date(),
    });

    console.log('✅ Firestore initialized and test user created successfully');
  } catch (err) {
    console.error('❌ Error initializing Firestore:', err);
  }
}

initFirestore();
