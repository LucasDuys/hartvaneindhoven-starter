import { prisma } from "@/lib/db";
import { BookingInput } from "@/models/types";
import { computeQuote } from "@/controllers/pricing";

const DEFAULT_BOOKING_MINUTES = 60;

function rangesOverlap(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
  return aStart < bEnd && aEnd > bStart;
}

async function findAvailableResource(activityId: string, start: Date, end: Date) {
  const resources = await prisma.resource.findMany({ where: { activityId } });
  if (resources.length === 0) return null;

  const bookings = await prisma.booking.findMany({
    where: {
      resourceId: { in: resources.map((r) => r.id) },
      status: { not: "CANCELLED" },
      date: { lte: end },
    },
    select: { id: true, date: true, resourceId: true },
  });

  for (const res of resources) {
    const resBookings = bookings.filter((b) => b.resourceId === res.id);
    const conflict = resBookings.some((b) => {
      const bStart = new Date(b.date);
      const bEnd = new Date(b.date);
      bEnd.setMinutes(bEnd.getMinutes() + DEFAULT_BOOKING_MINUTES);
      return rangesOverlap(start, end, bStart, bEnd);
    });
    if (!conflict) return res;
  }
  return null;
}

export async function createBooking(input: BookingInput) {
  const {
    email,
    name,
    date,
    size,
    resourceId: providedResourceId,
    activityId,
    addOnIds = [],
    durationMinutes,
  } = input;

  // Determine duration: explicit > activity default > fallback
  let duration = Number.isFinite(durationMinutes) ? (durationMinutes as number) : DEFAULT_BOOKING_MINUTES;
  const start = new Date(date);
  const end = new Date(start);
  end.setMinutes(end.getMinutes() + duration);

  // Resolve resource: use provided resourceId or auto-allocate by activityId
  let resourceId = providedResourceId || null;
  let resource = null as null | { id: string; capacity: number };

  if (!resourceId) {
    if (!activityId) {
      throw new Error("Provide either resourceId or activityId to allocate a resource");
    }
    const available = await findAvailableResource(activityId, start, end);
    if (!available) {
      throw new Error("No available resources for the selected time");
    }
    resourceId = available.id;
    resource = { id: available.id, capacity: available.capacity } as any;
  }

  // Load resource and capacity
  if (!resource) {
    const res = await prisma.resource.findUnique({ where: { id: resourceId! }, include: { activity: true } });
    if (!res) throw new Error("Resource not found");
    resource = { id: res.id, capacity: res.capacity } as any;
    if (!activityId) {
      // set activityId from resource
      (input as any).activityId = res.activityId;
    }
  }

  // Capacity check
  if (size > (resource!.capacity || 0)) {
    throw new Error("Party size exceeds resource capacity");
  }

  // Time-range conflict check on the chosen resource
  const existing = await prisma.booking.findMany({
    where: { resourceId: resource!.id, status: { not: "CANCELLED" } },
  });
  const hasConflict = existing.some((b) => {
    const bStart = new Date(b.date);
    const bEnd = new Date(b.date);
    bEnd.setMinutes(bEnd.getMinutes() + ((b as any).durationMinutes || DEFAULT_BOOKING_MINUTES));
    return rangesOverlap(start, end, bStart, bEnd);
  });
  if (hasConflict) {
    throw new Error("Resource is already booked for this time range");
  }

  // Create booking
  const booking = await prisma.booking.create({
    data: {
      email,
      name,
      date: start,
      size,
      resourceId: resource!.id,
      status: "PENDING",
    },
    include: {
      resource: { include: { activity: true } },
      addOns: { include: { addOn: true } },
    },
  });

  // Add add-ons if any
  if (addOnIds.length > 0) {
    await prisma.bookingAddOn.createMany({
      data: addOnIds.map((addOnId) => ({ bookingId: booking.id, addOnId })),
    });
  }

  // Fetch booking with addons
  const bookingWithAddons = await prisma.booking.findUnique({
    where: { id: booking.id },
    include: {
      addOns: { include: { addOn: true } },
      resource: { include: { activity: true } },
    },
  });

  // Pricing breakdown
  const quote = await computeQuote({
    activityId: (input.activityId as string) || bookingWithAddons!.resource.activityId,
    date: start,
    size,
    durationMinutes: duration,
    addOnIds,
  });

  return { booking: bookingWithAddons, pricing: quote };
}
