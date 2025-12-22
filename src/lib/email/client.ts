/**
 * Email client using nodemailer with Mailgun SMTP
 */

import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
}

// Singleton transporter
let transporter: Transporter | null = null;

/**
 * Get or create the email transporter
 */
function getTransporter(): Transporter {
  if (transporter) {
    return transporter;
  }
  
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;
  
  if (!host || !user || !pass) {
    console.warn('Email configuration incomplete - emails will not be sent');
    // Return a mock transporter that logs but doesn't send
    transporter = {
      sendMail: async (options: nodemailer.SendMailOptions) => {
        console.log('[EMAIL MOCK] Would send email:', {
          to: options.to,
          subject: options.subject,
        });
        return { messageId: 'mock-message-id' };
      },
    } as unknown as Transporter;
    return transporter;
  }
  
  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, false for other ports
    auth: {
      user,
      pass,
    },
  });
  
  return transporter;
}

/**
 * Send an email
 */
export async function sendEmail(options: EmailOptions): Promise<void> {
  const transport = getTransporter();
  const from = process.env.SMTP_FROM || 'MELD Report Generator <noreply@meld.com>';
  
  try {
    const result = await transport.sendMail({
      from,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });
    
    console.log(`Email sent successfully to ${options.to}:`, result.messageId);
  } catch (error) {
    console.error('Failed to send email:', error);
    throw new Error(`Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Verify email configuration
 */
export async function verifyEmailConfig(): Promise<boolean> {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;
  
  if (!host || !user || !pass) {
    console.warn('Email configuration incomplete');
    return false;
  }
  
  try {
    const transport = getTransporter();
    await transport.verify();
    console.log('Email configuration verified successfully');
    return true;
  } catch (error) {
    console.error('Email configuration verification failed:', error);
    return false;
  }
}

