"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
const mailgen_1 = __importDefault(require("mailgen"));
class EmailService {
    constructor() {
        this.transporter = nodemailer_1.default.createTransport({
            host: "smtp-relay.brevo.com",
            port: 587,
            secure: false,
            auth: {
                user: "7df421003@smtp-brevo.com",
                pass: "7D0VBam8kyUMOFrz",
            },
        });
        this.mailGenerator = new mailgen_1.default({
            theme: "default",
            product: {
                name: "cosmos",
                link: "https://follyb.vercel.app/",
            },
        });
    }
    generateEmailBody(recipientName = "Subscriber", recipientEmail, title, content) {
        const email = {
            body: {
                name: recipientName,
                intro: title || `Thank you ${recipientEmail} for subscribing to StadSec!`,
                action: {
                    instructions: content || "You can visit our website by clicking the button below:",
                    button: {
                        color: "#22BC66",
                        text: "Visit Cosmos",
                        link: "https://follyb.vercel.app/",
                    },
                },
                outro: "If you have any questions, feel free to reply to this email.",
            },
        };
        return this.mailGenerator.generate(email);
    }
    sendEmail(_a) {
        return __awaiter(this, arguments, void 0, function* ({ to, from, subject, attachments = [], title, content }) {
            try {
                const emailBody = attachments.length === 0 ? this.generateEmailBody(subject, to, title, content) : undefined;
                const info = yield this.transporter.sendMail({
                    to,
                    from,
                    subject,
                    html: emailBody,
                    attachments,
                });
                console.log(`Message sent: ${info.messageId}`);
                const previewUrl = nodemailer_1.default.getTestMessageUrl(info);
                if (previewUrl) {
                    console.log(`Preview URL: ${previewUrl}`);
                }
            }
            catch (error) {
                console.error("Error sending email:", error.message);
                throw new Error(`Failed to send email: ${error.message}`);
            }
        });
    }
}
exports.default = new EmailService();
