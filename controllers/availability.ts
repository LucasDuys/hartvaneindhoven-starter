import { prisma } from "@/lib/db";
import { AvailabilityInput } from "@/models/types";

export async function getAvailableSlots(input: AvailabilityInput) {
  const { activityId, date, durationMinutes } = input;

  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  // Find all resources for the activity
  const resources = await prisma.resource.findMany({
    where: { activityId },
  });

  if (resources.length === 0) {
    return [];
  }

  // Find all bookings for the day
  const bookings = await prisma.booking.findMany({
    where: {
      resourceId: { in: resources.map(r => r.id) },
      date: {
        gte: startOfDay,
        lte: endOfDay,
      },
      status: { not: "CANCELLED" },
    },
  });

  // Generate possible slots (e.g., every hour from 12:00 to 22:00)
  const possibleSlots: string[] = [];
  for (let hour = 12; hour <= 22; hour++) {
    possibleSlots.push(`${hour.toString().padStart(2, '0')}:00`);
  }

  // Filter slots based on availability
  const availableSlots = possibleSlots.filter(slot => {
    const slotTime = new Date(date + 'T' + slot + ':00');
    const endTime = new Date(slotTime);
    endTime.setMinutes(endTime.getMinutes() + durationMinutes);

    // Check if any booking overlaps with this slot
    const overlappingBookings = bookings.filter(booking => {
      const bookingEnd = new Date(booking.date);
      bookingEnd.setMinutes(bookingEnd.getMinutes() + (booking.size * 10 || 60)); // Assume 10 min per person or 60 min
      return slotTime < bookingEnd && endTime > booking.date;
    });

    return overlappingBookings.length === 0;
  });

  return availableSlots;
}