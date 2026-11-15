import OrderConfirmation from '@/components/cart/OrderConfirmation';

export const metadata = { title: 'Order confirmed — Spice Lane' };

export default function OrderPage({ params }: { params: { id: string } }) {
  return <OrderConfirmation id={params.id} />;
}
