'use client';
import { useEffect, useRef, useState } from 'react';

type Loc = { name: string; address: string; tz: string; hours: [number, number][]; q: string; phone: string };
// hours: per weekday (0=Sun..6=Sat) [open, close] in 24h decimal; close may exceed 24 (past midnight)
const LOCATIONS: Loc[] = [
  { name: 'Spice Lane — Gulshan', address: 'Road 11, Gulshan 2, Dhaka 1212', tz: 'Asia/Dhaka', phone: '+880 1700-000001',
    hours: [[12, 23], [12, 22.5], [12, 22.5], [12, 22.5], [12, 23], [12, 24], [12, 24]], q: 'Gulshan 2, Dhaka' },
  { name: 'Spice Lane — Dhanmondi', address: 'Road 27, Dhanmondi, Dhaka 1209', tz: 'Asia/Dhaka', phone: '+880 1700-000002',
    hours: [[11.5, 22], [11.5, 22], [11.5, 22], [11.5, 22], [11.5, 22], [11.5, 23], [11.5, 23]], q: 'Dhanmondi 27, Dhaka' },
];
const fmt = (h: number) => { const hh = Math.floor(h) % 24; const mm = Math.round((h % 1) * 60); return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`; };

function status(l: Loc, now: Date) {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: l.tz, weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false }).formatToParts(now);
  const wd = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(parts.find((p) => p.type === 'weekday')!.value);
  const h = (Number(parts.find((p) => p.type === 'hour')!.value) % 24) + Number(parts.find((p) => p.type === 'minute')!.value) / 60;
  const [o, c] = l.hours[wd];
  const open = h >= o && h < c;
  return { open, label: open ? `Open · closes ${fmt(c)}` : h < o ? `Closed · opens ${fmt(o)}` : `Closed · opens ${fmt(l.hours[(wd + 1) % 7][0])} tomorrow`, today: wd };
}

/** 8.8 Locations & hours: lazy map embed, live open/closed status, directions links. */
export default function Locations() {
  const [now, setNow] = useState<Date | null>(null);
  const [active, setActive] = useState(0);
  const [showMap, setShowMap] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setNow(new Date()); const t = setInterval(() => setNow(new Date()), 60_000); return () => clearInterval(t); }, []);
  useEffect(() => {
    const el = mapRef.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setShowMap(true); io.disconnect(); } }, { rootMargin: '200px' });
    io.observe(el); return () => io.disconnect();
  }, []);

  const loc = LOCATIONS[active];
  return (
    <section id="locations" aria-labelledby="loc-h" className="relative py-24">
      <div className="mx-auto max-w-7xl px-6">
        <p className="font-mono text-xs uppercase tracking-widest text-muted">Find the belt</p>
        <h2 id="loc-h" className="mt-2 text-4xl font-semibold tracking-tight text-white md:text-6xl">Locations &amp; hours</h2>
        <div className="mt-12 grid gap-6 md:grid-cols-[1fr_1.4fr]">
          <div className="grid gap-4">
            {LOCATIONS.map((l, i) => {
              const s = now ? status(l, now) : null;
              return (
                <button key={l.name} type="button" onClick={() => setActive(i)} aria-pressed={active === i}
                  className={`rounded-card border bg-card p-6 text-left transition ${active === i ? 'border-white/30' : 'border-line hover:border-white/20'}`}>
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-xl font-semibold text-white">{l.name}</h3>
                    {s && <span className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs ${s.open ? 'bg-emerald-500/15 text-emerald-300' : 'bg-white/5 text-muted'}`}>
                      <span className={`h-2 w-2 rounded-full ${s.open ? 'animate-pulse bg-emerald-400' : 'bg-white/30'}`} />{s.label}</span>}
                  </div>
                  <p className="mt-2 text-muted">{l.address}</p>
                  <p className="mt-1 font-mono text-sm text-muted">{l.phone}</p>
                  <ul className="mt-4 grid grid-cols-7 gap-1 font-mono text-[11px] text-muted">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, k) => (
                      <li key={k} className={`rounded-lg py-1 text-center ${s?.today === k ? 'bg-white/10 text-white' : ''}`} title={`${fmt(l.hours[k][0])}–${fmt(l.hours[k][1])}`}>{d}</li>))}
                  </ul>
                  <a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(l.q)}`} target="_blank" rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()} className="mt-5 inline-flex rounded-full bg-white px-4 py-2 text-sm font-medium text-black">Get directions →</a>
                </button>);
            })}
          </div>
          <div ref={mapRef} className="relative min-h-[22rem] overflow-hidden rounded-card border border-line bg-card">
            {showMap ? (
              <iframe key={loc.q} title={`Map of ${loc.name}`} loading="lazy" referrerPolicy="no-referrer-when-downgrade"
                src={`https://www.google.com/maps?q=${encodeURIComponent(loc.q)}&output=embed`}
                className="absolute inset-0 h-full w-full grayscale invert-[.9] contrast-[.9]" />
            ) : <div className="absolute inset-0 grid place-items-center text-muted">Loading map…</div>}
          </div>
        </div>
      </div>
    </section>
  );
}
