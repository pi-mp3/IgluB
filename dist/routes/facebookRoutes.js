"use strict";
/**
 * facebookRoutes.ts
 *
 * Routes for Facebook OAuth login.
 *
 * @module routes/facebookRoutes
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const facebookOAuth_controller_1 = require("../controllers/facebookOAuth.controller");
const router = (0, express_1.Router)();
/**
 * Route to handle Facebook OAuth login
 * POST /callback
 */
router.post('/callback', facebookOAuth_controller_1.facebookOAuthCallback);
exports.default = router;
