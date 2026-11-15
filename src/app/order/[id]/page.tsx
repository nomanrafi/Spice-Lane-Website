import OrderConfirmation from '@/components/cart/OrderConfirmation';

export const metadata = { title: 'Order confirmed · Spice Lane' };

export default function OrderPage({ params }: { params: { id: string } }) {
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 pb-24 pt-32">
      <OrderConfirmation id={params.id} />
    </main>
  );
}
