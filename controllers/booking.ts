import { prisma } from "@/lib/db";

export async function createBooking(input: {
  email: string;
  name?: string;
  date: Date;
  size: number;
  resourceId: string;
}) {
  // TODO: add validation (zod) & conflict checking
  return prisma.booking.create({ data: input });
}
