import { useState } from 'react';
import { X, LayoutDashboard, FolderTree, Package, ShoppingCart, Tag, Truck, Settings, LogOut as Logout, Bell } from 'lucide-react';
import { useStore } from '@/store/StoreContext';
import { productStock } from '@/lib/utils';
import AdminStats from '@/components/admin/AdminStats';
import AdminCategories from '@/components/admin/AdminCategories';
import AdminProducts from '@/components/admin/AdminProducts';
import AdminOrders from '@/components/admin/AdminOrders';
import AdminOffers from '@/components/admin/AdminOffers';
import AdminShipping from '@/components/admin/AdminShipping';
import AdminSettings from '@/components/admin/AdminSettings';

type Tab = 'stats' | 'categories' | 'products' | 'orders' | 'offers' | 'shipping' | 'settings';

interface AdminPanelProps {
  onClose: () => void;
}

export default function AdminPanel({ onClose }: AdminPanelProps) {
  const { data } = useStore();
  const [tab, setTab] = useState<Tab>('stats');
  const [showNotif, setShowNotif] = useState(false);

  const newOrders = data.orders.filter((o) => o.status === 'new').length;
  const lowStockItems = data.products.filter((p) => { const s = productStock(p); return s > 0 && s <= 4; });
  const outStockItems = data.products.filter((p) => productStock(p) === 0);
  const notifCount = newOrders + lowStockItems.length + outStockItems.length;

  const tabs: { id: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'stats', label: 'الإحصائيات', icon: <LayoutDashboard className="h-5 w-5" /> },
    { id: 'orders', label: 'الطلبات', icon: <ShoppingCart className="h-5 w-5" />, badge: newOrders },
    { id: 'products', label: 'المنتجات', icon: <Package className="h-5 w-5" /> },
    { id: 'categories', label: 'الأقسام', icon: <FolderTree className="h-5 w-5" /> },
    { id: 'offers', label: 'العروض', icon: <Tag className="h-5 w-5" /> },
    { id: 'shipping', label: 'الشحن', icon: <Truck className="h-5 w-5" /> },
    { id: 'settings', label: 'الإعدادات', icon: <Settings className="h-5 w-5" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-cream-50 flex flex-col animate-fade-in">
      {/* Top bar */}
      <div className="bg-white border-b border-cream-200 shadow-soft">
        <div className="container-knz flex items-center justify-between gap-3 py-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary-600 to-primary-800 grid place-items-center text-white font-display font-black">ك</div>
            <div>
              <div className="font-display font-black text-ink-900">لوحة تحكم كنوز</div>
              <div className="text-xs text-ink-500">إدارة المتجر والطلبات</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <button onClick={() => setShowNotif((v) => !v)} className="relative grid place-items-center h-11 w-11 rounded-full bg-cream-100 text-ink-700 hover:bg-cream-200 transition">
                <Bell className="h-5 w-5" />
                {notifCount > 0 && <span className="absolute -top-1 -left-1 min-w-5 h-5 px-1 rounded-full bg-error-500 text-white text-[11px] font-black grid place-items-center ring-2 ring-white">{notifCount}</span>}
              </button>
              {showNotif && (
                <div className="absolute left-0 mt-2 w-72 card p-3 shadow-lift z-10 animate-scale-in origin-top-left">
                  <div className="font-bold text-sm mb-2">الإشعارات</div>
                  <div className="space-y-1.5 max-h-72 overflow-y-auto text-sm">
                    {newOrders === 0 && lowStockItems.length === 0 && outStockItems.length === 0 && (
                      <p className="text-ink-500 py-2">لا توجد إشعارات جديدة.</p>
                    )}
                    {newOrders > 0 && <NotifItem tone="primary">طلب جديد بانتظار المراجعة ({newOrders})</NotifItem>}
                    {lowStockItems.map((p) => <NotifItem key={p.id} tone="warning">المخزون منخفض: {p.name} — باقي {productStock(p)} قطع</NotifItem>)}
                    {outStockItems.map((p) => <NotifItem key={p.id} tone="error">نفذت الكمية: {p.name}</NotifItem>)}
                  </div>
                </div>
              )}
            </div>
            <button onClick={onClose} className="btn-outline px-4 py-2.5 text-sm"><Logout className="h-4 w-4" /> خروج</button>
            <button onClick={onClose} className="grid place-items-center h-11 w-11 rounded-full bg-cream-100 text-ink-700 lg:hidden"><X className="h-5 w-5" /></button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-16 lg:w-60 shrink-0 bg-white border-l border-cream-200 overflow-y-auto py-3">
          <nav className="flex flex-col gap-1 px-2">
            {tabs.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-3 rounded-2xl px-3 py-3 font-bold text-sm transition ${tab === t.id ? 'bg-primary-700 text-white shadow-soft' : 'text-ink-700 hover:bg-cream-100'}`}>
                <span className="shrink-0">{t.icon}</span>
                <span className="hidden lg:block flex-1 text-right">{t.label}</span>
                {!!t.badge && t.badge > 0 && <span className="min-w-5 h-5 px-1 rounded-full bg-accent-400 text-ink-950 text-[11px] font-black grid place-items-center">{t.badge}</span>}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="container-knz max-w-5xl">
            {tab === 'stats' && <AdminStats />}
            {tab === 'categories' && <AdminCategories />}
            {tab === 'products' && <AdminProducts />}
            {tab === 'orders' && <AdminOrders />}
            {tab === 'offers' && <AdminOffers />}
            {tab === 'shipping' && <AdminShipping />}
            {tab === 'settings' && <AdminSettings />}
          </div>
        </main>
      </div>
    </div>
  );
}

function NotifItem({ children, tone }: { children: React.ReactNode; tone: 'primary' | 'warning' | 'error' }) {
  const tones = { primary: 'bg-primary-50 text-primary-700', warning: 'bg-warning-50 text-warning-700', error: 'bg-error-50 text-error-700' };
  return <div className={`rounded-xl p-2 ${tones[tone]}`}>{children}</div>;
}
