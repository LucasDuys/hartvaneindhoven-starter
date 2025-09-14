import { prisma } from "@/lib/db";
import { AvailabilityInput } from "@/models/types";

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

  // Generate candidate slots (hourly, 12:00-22:00)
  const possibleSlots: string[] = [];
  for (let hour = 12; hour <= 22; hour++) {
    possibleSlots.push(`${hour.toString().padStart(2, "0")}:00`);
  }

  const requestedDuration = Number.isFinite(durationMinutes)
    ? durationMinutes
    : DEFAULT_BOOKING_MINUTES;

  // For each slot, if at least one resource has no overlapping booking, it is available
  const availableSlots = possibleSlots.filter((slot) => {
    const [hh, mm] = slot.split(":").map(Number);
    const slotStart = new Date(Date.UTC(y, (m || 1) - 1, d || 1, hh || 0, mm || 0));
    const slotEnd = new Date(slotStart);
    slotEnd.setMinutes(slotEnd.getMinutes() + requestedDuration);

    // Check resources one by one
    return resources.some((res) => {
      const reservations = bookings.filter((b) => b.resourceId === res.id);
      const overlaps = reservations.some((b) => {
        const bStart = new Date(b.date);
        const bEnd = new Date(b.date);
        bEnd.setMinutes(bEnd.getMinutes() + DEFAULT_BOOKING_MINUTES);
        return slotStart < bEnd && slotEnd > bStart;
      });
      return !overlaps;
    });
  });

  return availableSlots;
}
