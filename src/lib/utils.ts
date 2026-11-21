export const EGP = (n: number): string => {
  const v = Math.round(n || 0);
  return v.toLocaleString('ar-EG', { maximumFractionDigits: 0 }) + ' ج.م';
};

export const uid = (prefix = 'id'): string =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export const orderRef = (n: number): string =>
  'KNZ-' + String(n).padStart(5, '0');

export const cls = (...args: (string | false | null | undefined)[]): string =>
  args.filter(Boolean).join(' ');

export const clamp = (n: number, min: number, max: number): number =>
  Math.min(Math.max(n, min), max);

export const formatDate = (ts: number): string =>
  new Date(ts).toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' } as Intl.DateTimeFormatOptions);

export const downloadFile = (filename: string, content: string, type = 'application/json') => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const readFileText = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result ?? ''));
    r.onerror = () => reject(r.error);
    r.readAsText(file);
  });

export const readDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result ?? ''));
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });

export const waLink = (phone: string, text: string): string => {
  const clean = phone.replace(/[^\d]/g, '');
  return `https://wa.me/${clean}?text=${encodeURIComponent(text)}`;
};

export const variantStock = (v: { sizes: { size: string; stock: number }[] }): number =>
  v.sizes.reduce((s, x) => s + x.stock, 0);

export const productStock = (p: { variants: { sizes: { size: string; stock: number }[] }[] }): number =>
  p.variants.reduce((s, v) => s + variantStock(v), 0);

export const deepClone = <T,>(v: T): T =>
  typeof structuredClone === 'function' ? structuredClone(v) : JSON.parse(JSON.stringify(v));
