"use strict";
// src/routes/logout.routes.ts
/**
 * Rutas para logout
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const logout_controller_1 = require("../controllers/logout.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
/**
 * POST /auth/logout
 * Requiere JWT válido en Authorization header
 */
router.post('/logout', auth_middleware_1.authenticateJWT, logout_controller_1.logoutUser);
exports.default = router;
