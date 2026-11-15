import { NextResponse } from 'next/server';
import { reservationSchema } from '@/lib/reservation';

/** POST /api/reserve — validation stub. TODO(agent, optional): persist to a DB / send email. */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = reservationSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, errors: parsed.error.flatten().fieldErrors }, { status: 400 });
  const id = 'R' + Math.random().toString(36).slice(2, 8).toUpperCase();
  return NextResponse.json({ ok: true, id, reservation: parsed.data });
}
