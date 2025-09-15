import { Resend } from 'resend';
import { renderBookingTemplate } from './emailTemplate';
import fs from 'node:fs/promises';
import path from 'node:path';

const EMAIL_ENABLED = process.env.EMAIL_ENABLED === 'true';
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM = process.env.RESEND_FROM || process.env.EMAIL_FROM || 'Hart van Eindhoven <no-reply@hartvaneindhoven.local>';
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

type SendBookingEmailInput = {
  to: string;
  activityName: string;
  bookingId: string;
  date: Date; // UTC
  durationMinutes: number;
  size: number;
  addOns?: { name: string; perPerson: boolean; priceCents: number }[];
  totalCents?: number;
  replyToName?: string;
  replyToEmail?: string;
  name?: string | null;
  locale?: 'nl' | 'en';
};

function formatIcsDate(dt: Date): string {
  const yyyy = dt.getUTCFullYear().toString().padStart(4, '0');
  const mm = (dt.getUTCMonth() + 1).toString().padStart(2, '0');
  const dd = dt.getUTCDate().toString().padStart(2, '0');
  const hh = dt.getUTCHours().toString().padStart(2, '0');
  const min = dt.getUTCMinutes().toString().padStart(2, '0');
  const ss = dt.getUTCSeconds().toString().padStart(2, '0');
  return `${yyyy}${mm}${dd}T${hh}${min}${ss}Z`;
}

function euros(cents: number) {
  return (cents / 100).toFixed(2);
}

export function buildIcs({
  uid,
  summary,
  description,
  start,
  end,
  location,
  url,
}: {
  uid: string;
  summary: string;
  description: string;
  start: Date;
  end: Date;
  location?: string;
  url?: string;
}) {
  const dtStart = formatIcsDate(start);
  const dtEnd = formatIcsDate(end);
  const dtStamp = formatIcsDate(new Date());
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Hart van Eindhoven//Booking//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description.replace(/\n/g, '\\n')}`,
  ];
  if (location) lines.push(`LOCATION:${location}`);
  if (url) lines.push(`URL:${url}`);
  lines.push('END:VEVENT', 'END:VCALENDAR');
  return lines.join('\r\n');
}

export function generateBookingEmail(input: Omit<SendBookingEmailInput, 'to' | 'replyToName' | 'replyToEmail'>) {
  const {
    activityName,
    bookingId,
    date,
    durationMinutes,
    size,
    addOns = [],
    totalCents,
    name,
    locale = 'nl',
  } = input;

  const start = new Date(date);
  const end = new Date(start);
  end.setMinutes(end.getMinutes() + (durationMinutes || 60));

  const ics = buildIcs({
    uid: bookingId,
    summary: `${activityName} — Hart van Eindhoven`,
    description: `Boeking: ${activityName}\nAantal: ${size}\nReserveringsnummer: ${bookingId}`,
    start,
    end,
    location: 'Hart van Eindhoven, [street address]',
    url: 'https://hartvaneindhoven.nl',
  });

  const html = renderBookingTemplate({
    locale,
    name,
    activityName,
    start,
    end,
    size,
    addOns: addOns.map(a => ({ name: a.name, perPerson: a.perPerson, price: `€${euros(a.priceCents * (a.perPerson ? size : 1))}` })),
    total: typeof totalCents === 'number' ? `€${euros(totalCents)}` : undefined,
    helpUrl: 'mailto:' + (process.env.CONTACT_EMAIL || 'info@hartvaneindhoven.nl'),
    address: 'Hart van Eindhoven, [street address]',
  });

  return { html, icsBase64: Buffer.from(ics).toString('base64'), start, end };
}

export async function sendBookingConfirmationEmail(input: SendBookingEmailInput) {
  const {
    to,
    activityName,
    bookingId,
    date,
    durationMinutes,
    size,
    addOns = [],
    totalCents,
    replyToName,
    replyToEmail,
    name,
    locale = 'nl',
  } = input;

  const generated = generateBookingEmail({
    activityName,
    bookingId,
    date,
    durationMinutes,
    size,
    addOns,
    totalCents,
    name,
    locale,
  });

  // If sending is disabled or no client, write to outbox for preview and skip sending
  if (!EMAIL_ENABLED || !resend) {
    try {
      const outDir = path.join(process.cwd(), 'outbox');
      await fs.mkdir(outDir, { recursive: true });
      const ts = new Date().toISOString().replace(/[:.]/g, '-');
      const base = `${ts}-${bookingId || 'preview'}`;
      await fs.writeFile(path.join(outDir, `${base}.html`), generated.html, 'utf8');
      await fs.writeFile(path.join(outDir, `${base}.ics`), Buffer.from(generated.icsBase64, 'base64'));
      console.warn(`[email] Skipped send; wrote preview to outbox/${base}.{html,ics}`);
    } catch (e) {
      console.warn('[email] Failed to write outbox files:', (e as Error).message);
    }
    return { skipped: true, ...generated };
  }

  // If no API key or client, log and skip to avoid breaking booking flow
  const res = await resend.emails.send({
    from: FROM,
    to,
    subject: `Bevestiging — ${activityName}`,
    html: generated.html,
    // Resend API uses snake_case for reply_to
    ...(replyToEmail ? { reply_to: replyToEmail } : {}),
    attachments: [
      {
        filename: 'booking.ics',
        content: generated.icsBase64,
      },
    ],
  });
  return { sent: true, provider: res, ...generated } as const;
}
