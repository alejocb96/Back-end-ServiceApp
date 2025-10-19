import nodemailer from 'nodemailer';
import { EmailOptions } from '../types';

const sendEmail = async (options: EmailOptions): Promise<void> => {
  const transporter = nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT as string) || 587,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD
    }
  });

  const message = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html
  };

  const info = await transporter.sendMail(message);

  console.log('✅ Email enviado: %s', info.messageId);
};

export default sendEmail;

