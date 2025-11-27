"use strict";
/**
 * deleteUser.controller.ts
 *
 * Controller to delete user account
 *
 * @module controllers/deleteUser
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = void 0;
const firebase_1 = require("../firebase/firebase");
const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;
        await firebase_1.db.collection('users').doc(userId).delete();
        return res.json({ message: 'User deleted successfully' });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
exports.deleteUser = deleteUser;
