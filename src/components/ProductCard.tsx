import { ShoppingBag, Eye, Heart } from 'lucide-react';
import type { Product } from '@/types';
import { EGP, productStock, variantStock } from '@/lib/utils';
import { useStore } from '@/store/StoreContext';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
}

export default function ProductCard({ product, onClick }: ProductCardProps) {
  const { addToCart, pushToast } = useStore();
  const stock = productStock(product);
  const firstVariant = product.variants[0];
  const firstSize = firstVariant?.sizes[0]?.size;
  const lowStock = stock > 0 && stock <= 4;
  const outOfStock = stock === 0;
  const hasDiscount = !!product.oldPrice && product.oldPrice > product.price;
  const discountPct = hasDiscount ? Math.round((1 - product.price / (product.oldPrice as number)) * 100) : 0;

  const quickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!firstVariant || !firstSize) { onClick(); return; }
    if (outOfStock) { pushToast('warning', 'هذا المنتج غير متوفر حاليًا'); return; }
    const sz = firstVariant.sizes.find((s) => s.size === firstSize && s.stock > 0) || firstVariant.sizes.find((s) => s.stock > 0);
    if (!sz) { pushToast('warning', 'المقاس غير متوفر حاليًا'); return; }
    addToCart(product.id, firstVariant.id, sz.size, 1);
    pushToast('success', `تمت إضافة "${product.name}" إلى السلة`);
  };

  return (
    <div onClick={onClick}
      className="group card overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lift">
      <div className="relative aspect-[3/4] overflow-hidden bg-cream-100">
        <img src={product.images[0]} alt={product.name}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.background = '#fbcfdd'; (e.currentTarget as HTMLImageElement).style.opacity = '0.2'; }}
          loading="lazy" />
        {/* secondary image on hover */}
        {product.images[1] && (
          <img src={product.images[1]} alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            onError={() => {}} loading="lazy" />
        )}

        {/* Badges */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-start">
          {hasDiscount && (
            <span className="chip bg-primary-700 text-white shadow-soft">-{discountPct}%</span>
          )}
          {product.badge && (
            <span className="chip bg-white/90 text-primary-700 shadow-soft border border-primary-100">{product.badge}</span>
          )}
          {product.onOffer && (
            <span className="chip bg-accent-400 text-ink-950 shadow-soft">عرض</span>
          )}
        </div>

        {/* Stock indicator */}
        {lowStock && (
          <span className="absolute bottom-3 right-3 chip bg-warning-500 text-white shadow-soft">باقي {stock} قطع</span>
        )}
        {outOfStock && (
          <span className="absolute bottom-3 right-3 chip bg-ink-800 text-white shadow-soft">نفذت الكمية</span>
        )}

        {/* Quick actions */}
        <div className="absolute bottom-3 left-3 flex gap-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
          <button onClick={(e) => { e.stopPropagation(); onClick(); }}
            className="grid place-items-center h-10 w-10 rounded-full bg-white text-ink-800 shadow-lift hover:bg-primary-700 hover:text-white transition">
            <Eye className="h-5 w-5" />
          </button>
          <button onClick={quickAdd}
            disabled={outOfStock}
            className="grid place-items-center h-10 w-10 rounded-full bg-primary-700 text-white shadow-lift hover:bg-primary-800 transition disabled:opacity-50">
            <ShoppingBag className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="p-3 sm:p-4">
        <h3 className="font-bold text-ink-900 text-sm sm:text-base line-clamp-1">{product.name}</h3>
        <p className="mt-0.5 text-xs text-ink-500 line-clamp-1">{product.description}</p>

        {/* colors */}
        <div className="mt-2 flex items-center gap-1.5">
          {product.variants.slice(0, 5).map((v) => (
            <span key={v.id} className="h-4 w-4 rounded-full ring-2 ring-white shadow-soft border border-cream-200"
              style={{ background: v.colorHex }} title={v.color} />
          ))}
          {product.variants.length > 5 && <span className="text-[10px] text-ink-400">+{product.variants.length - 5}</span>}
        </div>

        <div className="mt-2.5 flex items-end justify-between gap-2">
          <div className="flex items-baseline gap-2">
            <span className="font-display font-black text-primary-700 text-base sm:text-lg">{EGP(product.price)}</span>
            {hasDiscount && <span className="text-xs text-ink-400 line-through">{EGP(product.oldPrice as number)}</span>}
          </div>
          <span className="text-[11px] font-bold text-ink-400">{variantStock(firstVariant) ?? 0} متاح</span>
        </div>
      </div>
    </div>
  );
}
