/**
 * register.model.ts
 *
 * Defines the structure of a user object stored in Firestore.
 * This interface represents the shape of a user document.
 *
 * @module models/register
 */

/**
 * Represents a user in Firestore / Firebase.
 *
 * @property {string} [id] - Optional Firestore document ID.
 * @property {string} name - The user's first name.
 * @property {string} [lastName] - The user's last name; optional for OAuth users.
 * @property {number} [age] - The user's age; optional for OAuth users.
 * @property {string} email - The user's email address.
 * @property {string} [password] - The hashed password (only for manual registration).
 * @property {'manual' | 'google' | 'github'} authProvider - The authentication provider.
 * @property {string} [oauthId] - The ID coming from OAuth provider (Google or GitHub).
 * @property {Date} createdAt - Timestamp when the user was created.
 * @property {string} uid - The Firebase Auth UID for this user.
 */
export interface User {
  uid: string;                                   // ID único = Firebase UID
  name: string;
  lastName?: string;
  age?: number;
  email: string;
  password?: string;                             // Solo para usuarios manuales
  authProvider: 'manual' | 'google' | 'github';  // Provider real que usas
  oauthId?: string;                              // ID de Google/GitHub si aplica
  photoURL?: string;
  createdAt: Date;
  updatedAt?: Date;
}
