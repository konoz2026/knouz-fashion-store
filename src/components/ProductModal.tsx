import { useEffect, useMemo, useState } from 'react';
import { X, ChevronLeft, ChevronRight, ShoppingBag, Minus, Plus, Check, AlertCircle, Truck } from 'lucide-react';
import type { Product } from '@/types';
import { useStore } from '@/store/StoreContext';
import { EGP, variantStock } from '@/lib/utils';

interface ProductModalProps {
  product: Product;
  onClose: () => void;
  onAdded: () => void; // open cart
}

export default function ProductModal({ product, onClose, onAdded }: ProductModalProps) {
  const { addToCart, pushToast, data } = useStore();
  const [imgIdx, setImgIdx] = useState(0);
  const [variantId, setVariantId] = useState(product.variants[0]?.id ?? '');
  const [size, setSize] = useState('');
  const [qty, setQty] = useState(1);

  const variant = useMemo(() => product.variants.find((v) => v.id === variantId) ?? product.variants[0], [product, variantId]);
  const sizeObj = useMemo(() => variant?.sizes.find((s) => s.size === size), [variant, size]);
  const stock = sizeObj?.stock ?? 0;
  const outOfStock = stock === 0;
  const lowStock = stock > 0 && stock <= 4;
  const hasDiscount = !!product.oldPrice && product.oldPrice > product.price;
  const categoryName = data.categories.find((c) => c.id === product.categoryId)?.name ?? '';

  useEffect(() => {
    const firstAvailable = variant?.sizes.find((s) => s.stock > 0);
    setSize(firstAvailable?.size ?? variant?.sizes[0]?.size ?? '');
    setImgIdx(0);
    setQty(1);
  }, [variantId, variant]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [onClose]);

  const nextImg = () => setImgIdx((i) => (i + 1) % product.images.length);
  const prevImg = () => setImgIdx((i) => (i - 1 + product.images.length) % product.images.length);

  const handleAdd = () => {
    if (!variant || !size) { pushToast('warning', 'اختاري المقاس واللون أولًا'); return; }
    if (outOfStock) { pushToast('warning', 'الكمية غير متاحة حاليًا'); return; }
    if (qty > stock) { pushToast('warning', `الكمية المتاحة هي ${stock} فقط`); return; }
    addToCart(product.id, variant.id, size, qty);
    pushToast('success', `تمت إضافة "${product.name}" إلى السلة`);
    onAdded();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in" onClick={onClose}>
      <div className="absolute inset-0 bg-ink-950/70 backdrop-blur-sm" />
      <div onClick={(e) => e.stopPropagation()}
        className="relative bg-cream-50 w-full sm:max-w-4xl max-h-[92vh] sm:max-h-[88vh] overflow-y-auto rounded-t-4xl sm:rounded-4xl shadow-lift animate-scale-in">
        <button onClick={onClose} className="absolute top-3 left-3 z-10 grid place-items-center h-10 w-10 rounded-full bg-white/90 text-ink-800 shadow-soft hover:bg-primary-700 hover:text-white transition">
          <X className="h-5 w-5" />
        </button>

        <div className="grid md:grid-cols-2 gap-0">
          {/* Gallery */}
          <div className="relative bg-cream-100">
            <div className="relative aspect-square md:aspect-auto md:h-full min-h-[320px] overflow-hidden">
              <img src={product.images[imgIdx]} alt={product.name}
                className="absolute inset-0 h-full w-full object-cover animate-fade-in"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.background = '#fbcfdd'; }}
                key={imgIdx} />
              {product.images.length > 1 && (
                <>
                  <button onClick={prevImg} className="absolute top-1/2 right-2 -translate-y-1/2 grid place-items-center h-10 w-10 rounded-full bg-white/85 text-ink-800 shadow-soft hover:bg-white transition">
                    <ChevronRight className="h-5 w-5" />
                  </button>
                  <button onClick={nextImg} className="absolute top-1/2 left-2 -translate-y-1/2 grid place-items-center h-10 w-10 rounded-full bg-white/85 text-ink-800 shadow-soft hover:bg-white transition">
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="absolute bottom-3 inset-x-0 flex justify-center gap-2 px-3">
                {product.images.map((img, i) => (
                  <button key={i} onClick={() => setImgIdx(i)}
                    className={`h-14 w-14 rounded-xl overflow-hidden ring-2 transition ${i === imgIdx ? 'ring-primary-600 scale-105' : 'ring-white/80 opacity-80'}`}>
                    <img src={img} alt="" className="h-full w-full object-cover" onError={() => {}} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="p-5 sm:p-7">
            {categoryName && <div className="text-xs font-bold text-accent-600">{categoryName}</div>}
            <h2 className="font-display text-2xl sm:text-3xl font-black text-ink-900 mt-1">{product.name}</h2>

            <div className="mt-3 flex items-baseline gap-3">
              <span className="font-display text-2xl font-black text-primary-700">{EGP(product.price)}</span>
              {hasDiscount && <span className="text-base text-ink-400 line-through">{EGP(product.oldPrice as number)}</span>}
              {hasDiscount && <span className="chip bg-primary-100 text-primary-700">وفّري {EGP((product.oldPrice as number) - product.price)}</span>}
            </div>

            <p className="mt-3 text-sm text-ink-600 leading-relaxed">{product.description}</p>

            {/* Colors */}
            <div className="mt-5">
              <div className="label-knz">اللون: <span className="text-primary-700">{variant?.color}</span></div>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => {
                  const total = variantStock(v);
                  const active = v.id === variantId;
                  return (
                    <button key={v.id} onClick={() => setVariantId(v.id)}
                      className={`relative h-9 w-9 rounded-full ring-2 transition ${active ? 'ring-primary-600 scale-110' : 'ring-cream-200 hover:ring-primary-300'}`}
                      style={{ background: v.colorHex }} title={`${v.color} (${total} متاح)`}
                      disabled={total === 0}>
                      {active && <Check className="absolute inset-0 m-auto h-4 w-4 text-white drop-shadow" />}
                      {total === 0 && <span className="absolute inset-0 grid place-items-center text-white"><X className="h-4 w-4" /></span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sizes */}
            <div className="mt-4">
              <div className="label-knz">المقاس</div>
              <div className="flex flex-wrap gap-2">
                {variant?.sizes.map((s) => {
                  const active = s.size === size;
                  const disabled = s.stock === 0;
                  return (
                    <button key={s.size} onClick={() => setSize(s.size)} disabled={disabled}
                      className={`min-w-11 px-3 h-10 rounded-2xl text-sm font-bold border-2 transition ${active ? 'bg-primary-700 text-white border-primary-700' : disabled ? 'bg-cream-100 text-ink-300 border-cream-200 line-through cursor-not-allowed' : 'bg-white text-ink-700 border-cream-200 hover:border-primary-300'}`}>
                      {s.size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Stock status */}
            <div className="mt-4">
              {outOfStock ? (
                <span className="inline-flex items-center gap-2 text-sm font-bold text-error-600"><AlertCircle className="h-4 w-4" /> نفذت الكمية لهذا المقاس</span>
              ) : lowStock ? (
                <span className="inline-flex items-center gap-2 text-sm font-bold text-warning-600"><AlertCircle className="h-4 w-4" /> باقي {stock} قطع فقط — سارعي بالطلب</span>
              ) : (
                <span className="inline-flex items-center gap-2 text-sm font-bold text-success-600"><Check className="h-4 w-4" /> متاح — جاهز للشحن</span>
              )}
            </div>

            {/* Quantity + Add */}
            <div className="mt-5 flex items-stretch gap-3">
              <div className="flex items-center rounded-2xl border-2 border-cream-200 bg-white">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="grid place-items-center h-12 w-12 text-ink-700 hover:text-primary-700"><Minus className="h-4 w-4" /></button>
                <span className="w-10 text-center font-black text-ink-900">{qty}</span>
                <button onClick={() => setQty((q) => Math.min(stock || 99, q + 1))} className="grid place-items-center h-12 w-12 text-ink-700 hover:text-primary-700"><Plus className="h-4 w-4" /></button>
              </div>
              <button onClick={handleAdd} disabled={outOfStock}
                className="btn-primary flex-1 text-base disabled:opacity-50">
                <ShoppingBag className="h-5 w-5" />
                أضيفي إلى السلة — {EGP(product.price * qty)}
              </button>
            </div>

            <div className="mt-4 flex items-center gap-2 text-xs text-ink-500">
              <Truck className="h-4 w-4 text-primary-600" /> توصيل لجميع المحافظات — الدفع عند الاستلام متاح
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
