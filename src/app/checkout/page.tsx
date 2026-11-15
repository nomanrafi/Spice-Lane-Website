import type { Metadata } from 'next';
import CheckoutForm from '@/components/cart/CheckoutForm';

export const metadata: Metadata = { title: 'Checkout — Spice Lane' };

export default function CheckoutPage() {
  return (
    <main className="mx-auto min-h-screen max-w-[1100px] px-5 pb-24 pt-28 md:px-10">
      <a href="/" className="text-sm text-muted hover:text-white">← Back to the belt</a>
      <h1 className="mt-4 text-4xl font-medium tracking-tight md:text-5xl">Checkout</h1>
      <CheckoutForm />
    </main>
  );
}
