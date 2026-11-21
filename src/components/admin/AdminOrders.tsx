import { useState } from 'react';
import { Eye, X, Search } from 'lucide-react';
import { useStore } from '@/store/StoreContext';
import type { Order, OrderStatus } from '@/types';
import { EGP, formatDate } from '@/lib/utils';
import { StatusBadge } from '@/components/admin/AdminStats';

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: 'new', label: 'جديد' },
  { value: 'preparing', label: 'جاري التجهيز' },
  { value: 'shipped', label: 'تم الشحن' },
  { value: 'completed', label: 'مكتمل' },
  { value: 'cancelled', label: 'ملغي' },
];

export default function AdminOrders() {
  const { data, updateOrderStatus, pushToast } = useStore();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');
  const [view, setView] = useState<Order | null>(null);

  const filtered = data.orders.filter((o) => {
    if (filter !== 'all' && o.status !== filter) return false;
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return o.customerName.toLowerCase().includes(q) || o.phone.includes(q) || o.ref.toLowerCase().includes(q);
  });

  const changeStatus = (id: string, status: OrderStatus) => {
    updateOrderStatus(id, status);
    pushToast('success', `تم تحديث حالة الطلب إلى: ${STATUS_OPTIONS.find((s) => s.value === status)?.label}`);
  };

  return (
    <div className="space-y-4">
      <h3 className="font-display font-black text-lg text-ink-900">إدارة الطلبات ({data.orders.length})</h3>

      <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
          <input className="input-knz pr-9 py-2 text-sm" placeholder="ابحثي بالاسم أو الموبايل أو رقم الطلب..." value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <select className="input-knz py-2 text-sm w-auto" value={filter} onChange={(e) => setFilter(e.target.value as OrderStatus | 'all')}>
          <option value="all">كل الحالات</option>
          {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="card p-10 text-center text-ink-500">
          <p className="font-bold">لا توجد طلبات مطابقة</p>
          <p className="text-sm mt-1">ستظهر الطلبات الجديدة هنا فور إرسالها من المتجر</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((o) => (
            <div key={o.id} className="card p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-display font-black text-ink-900">{o.ref}</span>
                  <StatusBadge status={o.status} />
                  {o.paymentMethod === 'instapay' && <span className="chip bg-accent-100 text-accent-700">إنستا باي{o.instapayReceiptAttached ? ' + إيصال' : ''}</span>}
                </div>
                <div className="mt-1 text-sm text-ink-700 font-bold">{o.customerName} · <span dir="ltr">{o.phone}</span></div>
                <div className="text-xs text-ink-500">{o.governorate} · {formatDate(o.createdAt)}</div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="font-display font-black text-primary-700">{EGP(o.total)}</span>
                <button onClick={() => setView(o)} className="grid place-items-center h-9 w-9 rounded-full bg-primary-50 text-primary-700 hover:bg-primary-100"><Eye className="h-4 w-4" /></button>
                <select value={o.status} onChange={(e) => changeStatus(o.id, e.target.value as OrderStatus)} className="input-knz py-1.5 text-xs w-auto">
                  {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}

      {view && <OrderDetailModal order={view} onClose={() => setView(null)} />}
    </div>
  );
}

function OrderDetailModal({ order, onClose }: { order: Order; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in" onClick={onClose}>
      <div className="absolute inset-0 bg-ink-950/70 backdrop-blur-sm" />
      <div onClick={(e) => e.stopPropagation()} className="relative bg-cream-50 w-full sm:max-w-lg max-h-[92vh] overflow-y-auto rounded-t-4xl sm:rounded-4xl shadow-lift animate-scale-in">
        <div className="sticky top-0 flex items-center justify-between p-4 bg-white border-b border-cream-200">
          <div>
            <h4 className="font-display font-black text-ink-900">طلب {order.ref}</h4>
            <div className="text-xs text-ink-500">{formatDate(order.createdAt)}</div>
          </div>
          <button onClick={onClose} className="grid place-items-center h-10 w-10 rounded-full hover:bg-cream-100"><X className="h-5 w-5" /></button>
        </div>
        <div className="p-4 space-y-3 text-sm">
          <Row label="العميلة" value={order.customerName} />
          <Row label="الموبايل" value={order.phone} ltr />
          <Row label="المحافظة" value={order.governorate} />
          <Row label="العنوان" value={order.address} />
          {order.notes && <Row label="ملاحظات" value={order.notes} />}
          <Row label="وسيلة الدفع" value={order.paymentMethod === 'cod' ? 'الدفع عند الاستلام' : `تحويل إنستا باي${order.instapayReceiptAttached ? ' (إيصال مرفق)' : ''}`} />

          <div className="border-t border-cream-200 pt-3">
            <div className="font-bold mb-2">المنتجات:</div>
            <div className="space-y-2">
              {order.lines.map((l, i) => (
                <div key={i} className="rounded-xl bg-white border border-cream-200 p-2.5">
                  <div className="font-bold">{l.productName} <span className="text-ink-400 font-normal">— {l.categoryName}</span></div>
                  <div className="text-xs text-ink-500">المقاس: {l.size} · اللون: {l.color} · العدد: {l.qty} · السعر: {EGP(l.unitPrice)}</div>
                  <div className="text-sm font-bold text-primary-700 mt-0.5">{EGP(l.lineTotal)}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-cream-200 pt-3 space-y-1">
            <Row label="إجمالي المنتجات" value={EGP(order.subtotal)} />
            {order.discount > 0 && <Row label="الخصم" value={`- ${EGP(order.discount)}`} />}
            <Row label="الشحن" value={order.shipping === 0 ? 'مجاني' : EGP(order.shipping)} />
            <div className="flex items-center justify-between pt-2 border-t border-cream-200">
              <span className="font-bold">الإجمالي</span>
              <span className="font-display font-black text-xl text-primary-700">{EGP(order.total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, ltr }: { label: string; value: string; ltr?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-ink-500 shrink-0">{label}</span>
      <span className={`font-bold text-ink-900 text-left ${ltr ? '[direction:ltr]' : ''}`}>{value}</span>
    </div>
  );
}
