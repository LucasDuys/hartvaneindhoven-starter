import { prisma } from "@/lib/db";
import { AvailabilityInput } from "@/models/types";
import { generateTimeGrid, toUtcFromLocal } from "@/lib/schedule";

// Temporary default while duration per activity/booking is not modeled in DB
const DEFAULT_BOOKING_MINUTES = 60;

export async function getAvailableSlots(input: AvailabilityInput) {
  const { activityId, date, durationMinutes, size } = input;

  // Parse date as local (venue) day and build UTC day bounds to keep DB and UI aligned
  const [y, m, d] = date.split("-").map(Number);
  const startOfDay = new Date(Date.UTC(y, (m || 1) - 1, d || 1, 0, 0, 0, 0));
  const endOfDay = new Date(Date.UTC(y, (m || 1) - 1, d || 1, 23, 59, 59, 999));

  // All resources for the activity
  const resources = await prisma.resource.findMany({
    where: size ? { activityId, capacity: { gte: size } } : { activityId },
  });
  if (resources.length === 0) return [];

  // Day's bookings on those resources (non-cancelled)
  const bookings = await prisma.booking.findMany({
    where: {
      resourceId: { in: resources.map((r) => r.id) },
      date: { gte: startOfDay, lte: endOfDay },
      status: { not: "CANCELLED" },
    },
    select: { id: true, date: true, resourceId: true },
  });

  // Generate candidate slots on a 30-min grid within opening hours
  const possibleSlots: string[] = generateTimeGrid(date, 30);

  let requestedDuration = Number.isFinite(durationMinutes)
    ? (durationMinutes as number)
    : DEFAULT_BOOKING_MINUTES;
  // If not provided, use activity default
  if (!Number.isFinite(durationMinutes)) {
    const act = await prisma.activity.findUnique({ where: { id: activityId } });
    if (act?.durationMinutes) requestedDuration = act.durationMinutes;
  }

  // For each slot, if at least one resource has no overlapping booking, it is available
  const availableWithCounts = possibleSlots.map((slot) => {
    const slotStart = toUtcFromLocal(date, slot);
    const slotEnd = new Date(slotStart);
    slotEnd.setMinutes(slotEnd.getMinutes() + requestedDuration);

    let freeCount = 0;
    for (const res of resources) {
      const reservations = bookings.filter((b) => b.resourceId === res.id);
      const hasOverlap = reservations.some((b) => {
        const bStart = new Date(b.date);
        const bEnd = new Date(b.date);
        // If existing bookings start having durationMinutes stored, use it; fallback default
        const existingDuration = (b as any).durationMinutes || DEFAULT_BOOKING_MINUTES;
        bEnd.setMinutes(bEnd.getMinutes() + existingDuration);
        return slotStart < bEnd && slotEnd > bStart;
      });
      if (!hasOverlap) freeCount++;
    }
    return { time: slot, remaining: freeCount };
  }).filter(item => item.remaining > 0);

  return availableWithCounts;
}
