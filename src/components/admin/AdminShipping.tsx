import { useState } from 'react';
import { Plus, Trash2, Save, MapPin } from 'lucide-react';
import { useStore } from '@/store/StoreContext';
import type { ShippingZone } from '@/types';
import { uid, EGP } from '@/lib/utils';

export default function AdminShipping() {
  const { data, setShippingZones, pushToast } = useStore();
  const [zones, setZones] = useState<ShippingZone[]>(data.shippingZones);

  const add = () => setZones([...zones, { id: uid('z'), name: '', price: 50 }]);
  const update = (id: string, patch: Partial<ShippingZone>) => setZones(zones.map((z) => (z.id === id ? { ...z, ...patch } : z)));
  const remove = (id: string) => setZones(zones.filter((z) => z.id !== id));

  const save = () => {
    const valid = zones.filter((z) => z.name.trim());
    setShippingZones(valid);
    setZones(valid);
    pushToast('success', 'تم حفظ مناطق وأسعار الشحن');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-black text-lg text-ink-900">مناطق وأسعار الشحن ({zones.length})</h3>
        <button onClick={add} className="btn-primary px-4 py-2 text-sm"><Plus className="h-4 w-4" /> منطقة جديدة</button>
      </div>

      <div className="card divide-y divide-cream-200">
        {zones.map((z) => (
          <div key={z.id} className="flex items-center gap-2 p-3">
            <MapPin className="h-5 w-5 text-primary-700 shrink-0" />
            <input className="input-knz flex-1 py-2 text-sm" value={z.name} onChange={(e) => update(z.id, { name: e.target.value })} placeholder="اسم المحافظة / المنطقة" />
            <div className="flex items-center gap-1">
              <input type="number" min={0} className="input-knz w-24 py-2 text-sm" value={z.price} onChange={(e) => update(z.id, { price: Math.max(0, Number(e.target.value) || 0) })} />
              <span className="text-xs text-ink-500 shrink-0">ج.م</span>
            </div>
            <button onClick={() => remove(z.id)} className="grid place-items-center h-9 w-9 rounded-full bg-error-50 text-error-600 hover:bg-error-100 shrink-0"><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
        {zones.length === 0 && <p className="p-6 text-center text-ink-500 text-sm">لا توجد مناطق شحن. أضيفي منطقة جديدة.</p>}
      </div>

      <div className="text-xs text-ink-500">إجمالي المناطق: {zones.length} · متوسط السعر: {zones.length ? EGP(Math.round(zones.reduce((s, z) => s + z.price, 0) / zones.length)) : '-'}</div>

      <button onClick={save} className="btn-primary w-full sm:w-auto px-8 py-3"><Save className="h-4 w-4" /> حفظ مناطق الشحن</button>
    </div>
  );
}
