export interface User {
  id?: string;             // Firestore asigna el ID
  name: string;
  email: string;
  password?: string;       // Solo usuarios manuales
  authProvider: 'manual' | 'google' | 'facebook';
  oauthId?: string;        // ID del proveedor OAuth
  createdAt: Date;
}
