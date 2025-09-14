import { Resend } from 'resend';
import { renderBookingTemplate } from './emailTemplate';

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

  if (!EMAIL_ENABLED) {
    console.warn('[email] EMAIL_ENABLED is not true. Skipping send.');
    return { skipped: true };
  }

  // Build ICS
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

  const addOnsHtml = addOns.length
    ? `<ul>${addOns
        .map(
          (a) => `<li>${a.name}${a.perPerson ? ` x ${size}` : ''} — €${euros(a.priceCents * (a.perPerson ? size : 1))}</li>`
        )
        .join('')}</ul>`
    : '<p>Geen add-ons geselecteerd.</p>';

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

  // If no API key or client, log and skip to avoid breaking booking flow
  if (!resend) {
    console.warn('[email] RESEND_API_KEY not set. Skipping send.');
    return { skipped: true };
  }

  const res = await resend.emails.send({
    from: FROM,
    to,
    subject: `Bevestiging — ${activityName}`,
    html,
    // Resend API uses snake_case for reply_to
    ...(replyToEmail ? { reply_to: replyToEmail } : {}),
    attachments: [
      {
        filename: 'booking.ics',
        content: Buffer.from(ics).toString('base64'),
      },
    ],
  });

  return res;
}
