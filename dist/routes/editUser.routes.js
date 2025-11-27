"use strict";
/**
 * editUser.routes.ts
 *
 * Routes for editing user account
 *
 * @module routes/editUser
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const editUser_controller_1 = require("../controllers/editUser.controller");
const router = (0, express_1.Router)();
/**
 * PUT /api/user/:id
 * Edit user account by ID
 */
router.put('/user/:id', editUser_controller_1.editUser);
exports.default = router;
