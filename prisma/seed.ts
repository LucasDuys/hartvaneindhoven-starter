import { prisma } from '../lib/db';
import { Prisma } from '@prisma/client';

async function main() {
  // Create/update activities with default durations
  const activities = [
    {
      slug: 'bowlen',
      name: 'Bowlen',
      summary:
        'Unieke bowlingbanen in een kerk met neon vibe. Capaciteit: 6 p.p. per baan. Perfect voor groepen en families.',
      durationMinutes: 60,
    },
    {
      slug: 'karaoke',
      name: 'Karaoke',
      summary:
        'Privékamers met top sound. Kies je playlist en zing mee. Van solo tot groep.',
      durationMinutes: 60,
    },
    {
      slug: 'beat-the-matrix',
      name: 'Beat the Matrix',
      summary:
        'Interactieve challenge rooms met puzzels en teamwork. Test je behendigheid.',
      durationMinutes: 60,
    },
  ];

  for (const activity of activities) {
    await prisma.activity.upsert({
      where: { slug: activity.slug },
      update: { durationMinutes: activity.durationMinutes },
      create: activity as any,
    });
  }

  // Create resources for bowlen
  const bowlenId = (await prisma.activity.findUnique({ where: { slug: 'bowlen' } }))?.id;
  if (bowlenId) {
    for (let i = 1; i <= 4; i++) {
      const name = `Baan ${i}`;
      const existing = await prisma.resource.findFirst({ where: { name } });
      if (!existing) {
        await prisma.resource.create({
          data: {
            name,
            capacity: 6,
            activityId: bowlenId,
          },
        });
      }
    }
  }

  // Create resources for karaoke
  const karaokeId = (await prisma.activity.findUnique({ where: { slug: 'karaoke' } }))?.id;
  if (karaokeId) {
    for (let i = 1; i <= 3; i++) {
      const name = `Karaoke Room ${i}`;
      const existing = await prisma.resource.findFirst({ where: { name } });
      if (!existing) {
        await prisma.resource.create({
          data: {
            name,
            capacity: 10,
            activityId: karaokeId,
          },
        });
      }
    }
  }

  // Create resources for beat-the-matrix
  const matrixId = (await prisma.activity.findUnique({ where: { slug: 'beat-the-matrix' } }))?.id;
  if (matrixId) {
    for (let i = 1; i <= 2; i++) {
      const name = `Matrix Room ${i}`;
      const existing = await prisma.resource.findFirst({ where: { name } });
      if (!existing) {
        await prisma.resource.create({
          data: {
            name,
            capacity: 6,
            activityId: matrixId,
          },
        });
      }
    }
  }

  // Create add-ons
  const addOns = [
    { name: 'Drinks Package', priceCents: 500, perPerson: true },
    { name: 'Food Package', priceCents: 800, perPerson: true },
    { name: 'Extra Time', priceCents: 1000, perPerson: false },
  ];

  for (const addOn of addOns) {
    const existing = await prisma.addOn.findFirst({ where: { name: addOn.name } });
    if (!existing) {
      await prisma.addOn.create({
        data: addOn,
      });
    }
  }

  console.log('Seeding completed');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
