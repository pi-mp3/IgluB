"use strict";
/**
 * app.ts
 *
 * Main Express configuration for the Iglu backend.
 * Sets up middlewares and main routes using a centralized router.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const Routes_1 = __importDefault(require("./routes/Routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// =======================
// Middlewares
// =======================
app.use((0, cors_1.default)({
    origin: 'http://localhost:5173',
    credentials: true,
}));
app.use(express_1.default.json());
// =======================
// Routes
// =======================
app.use('/api', Routes_1.default);
// =======================
// Root route
// =======================
app.get('/', (req, res) => {
    res.send('Iglu Backend is running');
});
exports.default = app;
