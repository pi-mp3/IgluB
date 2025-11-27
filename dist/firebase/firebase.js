"use strict";
/**
 * Module for initializing Firebase Admin SDK.
 *
 * Responsibilities:
 * - Load service account JSON file.
 * - Initialize Firebase Admin with Auth and Firestore.
 * - Provide debug logs to verify project configuration.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = exports.db = void 0;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
/**
 * Absolute path to the Firebase service account JSON file.
 * Make sure the filename is correct.
 * @constant {string}
 */
const jsonPath = path_1.default.resolve(__dirname, 'iglu-2025-firebase-adminsdk-fbsvc-d91253ddfa.json');
console.log('DEBUG: Looking for serviceAccount at ->', jsonPath);
console.log('DEBUG: existsSync:', fs_1.default.existsSync(jsonPath));
if (!fs_1.default.existsSync(jsonPath)) {
    throw new Error('❌ serviceAccount JSON NOT FOUND. Check the file path.');
}
/**
 * The service account credentials loaded from the JSON file, used to authenticate admin SDK.
 * @type {object}
 */
const serviceAccount = require(jsonPath);
/**
 * Initialize Firebase Admin SDK using the service account credentials.
 * Uses `admin.credential.cert(...)` as specified in the Admin SDK documentation. :contentReference[oaicite:0]{index=0}
 */
firebase_admin_1.default.initializeApp({
    credential: firebase_admin_1.default.credential.cert(serviceAccount),
});
/**
 * Logs the project ID read from the service account JSON file and from environment variable.
 * Helps verifying that the correct project is being used.
 * @returns {void}
 */
console.log('Project ID (from JSON):', serviceAccount.project_id);
console.log('Project ID (from .env):', process.env.FIREBASE_PROJECT_ID);
/**
 * Firestore database instance from Firebase Admin.
 * @type {FirebaseFirestore.Firestore}
 */
exports.db = firebase_admin_1.default.firestore();
/**
 * Authentication service instance from Firebase Admin.
 * @type {admin.auth.Auth}
 */
exports.auth = firebase_admin_1.default.auth();
console.log('✅ Firebase initialized successfully');
