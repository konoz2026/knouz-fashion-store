import { useMemo } from 'react';
import { ShoppingBag, TrendingUp, Package, AlertTriangle, Clock, CheckCircle2, Truck, XCircle } from 'lucide-react';
import { useStore } from '@/store/StoreContext';
import { EGP, productStock, formatDate } from '@/lib/utils';
import type { OrderStatus } from '@/types';

export default function AdminStats() {
  const { data } = useStore();
  const { orders, products } = data;

  const stats = useMemo(() => {
    const newOrders = orders.filter((o) => o.status === 'new').length;
    const sales = orders.filter((o) => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0);
    const lowStock = products.filter((p) => { const s = productStock(p); return s > 0 && s <= 4; }).length;
    const outStock = products.filter((p) => productStock(p) === 0).length;
    return { newOrders, sales, productCount: products.length, lowStock, outStock };
  }, [orders, products]);

  const recent = orders.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard icon={<ShoppingBag />} label="طلبات جديدة" value={String(stats.newOrders)} tone="primary" />
        <StatCard icon={<TrendingUp />} label="إجمالي المبيعات" value={EGP(stats.sales)} tone="accent" />
        <StatCard icon={<Package />} label="عدد المنتجات" value={String(stats.productCount)} tone="ink" />
        <StatCard icon={<AlertTriangle />} label="تنبيهات المخزون" value={String(stats.lowStock + stats.outStock)} tone="warning" />
      </div>

      {/* Low stock list */}
      <div className="card p-4 sm:p-5">
        <h3 className="font-display font-black text-ink-900 flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-warning-600" /> تنبيهات المخزون المنخفض</h3>
        <div className="mt-3 space-y-2">
          {products.filter((p) => { const s = productStock(p); return s > 0 && s <= 4; }).map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded-xl bg-warning-50 border border-warning-200/60 p-2.5">
              <span className="font-bold text-sm text-ink-800">{p.name}</span>
              <span className="chip bg-warning-500 text-white">باقي {productStock(p)} قطع</span>
            </div>
          ))}
          {products.filter((p) => productStock(p) === 0).map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded-xl bg-error-50 border border-error-200/60 p-2.5">
              <span className="font-bold text-sm text-ink-800">{p.name}</span>
              <span className="chip bg-error-500 text-white">نفذت الكمية</span>
            </div>
          ))}
          {stats.lowStock === 0 && stats.outStock === 0 && (
            <p className="text-sm text-ink-500 py-2">لا توجد تنبيهات حاليًا — كل المنتجات متوفرة بكميات جيدة.</p>
          )}
        </div>
      </div>

      {/* Recent orders */}
      <div className="card p-4 sm:p-5">
        <h3 className="font-display font-black text-ink-900 flex items-center gap-2"><Clock className="h-5 w-5 text-primary-700" /> أحدث الطلبات</h3>
        <div className="mt-3 space-y-2">
          {recent.length === 0 ? (
            <p className="text-sm text-ink-500 py-2">لا توجد طلبات بعد.</p>
          ) : recent.map((o) => (
            <div key={o.id} className="flex items-center justify-between rounded-xl bg-cream-100/60 p-3">
              <div className="min-w-0">
                <div className="font-bold text-sm text-ink-900">{o.ref} — {o.customerName}</div>
                <div className="text-xs text-ink-500">{formatDate(o.createdAt)}</div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="font-display font-black text-primary-700">{EGP(o.total)}</span>
                <StatusBadge status={o.status} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string; tone: 'primary' | 'accent' | 'ink' | 'warning' }) {
  const tones = {
    primary: 'from-primary-600 to-primary-800',
    accent: 'from-accent-400 to-accent-600',
    ink: 'from-ink-700 to-ink-900',
    warning: 'from-warning-400 to-warning-600',
  };
  return (
    <div className="card p-4 sm:p-5 relative overflow-hidden">
      <div className={`absolute -top-6 -left-6 h-20 w-20 rounded-full bg-gradient-to-br ${tones[tone]} opacity-15`} />
      <div className={`grid place-items-center h-11 w-11 rounded-2xl bg-gradient-to-br ${tones[tone]} text-white shadow-soft`}>
        {icon}
      </div>
      <div className="mt-3 text-xs font-bold text-ink-500">{label}</div>
      <div className="font-display text-xl sm:text-2xl font-black text-ink-900 truncate">{value}</div>
    </div>
  );
}

export function StatusBadge({ status }: { status: OrderStatus }) {
  const map: Record<OrderStatus, { label: string; cls: string; icon: React.ReactNode }> = {
    new: { label: 'جديد', cls: 'bg-primary-100 text-primary-700', icon: <Clock className="h-3 w-3" /> },
    preparing: { label: 'جاري التجهيز', cls: 'bg-accent-100 text-accent-700', icon: <Clock className="h-3 w-3" /> },
    shipped: { label: 'تم الشحن', cls: 'bg-ink-100 text-ink-700', icon: <Truck className="h-3 w-3" /> },
    completed: { label: 'مكتمل', cls: 'bg-success-50 text-success-700', icon: <CheckCircle2 className="h-3 w-3" /> },
    cancelled: { label: 'ملغي', cls: 'bg-error-50 text-error-700', icon: <XCircle className="h-3 w-3" /> },
  };
  const m = map[status];
  return <span className={`chip ${m.cls}`}>{m.icon}{m.label}</span>;
}
