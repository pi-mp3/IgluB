"use strict";
/**
 * oauthRoutes.ts
 *
 * Routes for Google OAuth login.
 *
 * @module routes/oauthRoutes
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const oauthController_1 = require("../controllers/oauthController");
const router = (0, express_1.Router)();
/**
 * Route to handle Google OAuth redirect
 * GET /api/auth/google/callback
 */
router.get('/google/callback', oauthController_1.oauthCallback);
exports.default = router;
