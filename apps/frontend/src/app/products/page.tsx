import Link from 'next/link';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { COLLECTION_META, getProductsByCollection, Product } from '@/lib/products-data';

const CARD_BG = '#f8aeb2';

function ProductCard({ product, collectionSlug }: { product: Product; collectionSlug: string }) {
  return (
    <div className="flex flex-col group">
      <Link href={`/products/${collectionSlug}/${product.slug}`} className="block">
        <div
          className="relative aspect-[5/6] flex flex-col justify-end p-5 overflow-hidden"
          style={{ background: CARD_BG }}
        >
          {/* All tags stacked top-right */}
          <div className="absolute top-3 right-3 flex flex-col items-end gap-1">
            <span className="text-[8px] font-poppins uppercase tracking-widest text-[#86162f]/60 bg-white/40 px-1.5 py-0.5">
              {product.format}
            </span>
            {product.dietary.map(d => (
              <span key={d} className="text-[8px] font-poppins uppercase tracking-widest text-[#86162f]/60 bg-white/40 px-1.5 py-0.5">
                {d}
              </span>
            ))}
          </div>

          <div className="w-8 h-px bg-[#86162f]/25 mb-3" />
          <p className="font-poppins text-[9px] uppercase tracking-[0.25em] text-[#86162f]/55 mb-1">
            {product.flavour}
          </p>
          <h3 className="font-seasons text-[#86162f] text-xl md:text-2xl leading-snug">
            {product.name}
          </h3>
        </div>
      </Link>
    </div>
  );
}

const CAKE_COLLECTIONS    = ['whole-wheat', 'vegan-sugar-free', 'gf-sugar-free', 'liquor-infused'] as const;
const PETITE_COLLECTIONS  = ['tea-cakes', 'tub-cakes'] as const;
import { ChevronDown, Plus, Minus } from 'lucide-react';
import { useCart } from '@/context/CartContext';

interface Product {
    id: string;
    name: string;
    description: string;
    category?: { slug: string; name: string };
    isFeatured?: boolean;
    variants?: { id: string; price: number; discountPrice?: number }[];
    price?: number; // fallback
}

export default function ProductsPage() {
    const [filter, setFilter] = useState('all');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { cart, updateQuantity } = useCart();

    useEffect(() => {
        async function fetchProducts() {
            try {
                const res = await fetch('/api/products');
                const data = await res.json();
                setProducts(data.data || []);
            } catch (error) {
                console.error('Failed to fetch products', error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchProducts();
    }, []);

    const filteredProducts = products.filter(product => {
        if (filter === 'all') return true;
        return product.category?.slug === filter;
    });

    const getPrice = (product: Product) => {
        if (product.variants && product.variants.length > 0) {
            return product.variants[0].discountPrice || product.variants[0].price;
        }
        return product.price || 0;
    };

    const renderProductCard = (product: Product, index: number, sectionId: string) => {
        const price = getPrice(product);
        // Temporary mapping: CartContext still uses name. 
        // A full refactor to productId is recommended for backend cart sync.
        const cartItem = cart[product.name];

        return (
            <div key={`${sectionId}-${index}`} className="group flex flex-col h-full">
                <div className="relative aspect-square bg-[#f5f0ed] mb-6 overflow-visible flex items-center justify-center">
                    <div className="absolute -top-10 -left-10 w-32 h-32 -rotate-35 opacity-90 z-10 pointer-events-none">
                        <Image src="/bow.png" alt="" width={128} height={128} className="w-full h-full object-contain" />
                    </div>
                    {product.isFeatured && (
                        <div className="absolute top-4 right-4 bg-[#f8aeb2]/80 px-3 py-1 text-[10px] font-poppins font-semibold text-[#86162f] uppercase tracking-wider z-20">
                            Featured
                        </div>
                    )}
                    <svg className="w-32 h-32 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                    </svg>
                </div>
                <h3 className="font-seasons text-2xl md:text-3xl text-[#86162f] mb-3 min-h-[3.5rem] md:min-h-[4rem] flex items-center">
                    {product.name}
                </h3>
                <p className="font-poppins text-sm text-gray-600 leading-relaxed mb-6">{product.description}</p>
                <div className="mt-auto">
                    <div className="flex justify-between items-center mb-4">
                        {product.variants && product.variants.length > 0 && product.variants[0].discountPrice ? (
                            <div className="flex items-center gap-2">
                                <span className="font-poppins font-semibold text-[#86162f]">₹{product.variants[0].discountPrice}</span>
                                <span className="font-poppins text-xs text-gray-400 line-through">₹{product.variants[0].price}</span>
                            </div>
                        ) : (
                            <span className="font-poppins font-semibold text-[#86162f]">₹{price}</span>
                        )}
                    </div>
                    {cartItem && cartItem.quantity > 0 ? (
                        <div className="flex items-center justify-between bg-white border border-[#86162f]/20 rounded-sm overflow-hidden shadow-sm">
                            <button
                                onClick={() => updateQuantity(product.name, -1)}
                                className="p-3 text-[#86162f] hover:bg-[#86162f]/5 transition-colors"
                            >
                                <Minus size={16} />
                            </button>
                            <span className="font-poppins font-medium text-[#86162f]">{cartItem.quantity}</span>
                            <button
                                onClick={() => updateQuantity(product.name, 1)}
                                className="p-3 text-[#86162f] hover:bg-[#86162f]/5 transition-colors"
                            >
                                <Plus size={16} />
                            </button>
                        </div>
                    ) : (
                        <button
                            className="w-full py-3 bg-gradient-to-r from-[#86162f] via-[#a82043] to-[#f8aeb2] text-white font-poppins text-xs uppercase tracking-widest hover:opacity-90 transition-opacity rounded-sm shadow-md"
                            onClick={() => updateQuantity(product.name, 1, price, product.id, product.variants?.[0]?.id)}
                        >
                            Add to Cart
                        </button>
                    )}
                </div>
            </div>
        );
    };

export default function ProductsPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navigation />

      {/* Hero banner */}
      <div className="mt-10 md:mt-20 py-10 md:py-14 bg-gradient-to-r from-[#f8aeb2] via-[#a82043] to-[#86162f] text-center shadow-md">
        <p className="text-white/60 text-[10px] uppercase tracking-[0.45em] mb-3 font-poppins">Full Menu</p>
        <h1 className="font-seasons text-white text-5xl md:text-7xl">Our Products</h1>
      </div>

      <div className="max-w-screen-2xl mx-auto px-6 sm:px-10 md:px-16 lg:px-20 xl:px-24">

        {/* ── CAKES ─────────────────────────────────────────────── */}
        <div className="pt-20 pb-4 flex items-center gap-6">
          <span className="font-poppins text-[10px] uppercase tracking-[0.4em] text-[#86162f]/40">Cakes</span>
          <div className="flex-1 h-px bg-[#86162f]/10" />
        </div>

        {CAKE_COLLECTIONS.map((slug) => {
          const meta     = COLLECTION_META[slug];
          const products = getProductsByCollection(slug);
          return (
            <section key={slug} className="mb-20">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h2 className="font-seasons text-[#86162f] text-4xl md:text-5xl">{meta.title}</h2>
                  <p className="font-poppins text-xs text-gray-400 mt-2 max-w-sm leading-relaxed">{meta.description}</p>
                </div>
                {products.length > 0 && (
                  <Link
                    href={`/products/${slug}`}
                    className="shrink-0 ml-8 mt-3 font-poppins text-[10px] uppercase tracking-widest text-[#86162f] border-b border-[#86162f]/30 hover:border-[#86162f] transition-colors pb-0.5"
                  >
                    See Full Collection ({products.length}) →
                  </Link>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5">
                {products.slice(0, 3).map(p => <ProductCard key={p.id} product={p} collectionSlug={slug} />)}
              </div>
            </section>
          );
        })}

        {/* ── PETITE INDULGENCE ─────────────────────────────────── */}
        <div className="pb-4 flex items-center gap-6">
          <span className="font-poppins text-[10px] uppercase tracking-[0.4em] text-[#86162f]/40">Petite Indulgence</span>
          <div className="flex-1 h-px bg-[#86162f]/10" />
        </div>

        {PETITE_COLLECTIONS.map((slug) => {
          const meta     = COLLECTION_META[slug];
          const products = getProductsByCollection(slug);
          return (
            <section key={slug} className="mb-20">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h2 className="font-seasons text-[#86162f] text-4xl md:text-5xl">{meta.title}</h2>
                  <p className="font-poppins text-xs text-gray-400 mt-2 max-w-sm leading-relaxed">{meta.description}</p>
                </div>
                {products.length > 0 && (
                  <Link
                    href={`/products/${slug}`}
                    className="shrink-0 ml-8 mt-3 font-poppins text-[10px] uppercase tracking-widest text-[#86162f] border-b border-[#86162f]/30 hover:border-[#86162f] transition-colors pb-0.5"
                  >
                    See Full Collection ({products.length}) →
                  </Link>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5">
                {products.slice(0, 3).map(p => <ProductCard key={p.id} product={p} collectionSlug={slug} />)}
              </div>
            </section>
          );
        })}

      </div>

      <Footer />
    </main>
  );
}
