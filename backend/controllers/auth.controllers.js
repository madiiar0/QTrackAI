import bcryptjs from "bcryptjs";
import crypto from "crypto";

import {generateTokenAndSetCookie} from "../utils/generateTokenAndSetCookie.js";
import User from "../models/user.model.js";
import {sendForgotPasswordEmail, sendResetPasswordSuccessEmail} from "../mailtrap/emails.js";

export const signup = async (req, res) => {
    try{
        const { email, password, name } = req.body || {};
        if (!email || !password || !name) {
            throw new Error("All the fields are required!");
        }
        const userAlreadyExist = await User.findOne({ email });
        if (userAlreadyExist) {
            throw new Error("User already exists!");
        }

        const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

        const hashedPassword = await bcryptjs.hash(password, 12);
        const user = new User({
            email,
            password: hashedPassword,
            name,
            verificationToken,
            verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000,
        });
        await user.save();

        generateTokenAndSetCookie(res, user._id);

        // await sendVerificationEmail(user.email, verificationToken);

        res.status(201).json({
            success: true,
            message: "Successfully sign up!",
            user: {
                ...user._doc,
                password: undefined,
            },
        });
    } catch(error){
        res.status(400).json({ success: false, message: error.message });
    }
}

export const verifyEmail = async (req, res) => {
    try{
        const { code } = req.body || {};
        if (!code) {
            throw new Error("Verification code is required!");
        }
        const user = await User.findOne({
            verificationToken: String(code),
            verificationTokenExpiresAt: {$gt: Date.now()},
        });

        if(!user){
            throw new Error("Invalid or expired verification code!");
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpiresAt = undefined;
        await user.save();

        res.status(201).json({
            success: true,
            message: "Successfully verified!",
            user: {
                ...user._doc,
                password: undefined,
            },
        });
    } catch(error){
        res.status(400).json({ success: false, message: error.message });
    }
}

export const login = async (req, res) => {
    const { email, password } = req.body || {};
    try {
        const user = await User.findOne({email});
        if(!user){
            throw new Error("Invalid email!");
        }
        const isPasswordVaild = await bcryptjs.compare(password, user.password);
        if(!isPasswordVaild){
            throw new Error("Invalid password!");
        }

        generateTokenAndSetCookie(res, user._id);
        user.lastLogin = new Date();

        await user.save();

        res.status(201).json({
            success: true,
            message: "Successfully logged in!",
            user: {
                ...user._doc,
                password: undefined,
            },
        });
    } catch(error){
        res.status(400).json({ success: false, message: error.message });
    }
}

export const logout = async (req, res) => {
    res.clearCookie('auth_token');
    res.status(201).json({
        success: true,
        message: "Logged out successfully!",
        user: null,
    });
}

export const forgotPassword = async (req, res) => {
    const { email } = req.body || {};
    try{
        const user = await User.findOne({email});
        if(!user){
            throw new Error("Invalid email!");
        }
        const resetToken = crypto.randomBytes(20).toString("hex");
        const resetTokenExpiresAt = Date.now() + 60 * 60 * 1000;

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpiresAt = resetTokenExpiresAt;

        await user.save();

        await sendForgotPasswordEmail(email, `${process.env.CLIENT_URL}/forgot-password/${resetToken}`);

        res.status(201).json({
            success: true,
            message: "Password reset link sent to your email successfully!",
            user: {
                ...user._doc,
                password: undefined,
            },
        });
    } catch(error){
        res.status(400).json({ success: false, message: error.message });
    }
}

export const resetPassword = async (req, res) => {
    try{
        const {token} = req.params;
        const {password} = req.body || {};

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpiresAt: {$gt: Date.now()},
        })

        if(!user){
            throw new Error("Invalid or expired reset link!");
        }

        user.password = await bcryptjs.hash(password, 12);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpiresAt = undefined;

        await user.save();

        await sendResetPasswordSuccessEmail(user.email);

        res.status(201).json({
            success: true,
            message: "Successfully reset password!",
            user: {
                ...user._doc,
                password: undefined,
            },
        });
    } catch(error){
        res.status(400).json({ success: false, message: error.message });
    }
}

export const checkAuth = async (req, res) => {
    try{
        const user = await User.findById(req.userId);
        if(!user){
            throw new Error("Invalid or expired user!");
        }
        res.status(201).json({
            success: true,
            message: "Successfully logged in!",
            user: {
                ...user._doc,
                password: undefined,
            },
        });
    } catch (error){
        res.status(400).json({ success: false, message: error.message });
    }
}
