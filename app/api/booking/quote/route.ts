import { NextResponse } from "next/server";
import { z } from "zod";
import { computeQuote } from "@/controllers/pricing";

const quoteSchema = z.object({
  activityId: z.string(),
  date: z.string().datetime(),
  size: z.number().min(1).max(50),
  durationMinutes: z.number().min(15).max(240).optional(),
  addOnIds: z.array(z.string()).optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = quoteSchema.parse(body);
    const quote = await computeQuote({
      activityId: validated.activityId,
      date: new Date(validated.date),
      size: validated.size,
      durationMinutes: validated.durationMinutes ?? 60,
      addOnIds: validated.addOnIds,
    });
    return NextResponse.json({ success: true, pricing: quote });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: (error as Error).message || 'Failed to compute quote' }, { status: 500 });
  }
}

