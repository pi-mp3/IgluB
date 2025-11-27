"use strict";
/**
 * editUser.controller.ts
 *
 * Controller to edit user account
 *
 * @module controllers/editUser
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.editUser = void 0;
const firebase_1 = require("../firebase/firebase");
const editUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const updates = req.body;
        const userRef = firebase_1.db.collection('users').doc(userId);
        await userRef.update(updates);
        return res.json({ message: 'User updated successfully' });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
exports.editUser = editUser;
