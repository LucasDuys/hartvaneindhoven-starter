import { NextResponse } from "next/server";
import { createBooking } from "@/controllers/booking";
import { BookingInput } from "@/models/types";
import { z } from "zod";
import { sendBookingConfirmationEmail } from "@/controllers/email";

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
    const result = await createBooking(input);
    // Fire-and-forget email (do not block booking if it fails)
    try {
      const b = result.booking;
      const activityName = b?.resource.activity.name || 'Activiteit';
      const addOns = (b?.addOns || []).map((row: any) => ({
        name: row.addOn.name,
        perPerson: row.addOn.perPerson,
        priceCents: row.addOn.priceCents,
      }));
      await sendBookingConfirmationEmail({
        to: b?.email || input.email,
        activityName,
        bookingId: b?.id || 'unknown',
        date: new Date(b?.date || input.date),
        durationMinutes: (b as any)?.durationMinutes || input.durationMinutes || 60,
        size: b?.size || input.size,
        addOns,
        totalCents: result?.pricing?.totalCents,
        replyToName: 'Hart van Eindhoven',
        replyToEmail: process.env.CONTACT_EMAIL || undefined,
        name: b?.name || null,
        locale: 'nl',
      });
    } catch (e) {
      console.warn('[email] Failed to send confirmation:', (e as Error).message);
    }
    return NextResponse.json({ success: true, ...result });
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
