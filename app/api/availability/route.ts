import { NextResponse } from "next/server";
import { getAvailableSlots } from "@/controllers/availability";
import { AvailabilityInput } from "@/controllers/availability";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const activityId = searchParams.get('activityId');
  const date = searchParams.get('date');
  const duration = searchParams.get('duration') || '60';

  if (!activityId || !date) {
    return NextResponse.json({ error: 'Missing activityId or date' }, { status: 400 });
  }

  const input: AvailabilityInput = {
    activityId,
    date,
    durationMinutes: parseInt(duration),
  };

  try {
    const slots = await getAvailableSlots(input);
    return NextResponse.json({ slots });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch availability' }, { status: 500 });
  }
}
