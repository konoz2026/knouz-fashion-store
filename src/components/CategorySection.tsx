import { ArrowLeft } from 'lucide-react';
import type { Category } from '@/types';
import { productStock } from '@/lib/utils';

interface CategorySectionProps {
  categories: Category[];
  productCountByCat: Record<string, number>;
  onSelect: (id: string) => void;
}

export default function CategorySection({ categories, productCountByCat, onSelect }: CategorySectionProps) {
  return (
    <section className="container-knz py-14">
      <SectionHeading eyebrow="تسوّقي حسب القسم" title="الأقسام" subtitle="اختاري إطلالتك المفضلة من تشكيلاتنا المختارة بعناية" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-8">
        {categories.map((c, i) => (
          <button key={c.id} onClick={() => onSelect(c.id)}
            style={{ animationDelay: `${i * 60}ms` }}
            className="group relative aspect-[4/5] overflow-hidden rounded-3xl shadow-soft ring-1 ring-cream-200/60 animate-fade-up">
            <img src={c.image} alt={c.name}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.background = '#fbcfdd'; }}
              loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-950/85 via-ink-900/25 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 text-right text-white">
              <div className="text-[11px] font-bold text-accent-300">{productCountByCat[c.id] ?? 0} منتج</div>
              <h3 className="font-display text-xl sm:text-2xl font-black mt-0.5">{c.name}</h3>
              {c.description && <p className="mt-1 text-xs text-cream-200/90 line-clamp-2 hidden sm:block">{c.description}</p>}
              <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/15 border border-white/25 px-3 py-1.5 text-xs font-bold backdrop-blur-md group-hover:bg-accent-400 group-hover:text-ink-950 group-hover:border-accent-300 transition">
                تسوّقي الآن <ArrowLeft className="h-3.5 w-3.5" />
              </span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

export function SectionHeading({ eyebrow, title, subtitle }: { eyebrow?: string; title: string; subtitle?: string }) {
  return (
    <div className="text-center max-w-2xl mx-auto">
      {eyebrow && <div className="text-sm font-bold text-accent-600 tracking-wide">{eyebrow}</div>}
      <h2 className="font-display text-3xl sm:text-4xl font-black text-ink-900 mt-1">{title}</h2>
      {subtitle && <p className="mt-2 text-ink-500 text-sm sm:text-base">{subtitle}</p>}
      <div className="mt-4 mx-auto h-1 w-20 rounded-full bg-gradient-to-l from-primary-600 to-accent-400" />
    </div>
  );
}
