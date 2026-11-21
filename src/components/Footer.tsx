import { Phone, MessageCircle, MapPin, Facebook, Instagram, Clock, ShieldCheck, Mail } from 'lucide-react';
import { useStore } from '@/store/StoreContext';
import { waLink } from '@/lib/utils';

interface FooterProps {
  onOpenAdmin: () => void;
  onNavCategory: (id: string | 'all') => void;
}

export default function Footer({ onOpenAdmin, onNavCategory }: FooterProps) {
  const { data } = useStore();
  const { info, categories } = data;

  return (
    <footer className="mt-8 bg-ink-950 text-cream-100">
      <div className="container-knz py-12 grid gap-8 md:grid-cols-4">
        {/* Brand */}
        <div className="md:col-span-1">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-800 grid place-items-center ring-2 ring-accent-300/60">
              <span className="font-display font-black text-white text-xl">ك</span>
            </div>
            <div>
              <div className="font-display text-2xl font-black text-white">{info.brandName}</div>
              <div className="text-xs font-bold tracking-widest text-accent-300">{info.brandNameEn}</div>
            </div>
          </div>
          <p className="mt-4 text-sm text-cream-200/80 leading-relaxed">{info.tagline} — متجر إلكتروني فاخر للأزياء الحريمي العصرية بأرقى التفاصيل وأفضل الأسعار.</p>
          <div className="mt-4 flex gap-2">
            <Social href={info.facebook} label="فيسبوك"><Facebook className="h-5 w-5" /></Social>
            <Social href={info.instagram} label="إنستجرام"><Instagram className="h-5 w-5" /></Social>
            <Social href={`https://wa.me/${info.whatsapp.replace(/[^\d]/g, '')}`} label="واتساب"><MessageCircle className="h-5 w-5" /></Social>
            <Social href={info.telegram} label="تيليجرام"><Mail className="h-5 w-5" /></Social>
          </div>
        </div>

        {/* Links */}
        <div>
          <h4 className="font-display font-black text-white mb-3">روابط سريعة</h4>
          <ul className="space-y-2 text-sm">
            <li><button onClick={() => onNavCategory('all')} className="hover:text-accent-300 transition">كل المنتجات</button></li>
            {categories.map((c) => (
              <li key={c.id}><button onClick={() => onNavCategory(c.id)} className="hover:text-accent-300 transition">{c.name}</button></li>
            ))}
            <li><a href="#offers" className="hover:text-accent-300 transition">العروض والخصومات</a></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-display font-black text-white mb-3">تواصلي معنا</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2"><MapPin className="h-4 w-4 text-accent-300 mt-0.5 shrink-0" /><span>{info.address}</span></li>
            <li className="flex items-center gap-2"><Clock className="h-4 w-4 text-accent-300 shrink-0" /><span>{info.workingHours}</span></li>
            <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-accent-300 shrink-0" /><a dir="ltr" href={`tel:${info.phone}`} className="hover:text-accent-300 transition">{info.phone}</a></li>
            <li className="flex items-center gap-2"><MessageCircle className="h-4 w-4 text-accent-300 shrink-0" /><a href={waLink(info.whatsapp, 'مرحبًا كنوز ستايل، أريد الاستفسار عن منتجاتكم')} target="_blank" rel="noreferrer" className="hover:text-accent-300 transition">واتساب مباشر</a></li>
          </ul>
        </div>

        {/* Location + admin */}
        <div>
          <h4 className="font-display font-black text-white mb-3">الفرع</h4>
          <a href={info.locationUrl} target="_blank" rel="noreferrer"
            className="block rounded-2xl bg-white/5 border border-white/10 p-3 hover:bg-white/10 transition">
            <div className="flex items-center gap-2 text-accent-300 font-bold text-sm"><MapPin className="h-4 w-4" /> عرض الموقع على الخريطة</div>
            <p className="mt-1 text-xs text-cream-200/80">{info.address}</p>
          </a>
          <button onClick={onOpenAdmin} className="mt-4 w-full btn-outline border-white/20 text-white hover:bg-white/10 hover:border-white/40">
            <ShieldCheck className="h-4 w-4" /> لوحة التحكم
          </button>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-knz py-4 text-center text-xs text-cream-200/70">
          © {new Date().getFullYear()} {info.brandName} — {info.brandNameEn}. جميع الحقوق محفوظة.
        </div>
      </div>
    </footer>
  );
}

function Social({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" aria-label={label}
      className="grid place-items-center h-10 w-10 rounded-full bg-white/10 hover:bg-accent-400 hover:text-ink-950 transition">
      {children}
    </a>
  );
}
