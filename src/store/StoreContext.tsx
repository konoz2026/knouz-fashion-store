import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type {
  AppData, CartItem, Category, Order, Product, ShippingZone, StoreInfo, OfferSettings,
} from '@/types';
import { seedData } from '@/data/seed';
import { deepClone, uid, orderRef } from '@/lib/utils';

const STORAGE_KEY = 'knouz_style_data_v2';
const CART_KEY = 'knouz_fashion_cart_v1';
const LEGACY_KEYS = ['knouz_fashion_data_v1'];

export interface Toast {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  message: string;
}

interface StoreCtx {
  data: AppData;
  cart: CartItem[];
  toasts: Toast[];
  // derived
  cartCount: number;
  cartSubtotal: number;
  cartDiscount: number;
  // toasts
  pushToast: (type: Toast['type'], message: string) => void;
  dismissToast: (id: string) => void;
  // cart ops
  addToCart: (productId: string, variantId: string, size: string, qty?: number) => void;
  updateCartQty: (key: string, qty: number) => void;
  removeFromCart: (key: string) => void;
  clearCart: () => void;
  // admin: data mutation
  setCategories: (c: Category[]) => void;
  setProducts: (p: Product[]) => void;
  setShippingZones: (z: ShippingZone[]) => void;
  setOffers: (o: OfferSettings) => void;
  setInfo: (i: StoreInfo) => void;
  addOrder: (o: Order) => void;
  updateOrderStatus: (id: string, status: Order['status']) => void;
  importData: (d: AppData) => void;
  resetData: () => void;
}

const Ctx = createContext<StoreCtx | null>(null);

function loadData(): AppData {
  try {
    let raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // migrate from legacy keys
      for (const k of LEGACY_KEYS) {
        raw = localStorage.getItem(k);
        if (raw) { localStorage.removeItem(k); break; }
      }
    }
    if (!raw) return deepClone(seedData);
    const parsed = JSON.parse(raw) as AppData;
    if (!parsed || !Array.isArray(parsed.products) || !parsed.info) return deepClone(seedData);
    // brand rename migration: refresh brand identity & hero fields if they still hold old values
    const i = parsed.info;
    if (i.brandNameEn === 'Knouz Fashion' || i.brandName === 'كنوز') {
      i.brandName = 'كنوز ستايل';
      i.brandNameEn = 'KNOUZ STYLE';
    }
    if (i.heroTitle === 'كنوز فاشن') i.heroTitle = 'كنوز ستايل';
    return parsed;
  } catch {
    return deepClone(seedData);
  }
}

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(() => loadData());
  const [cart, setCart] = useState<CartItem[]>(() => loadCart());
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch { /* ignore quota */ }
  }, [data]);

  useEffect(() => {
    try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch { /* ignore */ }
  }, [cart]);

  const dismissToast = useCallback((id: string) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const pushToast = useCallback((type: Toast['type'], message: string) => {
    const id = uid('t');
    setToasts((t) => [...t, { id, type, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  }, []);

  const addToCart = useCallback((productId: string, variantId: string, size: string, qty = 1) => {
    const key = `${productId}|${variantId}|${size}`;
    setCart((c) => {
      const existing = c.find((i) => i.key === key);
      if (existing) return c.map((i) => (i.key === key ? { ...i, qty: i.qty + qty } : i));
      return [...c, { key, productId, variantId, size, qty, addedAt: Date.now() }];
    });
  }, []);

  const updateCartQty = useCallback((key: string, qty: number) => {
    setCart((c) => c.map((i) => (i.key === key ? { ...i, qty: Math.max(1, qty) } : i)));
  }, []);

  const removeFromCart = useCallback((key: string) => {
    setCart((c) => c.filter((i) => i.key !== key));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const setCategories = useCallback((categories: Category[]) => setData((d) => ({ ...d, categories })), []);
  const setProducts = useCallback((products: Product[]) => setData((d) => ({ ...d, products })), []);
  const setShippingZones = useCallback((shippingZones: ShippingZone[]) => setData((d) => ({ ...d, shippingZones })), []);
  const setOffers = useCallback((offers: OfferSettings) => setData((d) => ({ ...d, offers })), []);
  const setInfo = useCallback((info: StoreInfo) => setData((d) => ({ ...d, info })), []);

  const addOrder = useCallback((order: Order) => {
    setData((d) => {
      // decrement stock
      const products = deepClone(d.products) as Product[];
      for (const line of order.lines) {
        const p = products.find((x) => x.id === line.productId);
        if (!p) continue;
        const v = p.variants.find((x) => x.id === line.variantId);
        if (!v) continue;
        const sz = v.sizes.find((x) => x.size === line.size);
        if (!sz) continue;
        sz.stock = Math.max(0, sz.stock - line.qty);
      }
      return { ...d, products, orders: [order, ...d.orders] };
    });
  }, []);

  const updateOrderStatus = useCallback((id: string, status: Order['status']) => {
    setData((d) => {
      const orders = d.orders.map((o) => (o.id === id ? { ...o, status } : o));
      // if cancelled, restore stock
      if (status === 'cancelled') {
        const order = d.orders.find((o) => o.id === id);
        if (order && order.status !== 'cancelled') {
          const products = deepClone(d.products) as Product[];
          for (const line of order.lines) {
            const p = products.find((x) => x.id === line.productId);
            if (!p) continue;
            const v = p.variants.find((x) => x.id === line.variantId);
            if (!v) continue;
            const sz = v.sizes.find((x) => x.size === line.size);
            if (!sz) continue;
            sz.stock += line.qty;
          }
          return { ...d, products, orders };
        }
      }
      return { ...d, orders };
    });
  }, []);

  const importData = useCallback((incoming: AppData) => setData(incoming), []);
  const resetData = useCallback(() => setData(deepClone(seedData)), []);

  const { cartCount, cartSubtotal, cartDiscount } = useMemo(() => {
    let count = 0;
    let subtotal = 0;
    for (const item of cart) {
      const p = data.products.find((x) => x.id === item.productId);
      if (!p) continue;
      count += item.qty;
      subtotal += p.price * item.qty;
    }
    // global discount applied on subtotal (already reflected per product price for product offers,
    // global discount applies on top for items not already discounted)
    let discount = 0;
    if (data.offers.globalDiscountPercent > 0) {
      for (const item of cart) {
        const p = data.products.find((x) => x.id === item.productId);
        if (!p) continue;
        if (!p.oldPrice) { // not already on individual offer
          const d = (p.price * data.offers.globalDiscountPercent / 100) * item.qty;
          discount += d;
        }
      }
    }
    return { cartCount: count, cartSubtotal: subtotal, cartDiscount: Math.round(discount) };
  }, [cart, data.products, data.offers.globalDiscountPercent]);

  const value: StoreCtx = {
    data, cart, toasts,
    cartCount, cartSubtotal, cartDiscount,
    pushToast, dismissToast,
    addToCart, updateCartQty, removeFromCart, clearCart,
    setCategories, setProducts, setShippingZones, setOffers, setInfo,
    addOrder, updateOrderStatus, importData, resetData,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): StoreCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}

export { orderRef };
