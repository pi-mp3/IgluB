"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.recoverPassword = exports.deleteUser = exports.updateUser = exports.login = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const firebase_1 = require("../firebase/firebase");
const JWT_SECRET = process.env.JWT_SECRET || "my_secret_key";
/**
 * Generates a JWT token for a user.
 * @param {string} uid - Firebase user ID.
 * @returns {string} Generated JWT token.
 */
const generateToken = (uid) => {
    return jsonwebtoken_1.default.sign({ uid }, JWT_SECRET, { expiresIn: "7d" });
};
/**
 * Registers a new user in Firebase Authentication and Firestore.
 */
const register = async (req, res) => {
    try {
        const { email, password, ...data } = req.body;
        const userRecord = await firebase_1.auth.createUser({ email, password });
        await firebase_1.db.collection("users").doc(userRecord.uid).set(data);
        return res.json({ uid: userRecord.uid });
    }
    catch (err) {
        return res.status(400).json({ error: err.message });
    }
};
exports.register = register;
/**
 * Logs in a user.
 * NOTE: Firebase Admin SDK cannot validate passwords.
 */
const login = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await firebase_1.auth.getUserByEmail(email);
        if (!user)
            return res.status(404).json({ error: "User not found" });
        return res.status(400).json({
            error: "Password login must be handled on the frontend using Firebase Client SDK.",
        });
    }
    catch (err) {
        return res.status(400).json({ error: err.message });
    }
};
exports.login = login;
/**
 * Updates user data in Firestore.
 */
const updateUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const newData = req.body;
        await firebase_1.db.collection("users").doc(userId).update(newData);
        return res.json({ message: "User updated successfully" });
    }
    catch (err) {
        return res.status(400).json({ error: err.message });
    }
};
exports.updateUser = updateUser;
/**
 * Deletes a user from Firebase Authentication and Firestore.
 */
const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;
        await firebase_1.auth.deleteUser(userId);
        await firebase_1.db.collection("users").doc(userId).delete();
        return res.json({ message: "User deleted successfully" });
    }
    catch (err) {
        return res.status(400).json({ error: err.message });
    }
};
exports.deleteUser = deleteUser;
/**
 * Sends a password recovery email (Frontend responsibility).
 */
const recoverPassword = async (req, res) => {
    try {
        return res.status(400).json({
            error: "Password recovery must be done using Firebase Client SDK on the frontend.",
        });
    }
    catch (err) {
        return res.status(400).json({ error: err.message });
    }
};
exports.recoverPassword = recoverPassword;
