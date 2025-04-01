import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config({ path: ".env.local" });

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // This should be your Gmail App Password
    },
});

export async function sendEmail(
    to: string,
    subject: string,
    text: string,
    html?: string
) {
    try {
        const mailOptions = {
            from: `"Task Flow" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
            html,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
}
