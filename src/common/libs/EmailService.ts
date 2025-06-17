import nodemailer, { Transporter } from "nodemailer";
import Mailgen from "mailgen";

interface EmailOptions {
  to: string;
  from: string;
  subject: string;
  attachments?: Array<{
    filename: string;
    path: string;
  }>;
  title?: string;
  content?: string;
}

class EmailService {
  private transporter: Transporter;
  private mailGenerator: Mailgen;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: "smtp-relay.brevo.com",
      port: 587,
      secure: false,
      auth: {
        user: "7df421003@smtp-brevo.com",
        pass: "7D0VBam8kyUMOFrz",
      },
    });

    this.mailGenerator = new Mailgen({
      theme: "default",
      product: {
        name: "cosmos",
        link: "https://follyb.vercel.app/",
      },
    });
  }

  private generateEmailBody(
    recipientName: string = "Subscriber",
    recipientEmail: string,
    title?: string,
    content?: string
  ): string {
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

  public async sendEmail({ to, from, subject, attachments = [], title, content }: EmailOptions): Promise<void> {
    try {
      const emailBody = attachments.length === 0 ? this.generateEmailBody(subject, to, title, content) : undefined;

      const info = await this.transporter.sendMail({
        to,
        from,
        subject,
        html: emailBody,
        attachments,
      });
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.warn(`Preview URL: ${previewUrl}`);
      }
    } catch (error: any) {
      console.warn("Error sending email:", error.message);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }
}

export default new EmailService();
