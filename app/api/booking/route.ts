import { NextResponse } from "next/server";
import { createBooking } from "@/controllers/booking";
import { BookingInput } from "@/models/types";
import { z } from "zod";

const bookingSchema = z
  .object({
    email: z.string().email(),
    name: z.string().optional(),
    date: z.string().datetime(),
    size: z.number().min(1).max(20),
    resourceId: z.string().optional(),
    activityId: z.string().optional(),
    durationMinutes: z.number().min(15).max(240).optional(),
    addOnIds: z.array(z.string()).optional(),
  })
  .refine((d) => !!d.resourceId || !!d.activityId, {
    message: "Provide either resourceId or activityId",
    path: ["resourceId"],
  });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = bookingSchema.parse(body);
    const input: BookingInput = {
      ...validated,
      date: new Date(validated.date),
    };
    const booking = await createBooking(input);
    return NextResponse.json({ success: true, booking });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: (error as Error).message || "Failed to create booking" },
      { status: 500 }
    );
  }
}
