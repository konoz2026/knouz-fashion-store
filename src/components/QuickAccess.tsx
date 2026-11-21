import { Phone, MessageCircle, MapPin } from 'lucide-react';
import { useStore } from '@/store/StoreContext';
import { waLink } from '@/lib/utils';

export default function QuickAccess() {
  const { data } = useStore();
  const { info } = data;
  const phone = info.phone.replace(/[^\d]/g, '');

  return (
    <div className="fixed bottom-4 right-4 z-30 flex flex-col gap-2.5 safe-bottom">
      <a href={`tel:${phone}`} aria-label="اتصال"
        className="group grid place-items-center h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-primary-700 text-white shadow-lift hover:bg-primary-800 transition hover:scale-105">
        <Phone className="h-5 w-5 sm:h-6 sm:w-6" />
        <span className="pointer-events-none absolute right-full mr-3 whitespace-nowrap rounded-lg bg-ink-900 px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition hidden sm:block">اتصال مباشر</span>
      </a>
      <a href={waLink(info.whatsapp, 'مرحبًا كنوز ستايل، أريد الاستفسار عن منتجاتكم')} target="_blank" rel="noreferrer" aria-label="واتساب"
        className="group grid place-items-center h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-success-500 text-white shadow-lift hover:bg-success-600 transition hover:scale-105">
        <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6" />
        <span className="pointer-events-none absolute right-full mr-3 whitespace-nowrap rounded-lg bg-ink-900 px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition hidden sm:block">واتساب</span>
      </a>
      <a href={info.locationUrl} target="_blank" rel="noreferrer" aria-label="الموقع"
        className="group grid place-items-center h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-accent-400 text-ink-950 shadow-lift hover:bg-accent-500 transition hover:scale-105">
        <MapPin className="h-5 w-5 sm:h-6 sm:w-6" />
        <span className="pointer-events-none absolute right-full mr-3 whitespace-nowrap rounded-lg bg-ink-900 px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition hidden sm:block">الموقع على الخريطة</span>
      </a>
    </div>
  );
}
