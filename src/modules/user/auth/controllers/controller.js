import dotenv from "dotenv";
import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import {
    login,
    register,
    changePasswordUser,
    deletedUser
} from '../services/services.js';
dotenv.config();

export const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    try {
        // Call the login service to validate the user credentials
        const user = await login(email, password);

        // Generate JWT token with user ID and email as payload
        const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
        // Save user ID to session
        req.session.userId = user.id;

        // Return the token to the client
        return res.json({ token });
    } catch (error) {
        // Handle any errors that occur during login
        return res.status(401).json({ message: error.message });
    }

});

export const registerUser = asyncHandler(async (req, res) => {
    const { firstName, lastName, email, password } = req.body;

    try {
        // Call the register user service to create a new user
        const user = await register({ firstName, lastName, email, password });

        // Generate JWT token
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Save user ID to session
        req.session.userId = user.id;

        // Return the token to the client
        return res.json({ token });
    } catch (error) {
        // Handle any errors that occur during registration
        return res.status(400).json({ message: error.message });
    }
});

export const changePassword = asyncHandler(async (req, res) => {
    const { userId, oldPassword, newPassword } = req.body;

    try {
        // Call the change password service to update the user's password
        await changePasswordUser(userId, oldPassword, newPassword);

        // Save user ID to session
        req.session.userId = userId;

        return res.status(204).end();
    } catch (error) {
        // Handle any errors that occur during password change
        return res.status(401).json({ message: error.message });
    }
});

export const deleteUser = asyncHandler(async (req, res) => {
    const { userId } = req.body;

    try {
        // Call the delete user service to remove the user from the database
        await deletedUser(userId);

        // Clear user ID from session
        req.session.userId = null;

        return res.status(204).end();
    } catch (error) {
        // Handle any errors that occur during user deletion
        return res.status(401).json({ message: error.message });
    }
});
