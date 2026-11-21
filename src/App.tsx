import { useEffect, useMemo, useState } from 'react';
import { StoreProvider, useStore } from '@/store/StoreContext';
import { productStock } from '@/lib/utils';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import CategorySection from '@/components/CategorySection';
import OffersSection from '@/components/OffersSection';
import ProductsSection from '@/components/ProductsSection';
import Footer from '@/components/Footer';
import QuickAccess from '@/components/QuickAccess';
import ToastHost from '@/components/ToastHost';
import CartDrawer from '@/components/CartDrawer';
import ProductModal from '@/components/ProductModal';
import AdminLogin from '@/components/admin/AdminLogin';
import AdminPanel from '@/components/admin/AdminPanel';
import { Bell, X } from 'lucide-react';
import type { Product } from '@/types';

function Storefront() {
  const { data, cart, toasts, pushToast } = useStore();
  const [activeCategory, setActiveCategory] = useState<string | 'all'>('all');
  const [cartOpen, setCartOpen] = useState(false);
  const [adminMode, setAdminMode] = useState<'closed' | 'login' | 'panel'>('closed');
  const [productOpen, setProductOpen] = useState<Product | null>(null);
  const [newOrderSeen, setNewOrderSeen] = useState(0);
  const [showOrderBanner, setShowOrderBanner] = useState(false);

  const productCountByCat = useMemo(() => {
    const map: Record<string, number> = {};
    for (const p of data.products) map[p.categoryId] = (map[p.categoryId] ?? 0) + 1;
    return map;
  }, [data.products]);

  const newOrdersCount = data.orders.filter((o) => o.status === 'new').length;

  // New order notification
  useEffect(() => {
    if (newOrdersCount > newOrderSeen && newOrderSeen !== 0) {
      setShowOrderBanner(true);
      pushToast('success', `طلب جديد! لديك ${newOrdersCount - newOrderSeen} طلب بانتظار المراجعة`);
    }
    setNewOrderSeen(newOrdersCount);
  }, [newOrdersCount, newOrderSeen, pushToast]);

  // Low stock notifications (once per session per product)
  const [lowStockNotified, setLowStockNotified] = useState<Set<string>>(new Set());
  useEffect(() => {
    data.products.forEach((p) => {
      const stock = productStock(p);
      const key = p.id;
      if (stock > 0 && stock <= 4 && !lowStockNotified.has(key)) {
        pushToast('warning', `المخزون منخفض: ${p.name} — باقي ${stock} قطع`);
        setLowStockNotified((s) => new Set(s).add(key));
      } else if (stock > 4 && lowStockNotified.has(key)) {
        setLowStockNotified((s) => { const n = new Set(s); n.delete(key); return n; });
      }
    });
  }, [data.products, lowStockNotified, pushToast]);

  const openProduct = (id: string) => {
    const p = data.products.find((x) => x.id === id);
    if (p) setProductOpen(p);
  };

  const navCategory = (id: string | 'all') => {
    setActiveCategory(id);
    const el = document.getElementById('products');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const goOffers = () => {
    const el = document.getElementById('offers');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const goShop = () => navCategory('all');

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        onOpenCart={() => setCartOpen(true)}
        onOpenAdmin={() => setAdminMode('login')}
        onNavCategory={navCategory}
        activeCategory={activeCategory}
      />

      {/* New order banner */}
      {showOrderBanner && (
        <div className="bg-gradient-to-l from-success-600 to-success-500 text-white px-4 py-2 text-center text-sm font-bold flex items-center justify-center gap-3 animate-fade-down">
          <Bell className="h-4 w-4" />
          <span>تنبيه: طلب جديد في انتظار المراجعة في لوحة التحكم</span>
          <button onClick={() => setShowOrderBanner(false)} className="opacity-80 hover:opacity-100"><X className="h-4 w-4" /></button>
        </div>
      )}

      <main className="flex-1">
        <Hero onShop={goShop} onOffers={goOffers} />
        <CategorySection categories={data.categories} productCountByCat={productCountByCat} onSelect={navCategory} />
        <OffersSection onProductClick={openProduct} />
        <ProductsSection activeCategory={activeCategory} onCategoryChange={setActiveCategory} onProductClick={openProduct} />
      </main>

      <Footer onOpenAdmin={() => setAdminMode('login')} onNavCategory={navCategory} />
      <QuickAccess />

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      {productOpen && <ProductModal product={productOpen} onClose={() => setProductOpen(null)} onAdded={() => setCartOpen(true)} />}

      {adminMode === 'login' && (
        <AdminLogin expected={data.info.adminPassword} onSuccess={() => setAdminMode('panel')} onClose={() => setAdminMode('closed')} />
      )}
      {adminMode === 'panel' && <AdminPanel onClose={() => setAdminMode('closed')} />}

      <ToastHost />
      {/* keep toasts referenced to avoid tree-shake warnings */}
      <span className="hidden">{toasts.length}{cart.length}</span>
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <Storefront />
    </StoreProvider>
  );
}
