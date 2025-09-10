import { prisma } from "@/lib/db";
import { BookingInput } from "@/models/types";

export async function createBooking(input: BookingInput) {
  const { email, name, date, size, resourceId, addOnIds = [] } = input;

  // Conflict checking - check if the slot is available
  const conflictingBooking = await prisma.booking.findFirst({
    where: {
      resourceId,
      date,
      status: { not: "CANCELLED" },
    },
  });

  if (conflictingBooking) {
    throw new Error("Resource is already booked for this time slot");
  }

  // Capacity check
  const resource = await prisma.resource.findUnique({ where: { id: resourceId } });
  if (!resource || size > resource.capacity) {
    throw new Error("Party size exceeds resource capacity");
  }

  // Create booking
  const booking = await prisma.booking.create({
    data: {
      email,
      name,
      date,
      size,
      resourceId,
      status: "PENDING",
    },
    include: {
      resource: {
        include: {
          activity: true
        }
      }
    }
  });

  // Add add-ons if any
  if (addOnIds.length > 0) {
    await prisma.bookingAddOn.createMany({
      data: addOnIds.map(addOnId => ({
        bookingId: booking.id,
        addOnId,
      })),
    });
  }

  // Fetch booking with addons
  const bookingWithAddons = await prisma.booking.findUnique({
    where: { id: booking.id },
    include: {
      addOns: {
        include: {
          addOn: true
        }
      },
      resource: {
        include: {
          activity: true
        }
      }
    }
  });

  return bookingWithAddons;
}
