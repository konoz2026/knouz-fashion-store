import { useMemo, useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { useStore } from '@/store/StoreContext';
import ProductCard from '@/components/ProductCard';
import { SectionHeading } from '@/components/CategorySection';

interface ProductsSectionProps {
  activeCategory: string | 'all';
  onCategoryChange: (id: string | 'all') => void;
  onProductClick: (id: string) => void;
}

type SortKey = 'newest' | 'price-asc' | 'price-desc' | 'name';

export default function ProductsSection({ activeCategory, onCategoryChange, onProductClick }: ProductsSectionProps) {
  const { data } = useStore();
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortKey>('newest');
  const [onlyOffers, setOnlyOffers] = useState(false);

  const filtered = useMemo(() => {
    let list = data.products;
    if (activeCategory !== 'all') list = list.filter((p) => p.categoryId === activeCategory);
    if (onlyOffers) list = list.filter((p) => p.onOffer);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }
    const sorted = [...list];
    switch (sort) {
      case 'price-asc': sorted.sort((a, b) => a.price - b.price); break;
      case 'price-desc': sorted.sort((a, b) => b.price - a.price); break;
      case 'name': sorted.sort((a, b) => a.name.localeCompare(b.name, 'ar')); break;
      default: sorted.sort((a, b) => b.createdAt - a.createdAt);
    }
    return sorted;
  }, [data.products, activeCategory, query, sort, onlyOffers]);

  const activeCatName = activeCategory === 'all' ? 'كل المنتجات' : (data.categories.find((c) => c.id === activeCategory)?.name ?? 'المنتجات');

  return (
    <section id="products" className="container-knz py-14">
      <SectionHeading eyebrow="تشكيلتنا" title={activeCatName} subtitle="اكتشفي أحدث الموديلات وأضيفي ما يناسب إطلالتك" />

      {/* Toolbar */}
      <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          <CatPill active={activeCategory === 'all'} onClick={() => onCategoryChange('all')}>الكل</CatPill>
          {data.categories.map((c) => (
            <CatPill key={c.id} active={activeCategory === c.id} onClick={() => onCategoryChange(c.id)}>{c.name}</CatPill>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setOnlyOffers((v) => !v)}
            className={`chip border px-3 py-2 transition ${onlyOffers ? 'bg-primary-700 text-white border-primary-700' : 'bg-white text-ink-700 border-cream-200 hover:border-primary-300'}`}>
            <SlidersHorizontal className="h-4 w-4" /> العروض فقط
          </button>
          <div className="relative flex-1 sm:w-56">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ابحثي..."
              className="input-knz pr-9 py-2 text-sm" />
          </div>
          <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className="input-knz py-2 text-sm w-auto">
            <option value="newest">الأحدث</option>
            <option value="price-asc">السعر: الأقل</option>
            <option value="price-desc">السعر: الأعلى</option>
            <option value="name">الاسم</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-ink-500">
          <p className="font-bold">لا توجد منتجات مطابقة لبحثك</p>
          <p className="text-sm mt-1">جرّبي تغيير القسم أو كلمة البحث</p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} onClick={() => onProductClick(p.id)} />
          ))}
        </div>
      )}
    </section>
  );
}

function CatPill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-bold border-2 transition ${active ? 'bg-primary-700 text-white border-primary-700 shadow-soft' : 'bg-white text-ink-700 border-cream-200 hover:border-primary-300'}`}>
      {children}
    </button>
  );
}
