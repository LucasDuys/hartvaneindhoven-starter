import { NextResponse } from "next/server";
// import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const body = await req.json();
  // TODO: validate body with zod, create booking, start payment session
  // const booking = await prisma.booking.create({ data: { ... } });
  return NextResponse.json({ ok: true, bookingId: "demo_123" });
}
