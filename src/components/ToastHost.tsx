import { CheckCircle2, Info, AlertTriangle, XCircle, X } from 'lucide-react';
import { useStore } from '@/store/StoreContext';

export default function ToastHost() {
  const { toasts, dismissToast } = useStore();
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] flex flex-col gap-2 w-[92vw] max-w-sm pointer-events-none">
      {toasts.map((t) => {
        const Icon = t.type === 'success' ? CheckCircle2 : t.type === 'warning' ? AlertTriangle : t.type === 'error' ? XCircle : Info;
        const tone =
          t.type === 'success' ? 'bg-success-600' :
          t.type === 'warning' ? 'bg-warning-500 text-ink-950' :
          t.type === 'error' ? 'bg-error-600' : 'bg-ink-900';
        return (
          <div key={t.id} className={`pointer-events-auto flex items-center gap-3 rounded-2xl ${tone} text-white px-4 py-3 shadow-lift animate-fade-down`}>
            <Icon className="h-5 w-5 shrink-0" />
            <span className="flex-1 text-sm font-bold">{t.message}</span>
            <button onClick={() => dismissToast(t.id)} className="opacity-80 hover:opacity-100"><X className="h-4 w-4" /></button>
          </div>
        );
      })}
    </div>
  );
}
