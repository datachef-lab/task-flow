import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config({ path: ".env.local" });
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // Your Gmail
        pass: process.env.EMAIL_PASS, // Your App Password
    },
});

export async function sendEmail(to: string, subject: string, text: string) {
    console.log(process.env.EMAIL_USER, process.env.EMAIL_PASS)
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject,
            text,
        });
        console.log('Email sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
    }
}
