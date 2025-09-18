import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    let activities = await prisma.activity.findMany({ include: { resources: true } });

    // Seed minimal data if empty so the booking UI always has options
    if (activities.length === 0) {
      const seeds = [
        { slug: 'bowlen', name: 'Bowlen', summary: 'Bowlen in een kerk.' },
        { slug: 'karaoke', name: 'Karaoke', summary: 'Privé karaoke kamers.' },
        { slug: 'beat-the-matrix', name: 'Beat the Matrix', summary: 'Interactieve challenge.' },
      ];
      for (const a of seeds) {
        await prisma.activity.upsert({ where: { slug: a.slug }, update: {}, create: a });
      }
      const bowlen = await prisma.activity.findUnique({ where: { slug: 'bowlen' } });
      const karaoke = await prisma.activity.findUnique({ where: { slug: 'karaoke' } });
      const matrix = await prisma.activity.findUnique({ where: { slug: 'beat-the-matrix' } });
      if (bowlen) {
        for (let i = 1; i <= 2; i++) {
          const name = `Baan ${i}`;
          const exists = await prisma.resource.findFirst({ where: { name } });
          if (!exists) await prisma.resource.create({ data: { name, capacity: 6, activityId: bowlen.id } });
        }
      }
      if (karaoke) {
        for (let i = 1; i <= 2; i++) {
          const name = `Karaoke Room ${i}`;
          const exists = await prisma.resource.findFirst({ where: { name } });
          if (!exists) await prisma.resource.create({ data: { name, capacity: 10, activityId: karaoke.id } });
        }
      }
      if (matrix) {
        for (let i = 1; i <= 1; i++) {
          const name = `Matrix Room ${i}`;
          const exists = await prisma.resource.findFirst({ where: { name } });
          if (!exists) await prisma.resource.create({ data: { name, capacity: 6, activityId: matrix.id } });
        }
      }
      activities = await prisma.activity.findMany({ include: { resources: true } });
    }

    return NextResponse.json(activities);
  } catch (error) {
    console.error('[api/activities] fetch failed:', error);
    return NextResponse.json({ error: "Failed to fetch activities" }, { status: 500 });
  }
}
