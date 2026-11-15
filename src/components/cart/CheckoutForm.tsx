'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { formatPrice } from '@/data/menu';
import { useStore, cartTotal, lineInfo } from '@/store/useStore';

const schema = z.object({
  name: z.string().min(2, 'Please enter your name'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().min(7, 'Enter a valid phone number'),
  mode: z.enum(['pickup', 'delivery']),
  address: z.string().optional(),
  time: z.string().min(1, 'Choose a time'),
  notes: z.string().max(300).optional(),
}).refine((d) => d.mode === 'pickup' || (d.address ?? '').trim().length > 5, { path: ['address'], message: 'Delivery address is required' });
type Form = z.infer<typeof schema>;

const field = 'w-full rounded-2xl border border-line bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-white/40';

/** Checkout: validated form (react-hook-form + zod) + order summary. Submits locally → /order/[id]. TODO(agent): real payment/API. */
export default function CheckoutForm() {
  const router = useRouter();
  const cart = useStore((s) => s.cart);
  const clear = useStore((s) => s.clear);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<Form>({ resolver: zodResolver(schema), defaultValues: { mode: 'pickup', time: 'asap' } });
  const mode = watch('mode');
  const subtotal = cartTotal(cart);
  const total = subtotal * 1.1 + (mode === 'delivery' ? 4 : 0);

  const onSubmit = async (data: Form) => {
    const id = 'SL' + Date.now().toString(36).toUpperCase().slice(-6);
    const order = { id, ...data, lines: cart, total, at: new Date().toISOString() };
    sessionStorage.setItem('spice-lane-order-' + id, JSON.stringify(order));
    await new Promise((r) => setTimeout(r, 600));
    clear();
    router.push('/order/' + id);
  };

  if (!mounted) return null;
  if (cart.length === 0) return (
    <div className="mt-10 rounded-card border border-line bg-card p-10 text-center">
      <p className="text-muted">Your tray is empty.</p>
      <a href="/" className="pill-primary mt-6">Pick a plate</a>
    </div>
  );

  const Err = ({ k }: { k: keyof Form }) => errors[k] ? <p role="alert" className="mt-1 text-xs text-[#ff6b7a]">{String(errors[k]?.message)}</p> : null;

  return (
    <div className="mt-10 grid gap-8 md:grid-cols-[1.4fr_1fr]">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5 rounded-card border border-line bg-card p-6 md:p-8">
        <fieldset className="flex gap-2" aria-label="Order type">
          {(['pickup', 'delivery'] as const).map((m) => (
            <label key={m} className={`pill-glass cursor-pointer capitalize ${mode === m ? '!bg-white !text-black' : ''}`}>
              <input type="radio" value={m} {...register('mode')} className="sr-only" />{m}
            </label>
          ))}
        </fieldset>
        <div className="grid gap-4 md:grid-cols-2">
          <div><label className="mb-1 block text-xs text-muted" htmlFor="name">Name</label><input id="name" autoComplete="name" className={field} {...register('name')} /><Err k="name" /></div>
          <div><label className="mb-1 block text-xs text-muted" htmlFor="phone">Phone</label><input id="phone" type="tel" autoComplete="tel" className={field} {...register('phone')} /><Err k="phone" /></div>
        </div>
        <div><label className="mb-1 block text-xs text-muted" htmlFor="email">Email</label><input id="email" type="email" autoComplete="email" className={field} {...register('email')} /><Err k="email" /></div>
        {mode === 'delivery' && <div><label className="mb-1 block text-xs text-muted" htmlFor="address">Delivery address</label><input id="address" autoComplete="street-address" className={field} {...register('address')} /><Err k="address" /></div>}
        <div><label className="mb-1 block text-xs text-muted" htmlFor="time">Time</label>
          <select id="time" className={field} {...register('time')}>
            <option value="asap">As soon as possible (~25 min)</option>
            {['18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'].map((t) => <option key={t} value={t}>{t}</option>)}
          </select><Err k="time" />
        </div>
        <div><label className="mb-1 block text-xs text-muted" htmlFor="notes">Notes (optional)</label><textarea id="notes" rows={3} className={field} {...register('notes')} /></div>
        <button type="submit" disabled={isSubmitting} className="pill-primary w-full justify-center !py-3.5 disabled:opacity-60">{isSubmitting ? 'Placing order…' : `Place order · ${formatPrice(total)}`}</button>
      </form>
      <aside className="h-fit rounded-card border border-line bg-card p-6 md:p-8">
        <h2 className="text-lg font-medium">Summary</h2>
        <ul className="mt-4 space-y-3 text-sm">
          {cart.map((l) => { const it = lineInfo(l); return it ? <li key={l.id} className="flex justify-between gap-4"><span className="text-white/80">{l.qty} × {it.name}{it.detail && <span className="block text-xs text-muted">{it.detail}</span>}</span><span className="font-mono">{formatPrice(it.price * l.qty)}</span></li> : null; })}
        </ul>
        <div className="mt-5 space-y-2 border-t border-line pt-4 text-sm text-muted">
          <div className="flex justify-between"><span>Subtotal</span><span className="font-mono">{formatPrice(subtotal)}</span></div>
          <div className="flex justify-between"><span>Service (10%)</span><span className="font-mono">{formatPrice(subtotal * 0.1)}</span></div>
          {mode === 'delivery' && <div className="flex justify-between"><span>Delivery</span><span className="font-mono">{formatPrice(4)}</span></div>}
          <div className="flex justify-between pt-2 text-base text-white"><span>Total</span><span className="font-mono">{formatPrice(total)}</span></div>
        </div>
      </aside>
    </div>
  );
}
