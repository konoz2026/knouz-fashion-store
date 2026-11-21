import { Tag, Clock, Flame } from 'lucide-react';
import { useStore } from '@/store/StoreContext';
import { EGP } from '@/lib/utils';
import { SectionHeading } from '@/components/CategorySection';
import ProductCard from '@/components/ProductCard';

interface OffersSectionProps {
  onProductClick: (id: string) => void;
}

export default function OffersSection({ onProductClick }: OffersSectionProps) {
  const { data } = useStore();
  const { offers, products } = data;
  if (!offers.enabled) return null;
  const offerProducts = products.filter((p) => p.onOffer).slice(0, 8);

  return (
    <section id="offers" className="relative py-14 bg-gradient-to-b from-primary-50/60 via-cream-50 to-cream-50">
      <div className="container-knz">
        <SectionHeading eyebrow="وفّري أكثر" title={offers.title} subtitle={offers.subtitle} />
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <span className="chip bg-primary-700 text-white shadow-soft">
            <Flame className="h-4 w-4" /> خصم {offers.globalDiscountPercent}%
          </span>
          <span className="chip bg-accent-400 text-ink-950 shadow-soft">
            <Clock className="h-4 w-4" /> لمدة أسبوع كامل
          </span>
          <span className="chip bg-white text-primary-700 border border-primary-200">
            <Tag className="h-4 w-4" /> تشكيلة مختارة
          </span>
        </div>

        {offerProducts.length === 0 ? (
          <p className="text-center text-ink-500 mt-8">لا توجد منتجات في العروض حاليًا.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mt-8">
            {offerProducts.map((p) => (
              <ProductCard key={p.id} product={p} onClick={() => onProductClick(p.id)} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
