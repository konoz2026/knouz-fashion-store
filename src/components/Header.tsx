import { useEffect, useState } from 'react';
import { ShoppingBag, Menu, X, Sparkles, ShieldCheck, Phone } from 'lucide-react';
import { useStore } from '@/store/StoreContext';
import { EGP } from '@/lib/utils';

interface HeaderProps {
  onOpenCart: () => void;
  onOpenAdmin: () => void;
  onNavCategory: (id: string | 'all') => void;
  activeCategory: string | 'all';
}

export default function Header({ onOpenCart, onOpenAdmin, onNavCategory, activeCategory }: HeaderProps) {
  const { data, cartCount } = useStore();
  const { info, categories, offers } = data;
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-40">
      {/* Announcement bar */}
      <div className="bg-gradient-to-l from-primary-800 via-primary-700 to-primary-600 text-white">
        <div className="container-knz flex items-center justify-center gap-3 py-2 text-center text-xs sm:text-sm font-bold">
          <Sparkles className="h-4 w-4 shrink-0 animate-pulse-soft text-accent-300" />
          <span className="line-clamp-1">{info.announcement}</span>
        </div>
      </div>

      {/* Main header */}
      <div className={`transition-all duration-300 ${scrolled ? 'glass shadow-soft' : 'bg-cream-50/95'} backdrop-blur-md`}>
        <div className="container-knz flex items-center justify-between gap-3 py-3">
          {/* Logo */}
          <button onClick={() => onNavCategory('all')} className="flex items-center gap-3 group">
            <div className="relative h-12 w-12 shrink-0 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800 grid place-items-center shadow-soft ring-2 ring-accent-300/60">
              <span className="font-display font-black text-white text-xl">ك</span>
              <span className="absolute -bottom-1 -left-1 h-3 w-3 rounded-full bg-accent-400 ring-2 ring-white" />
            </div>
            <div className="text-right leading-tight">
              <div className="font-display text-xl sm:text-2xl font-black text-primary-800 group-hover:text-primary-700 transition drop-shadow-sm">
                {info.brandName}
              </div>
              <div className="text-[10px] sm:text-xs font-bold tracking-[0.25em] text-accent-600 [direction:ltr]">
                {info.brandNameEn}
              </div>
            </div>
          </button>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            <NavBtn active={activeCategory === 'all'} onClick={() => onNavCategory('all')}>الكل</NavBtn>
            {categories.map((c) => (
              <NavBtn key={c.id} active={activeCategory === c.id} onClick={() => onNavCategory(c.id)}>
                {c.name}
              </NavBtn>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <span className="hidden md:inline-flex chip bg-success-50 text-success-700 border border-success-400/40">
              <span className="h-2 w-2 rounded-full bg-success-500 animate-pulse-soft" />
              مفتوح 24 ساعة
            </span>
            <button onClick={onOpenAdmin} title="لوحة التحكم"
              className="hidden sm:grid place-items-center h-11 w-11 rounded-full bg-white border border-cream-200 text-ink-700 hover:text-primary-700 hover:border-primary-200 transition shadow-soft">
              <ShieldCheck className="h-5 w-5" />
            </button>
            <a href={`tel:${info.phone}`} title="اتصال"
              className="hidden sm:grid place-items-center h-11 w-11 rounded-full bg-white border border-cream-200 text-ink-700 hover:text-primary-700 hover:border-primary-200 transition shadow-soft">
              <Phone className="h-5 w-5" />
            </a>
            <button onClick={onOpenCart} className="relative grid place-items-center h-11 w-11 rounded-full bg-primary-700 text-white shadow-soft hover:bg-primary-800 transition">
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -left-1 min-w-5 h-5 px-1 rounded-full bg-accent-400 text-ink-950 text-[11px] font-black grid place-items-center ring-2 ring-white animate-scale-in">
                  {cartCount}
                </span>
              )}
            </button>
            <button onClick={() => setMenuOpen((v) => !v)} className="lg:hidden grid place-items-center h-11 w-11 rounded-full bg-white border border-cream-200 text-ink-700">
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="lg:hidden border-t border-cream-200 bg-white animate-fade-in">
            <nav className="container-knz flex flex-col py-2">
              <MobileNav active={activeCategory === 'all'} onClick={() => { onNavCategory('all'); setMenuOpen(false); }}>الكل</MobileNav>
              {categories.map((c) => (
                <MobileNav key={c.id} active={activeCategory === c.id} onClick={() => { onNavCategory(c.id); setMenuOpen(false); }}>
                  {c.name}
                </MobileNav>
              ))}
              <div className="flex gap-2 py-2">
                <button onClick={() => { onOpenAdmin(); setMenuOpen(false); }} className="btn-outline flex-1">لوحة التحكم</button>
                <a href={`tel:${info.phone}`} className="btn-outline flex-1">اتصال</a>
              </div>
            </nav>
          </div>
        )}
      </div>

      {/* secondary offer strip (desktop) */}
      {offers.enabled && (
        <div className="hidden md:block bg-accent-50/80 border-y border-accent-200/60">
          <div className="container-knz flex items-center justify-between py-1.5 text-xs font-bold text-accent-700">
            <span>عروض خاصة: {offers.title}</span>
            <span>أسعار تبدأ من {EGP(info.priceFrom)} — خصم {offers.globalDiscountPercent}%</span>
          </div>
        </div>
      )}
    </header>
  );
}

function NavBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick}
      className={`relative px-4 py-2 rounded-full text-sm font-bold transition ${active ? 'bg-primary-700 text-white shadow-soft' : 'text-ink-700 hover:bg-primary-50 hover:text-primary-700'}`}>
      {children}
    </button>
  );
}

function MobileNav({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick}
      className={`text-right px-4 py-3 rounded-2xl font-bold transition ${active ? 'bg-primary-50 text-primary-700' : 'text-ink-700 hover:bg-cream-100'}`}>
      {children}
    </button>
  );
}
