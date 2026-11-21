import { useRef, useState } from 'react';
import { Plus, Pencil, Trash2, X, Image as ImageIcon, Save, Upload, Download, Search } from 'lucide-react';
import { useStore } from '@/store/StoreContext';
import type { Product, Variant } from '@/types';
import { uid, readDataUrl, EGP, productStock, variantStock } from '@/lib/utils';
import { downloadTemplate, parseProducts } from '@/lib/excel';

export default function AdminProducts() {
  const { data, setProducts, pushToast } = useStore();
  const [editing, setEditing] = useState<Product | null>(null);
  const [query, setQuery] = useState('');
  const [excelBusy, setExcelBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const filtered = data.products.filter((p) => p.name.toLowerCase().includes(query.trim().toLowerCase()));

  const startCreate = () => setEditing({
    id: uid('p'), name: '', categoryId: data.categories[0]?.id ?? '', description: '',
    price: 0, oldPrice: undefined, images: [],
    variants: [{ id: uid('var'), color: 'افتراضي', colorHex: '#cccccc', sizes: [{ size: 'M', stock: 10 }] }],
    createdAt: Date.now(),
  });

  const save = (p: Product) => {
    if (!p.name.trim()) { pushToast('warning', 'اسم المنتج مطلوب'); return; }
    if (p.price <= 0) { pushToast('warning', 'السعر غير صالح'); return; }
    if (p.images.length === 0) { pushToast('warning', 'أضيفي صورة واحدة على الأقل'); return; }
    const exists = data.products.find((x) => x.id === p.id);
    const next = exists ? data.products.map((x) => (x.id === p.id ? p : x)) : [p, ...data.products];
    setProducts(next);
    pushToast('success', exists ? 'تم تحديث المنتج' : 'تمت إضافة المنتج');
    setEditing(null);
  };

  const remove = (id: string) => {
    setProducts(data.products.filter((p) => p.id !== id));
    pushToast('info', 'تم حذف المنتج');
  };

  const onExcel = async (file: File) => {
    setExcelBusy(true);
    try {
      const { products, errors } = await parseProducts(file, data.categories);
      if (products.length > 0) {
        setProducts([...products, ...data.products]);
        pushToast('success', `تمت إضافة ${products.length} منتج بنجاح`);
      }
      errors.forEach((e) => pushToast('warning', e));
      if (products.length === 0 && errors.length === 0) pushToast('warning', 'لم يتم العثور على منتجات في الملف');
    } catch (e) {
      pushToast('error', `فشل استيراد الملف: ${(e as Error).message}`);
    } finally {
      setExcelBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-display font-black text-lg text-ink-900">إدارة المنتجات ({data.products.length})</h3>
        <div className="flex flex-wrap gap-2">
          <button onClick={downloadTemplate} className="btn-outline px-3 py-2 text-sm"><Download className="h-4 w-4" /> نموذج إكسيل</button>
          <label className="btn-outline px-3 py-2 text-sm cursor-pointer">
            <Upload className="h-4 w-4" /> {excelBusy ? 'جاري...' : 'رفع إكسيل'}
            <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden" disabled={excelBusy} onChange={(e) => e.target.files?.[0] && onExcel(e.target.files[0])} />
          </label>
          <button onClick={startCreate} className="btn-primary px-4 py-2 text-sm"><Plus className="h-4 w-4" /> منتج جديد</button>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
        <input className="input-knz pr-9 py-2 text-sm" placeholder="ابحثي عن منتج..." value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((p) => {
          const stock = productStock(p);
          const cat = data.categories.find((c) => c.id === p.categoryId);
          return (
            <div key={p.id} className="card overflow-hidden flex">
              <div className="h-24 w-24 shrink-0 bg-cream-100">
                {p.images[0] && <img src={p.images[0]} className="h-full w-full object-cover" onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = '0.2'; }} />}
              </div>
              <div className="flex-1 p-3 min-w-0">
                <div className="font-bold text-sm text-ink-900 line-clamp-1">{p.name}</div>
                <div className="text-xs text-ink-500">{cat?.name} · {EGP(p.price)}{p.oldPrice ? ` (كان ${EGP(p.oldPrice)})` : ''}</div>
                <div className="mt-1 flex items-center gap-2 text-[11px] font-bold">
                  <span className={stock <= 4 ? 'text-warning-600' : 'text-success-600'}>المخزون: {stock}</span>
                  {p.onOffer && <span className="chip bg-accent-100 text-accent-700 px-1.5 py-0.5">عرض</span>}
                </div>
                <div className="mt-2 flex gap-1.5">
                  <button onClick={() => setEditing(p)} className="btn-outline flex-1 px-2 py-1 text-xs"><Pencil className="h-3.5 w-3.5" /> تعديل</button>
                  <button onClick={() => remove(p.id)} className="grid place-items-center h-8 w-8 rounded-full bg-error-50 text-error-600 hover:bg-error-100"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && <p className="text-sm text-ink-500 py-4 col-span-full text-center">لا توجد منتجات مطابقة.</p>}
      </div>

      {editing && <ProductModal product={editing} onClose={() => setEditing(null)} onSave={save} />}
    </div>
  );
}

function ProductModal({ product, onClose, onSave }: { product: Product; onClose: () => void; onSave: (p: Product) => void }) {
  const { data } = useStore();
  const [form, setForm] = useState<Product>(product);

  const addImage = async (file: File) => {
    try {
      let url: string;
      if (file.size > 1_500_000) { url = URL.createObjectURL(file); }
      else { url = await readDataUrl(file); }
      setForm((f) => ({ ...f, images: [...f.images, url] }));
    } catch { /* ignore */ }
  };

  const addVariant = () => setForm((f) => ({ ...f, variants: [...f.variants, { id: uid('var'), color: 'لون جديد', colorHex: '#f7a8c0', sizes: [{ size: 'M', stock: 5 }] }] }));
  const updateVariant = (id: string, patch: Partial<Variant>) => setForm((f) => ({ ...f, variants: f.variants.map((v) => (v.id === id ? { ...v, ...patch } : v)) }));
  const removeVariant = (id: string) => setForm((f) => ({ ...f, variants: f.variants.length > 1 ? f.variants.filter((v) => v.id !== id) : f.variants }));
  const updateSize = (vid: string, idx: number, patch: Partial<{ size: string; stock: number }>) =>
    setForm((f) => ({ ...f, variants: f.variants.map((v) => v.id === vid ? { ...v, sizes: v.sizes.map((s, i) => (i === idx ? { ...s, ...patch } : s)) } : v) }));
  const addSize = (vid: string) => setForm((f) => ({ ...f, variants: f.variants.map((v) => v.id === vid ? { ...v, sizes: [...v.sizes, { size: 'XL', stock: 5 }] } : v) }));
  const removeSize = (vid: string, idx: number) => setForm((f) => ({ ...f, variants: f.variants.map((v) => v.id === vid ? { ...v, sizes: v.sizes.length > 1 ? v.sizes.filter((_, i) => i !== idx) : v.sizes } : v) }));

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in" onClick={onClose}>
      <div className="absolute inset-0 bg-ink-950/70 backdrop-blur-sm" />
      <div onClick={(e) => e.stopPropagation()} className="relative bg-cream-50 w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto rounded-t-4xl sm:rounded-4xl shadow-lift animate-scale-in">
        <div className="sticky top-0 flex items-center justify-between p-4 bg-white border-b border-cream-200">
          <h4 className="font-display font-black text-ink-900">{product.name ? 'تعديل منتج' : 'منتج جديد'}</h4>
          <button onClick={onClose} className="grid place-items-center h-10 w-10 rounded-full hover:bg-cream-100"><X className="h-5 w-5" /></button>
        </div>

        <div className="p-4 sm:p-5 space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="label-knz">اسم المنتج *</label>
              <input className="input-knz" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="label-knz">القسم *</label>
              <select className="input-knz" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
                {data.categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="label-knz">الوصف</label>
            <textarea className="input-knz min-h-20" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="label-knz">السعر (ج.م) *</label>
              <input type="number" min={0} className="input-knz" value={form.price || ''} onChange={(e) => setForm({ ...form, price: Math.max(0, Number(e.target.value) || 0) })} />
            </div>
            <div>
              <label className="label-knz">السعر قبل الخصم</label>
              <input type="number" min={0} className="input-knz" value={form.oldPrice ?? ''} onChange={(e) => setForm({ ...form, oldPrice: Number(e.target.value) || undefined })} />
            </div>
            <div>
              <label className="label-knz">شارة (اختياري)</label>
              <input className="input-knz" value={form.badge ?? ''} onChange={(e) => setForm({ ...form, badge: e.target.value || undefined })} placeholder="مثال: الأكثر مبيعًا" />
            </div>
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer text-sm font-bold">
              <input type="checkbox" checked={!!form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="h-4 w-4 accent-primary-700" />
              منتج مميز
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm font-bold">
              <input type="checkbox" checked={!!form.onOffer} onChange={(e) => setForm({ ...form, onOffer: e.target.checked })} className="h-4 w-4 accent-primary-700" />
              ضمن العروض
            </label>
          </div>

          {/* Images */}
          <div>
            <label className="label-knz">صور المنتج ({form.images.length})</label>
            <div className="flex flex-wrap gap-2">
              {form.images.map((img, i) => (
                <div key={i} className="relative h-20 w-20 rounded-2xl overflow-hidden bg-cream-100 ring-1 ring-cream-200">
                  <img src={img} className="h-full w-full object-cover" onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = '0.2'; }} />
                  <button onClick={() => setForm((f) => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }))}
                    className="absolute top-1 left-1 grid place-items-center h-6 w-6 rounded-full bg-error-600 text-white"><X className="h-3.5 w-3.5" /></button>
                </div>
              ))}
              <label className="grid place-items-center h-20 w-20 rounded-2xl border-2 border-dashed border-cream-300 text-ink-400 hover:border-primary-400 hover:text-primary-700 cursor-pointer transition">
                <ImageIcon className="h-6 w-6" />
                <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => { const fs = Array.from(e.target.files ?? []); fs.forEach(addImage); e.target.value = ''; }} />
              </label>
            </div>
            <input className="input-knz mt-2 text-sm" placeholder="أو ألصقي رابط صورة واضغطي Enter" onKeyDown={(e) => {
              if (e.key === 'Enter') { const v = (e.target as HTMLInputElement).value.trim(); if (v) { setForm((f) => ({ ...f, images: [...f.images, v] })); (e.target as HTMLInputElement).value = ''; } }
            }} />
          </div>

          {/* Variants */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="label-knz mb-0">الألوان والمقاسات والمخزون</label>
              <button onClick={addVariant} className="btn-outline px-3 py-1.5 text-xs"><Plus className="h-3.5 w-3.5" /> لون</button>
            </div>
            <div className="space-y-3">
              {form.variants.map((v) => (
                <div key={v.id} className="rounded-2xl border-2 border-cream-200 p-3 bg-white">
                  <div className="flex items-center gap-2">
                    <input type="color" value={v.colorHex} onChange={(e) => updateVariant(v.id, { colorHex: e.target.value })} className="h-9 w-9 rounded-lg border border-cream-200 cursor-pointer" />
                    <input className="input-knz flex-1 py-2 text-sm" value={v.color} onChange={(e) => updateVariant(v.id, { color: e.target.value })} placeholder="اسم اللون" />
                    <span className="text-xs font-bold text-ink-500 shrink-0">إجمالي: {variantStock(v)}</span>
                    {form.variants.length > 1 && <button onClick={() => removeVariant(v.id)} className="grid place-items-center h-9 w-9 rounded-full bg-error-50 text-error-600"><Trash2 className="h-4 w-4" /></button>}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {v.sizes.map((s, i) => (
                      <div key={i} className="flex items-center gap-1 rounded-xl border border-cream-200 bg-cream-50 px-2 py-1.5">
                        <input className="w-12 text-sm font-bold text-center bg-transparent outline-none" value={s.size} onChange={(e) => updateSize(v.id, i, { size: e.target.value })} />
                        <span className="text-ink-300">/</span>
                        <input type="number" min={0} className="w-14 text-sm text-center bg-transparent outline-none" value={s.stock} onChange={(e) => updateSize(v.id, i, { stock: Math.max(0, Number(e.target.value) || 0) })} />
                        <button onClick={() => removeSize(v.id, i)} className="text-ink-400 hover:text-error-600"><X className="h-3.5 w-3.5" /></button>
                      </div>
                    ))}
                    <button onClick={() => addSize(v.id)} className="btn-outline px-2 py-1.5 text-xs"><Plus className="h-3 w-3" /> مقاس</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button onClick={() => onSave(form)} className="btn-primary w-full py-3 sticky bottom-0"><Save className="h-4 w-4" /> حفظ المنتج</button>
        </div>
      </div>
    </div>
  );
}
