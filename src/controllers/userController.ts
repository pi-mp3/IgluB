/**
 * userController.ts
 * 
 * Functions to manage users in your database
 */

import { auth, db } from "../firebase/firebase";

interface UserData {
  uid: string;
  email: string;
  displayName?: string;
  provider: 'google' | 'github' | 'manual';
}

/**
 * Create a new user if it doesn't exist yet
 */
export const createUserIfNotExists = async (userData: UserData) => {
  try {
    // Buscar usuario por UID
    const existingUser = await db.collection('users').doc(userData.uid).get();

    if (existingUser.exists) {
      return existingUser.data();
    }

    // Si no existe, crear usuario nuevo
    const newUser = {
      uid: userData.uid,
      email: userData.email,
      displayName: userData.displayName || '',
      provider: userData.provider,
      createdAt: new Date().toISOString(),
    };

    await db.collection('users').doc(userData.uid).set(newUser);

    return newUser;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

/**
 * Get user by UID
 */
export const getUserByUid = async (uid: string) => {
  try {
    const userDoc = await db.collection('users').doc(uid).get();
    if (!userDoc.exists) throw new Error('No existe un usuario con uid ' + uid);
    return userDoc.data();
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};
