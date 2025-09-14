import { Resend } from 'resend';

type SendBookingEmailInput = {
  to: string;
  activityName: string;
  bookingId: string;
  date: Date; // UTC
  durationMinutes: number;
  size: number;
  addOns?: { name: string; perPerson: boolean; priceCents: number }[];
  totalCents?: number;
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
}: {
  uid: string;
  summary: string;
  description: string;
  start: Date;
  end: Date;
}) {
  const dtStart = formatIcsDate(start);
  const dtEnd = formatIcsDate(end);
  const dtStamp = formatIcsDate(new Date());
  return [
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
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
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
  } = input;

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM || process.env.EMAIL_FROM || 'Hart van Eindhoven <no-reply@hartvaneindhoven.local>';

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
  });

  const addOnsHtml = addOns.length
    ? `<ul>${addOns
        .map(
          (a) => `<li>${a.name}${a.perPerson ? ` x ${size}` : ''} — €${euros(a.priceCents * (a.perPerson ? size : 1))}</li>`
        )
        .join('')}</ul>`
    : '<p>Geen add-ons geselecteerd.</p>';

  const html = `
  <div style="font-family:Inter,Arial,sans-serif; line-height:1.5">
    <h2>Bevestiging van je boeking</h2>
    <p>Bedankt voor je reservering bij <strong>Hart van Eindhoven</strong>.</p>
    <p><strong>Activiteit:</strong> ${activityName}<br/>
       <strong>Aantal:</strong> ${size}<br/>
       <strong>Start:</strong> ${start.toUTCString()}<br/>
       <strong>Eindtijd:</strong> ${end.toUTCString()}<br/>
       <strong>Reserveringsnummer:</strong> ${bookingId}</p>
    <h3>Extra's</h3>
    ${addOnsHtml}
    ${typeof totalCents === 'number' ? `<p><strong>Totaal:</strong> €${euros(totalCents)}</p>` : ''}
    <p>Je vindt een kalenderbestand (.ics) in de bijlage.</p>
  </div>`;

  // If no API key, log and skip to avoid breaking booking flow
  if (!apiKey) {
    console.warn('[email] RESEND_API_KEY not set. Skipping send.');
    return { skipped: true };
  }

  const resend = new Resend(apiKey);
  const res = await resend.emails.send({
    from,
    to,
    subject: `Bevestiging — ${activityName}`,
    html,
    attachments: [
      {
        filename: 'booking.ics',
        content: Buffer.from(ics).toString('base64'),
      },
    ],
  });

  return res;
}

