// apps/host-client/lib/nodemailer.ts
import nodemailer from 'nodemailer';

const emailUser = process.env.EMAIL_SERVER_USER;
const emailPass = process.env.EMAIL_SERVER_PASSWORD;
const fromName = process.env.EMAIL_FROM_NAME;
const fromEmail = process.env.EMAIL_FROM;

// Basic check to ensure credentials are loaded
if (!emailUser || !emailPass || !fromName || !fromEmail) {
    console.warn("⚠️ Email credentials are not fully set in .env.local. Email notifications will be disabled.");
}

// This is the "transport" that defines how Nodemailer connects to the email service
export const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: emailUser,
        pass: emailPass,
    },
});

// A reusable function for the "Approved" email template
export const createApprovalEmail = (hackathonName: string) => ({
    subject: `Congratulations! Your application for ${hackathonName} has been approved!`,
    html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h2>Application Approved!</h2>
            <p>Hi there,</p>
            <p>Great news! Your application to participate in the <strong>${hackathonName}</strong> hackathon has been approved.</p>
            <p>Get ready to build something amazing. We'll be in touch with more details as the event gets closer.</p>
            <p>Best regards,<br/>The ${fromName} Team</p>
        </div>
    `,
});

// A reusable function for the "Rejected" email template
export const createRejectionEmail = (hackathonName: string) => ({
    subject: `Update on your application for ${hackathonName}`,
    html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h2>Application Update</h2>
            <p>Hi there,</p>
            <p>Thank you for your interest in the <strong>${hackathonName}</strong> hackathon.</p>
            <p>Due to a high volume of applications, we are unfortunately unable to offer you a spot at this time. We strongly encourage you to apply for our future events.</p>
            <p>We wish you the best of luck in your hacking endeavors.</p>
            <p>Best regards,<br/>The ${fromName} Team</p>
        </div>
    `,
});