import {mailtrapClient, sender, sender as user} from "./mailtrap.config.js";
import {
    PASSWORD_RESET_REQUEST_TEMPLATE,
    PASSWORD_RESET_SUCCESS_TEMPLATE,
    VERIFICATION_EMAIL_TEMPLATE
} from "./emailTemplates.js";

export const sendVerificationEmail = async (email, verificationToken) => {
    const receipt = [{email}];
    try{
        const response = await mailtrapClient.send({
            from: sender,
            to: receipt,
            subject: "QTrackAI: Verify Your Email!",
            html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationToken}", verificationToken),
            category: "EmailVerification",
        });
    } catch (error) {
        console.error(`Error sending verification email:`, error);
        throw new Error(`Error sending verification email: ${error}`);
    }
}

export const sendForgotPasswordEmail = async (email, resetURL) => {
    const receipt = [{email}];
    try{
        const response = await mailtrapClient.send({
            from: sender,
            to: receipt,
            subject: "QTrackAI: Reset your password!",
            html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL),
            category: "resetPassword",
        });
    } catch(error){
        console.error(`Error resetting password:`, error);
        throw new Error(`Error resetting password: ${error}`);
    }
}

export const sendResetPasswordSuccessEmail = async (email) => {
    const receipt = [{email}];
    try{
        const response = await mailtrapClient.send({
            from: sender,
            to: receipt,
            subject: "QTrackAI: Password reset successfully!",
            html: PASSWORD_RESET_SUCCESS_TEMPLATE,
            category: "resetPassword",
        });
    } catch(error){
        console.error(`Error sending reset success password: ${error}`);
        throw new Error(`Error sending reset success password: ${error}`);
    }
}