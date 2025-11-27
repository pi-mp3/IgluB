"use strict";
/**
 * deleteUser.routes.ts
 *
 * Routes for deleting user account
 *
 * @module routes/deleteUser
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const deleteUser_controller_1 = require("../controllers/deleteUser.controller");
const router = (0, express_1.Router)();
/**
 * DELETE /api/user/:id
 * Delete user account by ID
 */
router.delete('/user/:id', deleteUser_controller_1.deleteUser);
exports.default = router;
