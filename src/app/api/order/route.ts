import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getItem } from '@/data/menu';

/** POST /api/order — validates the order and re-prices it on the server from src/data/menu.ts
 *  (client prices are never trusted). Payment is a MOCK authorization.
 *  TODO(agent, optional): plug a real payment provider (e.g. Stripe PaymentIntent) + persist orders to a DB. */
const line = z.object({
  id: z.string().min(1),
  qty: z.number().int().min(1).max(50),
  bundle: z.object({ name: z.string().min(1).max(60), items: z.array(z.string()).min(2).max(8), price: z.number().positive() }).optional(),
});
const body = z.object({
  customer: z.object({
    name: z.string().min(2), email: z.string().email(), phone: z.string().min(7),
    mode: z.enum(['pickup', 'delivery']), address: z.string().optional(), time: z.string().min(1), notes: z.string().max(300).optional(),
  }),
  lines: z.array(line).min(1).max(40),
});

const MAX_BUNDLE_OFF = 0.25; // combos/platters discount at most 25%
const r2 = (n: number) => Math.round(n * 100) / 100;

export async function POST(req: Request) {
  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'Invalid order', errors: parsed.error.flatten().fieldErrors }, { status: 400 });
  const { customer, lines } = parsed.data;
  if (customer.mode === 'delivery' && (customer.address ?? '').trim().length <= 5) return NextResponse.json({ ok: false, error: 'Delivery address is required' }, { status: 400 });

  let subtotal = 0;
  for (const l of lines) {
    if (l.bundle) {
      const items = l.bundle.items.map(getItem);
      if (items.some((i) => !i)) return NextResponse.json({ ok: false, error: `Unknown dish in ${l.bundle.name}` }, { status: 400 });
      const full = items.reduce((a, i) => a + i!.price, 0);
      const unit = Math.min(full, Math.max(l.bundle.price, full * (1 - MAX_BUNDLE_OFF))); // clamp client price
      subtotal += unit * l.qty;
    } else {
      const it = getItem(l.id);
      if (!it) return NextResponse.json({ ok: false, error: `Unknown dish: ${l.id}` }, { status: 400 });
      subtotal += it.price * l.qty;
    }
  }
  const total = r2(subtotal * 1.1 + (customer.mode === 'delivery' ? 4 : 0));
  const id = 'SL' + Date.now().toString(36).toUpperCase().slice(-6);
  await new Promise((r) => setTimeout(r, 300)); // simulate payment provider latency
  return NextResponse.json({ ok: true, id, subtotal: r2(subtotal), total, payment: { status: 'authorized', provider: 'mock' }, at: new Date().toISOString() });
}
