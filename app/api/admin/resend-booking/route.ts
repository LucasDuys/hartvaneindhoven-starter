import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendBookingConfirmationEmail } from '@/controllers/email';
import { computeQuote } from '@/controllers/pricing';

export async function POST(req: NextRequest) {
  const adminToken = process.env.ADMIN_TOKEN;
  if (adminToken) {
    const provided = req.headers.get('x-admin-token');
    if (provided !== adminToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const body = await req.json();
  const bookingId = body?.bookingId as string;
  if (!bookingId) return NextResponse.json({ error: 'Missing bookingId' }, { status: 400 });

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      addOns: { include: { addOn: true } },
      resource: { include: { activity: true } },
    },
  });
  if (!booking) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const quote = await computeQuote({
    activityId: booking.resource.activityId,
    date: booking.date,
    size: booking.size,
    durationMinutes: (booking as any).durationMinutes || 60,
    addOnIds: booking.addOns.map(a => a.addOnId),
  });

  await sendBookingConfirmationEmail({
    to: booking.email,
    name: booking.name || null,
    activityName: booking.resource.activity.name,
    bookingId: booking.id,
    date: booking.date,
    durationMinutes: (booking as any).durationMinutes || 60,
    size: booking.size,
    addOns: booking.addOns.map(a => ({ name: a.addOn.name, perPerson: a.addOn.perPerson, priceCents: a.addOn.priceCents })),
    totalCents: quote.totalCents,
    locale: 'nl',
    replyToName: 'Hart van Eindhoven',
    replyToEmail: process.env.CONTACT_EMAIL || undefined,
  });

  return NextResponse.json({ ok: true });
}

