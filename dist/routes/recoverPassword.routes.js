"use strict";
/**
 * recoverPassword.routes.ts
 *
 * Routes for password recovery (request reset email)
 *
 * @module routes/recoverPassword
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const recoverPassword_controller_1 = require("../controllers/recoverPassword.controller");
const router = (0, express_1.Router)();
/**
 * POST /api/recover/user/recover-password
 * Request password recovery email
 */
router.post('/user/recover-password', recoverPassword_controller_1.recoverPassword);
exports.default = router;
