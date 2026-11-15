import Header from '@/components/Header';
import Hero from '@/components/hero/Hero';
import ProductModal from '@/components/modal/ProductModal';

export default function Home() {
  // TODO(agent): drag-to-cart (Step 6), cart drawer (Step 7), sections (Step 8)
  return (
    <>
      <Header />
      <main id="top">
        <Hero />
      </main>
      <ProductModal />
    </>
  );
}
