'use client';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const FAQS = [
  { q: 'How does plate pricing work?', a: 'Every plate rim color is a price tier — blue $3.20, green $4.20, orange $5.40, purple $6.80, red $8.50. Count your plates and you know your bill.' },
  { q: 'Do you deliver?', a: 'Yes. Choose delivery or pickup at checkout. Delivery covers roughly 6 km around each location.' },
  { q: 'Can I build a sharing platter?', a: 'Use the platter builder: drop items onto the board, watch the live total, then add the whole platter to your cart as one bundle.' },
  { q: 'Do you cater for allergies?', a: 'Each dish lists its allergens and ingredients in the product view. Tell us in the order notes and the kitchen will take extra care.' },
  { q: 'Can I reserve for a large group?', a: 'Online bookings go up to 12 guests. For bigger parties or private hire, call the location directly.' },
  { q: 'Is my cart saved?', a: 'Your cart is stored on this device and synced across open tabs, so you can come back to it later.' },
];

/** 8.9 FAQ: animated accordion + schema.org FAQPage JSON-LD. */
export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  const jsonLd = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: FAQS.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) };
  return (
    <section id="faq" aria-labelledby="faq-h" className="relative py-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto grid max-w-7xl gap-12 px-6 md:grid-cols-[1fr_1.6fr]">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-muted">Good to know</p>
          <h2 id="faq-h" className="mt-2 text-4xl font-semibold tracking-tight text-white md:text-6xl">FAQ</h2>
        </div>
        <ul className="divide-y divide-white/10 border-y border-line">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <li key={f.q}>
                <h3>
                  <button type="button" id={`faq-b-${i}`} aria-expanded={isOpen} aria-controls={`faq-p-${i}`} onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-6 py-6 text-left text-lg text-white">
                    {f.q}
                    <motion.span animate={{ rotate: isOpen ? 45 : 0 }} transition={{ type: 'spring', stiffness: 300, damping: 22 }} className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-line text-xl leading-none">+</motion.span>
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div id={`faq-p-${i}`} role="region" aria-labelledby={`faq-b-${i}`} key="c"
                      initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }} className="overflow-hidden">
                      <p className="pb-6 pr-12 text-muted">{f.a}</p>
                    </motion.div>)}
                </AnimatePresence>
              </li>);
          })}
        </ul>
      </div>
    </section>
  );
}
