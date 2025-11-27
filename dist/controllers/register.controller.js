"use strict";
// src/controllers/register.controller.ts
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.loginFacebook = exports.loginGoogle = exports.loginManual = exports.registerUser = void 0;
const firebase_1 = require("../firebase/firebase");
const bcrypt = __importStar(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const google_auth_library_1 = require("google-auth-library");
const FB = require('fb');
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';
const SALT_ROUNDS = 10;
const googleClient = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID);
/**
 * Validates that a password meets strength requirements.
 * @param password - The plain-text password to validate.
 * @returns True if the password is considered strong.
 */
const isPasswordStrong = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return regex.test(password);
};
/**
 * Handles manual user registration.
 * Creates a user in Firebase Auth and also stores profile data in Firestore.
 *
 * POST /api/auth/register
 *
 * @param req - Express request, expects firstName, lastName, age, email, and password in body.
 * @param res - Express response.
 */
const registerUser = async (req, res) => {
    try {
        const { firstName, lastName, age, email, password } = req.body;
        if (!firstName || !lastName || !age || !email || !password) {
            return res.status(400).json({ message: 'Todos los campos son obligatorios' });
        }
        if (!isPasswordStrong(password)) {
            return res.status(400).json({
                message: 'La contraseña debe tener mínimo 8 caracteres, incluir mayúsculas, minúsculas, número y un carácter especial',
            });
        }
        const userRef = firebase_1.db.collection('users');
        const snapshot = await userRef.where('email', '==', email).get();
        if (!snapshot.empty) {
            return res.status(400).json({ message: 'Usuario ya registrado' });
        }
        // Create user in Firebase Auth
        const userRecord = await firebase_1.auth.createUser({
            email,
            password,
            displayName: `${firstName} ${lastName}`,
        });
        // Hash the password to store in Firestore
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        const newUser = {
            name: firstName,
            lastName,
            age,
            email,
            password: hashedPassword,
            authProvider: 'manual',
            createdAt: new Date(),
            uid: userRecord.uid, // assign the Auth UID
        };
        const docRef = await userRef.add(newUser);
        return res.status(201).json({
            id: docRef.id,
            authUid: userRecord.uid,
            message: 'Usuario registrado exitosamente',
        });
    }
    catch (err) {
        console.error('REGISTER ERROR:', err);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
};
exports.registerUser = registerUser;
/**
 * Handles manual login.
 *
 * POST /api/auth/login
 *
 * @param req - Express request, expects email and password in body.
 * @param res - Express response.
 */
const loginManual = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Correo y contraseña son requeridos' });
        }
        const userRef = firebase_1.db.collection('users');
        const snapshot = await userRef.where('email', '==', email).get();
        if (snapshot.empty) {
            return res.status(400).json({ message: 'Usuario no encontrado' });
        }
        const userData = snapshot.docs[0].data();
        const userId = snapshot.docs[0].id;
        const match = await bcrypt.compare(password, userData.password || '');
        if (!match) {
            return res.status(401).json({ message: 'Contraseña incorrecta' });
        }
        const token = jsonwebtoken_1.default.sign({ id: userId, email }, JWT_SECRET, { expiresIn: '2h' });
        return res.json({
            token,
            message: 'Inicio de sesión exitoso',
        });
    }
    catch (err) {
        console.error('LOGIN ERROR:', err);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
};
exports.loginManual = loginManual;
/**
 * Handles Google OAuth login.
 * Verifies the Google ID token, then creates or retrieves the user in Firestore.
 * If the user doesn't exist, also creates them in Firebase Auth.
 *
 * POST /api/auth/login/google
 *
 * @param req - Express request, expects idToken in body.
 * @param res - Express response.
 */
const loginGoogle = async (req, res) => {
    try {
        const { idToken } = req.body;
        if (!idToken) {
            return res.status(400).json({ message: 'Token requerido' });
        }
        const ticket = await googleClient.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (!payload) {
            return res.status(401).json({ message: 'Token inválido' });
        }
        const { email, name, sub: googleId } = payload;
        if (!email || !name || !googleId) {
            return res.status(400).json({ message: 'Información incompleta del token de Google' });
        }
        const userRef = firebase_1.db.collection('users');
        const snapshot = await userRef.where('email', '==', email).get();
        let userId;
        if (snapshot.empty) {
            const userRecord = await firebase_1.auth.createUser({
                email,
                displayName: name,
            });
            const newUser = {
                name,
                lastName: '',
                age: 0,
                email,
                password: '',
                authProvider: 'google',
                oauthId: googleId,
                createdAt: new Date(),
                uid: userRecord.uid, // assign UID
            };
            const docRef = await userRef.add(newUser);
            userId = docRef.id;
        }
        else {
            userId = snapshot.docs[0].id;
        }
        const token = jsonwebtoken_1.default.sign({ id: userId, email }, JWT_SECRET, { expiresIn: '2h' });
        return res.json({
            token,
            message: 'Inicio de sesión con Google exitoso',
        });
    }
    catch (err) {
        console.error('GOOGLE LOGIN ERROR:', err);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
};
exports.loginGoogle = loginGoogle;
/**
 * Handles Facebook OAuth login.
 * Verifies the Facebook access token, then creates or retrieves the user in Firestore.
 * If the user doesn't exist, also creates them in Firebase Auth.
 *
 * POST /api/auth/login/facebook
 *
 * @param req - Express request, expects accessToken in body.
 * @param res - Express response.
 */
const loginFacebook = async (req, res) => {
    try {
        const { accessToken } = req.body;
        if (!accessToken) {
            return res.status(400).json({ message: 'Access token requerido' });
        }
        const fbResponse = await FB.api('me', {
            fields: ['id', 'name', 'email'],
            access_token: accessToken,
        });
        const { id: facebookId, name, email } = fbResponse;
        if (!facebookId || !name || !email) {
            return res.status(400).json({ message: 'Información incompleta de Facebook' });
        }
        const userRef = firebase_1.db.collection('users');
        const snapshot = await userRef.where('email', '==', email).get();
        let userId;
        if (snapshot.empty) {
            const userRecord = await firebase_1.auth.createUser({
                email,
                displayName: name,
            });
            const newUser = {
                name,
                lastName: '',
                age: 0,
                email,
                password: '',
                authProvider: 'facebook',
                oauthId: facebookId,
                createdAt: new Date(),
                uid: userRecord.uid, // assign UID
            };
            const docRef = await userRef.add(newUser);
            userId = docRef.id;
        }
        else {
            userId = snapshot.docs[0].id;
        }
        const token = jsonwebtoken_1.default.sign({ id: userId, email }, JWT_SECRET, { expiresIn: '2h' });
        return res.json({ token, message: 'Inicio de sesión con Facebook exitoso' });
    }
    catch (err) {
        console.error('FACEBOOK LOGIN ERROR:', err);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
};
exports.loginFacebook = loginFacebook;
/**
 * Logout handler.
 * This endpoint does not invalidate tokens server-side; the frontend should discard the token.
 *
 * POST /api/auth/logout
 *
 * @param _req - Express request (no body needed).
 * @param res - Express response.
 */
const logout = (_req, res) => {
    return res.json({ message: 'Cierre de sesión exitoso, elimina el token en el frontend' });
};
exports.logout = logout;
