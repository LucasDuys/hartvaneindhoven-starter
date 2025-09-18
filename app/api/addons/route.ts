import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    let addons = await prisma.addOn.findMany();
    if (addons.length === 0) {
      const defaults = [
        { name: 'Drinks Package', priceCents: 500, perPerson: true },
        { name: 'Food Package', priceCents: 800, perPerson: true },
        { name: 'Extra Time', priceCents: 1000, perPerson: false },
      ];
      for (const a of defaults) {
        const exists = await prisma.addOn.findFirst({ where: { name: a.name } });
        if (!exists) await prisma.addOn.create({ data: a });
      }
      addons = await prisma.addOn.findMany();
    }
    return NextResponse.json(addons);
  } catch (error) {
    console.error('[api/addons] fetch failed:', error);
    return NextResponse.json({ error: "Failed to fetch add-ons" }, { status: 500 });
  }
}
