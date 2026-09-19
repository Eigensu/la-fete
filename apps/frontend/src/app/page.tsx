import Hero from '@/components/Hero';
import About from '@/components/About';
import Products from '@/components/Products';

export default function Home() {
  return (
    <main className="min-h-screen">
<Hero />
      <About />
      <Products />
</main>
  );
}
