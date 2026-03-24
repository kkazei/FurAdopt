import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

const resendApiKey = process.env.RESEND_API_KEY;

if (!resendApiKey) {
	console.warn("RESEND_API_KEY is not set. Email sending is disabled.");
}

export const resendClient = resendApiKey ? new Resend(resendApiKey) : null;

const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
const fromName = process.env.RESEND_FROM_NAME || "FurAdopt";

export const sender = `${fromName} <${fromEmail}>`;
