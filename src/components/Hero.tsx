import { ShoppingBag, Tag, Truck, ArrowLeft } from 'lucide-react';
import { useStore } from '@/store/StoreContext';
import { EGP } from '@/lib/utils';

interface HeroProps {
  onShop: () => void;
  onOffers: () => void;
}

export default function Hero({ onShop, onOffers }: HeroProps) {
  const { data } = useStore();
  const { info, offers } = data;

  return (
    <section className="relative">
      <div className="relative h-[70vh] min-h-[460px] max-h-[720px] w-full overflow-hidden">
        {/* Background image with Ken Burns */}
        <div className="absolute inset-0">
          <img src={info.heroImage} alt="كنوز ستايل"
            className="h-full w-full object-cover animate-ken-burns"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = '0'; }}
            loading="eager" />
        </div>
        {/* Gradient overlays for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-l from-ink-950/85 via-ink-900/55 to-ink-900/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/70 via-transparent to-ink-950/20" />
        {/* Soft pink tint accent */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/30 via-transparent to-accent-700/20 mix-blend-soft-light" />

        {/* Content */}
        <div className="relative h-full container-knz flex items-center">
          <div className="max-w-2xl text-white animate-fade-up">
            <span className="chip bg-white/15 text-accent-200 border border-white/20 backdrop-blur-md mb-5">
              <span className="h-2 w-2 rounded-full bg-accent-300 animate-pulse-soft" />
              {info.brandNameEn} — {info.tagline}
            </span>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.1] text-balance drop-shadow-lg">
              {info.heroTitle}
            </h1>
            <p className="mt-4 text-lg sm:text-2xl font-bold text-cream-100 drop-shadow">
              {info.heroSubtitle}
            </p>
            <p className="mt-4 max-w-xl text-sm sm:text-base text-cream-200/90 leading-relaxed">
              اكتشفي تشكيلة مختارة من أرقى الموديلات العصرية بتفاصيل فاخرة وأسعار تناسبك.
              أسعار تبدأ من {EGP(info.priceFrom)} + خصم {offers.globalDiscountPercent}% لمدة أسبوع كامل + توصيل لجميع المحافظات.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <button onClick={onShop} className="btn-gold px-7 py-3.5 text-base">
                <ShoppingBag className="h-5 w-5" />
                تسوّقي التشكيلة الآن
              </button>
              <button onClick={onOffers} className="btn px-7 py-3.5 text-base bg-white/15 border border-white/30 text-white backdrop-blur-md hover:bg-white/25 transition">
                <Tag className="h-5 w-5" />
                اكتشفي العروض
              </button>
            </div>

            {/* Feature pills */}
            <div className="mt-8 flex flex-wrap gap-4 text-sm font-bold text-cream-100">
              <span className="inline-flex items-center gap-2"><Truck className="h-4 w-4 text-accent-300" /> توصيل لكل المحافظات</span>
              <span className="inline-flex items-center gap-2"><Tag className="h-4 w-4 text-accent-300" /> خصم {offers.globalDiscountPercent}% لمدة أسبوع</span>
              <span className="inline-flex items-center gap-2"><ArrowLeft className="h-4 w-4 text-accent-300" /> الدفع عند الاستلام</span>
            </div>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-cream-50 to-transparent" />
      </div>
    </section>
  );
}
