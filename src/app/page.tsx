import Header from '@/components/Header';
import Hero from '@/components/hero/Hero';
import ProductModal from '@/components/modal/ProductModal';
import CartDrawer from '@/components/cart/CartDrawer';
import DragGhost from '@/components/hero/DragGhost';
import Spotlight from '@/components/sections/Spotlight';
import MenuGrid from '@/components/sections/MenuGrid';

export default function Home() {
  // TODO(agent): remaining sections 8.2–8.10 (Step 8)
  return (
    <>
      <Header />
      <main id="top">
        <Hero />
        <Spotlight />
        <MenuGrid />
      </main>
      <ProductModal />
      <CartDrawer />
      <DragGhost />
    </>
  );
}
