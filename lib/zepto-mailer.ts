import { SendMailClient } from "zeptomail";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

console.log("ZeptoMail URL:", process.env.ZEPTO_URL);
console.log("ZeptoMail FROM:", process.env.ZEPTO_FROM);
console.log(`Zoho-enczapikey ${process.env.ZEPTO_TOKEN!}`);

const client = new SendMailClient({
    url: process.env.ZEPTO_URL!,
    token: `Zoho-enczapikey ${process.env.ZEPTO_TOKEN!}`,
});

export async function sendZeptoMail(
    to: string,
    subject: string,
    htmlBody: string,
    name?: string
) {
    try {
        console.log("sending email to:", to);
        console.log("email subject:", subject);
        console.log("email body:", htmlBody);
        console.log("email name:", name);
        const response = await client.sendMail({
            from: {
                address: process.env.ZEPTO_FROM!,
                name: "Task Flow",
            },
            to: [
                {
                    email_address: {
                        address: to,
                        name: name || "User",
                    },
                },
            ],
            subject,
            htmlbody: htmlBody,
        });

        console.log("✅ Email sent via ZeptoMail:", response);
        return response;
    } catch (error) {
        console.error("❌ ZeptoMail send error:", error);
        throw error;
    }
}
