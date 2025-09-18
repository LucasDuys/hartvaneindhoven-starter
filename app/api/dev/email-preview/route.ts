import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { computeQuote } from '@/controllers/pricing';
import { generateBookingEmail } from '@/controllers/email';

export async function GET(req: NextRequest) {
  const bookingId = req.nextUrl.searchParams.get('bookingId');
  const locale = (req.nextUrl.searchParams.get('locale') as 'nl' | 'en') || 'nl';

  if (bookingId) {
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
      addOnIds: booking.addOns.map((a: any) => a.addOnId),
    });
    const gen = generateBookingEmail({
      activityName: booking.resource.activity.name,
      bookingId: booking.id,
      date: booking.date,
      durationMinutes: (booking as any).durationMinutes || 60,
      size: booking.size,
      addOns: booking.addOns.map((a: any) => ({ name: a.addOn.name, perPerson: a.addOn.perPerson, priceCents: a.addOn.priceCents })),
      totalCents: quote.totalCents,
      name: booking.name || null,
      locale,
    });
    return NextResponse.json(gen);
  }

  // Fallback sample
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 16, 0));
  const gen = generateBookingEmail({
    activityName: 'Bowlen',
    bookingId: 'preview',
    date: start,
    durationMinutes: 60,
    size: 4,
    addOns: [ { name: 'Drinks Package', perPerson: true, priceCents: 500 } ],
    totalCents: 2500 + 4*500,
    name: 'Lucas',
    locale,
  });
  return NextResponse.json(gen);
}
