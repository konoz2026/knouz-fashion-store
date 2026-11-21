import { useState } from 'react';
import { Save, Tag, Truck } from 'lucide-react';
import { useStore } from '@/store/StoreContext';
import type { OfferSettings } from '@/types';
import { EGP } from '@/lib/utils';

export default function AdminOffers() {
  const { data, setOffers, pushToast } = useStore();
  const [form, setForm] = useState<OfferSettings>(data.offers);

  const save = () => {
    setOffers(form);
    pushToast('success', 'تم حفظ إعدادات العروض');
  };

  return (
    <div className="space-y-4">
      <h3 className="font-display font-black text-lg text-ink-900">إدارة العروض والخصومات</h3>

      <div className="card p-4 sm:p-5 space-y-4">
        <label className="flex items-center justify-between cursor-pointer">
          <span className="font-bold text-ink-800 flex items-center gap-2"><Tag className="h-5 w-5 text-primary-700" /> تفعيل قسم العروض في المتجر</span>
          <input type="checkbox" checked={form.enabled} onChange={(e) => setForm({ ...form, enabled: e.target.checked })} className="h-6 w-11 accent-primary-700" />
        </label>

        <div>
          <label className="label-knz">عنوان قسم العروض</label>
          <input className="input-knz" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <div>
          <label className="label-knz">الوصف الفرعي</label>
          <input className="input-knz" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
        </div>
        <div>
          <label className="label-knz">نسبة الخصم العام (%) — يُطبق على المنتجات غير المخفّضة</label>
          <input type="number" min={0} max={100} className="input-knz" value={form.globalDiscountPercent} onChange={(e) => setForm({ ...form, globalDiscountPercent: Math.min(100, Math.max(0, Number(e.target.value) || 0)) })} />
        </div>
      </div>

      <div className="card p-4 sm:p-5 space-y-4">
        <div className="flex items-center gap-2 font-bold text-ink-800"><Truck className="h-5 w-5 text-primary-700" /> مؤشر الشحن المجاني داخل السلة</div>
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-sm font-bold text-ink-700">تفعيل الشحن المجاني عند تجاوز مبلغ محدد</span>
          <input type="checkbox" checked={form.freeShippingEnabled} onChange={(e) => setForm({ ...form, freeShippingEnabled: e.target.checked })} className="h-6 w-11 accent-primary-700" />
        </label>
        <div>
          <label className="label-knz">الحد الأدنى للحصول على الشحن المجاني (ج.م)</label>
          <input type="number" min={0} className="input-knz" value={form.freeShippingThreshold} onChange={(e) => setForm({ ...form, freeShippingThreshold: Math.max(0, Number(e.target.value) || 0) })} />
          <p className="mt-1.5 text-xs text-ink-500">عند تجاوز قيمة المنتجات في السلة {EGP(form.freeShippingThreshold)}، يصبح الشحن مجانيًا تلقائيًا.</p>
        </div>
      </div>

      <button onClick={save} className="btn-primary w-full sm:w-auto px-8 py-3"><Save className="h-4 w-4" /> حفظ الإعدادات</button>
    </div>
  );
}
