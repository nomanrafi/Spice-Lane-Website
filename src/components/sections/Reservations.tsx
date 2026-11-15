'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import { reservationSchema, TIME_SLOTS, type Reservation } from '@/lib/reservation';
import { useStore } from '@/store/useStore';
import { MENU } from '@/data/menu';

function Confetti({ color }: { color: string }) {
  const bits = Array.from({ length: 36 }, (_, i) => i);
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {bits.map((i) => (
        <motion.span key={i} className="absolute left-1/2 top-1/3 h-2 w-1.5 rounded-sm"
          style={{ background: i % 3 ? color : '#fff' }}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
          animate={{ x: (Math.random() - 0.5) * 520, y: Math.random() * 360 - 60, opacity: 0, rotate: Math.random() * 720 }}
          transition={{ duration: 1.4 + Math.random() * 0.6, ease: [0.16, 1, 0.3, 1] }} />))}
    </div>
  );
}

const field = 'w-full rounded-2xl border border-line bg-black/40 px-4 py-3 text-white placeholder:text-white/30 outline-none transition focus:border-white/40';

/** 8.7 Reservations: zod + react-hook-form, slot picker, success state with accent confetti, POST /api/reserve. */
export default function Reservations() {
  const selectedId = useStore((s) => s.selectedId ?? s.frontId);
  const accent = MENU.find((m) => m.id === selectedId)?.accentColor ?? '#FF8A4C';
  const [done, setDone] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const today = new Date().toISOString().slice(0, 10);
  const { register, handleSubmit, setValue, watch, reset, formState: { errors, isSubmitting } } = useForm<Reservation>({
    resolver: zodResolver(reservationSchema), defaultValues: { date: today, time: '19:00', party: 2 } as any,
  });
  const time = watch('time');

  const onSubmit = async (data: Reservation) => {
    setErr(null);
    const r = await fetch('/api/reserve', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    const j = await r.json().catch(() => ({}));
    if (r.ok && j.ok) setDone(j.id); else setErr('Could not book right now — please try again.');
  };

  return (
    <section id="reserve" aria-labelledby="res-h" className="relative py-24">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 md:grid-cols-2">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-muted">Sit at the belt</p>
          <h2 id="res-h" className="mt-2 text-4xl font-semibold tracking-tight text-white md:text-6xl">Book a seat</h2>
          <p className="mt-4 max-w-md text-muted">Counter seats face the belt. Booths fit up to six. Tables are held for 15 minutes.</p>
        </div>
        <div className="relative overflow-hidden rounded-card border border-line bg-card p-6 md:p-8">
          <AnimatePresence mode="wait">
            {done ? (
              <motion.div key="ok" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="relative py-12 text-center" role="status">
                <Confetti color={accent} />
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-full text-2xl text-black" style={{ background: accent }}>✓</div>
                <h3 className="mt-6 text-2xl font-semibold text-white">You’re booked</h3>
                <p className="mt-2 text-muted">Reference <span className="font-mono text-white">{done}</span> — a confirmation is on its way.</p>
                <button type="button" onClick={() => { setDone(null); reset(); }} className="mt-8 rounded-full border border-line px-5 py-2.5 text-sm text-white hover:bg-white/5">Make another booking</button>
              </motion.div>
            ) : (
              <motion.form key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <label className="grid gap-1.5 text-sm text-muted">Date<input type="date" min={today} {...register('date')} className={field} aria-invalid={!!errors.date} /></label>
                  <label className="grid gap-1.5 text-sm text-muted">Party size<input type="number" min={1} max={12} {...register('party')} className={field} aria-invalid={!!errors.party} /></label>
                </div>
                {(errors.date || errors.party) && <p className="text-sm text-red-400">{errors.date?.message ?? errors.party?.message}</p>}
                <fieldset>
                  <legend className="mb-2 text-sm text-muted">Time</legend>
                  <div className="flex flex-wrap gap-2">
                    {TIME_SLOTS.map((t) => (
                      <button key={t} type="button" onClick={() => setValue('time', t, { shouldValidate: true })} aria-pressed={time === t}
                        className="rounded-full border px-3.5 py-1.5 font-mono text-sm transition"
                        style={time === t ? { background: '#fff', color: '#000', borderColor: '#fff' } : { borderColor: '#ffffff14', color: '#fff' }}>{t}</button>))}
                  </div>
                </fieldset>
                <input placeholder="Full name" autoComplete="name" {...register('name')} className={field} aria-invalid={!!errors.name} />
                {errors.name && <p className="text-sm text-red-400">{errors.name.message}</p>}
                <div className="grid gap-4 sm:grid-cols-2">
                  <input placeholder="Phone" type="tel" autoComplete="tel" {...register('phone')} className={field} aria-invalid={!!errors.phone} />
                  <input placeholder="Email" type="email" autoComplete="email" {...register('email')} className={field} aria-invalid={!!errors.email} />
                </div>
                {(errors.phone || errors.email) && <p className="text-sm text-red-400">{errors.phone?.message ?? errors.email?.message}</p>}
                {err && <p className="text-sm text-red-400" role="alert">{err}</p>}
                <button type="submit" disabled={isSubmitting} className="mt-2 rounded-full bg-white px-6 py-3 font-medium text-black transition hover:scale-[1.02] disabled:opacity-60">
                  {isSubmitting ? 'Booking…' : 'Reserve table'}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
