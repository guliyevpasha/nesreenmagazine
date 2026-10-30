/**
 * Email göndərmə sistemi (Hostinger SMTP)
 */

import nodemailer from 'nodemailer';
import type { Attachment } from 'nodemailer/lib/mailer';

// SMTP konfiqurasiya
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.hostinger.com',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  attachments?: Attachment[];
}

/**
 * Email göndər
 */
export async function sendEmail(options: EmailOptions): Promise<void> {
  const { to, subject, html, text, attachments } = options;

  await transporter.sendMail({
    from: {
      name: process.env.EMAIL_FROM_NAME || 'Nesreen Magazine',
      address: process.env.EMAIL_FROM || 'info@nesreenmagazine.com',
    },
    to: Array.isArray(to) ? to.join(', ') : to,
    subject,
    html,
    text: text || html.replace(/<[^>]*>/g, ''), // HTML-dən text yarat
    attachments,
  });
}

/**
 * Bülten göndər (toplu email)
 */
export async function sendNewsletter(
  subscribers: string[],
  subject: string,
  html: string,
  attachments?: Attachment[]
): Promise<{ sent: number; failed: number; errors: string[] }> {
  const results = {
    sent: 0,
    failed: 0,
    errors: [] as string[],
  };

  // Batch-lərlə göndər (50-dən çox olsa)
  const batchSize = 50;
  for (let i = 0; i < subscribers.length; i += batchSize) {
    const batch = subscribers.slice(i, i + batchSize);

    try {
      await sendEmail({
        to: batch,
        subject,
        html,
        attachments,
      });
      results.sent += batch.length;
    } catch (error) {
      results.failed += batch.length;
      results.errors.push(
        `Batch ${i / batchSize + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }

    // Rate limiting - 1 saniyə gözlə
    if (i + batchSize < subscribers.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  return results;
}

/**
 * Test email göndər
 */
export async function sendTestEmail(to: string): Promise<boolean> {
  try {
    await sendEmail({
      to,
      subject: 'Test Email - Nesreen Magazine',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #8B1538;">Salam!</h2>
          <p>Bu Nesreen Magazine admin panelindən göndərilən test emaildir.</p>
          <p>Email konfiqurasiyası düzgün işləyir! ✅</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">
            Nesreen Magazine © 2026<br>
            <a href="https://nesreenmagazine.com">nesreenmagazine.com</a>
          </p>
        </div>
      `,
    });
    return true;
  } catch (error) {
    console.error('[Email] Test failed:', error);
    return false;
  }
}
