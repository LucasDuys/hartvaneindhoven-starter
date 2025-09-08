import { NextResponse } from "next/server";

export async function GET() {
  // TODO: read params and check DB for resource availability
  return NextResponse.json({ slots: ["15:00","16:00","17:00","18:00"] });
}
