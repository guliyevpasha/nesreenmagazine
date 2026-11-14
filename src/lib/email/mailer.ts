/**
 * Email göndərmə sistemi (Hostinger SMTP — info@nesreenmagazine.com)
 *
 * Spama düşməmək üçün:
 *   - hər abunəçiyə AYRICA məktub gedir (heç kim başqasının ünvanını görmür);
 *   - `List-Unsubscribe` + `List-Unsubscribe-Post` başlıqları (Gmail/Yahoo
 *     2024 tələbi — poçt proqramında «Abunəlikdən çıx» düyməsi çıxır);
 *   - HTML ilə yanaşı düz mətn versiyası;
 *   - göndərən ünvan domenin öz qutusudur (SPF/DKIM/DMARC Hostinger DNS-də).
 */

import nodemailer from 'nodemailer';
import type { Attachment } from 'nodemailer/lib/mailer';

import { siteUrl } from '@/lib/firebase/config';
import { localeDirection, type Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import type { NewsletterRecipient } from '@/lib/newsletter/shared';
import { routes } from '@/lib/routes';

// SMTP konfiqurasiya — bir bağlantı üzərindən, saniyədə ən çox 2 məktub
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.hostinger.com',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  pool: true,
  maxConnections: 1,
  rateDelta: 1000,
  rateLimit: 2,
});

const FROM_ADDRESS = () => process.env.EMAIL_FROM || 'info@nesreenmagazine.com';

/**
 * Məktubdakı linklər üçün baza ünvan. Sayt www-ya 308 ilə yönləndirir, Gmail-in
 * one-click imtina POST-u isə yönləndirməni izləməyə bilər — ona görə birbaşa www.
 */
const LINK_BASE =
  process.env.NEWSLETTER_LINK_BASE_URL?.replace(/\/$/, '') ||
  siteUrl.replace('://nesreenmagazine.com', '://www.nesreenmagazine.com');

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  attachments?: Attachment[];
  headers?: Record<string, string>;
}

/** HTML-dən oxunaqlı düz mətn */
function htmlToText(html: string): string {
  return html
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, '')
    .replace(/<a [^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, '$2 ($1)')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|h[1-6]|li|tr)>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Email göndər
 */
export async function sendEmail(options: EmailOptions): Promise<void> {
  const { to, subject, html, text, attachments, headers } = options;

  await transporter.sendMail({
    from: {
      name: process.env.EMAIL_FROM_NAME || 'Nesreen Magazine',
      address: FROM_ADDRESS(),
    },
    to: Array.isArray(to) ? to.join(', ') : to,
    subject,
    html,
    text: text || htmlToText(html),
    attachments,
    headers,
  });
}

/** Abunəçinin şəxsi imtina linkləri */
export function unsubscribeLinks(locale: Locale, recipient: NewsletterRecipient) {
  const query = `id=${encodeURIComponent(recipient.id)}&t=${encodeURIComponent(recipient.token)}`;
  return {
    page: `${LINK_BASE}${routes.unsubscribe(locale)}?${query}`,
    oneClick: `${LINK_BASE}/api/newsletter/unsubscribe?${query}`,
  };
}

/** Bülleten məzmununu brend şablonuna salır (dil və RTL nəzərə alınır). */
export function renderNewsletterHtml(
  locale: Locale,
  subject: string,
  bodyHtml: string,
  unsubscribeUrl: string,
): string {
  const t = getDictionary(locale).newsletter;
  const dir = localeDirection[locale];
  const align = dir === 'rtl' ? 'right' : 'left';
  return `<!doctype html>
<html lang="${locale}" dir="${dir}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background:#f7f2ec;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7f2ec;">
    <tr><td align="center" style="padding:24px 12px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;">
        <tr><td align="center" style="padding:32px 24px 8px;border-bottom:1px solid #eadfd3;">
          <a href="${LINK_BASE}/${locale}" style="text-decoration:none;">
            <div style="font-family:Georgia,'Times New Roman',serif;font-size:28px;letter-spacing:6px;color:#1a1414;">NESREEN</div>
            <div style="font-family:Arial,sans-serif;font-size:10px;letter-spacing:4px;color:#b08d57;margin:4px 0 20px;">MAGAZINE</div>
          </a>
        </td></tr>
        <tr><td dir="${dir}" style="padding:28px 32px;font-family:Georgia,'Times New Roman',serif;font-size:16px;line-height:1.65;color:#2b2424;text-align:${align};">
          ${bodyHtml}
        </td></tr>
        <tr><td dir="${dir}" style="padding:20px 32px 28px;border-top:1px solid #eadfd3;font-family:Arial,sans-serif;font-size:12px;line-height:1.6;color:#8a7f78;text-align:center;">
          ${escapeHtml(t.emailReason)}<br>
          <a href="${unsubscribeUrl}" style="color:#5e1a2a;">${escapeHtml(t.emailUnsubscribe)}</a>
          &nbsp;·&nbsp;
          <a href="${LINK_BASE}/${locale}" style="color:#5e1a2a;">nesreenmagazine.com</a><br>
          Nesreen Magazine © ${new Date().getFullYear()}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

/**
 * Bülleteni hər abunəçiyə ayrıca, şəxsi imtina linki ilə göndərir.
 */
export async function sendNewsletterToRecipients(
  recipients: NewsletterRecipient[],
  locale: Locale,
  subject: string,
  bodyHtml: string,
): Promise<{ sent: string[]; failed: { email: string; error: string }[] }> {
  const sent: string[] = [];
  const failed: { email: string; error: string }[] = [];

  for (const recipient of recipients) {
    const links = unsubscribeLinks(locale, recipient);
    try {
      await sendEmail({
        to: recipient.email,
        subject,
        html: renderNewsletterHtml(locale, subject, bodyHtml, links.page),
        headers: {
          'List-Unsubscribe': `<${links.oneClick}>, <mailto:${FROM_ADDRESS()}?subject=unsubscribe>`,
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
          'List-Id': `Nesreen Magazine ${locale.toUpperCase()} <newsletter-${locale}.nesreenmagazine.com>`,
          Precedence: 'bulk',
        },
      });
      sent.push(recipient.email);
    } catch (error) {
      failed.push({
        email: recipient.email,
        error: error instanceof Error ? error.message : 'Naməlum xəta',
      });
    }
  }

  return { sent, failed };
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
