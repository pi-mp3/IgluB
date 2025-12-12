/**
 * ============================================================
 *  userController.ts
 * ============================================================
 *
 * Description:
 * Provides functions to create, fetch, and update users in Firestore.
 * Ensures that the profile can be correctly fetched and updated
 * from the frontend using Firebase UID.
 *
 * All errors are logged on the server console and thrown
 * to the frontend to be displayed in Spanish.
 *
 * Backend Contract for Profile.tsx:
 * {
 *   id: string;
 *   name: string;
 *   lastName: string;
 *   age: number;
 *   email: string;
 *   displayName?: string;
 *   photoURL?: string;
 *   provider: 'google' | 'github' | 'manual' | 'email';
 *   createdAt: string;
 *   updatedAt?: string;
 * }
 * ============================================================
 */

import { db } from "../firebase/firebase";

export interface UserData {
  uid: string;
  email: string;
  name?: string;
  lastName?: string;
  age?: number;
  displayName?: string;
  photoURL?: string;
  provider: "google" | "github" | "manual" | "email";
}

/**
 * Create a new user in Firestore if it doesn't exist yet
 * @param userData - Information from Firebase Auth or registration
 */
export const createUserIfNotExists = async (userData: UserData) => {
  try {
    const userRef = db.collection("users").doc(userData.uid);
    const existingUser = await userRef.get();

    if (existingUser.exists) {
      return existingUser.data();
    }

    const newUser = {
      uid: userData.uid,
      email: userData.email,
      name: userData.name || "",
      lastName: userData.lastName || "",
      age: userData.age || null,
      displayName: userData.displayName || "",
      photoURL: userData.photoURL || "",
      provider: userData.provider,
      createdAt: new Date().toISOString(),
    };

    await userRef.set(newUser);

    return newUser;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

/**
 * Fetch a user from Firestore by UID
 * @param uid - Firebase UID of the user
 * @returns UserData - All fields required by frontend profile
 */
export const getUserByUid = async (uid: string) => {
  try {
    const userDoc = await db.collection("users").doc(uid).get();

    if (!userDoc.exists) {
      throw new Error("No existe un usuario con UID " + uid);
    }

    const data = userDoc.data();

    return {
      id: uid,
      name: data?.name || "",
      lastName: data?.lastName || "",
      age: data?.age || null,
      email: data?.email || "",
      displayName: data?.displayName || "",
      photoURL: data?.photoURL || "",
      provider: data?.provider || "",
      createdAt: data?.createdAt || "",
      updatedAt: data?.updatedAt || "",
    };
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
};

/**
 * Update user fields in Firestore
 * @param uid - Firebase UID of the user
 * @param updates - Fields to update
 */
export const updateUserByUid = async (uid: string, updates: Partial<UserData>) => {
  try {
    const userRef = db.collection("users").doc(uid);
    await userRef.update({ ...updates, updatedAt: new Date().toISOString() });
    const updatedDoc = await userRef.get();
    return updatedDoc.data();
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};
