"use strict";
/**
 * routes.ts
 *
 * Centralized route aggregator for the Iglu backend.
 * Imports and mounts all feature modules under the main API prefix.
 *
 * @module routes
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
// Rutas de autenticación
const register_routes_1 = __importDefault(require("./register.routes")); // Registro / login
const oauthRoutes_1 = __importDefault(require("./oauthRoutes")); // Google OAuth
const facebookRoutes_1 = __importDefault(require("./facebookRoutes")); // Facebook OAuth
const logout_routes_1 = __importDefault(require("./logout.routes")); // Logout
// Rutas de manejo de usuario
const editUser_routes_1 = __importDefault(require("./editUser.routes")); // Editar usuario
const deleteUser_routes_1 = __importDefault(require("./deleteUser.routes")); // Eliminar usuario
// Rutas de recuperación y reset de contraseña
const recoverPassword_routes_1 = __importDefault(require("./recoverPassword.routes"));
const resetPassword_routes_1 = __importDefault(require("./resetPassword.routes"));
const router = (0, express_1.Router)();
/**
 * Authentication routes
 */
router.use('/auth', register_routes_1.default);
router.use('/auth', oauthRoutes_1.default);
router.use('/auth', facebookRoutes_1.default);
router.use('/auth', logout_routes_1.default);
/**
 * User management routes
 */
router.use('/user', editUser_routes_1.default);
router.use('/user', deleteUser_routes_1.default);
/**
 * Password recovery routes
 */
router.use('/recover', recoverPassword_routes_1.default);
router.use('/user', resetPassword_routes_1.default);
exports.default = router;
