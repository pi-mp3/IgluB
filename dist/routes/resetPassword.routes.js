"use strict";
/**
 * resetPassword.routes.ts
 *
 * Routes for password reset (after user clicks link)
 *
 * @module routes/resetPassword
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const resetPassword_controller_1 = require("../controllers/resetPassword.controller");
const router = (0, express_1.Router)();
/**
 * POST /api/user/reset-password
 * Reset password using token from email
 */
router.post('/reset-password', resetPassword_controller_1.resetPassword);
exports.default = router;
