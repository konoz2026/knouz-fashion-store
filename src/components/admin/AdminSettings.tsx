import { useRef, useState } from 'react';
import { Save, Download, Upload, RotateCcw, Lock } from 'lucide-react';
import { useStore } from '@/store/StoreContext';
import type { AppData, StoreInfo } from '@/types';
import { downloadFile, readFileText, deepClone } from '@/lib/utils';
import { seedData } from '@/data/seed';

export default function AdminSettings() {
  const { data, setInfo, importData, resetData, pushToast } = useStore();
  const [form, setForm] = useState<StoreInfo>(data.info);
  const [newPass, setNewPass] = useState('');
  const importRef = useRef<HTMLInputElement>(null);

  const saveInfo = () => {
    const info = { ...form, adminPassword: newPass.trim() ? newPass.trim() : form.adminPassword };
    setInfo(info);
    setForm(info);
    setNewPass('');
    pushToast('success', 'تم حفظ الإعدادات العامة');
  };

  const exportBackup = () => {
    downloadFile(`knouz_backup_${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(data, null, 2));
    pushToast('success', 'تم تصدير نسخة احتياطية');
  };

  const importBackup = async (file: File) => {
    try {
      const text = await readFileText(file);
      const parsed = JSON.parse(text) as AppData;
      if (!parsed.info || !Array.isArray(parsed.products)) throw new Error('ملف غير صالح');
      importData(parsed);
      setForm(parsed.info);
      pushToast('success', 'تم استيراد النسخة الاحتياطية بنجاح');
    } catch (e) {
      pushToast('error', `فشل استيراد الملف: ${(e as Error).message}`);
    } finally {
      if (importRef.current) importRef.current.value = '';
    }
  };

  const onReset = () => {
    if (confirm('هل أنت متأكدة من استعادة البيانات الافتراضية؟ سيتم فقدان كل التعديلات (يمكن استرجاعها من النسخة الاحتياطية).')) {
      resetData();
      setForm(deepClone(seedData.info));
      pushToast('info', 'تمت استعادة البيانات الافتراضية');
    }
  };

  return (
    <div className="space-y-5">
      <h3 className="font-display font-black text-lg text-ink-900">الإعدادات العامة</h3>

      <div className="card p-4 sm:p-5 space-y-4">
        <h4 className="font-bold text-ink-900">بيانات المتجر</h4>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="اسم البراند" value={form.brandName} onChange={(v) => setForm({ ...form, brandName: v })} />
          <Field label="الاسم الإنجليزي" value={form.brandNameEn} onChange={(v) => setForm({ ...form, brandNameEn: v })} />
          <Field label="الشعار النصي" value={form.tagline} onChange={(v) => setForm({ ...form, tagline: v })} />
          <Field label="أقل سعر يبدأ منه" type="number" value={String(form.priceFrom)} onChange={(v) => setForm({ ...form, priceFrom: Number(v) || 0 })} />
        </div>
        <Field label="الشريط الإعلاني العلوي" value={form.announcement} onChange={(v) => setForm({ ...form, announcement: v })} />
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="عنوان الهيرو" value={form.heroTitle} onChange={(v) => setForm({ ...form, heroTitle: v })} />
          <Field label="العنوان الفرعي للهيرو" value={form.heroSubtitle} onChange={(v) => setForm({ ...form, heroSubtitle: v })} />
        </div>
        <Field label="رابط صورة الهيرو" value={form.heroImage} onChange={(v) => setForm({ ...form, heroImage: v })} />
      </div>

      <div className="card p-4 sm:p-5 space-y-4">
        <h4 className="font-bold text-ink-900">بيانات التواصل والفرع</h4>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="رقم الموبايل" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} ltr />
          <Field label="رقم واتساب" value={form.whatsapp} onChange={(v) => setForm({ ...form, whatsapp: v })} ltr />
          <Field label="رقم إنستا باي" value={form.instaPayNumber} onChange={(v) => setForm({ ...form, instaPayNumber: v })} ltr />
          <Field label="مواعيد العمل" value={form.workingHours} onChange={(v) => setForm({ ...form, workingHours: v })} />
        </div>
        <Field label="العنوان" value={form.address} onChange={(v) => setForm({ ...form, address: v })} />
        <Field label="رابط الموقع على الخريطة" value={form.locationUrl} onChange={(v) => setForm({ ...form, locationUrl: v })} ltr />
      </div>

      <div className="card p-4 sm:p-5 space-y-4">
        <h4 className="font-bold text-ink-900">روابط التواصل الاجتماعي</h4>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="فيسبوك" value={form.facebook} onChange={(v) => setForm({ ...form, facebook: v })} ltr />
          <Field label="إنستجرام" value={form.instagram} onChange={(v) => setForm({ ...form, instagram: v })} ltr />
          <Field label="تيك توك" value={form.tiktok} onChange={(v) => setForm({ ...form, tiktok: v })} ltr />
          <Field label="تيليجرام" value={form.telegram} onChange={(v) => setForm({ ...form, telegram: v })} ltr />
        </div>
      </div>

      <div className="card p-4 sm:p-5 space-y-4">
        <h4 className="font-bold text-ink-900 flex items-center gap-2"><Lock className="h-5 w-5 text-primary-700" /> الأمان</h4>
        <div>
          <label className="label-knz">تغيير كلمة سر لوحة التحكم</label>
          <div className="flex gap-2">
            <input className="input-knz" type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} placeholder="اتركيها فارغة لعدم التغيير" />
          </div>
          <p className="mt-1 text-xs text-ink-500">كلمة السر الحالية: {form.adminPassword}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={saveInfo} className="btn-primary px-8 py-3"><Save className="h-4 w-4" /> حفظ الإعدادات</button>
      </div>

      <div className="card p-4 sm:p-5 space-y-3">
        <h4 className="font-bold text-ink-900">النسخ الاحتياطي</h4>
        <p className="text-sm text-ink-500">صدّري كل بيانات المتجر (الأقسام، المنتجات، الطلبات، الإعدادات) كملف JSON، أو استرجعي نسخة سابقة. يُنصح بتصدير نسخة دوريًا.</p>
        <div className="flex flex-wrap gap-2">
          <button onClick={exportBackup} className="btn-outline px-5 py-2.5"><Download className="h-4 w-4" /> تصدير نسخة احتياطية</button>
          <label className="btn-outline px-5 py-2.5 cursor-pointer">
            <Upload className="h-4 w-4" /> استيراد نسخة
            <input ref={importRef} type="file" accept=".json" className="hidden" onChange={(e) => e.target.files?.[0] && importBackup(e.target.files[0])} />
          </label>
          <button onClick={onReset} className="btn px-5 py-2.5 bg-error-50 text-error-700 hover:bg-error-100 border border-error-200"><RotateCcw className="h-4 w-4" /> استعادة الافتراضي</button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', ltr }: { label: string; value: string; onChange: (v: string) => void; type?: string; ltr?: boolean }) {
  return (
    <div>
      <label className="label-knz">{label}</label>
      <input type={type} className={`input-knz ${ltr ? '[direction:ltr] text-left' : ''}`} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
