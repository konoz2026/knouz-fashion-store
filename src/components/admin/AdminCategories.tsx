import { useState } from 'react';
import { Plus, Pencil, Trash2, X, Image as ImageIcon, Save } from 'lucide-react';
import { useStore } from '@/store/StoreContext';
import type { Category } from '@/types';
import { uid, readDataUrl } from '@/lib/utils';

export default function AdminCategories() {
  const { data, setCategories, pushToast } = useStore();
  const [editing, setEditing] = useState<Category | null>(null);
  const [creating, setCreating] = useState(false);

  const startCreate = () => setEditing({ id: uid('cat'), name: '', image: '', description: '' });
  const save = (c: Category) => {
    if (!c.name.trim()) { pushToast('warning', 'اسم القسم مطلوب'); return; }
    const exists = data.categories.find((x) => x.id === c.id);
    const next = exists ? data.categories.map((x) => (x.id === c.id ? c : x)) : [...data.categories, c];
    setCategories(next);
    pushToast('success', exists ? 'تم تحديث القسم' : 'تمت إضافة القسم');
    setEditing(null);
  };
  const remove = (id: string) => {
    if (data.products.some((p) => p.categoryId === id)) { pushToast('error', 'لا يمكن حذف قسم يحتوي منتجات'); return; }
    setCategories(data.categories.filter((c) => c.id !== id));
    pushToast('info', 'تم حذف القسم');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-black text-lg text-ink-900">إدارة الأقسام</h3>
        <button onClick={startCreate} className="btn-primary px-4 py-2 text-sm"><Plus className="h-4 w-4" /> قسم جديد</button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {data.categories.map((c) => (
          <div key={c.id} className="card overflow-hidden">
            <div className="relative aspect-[4/3] bg-cream-100">
              {c.image ? <img src={c.image} alt={c.name} className="h-full w-full object-cover" onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = '0.2'; }} /> : <div className="grid place-items-center h-full text-ink-300"><ImageIcon /></div>}
            </div>
            <div className="p-3">
              <div className="font-bold text-sm text-ink-900">{c.name}</div>
              <div className="text-xs text-ink-500 line-clamp-1">{c.description}</div>
              <div className="mt-2 flex gap-2">
                <button onClick={() => setEditing(c)} className="btn-outline flex-1 px-2 py-1.5 text-xs"><Pencil className="h-3.5 w-3.5" /> تعديل</button>
                <button onClick={() => remove(c.id)} className="grid place-items-center h-8 w-8 rounded-full bg-error-50 text-error-600 hover:bg-error-100"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editing && <CategoryModal category={editing} onClose={() => setEditing(null)} onSave={save} />}
    </div>
  );
}

function CategoryModal({ category, onClose, onSave }: { category: Category; onClose: () => void; onSave: (c: Category) => void }) {
  const [form, setForm] = useState<Category>(category);
  const onImg = async (file: File) => {
    try {
      if (file.size > 2_000_000) { setForm((f) => ({ ...f, image: URL.createObjectURL(file) })); return; }
      const url = await readDataUrl(file);
      setForm((f) => ({ ...f, image: url }));
    } catch { /* ignore */ }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="absolute inset-0 bg-ink-950/70 backdrop-blur-sm" />
      <div onClick={(e) => e.stopPropagation()} className="relative w-full max-w-md card p-5 animate-scale-in">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-display font-black text-ink-900">{category.name ? 'تعديل قسم' : 'قسم جديد'}</h4>
          <button onClick={onClose} className="grid place-items-center h-9 w-9 rounded-full hover:bg-cream-100"><X className="h-5 w-5" /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="label-knz">اسم القسم *</label>
            <input className="input-knz" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="label-knz">الوصف</label>
            <textarea className="input-knz" value={form.description ?? ''} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div>
            <label className="label-knz">صورة القسم</label>
            <div className="flex items-center gap-3">
              <div className="h-20 w-20 rounded-2xl overflow-hidden bg-cream-100 shrink-0">
                {form.image ? <img src={form.image} className="h-full w-full object-cover" onError={() => {}} /> : <div className="grid place-items-center h-full text-ink-300"><ImageIcon /></div>}
              </div>
              <div className="flex-1 space-y-2">
                <input className="input-knz text-sm" placeholder="أو ألصقي رابط الصورة" value={form.image.startsWith('blob:') ? '' : form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
                <label className="btn-outline px-3 py-2 text-sm cursor-pointer">
                  <ImageIcon className="h-4 w-4" /> رفع صورة
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && onImg(e.target.files[0])} />
                </label>
              </div>
            </div>
          </div>
          <button onClick={() => onSave(form)} className="btn-primary w-full py-3"><Save className="h-4 w-4" /> حفظ</button>
        </div>
      </div>
    </div>
  );
}
