import { useState } from 'react';
import { Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';

interface AdminLoginProps {
  expected: string;
  onSuccess: () => void;
  onClose: () => void;
}

export default function AdminLogin({ expected, onSuccess, onClose }: AdminLoginProps) {
  const [val, setVal] = useState('');
  const [show, setShow] = useState(false);
  const [err, setErr] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (val === expected) { onSuccess(); }
    else { setErr(true); setVal(''); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="absolute inset-0 bg-ink-950/70 backdrop-blur-sm" />
      <div onClick={(e) => e.stopPropagation()} className="relative w-full max-w-sm card p-6 sm:p-8 animate-scale-in">
        <button onClick={onClose} className="absolute top-3 left-3 grid place-items-center h-10 w-10 rounded-full hover:bg-cream-100 text-ink-700">
          <ArrowRight className="h-5 w-5" />
        </button>
        <div className="text-center">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800 grid place-items-center shadow-soft ring-2 ring-accent-300/60">
            <Lock className="h-8 w-8 text-white" />
          </div>
          <h3 className="mt-4 font-display text-2xl font-black text-ink-900">لوحة التحكم</h3>
          <p className="mt-1 text-sm text-ink-500">أدخلي كلمة السر للدخول</p>
        </div>
        <form onSubmit={submit} className="mt-6">
          <div className="relative">
            <input
              type={show ? 'text' : 'password'}
              value={val}
              onChange={(e) => { setVal(e.target.value); setErr(false); }}
              autoFocus
              inputMode="numeric"
              placeholder="كلمة السر"
              className={`input-knz pl-11 text-center text-lg tracking-widest ${err ? 'border-error-500 ring-4 ring-error-50' : ''}`}
            />
            <button type="button" onClick={() => setShow((v) => !v)}
              className="absolute left-2 top-1/2 -translate-y-1/2 grid place-items-center h-9 w-9 rounded-full text-ink-500 hover:text-primary-700">
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {err && <p className="mt-2 text-sm font-bold text-error-600 text-center">كلمة السر غير صحيحة</p>}
          <button type="submit" className="btn-primary w-full mt-4 py-3">دخول</button>
        </form>
      </div>
    </div>
  );
}
