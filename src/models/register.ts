/**
 * register.model.ts
 * 
 * User interface for Firestore.
 * Represents the structure of a user document in the database.
 * 
 * @module models/register
 */

export interface User {
  id?: string;
  name: string;
  lastName?: string;  // optional for OAuth users
  age?: number;       // optional for OAuth users
  email: string;
  password?: string;
  authProvider: 'manual' | 'google' | 'facebook';
  oauthId?: string;
  createdAt: Date;
}
