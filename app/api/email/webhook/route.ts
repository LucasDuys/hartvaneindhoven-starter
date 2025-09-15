import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Minimal Resend webhook handler. Consider verifying signatures in production.
export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    // Resend payload examples: { type, data: { email: { to, id, ... }, event: 'delivered' } }
    const type = payload?.type || payload?.event || 'unknown';
    const data = payload?.data || payload;
    const email = data?.email || {};
    const recipient = Array.isArray(email?.to) ? email.to[0] : email?.to;
    const providerId = email?.id || data?.id;
    const status = data?.event || data?.status || undefined;

    // Optional bookingId if you include it in headers or metadata in the future
    const bookingId = payload?.bookingId || email?.metadata?.bookingId || null;

    await prisma.emailEvent.create({
      data: {
        bookingId: bookingId || undefined,
        type: String(type),
        status: status ? String(status) : null,
        providerId: providerId ? String(providerId) : null,
        recipient: recipient ? String(recipient) : null,
        payload,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'failed' }, { status: 400 });
  }
}

