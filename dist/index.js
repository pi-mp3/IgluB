"use strict";
/**
 * index.ts
 *
 * Entry point of the Express server.
 * Starts the application on the port defined in .env or 3001 by default.
 *
 * @module index
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
/** Server port, taken from environment variable or default to 3001 */
const PORT = process.env.PORT || 3001;
/**
 * Starts the Express server and listens for HTTP requests
 */
app_1.default.listen(PORT, () => {
    console.log(`🔥 Server running at http://localhost:${PORT}`);
});
