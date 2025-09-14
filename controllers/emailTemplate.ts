type LineItem = { label: string; value?: string };

type TemplateParams = {
  locale?: 'nl' | 'en';
  name?: string | null;
  activityName: string;
  start: Date; // UTC
  end: Date;   // UTC
  size: number;
  addOns?: { name: string; perPerson: boolean; price: string }[];
  total?: string;
  manageUrl?: string;
  helpUrl?: string;
  address?: string;
  logoUrl?: string;
};

const T = {
  nl: {
    hello: (name?: string | null) => `Beste ${name ?? 'gast'},`,
    thanks: (activity: string) => `Bedankt voor je reservering voor ${activity} bij Hart van Eindhoven.`,
    when: (start: Date) => `Je bent van harte welkom op ${start.toLocaleDateString('nl-NL')} om ${start.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}.`,
    details: 'Details',
    activity: 'Activiteit',
    time: 'Tijd',
    group: 'Aantal personen',
    addons: "Extra's",
    total: 'Totaal',
    manage: 'Beheer je boeking',
    help: 'Neem contact op',
    footer: 'Je vindt een kalenderbestand (.ics) in de bijlage.',
  },
  en: {
    hello: (name?: string | null) => `Hi ${name ?? 'guest'},`,
    thanks: (activity: string) => `Thanks for your reservation for ${activity} at Hart van Eindhoven.`,
    when: (start: Date) => `We look forward to seeing you on ${start.toLocaleDateString('en-GB')} at ${start.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}.`,
    details: 'Details',
    activity: 'Activity',
    time: 'Time',
    group: 'Group size',
    addons: 'Add-ons',
    total: 'Total',
    manage: 'Manage your booking',
    help: 'Contact support',
    footer: 'A calendar file (.ics) is attached to this email.',
  },
};

export function renderBookingTemplate(params: TemplateParams) {
  const {
    locale = 'nl', name, activityName, start, end, size, addOns = [], total, manageUrl, helpUrl,
    address = 'Hart van Eindhoven, [street address]', logoUrl = ''
  } = params;

  const t = T[locale] || T.nl;

  const lines: LineItem[] = [
    { label: t.activity, value: activityName },
    { label: t.time, value: `${start.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}–${end.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })} (${start.toLocaleDateString(locale)})` },
    { label: t.group, value: String(size) },
  ];

  const addOnsHtml = addOns.length
    ? `<ul style="margin:6px 0 0 18px; padding:0;">${addOns.map(a => `<li>${a.name}${a.perPerson ? ` x ${size}` : ''}${a.price ? ` — ${a.price}` : ''}</li>`).join('')}</ul>`
    : `<p style="margin:6px 0 0 0;">-</p>`;

  return `
  <div style="font-family:Inter,Arial,sans-serif; line-height:1.55; color:#111;">
    ${logoUrl ? `<div style=\"margin-bottom:16px\"><img src=\"${logoUrl}\" alt=\"Hart van Eindhoven\" style=\"height:32px\"/></div>` : ''}
    <h2 style="margin:0 0 12px;">${t.hello(name)}</h2>
    <p style="margin:0 0 6px;">${t.thanks(activityName)}</p>
    <p style="margin:0 0 16px;">${t.when(start)}</p>
    <h3 style="margin:0 0 8px;">${t.details}</h3>
    <table role="presentation" cellspacing="0" cellpadding="0" style="border-collapse:collapse; width:100%; max-width:560px;">
      ${lines.map(li => `
        <tr>
          <td style="padding:6px 8px; background:#f8f8fb; border:1px solid #eee; width:40%;">${li.label}</td>
          <td style="padding:6px 8px; border:1px solid #eee;">${li.value ?? '-'}</td>
        </tr>
      `).join('')}
      <tr>
        <td style="padding:6px 8px; background:#f8f8fb; border:1px solid #eee;">${t.addons}</td>
        <td style="padding:6px 8px; border:1px solid #eee;">${addOnsHtml}</td>
      </tr>
      ${typeof total === 'string' ? `
      <tr>
        <td style="padding:6px 8px; background:#f8f8fb; border:1px solid #eee;">${t.total}</td>
        <td style="padding:6px 8px; border:1px solid #eee; font-weight:600;">${total}</td>
      </tr>` : ''}
    </table>
    <div style="margin:16px 0;">
      ${manageUrl ? `<a href="${manageUrl}" style="display:inline-block; background:#6B57FF; color:#fff; padding:10px 14px; border-radius:10px; text-decoration:none;">${t.manage}</a>` : ''}
      ${helpUrl ? `<a href="${helpUrl}" style="display:inline-block; margin-left:12px; color:#6B57FF; text-decoration:none;">${t.help}</a>` : ''}
    </div>
    <p style="margin:12px 0; color:#4b5563;">${t.footer}</p>
    <hr style="border:none; border-top:1px solid #eee; margin:16px 0;"/>
    <p style="margin:0; color:#6b7280; font-size:12px;">${address}</p>
  </div>`;
}

