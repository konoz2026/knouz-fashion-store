import * as XLSX from 'xlsx';
import type { Product, Category, Variant } from '@/types';
import { uid } from '@/lib/utils';

export interface ExcelRow {
  name: string;
  category: string; // category name
  description: string;
  price: number;
  oldPrice?: number;
  images: string; // comma separated URLs
  colors: string; // e.g. "وردي:#f7a8c0,بيج:#e8d5c4"
  sizes: string; // e.g. "S,M,L,XL"
  stock: number; // per size
  badge?: string;
  featured?: string; // "true"/"false"
  onOffer?: string;
}

export function downloadTemplate() {
  const sample: ExcelRow[] = [
    {
      name: 'تيشيرت قطني مثال',
      category: 'تيشيرتات',
      description: 'وصف المنتج هنا',
      price: 219,
      oldPrice: 279,
      images: 'https://images.unsplash.com/photo-1576566588028-41439f1a4878?w=800,https://images.unsplash.com/photo-1583743814966-8930f2ed5169?w=800',
      colors: 'وردي:#f7a8c0,بيج:#e8d5c4',
      sizes: 'S,M,L,XL',
      stock: 10,
      badge: 'الأكثر مبيعًا',
      featured: 'true',
      onOffer: 'true',
    },
  ];
  const ws = XLSX.utils.json_to_sheet(sample);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'المنتجات');
  XLSX.writeFile(wb, 'knouz_products_template.xlsx');
}

export function parseProducts(file: File, categories: Category[]): Promise<{ products: Product[]; errors: string[] }> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const errors: string[] = [];
      try {
        const wb = XLSX.read(reader.result, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: '' });
        const products: Product[] = [];
        for (let i = 0; i < rows.length; i++) {
          const r = rows[i];
          const name = String(r['name'] ?? '').trim();
          if (!name) { errors.push(`الصف ${i + 2}: اسم المنتج مفقود — تم التخطي`); continue; }
          const catName = String(r['category'] ?? '').trim();
          const cat = categories.find((c) => c.name === catName);
          if (!cat) { errors.push(`الصف ${i + 2}: القسم "${catName}" غير موجود — تم التخطي`); continue; }
          const price = Number(r['price'] ?? 0);
          if (!price || price <= 0) { errors.push(`الصف ${i + 2}: سعر غير صالح — تم التخطي`); continue; }
          const images = String(r['images'] ?? '').split(',').map((s) => s.trim()).filter(Boolean);
          if (images.length === 0) images.push('https://images.unsplash.com/photo-1576566588028-41439f1a4878?w=800');
          const colorsRaw = String(r['colors'] ?? '').split(',').map((s) => s.trim()).filter(Boolean);
          const sizesRaw = String(r['sizes'] ?? '').split(',').map((s) => s.trim()).filter(Boolean);
          if (sizesRaw.length === 0) sizesRaw.push('M');
          const stock = Math.max(0, Math.floor(Number(r['stock'] ?? 0)) || 0);
          const variants: Variant[] = (colorsRaw.length ? colorsRaw : ['افتراضي:#cccccc']).map((c) => {
            const [color, hex] = c.split(':').map((s) => s.trim());
            return {
              id: uid('var'),
              color: color || 'افتراضي',
              colorHex: hex || '#cccccc',
              sizes: sizesRaw.map((size) => ({ size, stock })),
            };
          });
          const oldPrice = Number(r['oldPrice'] ?? 0) || undefined;
          products.push({
            id: uid('p'),
            name,
            categoryId: cat.id,
            description: String(r['description'] ?? '').trim(),
            price,
            oldPrice,
            images,
            variants,
            badge: String(r['badge'] ?? '').trim() || undefined,
            featured: String(r['featured'] ?? '').toLowerCase() === 'true',
            onOffer: String(r['onOffer'] ?? '').toLowerCase() === 'true',
            createdAt: Date.now(),
          });
        }
        resolve({ products, errors });
      } catch (e) {
        resolve({ products: [], errors: [`فشل قراءة الملف: ${(e as Error).message}`] });
      }
    };
    reader.onerror = () => resolve({ products: [], errors: ['تعذّر قراءة الملف'] });
    reader.readAsArrayBuffer(file);
  });
}
