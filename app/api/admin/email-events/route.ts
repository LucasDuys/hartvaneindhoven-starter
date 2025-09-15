import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const adminToken = process.env.ADMIN_TOKEN;
  if (adminToken) {
    const provided = req.headers.get('x-admin-token');
    if (provided !== adminToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const take = Number(req.nextUrl.searchParams.get('take') || 50);
  const events = await prisma.emailEvent.findMany({
    orderBy: { createdAt: 'desc' },
    take: Math.min(Math.max(take, 1), 200),
  });
  return NextResponse.json({ events });
}

