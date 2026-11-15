import Header from '@/components/Header';
import Hero from '@/components/hero/Hero';
import ProductModal from '@/components/modal/ProductModal';
import CartDrawer from '@/components/cart/CartDrawer';
import DragGhost from '@/components/hero/DragGhost';
import Spotlight from '@/components/sections/Spotlight';
import MenuGrid from '@/components/sections/MenuGrid';
import HowItWorks from "@/components/sections/HowItWorks";
import Specials from "@/components/sections/Specials";
import PlatterBuilder from "@/components/sections/PlatterBuilder";
import Reviews from "@/components/sections/Reviews";
import Reservations from "@/components/sections/Reservations";
import Locations from "@/components/sections/Locations";
import FAQ from "@/components/sections/FAQ";
import Footer from "@/components/sections/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main id="top">
        <Hero />
        <Spotlight />
        <MenuGrid />
        <HowItWorks />
        <Specials />
        <PlatterBuilder />
        <Reviews />
        <Reservations />
        <Locations />
        <FAQ />
      </main>
      <Footer />
      <ProductModal />
      <CartDrawer />
      <DragGhost />
    </>
  );
}
