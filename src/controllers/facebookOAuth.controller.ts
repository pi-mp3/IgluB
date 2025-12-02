/**
 * facebookOAuth.controller.ts
 *
 * Handles the full Facebook OAuth 2.0 login flow.
 * - Exchanges authorization code for an access token.
 * - Retrieves the user’s Facebook profile.
 * - Creates or updates a corresponding Firebase user.
 * - Stores or merges user data in Firestore.
 * - Redirects the user back to the frontend with their UID.
 *
 * All developer-facing comments/documentation are in English.
 * All client-facing responses remain in Spanish.
 */

import { Request, Response } from 'express';
import axios from 'axios';
import * as admin from 'firebase-admin';
import { db } from '../firebase/firebase';
import dotenv from 'dotenv';

dotenv.config();

const { FACEBOOK_APP_ID, FACEBOOK_APP_SECRET, FRONTEND_REDIRECT } = process.env;

if (!FACEBOOK_APP_ID || !FACEBOOK_APP_SECRET || !FRONTEND_REDIRECT) {
  throw new Error("Missing environment variables required for Facebook OAuth integration.");
}

// ======================================================
// Interfaces
// ======================================================

interface FacebookTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface FacebookUser {
  id: string;
  name: string;
  email: string;
  picture: {
    data: {
      url: string;
    };
  };
}

// ======================================================
// Controller
// ======================================================

/**
 * Facebook OAuth callback handler.
 * This endpoint receives a short-lived `code` from Facebook
 * and performs an exchange for an access token. Then it retrieves
 * the user profile and syncs it with Firebase.
 *
 * Expected request:
 *   POST /api/auth/facebook/callback
 *   body: { code: string }
 */
export const facebookCallback = async (req: Request, res: Response) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res
        .status(400)
        .json({ success: false, message: "No se recibió el código de Facebook" });
    }

    // ----------------------------------------------
    // Step 1: Exchange authorization code for access token
    // ----------------------------------------------
    const tokenRes = await axios.get<FacebookTokenResponse>(
      `https://graph.facebook.com/v17.0/oauth/access_token`,
      {
        params: {
          client_id: FACEBOOK_APP_ID,
          client_secret: FACEBOOK_APP_SECRET,
          redirect_uri: `${req.protocol}://${req.get('host')}/api/auth/facebook/callback`,
          code,
        },
      }
    );

    const accessToken = tokenRes.data.access_token;

    // ----------------------------------------------
    // Step 2: Retrieve user's profile from Facebook Graph API
    // ----------------------------------------------
    const userRes = await axios.get<FacebookUser>(
      `https://graph.facebook.com/me`,
      {
        params: {
          fields: 'id,name,email,picture',
          access_token: accessToken,
        },
      }
    );

    const fbUser = userRes.data;

    // ----------------------------------------------
    // Step 3: Create or retrieve Firebase Auth user
    // Using the Facebook ID as Firebase UID ensures consistency.
    // ----------------------------------------------
    let firebaseUser;
    try {
      firebaseUser = await admin.auth().getUser(fbUser.id);
    } catch (err) {
      firebaseUser = await admin.auth().createUser({
        uid: fbUser.id,
        email: fbUser.email,
        displayName: fbUser.name,
        photoURL: fbUser.picture.data.url,
      });
    }

    // ----------------------------------------------
    // Step 4: Store/update user in Firestore
    // ----------------------------------------------
    await db.collection("users").doc(fbUser.id).set(
      {
        uid: fbUser.id,
        email: fbUser.email,
        name: fbUser.name,
        photoURL: fbUser.picture.data.url,
        provider: 'facebook',
        updatedAt: new Date(),
      },
      { merge: true }
    );

    // ----------------------------------------------
    // Step 5: Redirect back to frontend with UID
    // The frontend will take uid and request full user data from Firestore.
    // ----------------------------------------------
    return res.redirect(`${FRONTEND_REDIRECT}?uid=${fbUser.id}`);

  } catch (err: any) {
    console.error("Facebook OAuth Error:", err.response?.data || err.message || err);
    return res
      .status(500)
      .json({ success: false, message: "Error iniciando sesión con Facebook" });
  }
};
