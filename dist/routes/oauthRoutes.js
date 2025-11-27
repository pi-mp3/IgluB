"use strict";
/**
 * oauthRoutes.ts
 *
 * Routes for Google OAuth authentication.
 * Includes login URL generation and callback processing.
 *
 * @module routes/oauthRoutes
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const oauthController_1 = require("../controllers/oauthController");
const router = (0, express_1.Router)();
/**
 * Starts Google OAuth login process.
 * Redirects user to Google’s authentication page.
 *
 * GET /api/auth/google
 */
router.get('/google', (req, res) => {
    // Generate the Google login URL using OAuth2 client
    const redirectUrl = oauthController_1.googleClient.generateAuthUrl({
        access_type: 'offline', // Necesario para refresh_token
        prompt: 'consent', // Fuerza a Google a entregar refresh_token
        scope: [
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email'
        ],
    });
    // Redirect user to Google login page
    res.redirect(redirectUrl);
});
/**
 * Google OAuth callback route.
 * Handles authorization code returned by Google and returns user data.
 *
 * GET /api/auth/google/callback
 */
router.get('/google/callback', oauthController_1.oauthCallback);
exports.default = router;
