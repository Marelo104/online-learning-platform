import jwt from 'jsonwebtoken';
import dotenv from "dotenv"

dotenv.config() 

export const generateTokenAndSendCookie = (userId, res) => {
    const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: '15d',
    });

    res.cookie('learnify_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Set to true in production
        sameSite: 'strict', // Adjust as needed (e.g., 'lax' or 'none' for cross-site)
        maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days in milliseconds
    });

    return token;
}