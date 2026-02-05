import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

export const resendClient = new Resend(process.env.RESEND_API_KEY);

const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
const fromName = process.env.RESEND_FROM_NAME || "FurAdopt";

export const sender = `${fromName} <${fromEmail}>`;
