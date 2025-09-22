import { prisma } from "@/lib/db";

type QuoteInput = {
  activityId: string;
  date: Date; // UTC date of start time
  size: number;
  durationMinutes: number;
  addOnIds?: string[];
};

export type Quote = {
  baseCents: number;
  addOnsCents: number;
  totalCents: number;
  items: { label: string; cents: number }[];
};

function isPeak(date: Date): boolean {
  // Treat Fri 17:00 through Sun 23:59 as peak (local)
  const local = new Date(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes()
  );
  const dow = local.getDay(); // 0=Sun
  const hour = local.getHours();
  if (dow === 5 || dow === 6) return true; // Fri/Sat all day considered peak
  if (dow === 0) return true; // Sun peak
  if (dow === 4 && hour >= 17) return true; // Thu 17:00 onward counts as ramp-up (optional)
  return false;
}

export async function computeQuote(input: QuoteInput): Promise<Quote> {
  const { activityId, date, size, durationMinutes, addOnIds = [] } = input;
  const activity = await prisma.activity.findUnique({ where: { id: activityId } });
  if (!activity) throw new Error("Activity not found");

  // Pricing rules per activity slug
  const slug = activity.slug;
  const peak = isPeak(date);
  let basePerHourCents = 0;
  let perPerson = false;

  if (slug === 'bowlen') {
    basePerHourCents = peak ? 3500 : 2500; // per lane per hour
    perPerson = false;
  } else if (slug === 'karaoke') {
    basePerHourCents = peak ? 1500 : 1000; // per person per hour
    perPerson = true;
  } else if (slug === 'beat-the-matrix') {
    basePerHourCents = 1400; // per person per hour (flat)
    perPerson = true;
  } else if (slug === 'fitness') {
    basePerHourCents = peak ? 1500 : 1200; // per person per hour
    perPerson = true;
  } else {
    basePerHourCents = 1000; // fallback
    perPerson = true;
  }

  const durationFactor = durationMinutes / 60;
  const baseCents = Math.round(basePerHourCents * durationFactor * (perPerson ? size : 1));

  // Add-ons
  const addons = await prisma.addOn.findMany({ where: { id: { in: addOnIds } } });
  const addOnsCents = addons.reduce((sum: number, a: any) => sum + a.priceCents * (a.perPerson ? size : 1), 0);

  const items: Quote["items"] = [
    { label: `${activity.name} ${perPerson ? `x ${size}` : ''} (${durationMinutes} min)`, cents: baseCents },
  ];
  for (const a of addons) {
    items.push({ label: `${a.name}${a.perPerson ? ` x ${size}` : ''}`, cents: a.priceCents * (a.perPerson ? size : 1) });
  }

  const totalCents = baseCents + addOnsCents;
  return { baseCents, addOnsCents, totalCents, items };
}
