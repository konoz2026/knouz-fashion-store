import type { AppData, Product, Category } from '@/types';

// Stable Unsplash fashion imagery (royalty-free, direct CDN URLs)
const IMG = {
  hero: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1920&q=85&auto=format&fit=crop',
  heroAlt: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1920&q=85&auto=format&fit=crop',
  // Category covers
  catTshirts: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=900&q=80&auto=format&fit=crop',
  catCasual: 'https://images.unsplash.com/photo-1551803091-e20673f15770?w=900&q=80&auto=format&fit=crop',
  catBlouses: 'https://images.unsplash.com/photo-1485518882345-15568b007407?w=900&q=80&auto=format&fit=crop',
  catJackets: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=900&q=80&auto=format&fit=crop',
  // Products
  p1a: 'https://images.unsplash.com/photo-1576566588028-41439f1a4878?w=800&q=80&auto=format&fit=crop',
  p1b: 'https://images.unsplash.com/photo-1583743814966-8930f2ed5169?w=800&q=80&auto=format&fit=crop',
  p2a: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&q=80&auto=format&fit=crop',
  p2b: 'https://images.unsplash.com/photo-15391092361195367e5235c5a3a1a9e7c?w=800&q=80&auto=format&fit=crop',
  p3a: 'https://images.unsplash.com/photo-1564257577154-75bd1e6c04fa?w=800&q=80&auto=format&fit=crop',
  p3b: 'https://images.unsplash.com/photo-1485968579580-b6d095142e69?w=800&q=80&auto=format&fit=crop',
  p4a: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80&auto=format&fit=crop',
  p4b: 'https://images.unsplash.com/photo-1542060748-10c28b62716f?w=800&q=80&auto=format&fit=crop',
  p5a: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80&auto=format&fit=crop',
  p5b: 'https://images.unsplash.com/photo-1583744946564-b52ac1c389c8?w=800&q=80&auto=format&fit=crop',
  p6a: 'https://images.unsplash.com/photo-1434389677669-e5b75b6da83f?w=800&q=80&auto=format&fit=crop',
  p6b: 'https://images.unsplash.com/photo-1509631179627-0147e6f22995?w=800&q=80&auto=format&fit=crop',
  p7a: 'https://images.unsplash.com/photo-1548883354-94bcdab00de7?w=800&q=80&auto=format&fit=crop',
  p7b: 'https://images.unsplash.com/photo-1551232864-3f0890e580e9?w=800&q=80&auto=format&fit=crop',
  p8a: 'https://images.unsplash.com/photo-15391092361195367e5235c5a3a1a9e7c?w=800&q=80&auto=format&fit=crop',
  p8b: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&q=80&auto=format&fit=crop',
};

const uid = (p: string) => p;

const categories: Category[] = [
  { id: 'cat-tshirts', name: 'تيشيرتات', image: IMG.catTshirts, description: 'تيشيرتات قطنية أنيقة بإطلالات عصرية' },
  { id: 'cat-casual', name: 'أطقم كاجوال', image: IMG.catCasual, description: 'أطقم مريحة وراقية لإطلالة يومية مميزة' },
  { id: 'cat-blouses', name: 'بلوزات', image: IMG.catBlouses, description: 'بلوزات ناعمة بخامات فاخرة تليق بكل مناسبة' },
  { id: 'cat-jackets', name: 'جواكت', image: IMG.catJackets, description: 'جواكت أنيقة تضيف لمسة جريئة لإطلالتك' },
];

const mkVariants = (colors: { c: string; hex: string }[], sizes: string[], baseStock: number) =>
  colors.map((color) => ({
    id: `${color.c}-${color.hex}`.replace(/\s+/g, ''),
    color: color.c,
    colorHex: color.hex,
    sizes: sizes.map((size) => ({ size, stock: baseStock })),
  }));

const products: Product[] = [
  {
    id: 'p1', name: 'تيشيرت قطني بخصر مطاطي', categoryId: 'cat-tshirts',
    description: 'تيشيرت قطني فاخر بقصة واسعة مريحة وخامة ناعمة تمنحك إطلالة عصرية أنيقة طوال اليوم.',
    price: 219, oldPrice: 279, images: [IMG.p1a, IMG.p1b], variants: mkVariants([{c:'وردي',hex:'#f7a8c0'},{c:'بيج',hex:'#e8d5c4'},{c:'أسود',hex:'#222'}], ['S','M','L','XL'], 12),
    badge: 'الأكثر مبيعًا', featured: true, onOffer: true, createdAt: Date.now(),
  },
  {
    id: 'p2', name: 'طقم كاجوال شيك (بلوزة + بنطلون)', categoryId: 'cat-casual',
    description: 'طقم متكامل بتصميم انسيابي يجمع بين الراحة والأناقة، مثالي للخروجات اليومية والمناسبات غير الرسمية.',
    price: 449, oldPrice: 549, images: [IMG.p2a, IMG.p2b], variants: mkVariants([{c:'كريمي',hex:'#fff5e6'},{c:'وردي باودر',hex:'#fbcfdd'},{c:'كحلي',hex:'#1e2a52'}], ['M','L','XL'], 8),
    badge: 'تشكيلة جديدة', featured: true, onOffer: true, createdAt: Date.now(),
  },
  {
    id: 'p3', name: 'بلوزة حريرية ناعمة بياقة V', categoryId: 'cat-blouses',
    description: 'بلوزة بخامة شبيهة بالحرير بملمس فاخر وانسيابية راقية تبرز أنوثتك في كل إطلالة.',
    price: 329, oldPrice: 399, images: [IMG.p3a, IMG.p3b], variants: mkVariants([{c:'عاجي',hex:'#fdf6ec'},{c:'وردي',hex:'#f07498'},{c:'زيتي',hex:'#5e6b4f'}], ['S','M','L'], 15),
    featured: true, onOffer: true, createdAt: Date.now(),
  },
  {
    id: 'p4', name: 'جاكيت كاجوال مزين بأزرار ذهبية', categoryId: 'cat-jackets',
    description: 'جاكيت بقصة عصرية وخامة عالية الجودة يضيف لمسة فخامة دافئة لإطلالتك في الأجواء الباردة.',
    price: 599, oldPrice: 749, images: [IMG.p4a, IMG.p4b], variants: mkVariants([{c:'بيج',hex:'#e8d5c4'},{c:'بني',hex:'#7c421a'},{c:'أسود',hex:'#222'}], ['M','L','XL'], 6),
    badge: 'إصدار محدود', featured: true, onOffer: true, createdAt: Date.now(),
  },
  {
    id: 'p5', name: 'تيشيرت أوفر سايز بطبعة مميزة', categoryId: 'cat-tshirts',
    description: 'تيشيرت بقصة واسعة عصرية وطبعة أنيقة يمنحك حرية الحركة وإطلالة جريئة في آنٍ واحد.',
    price: 199, oldPrice: 249, images: [IMG.p5a, IMG.p5b], variants: mkVariants([{c:'أبيض',hex:'#fff'},{c:'وردي',hex:'#f7a8c0'},{c:'رمادي',hex:'#9ca3af'}], ['S','M','L','XL'], 20),
    onOffer: true, createdAt: Date.now(),
  },
  {
    id: 'p6', name: 'طقم سهرة أنيق', categoryId: 'cat-casual',
    description: 'طقم بتصميم راقٍ يجمع بين الفخامة والراحة، مثالي للمناسبات والسهرات بإطلالة لا تُنسى.',
    price: 699, oldPrice: 849, images: [IMG.p6a, IMG.p6b], variants: mkVariants([{c:'وردي غامق',hex:'#b8336a'},{c:'كحلي',hex:'#1e2a52'},{c:'أسود',hex:'#222'}], ['M','L'], 4),
    badge: 'كمية محدودة', featured: true, createdAt: Date.now(),
  },
  {
    id: 'p7', name: 'بلوزة كشكش بكم منفوش', categoryId: 'cat-blouses',
    description: 'بلوزة بتفاصيل الكشكش والكم المنفوش لإطلالة ناعمة أنثوية تليق بالمناسبات الراقية.',
    price: 289, oldPrice: 359, images: [IMG.p7a, IMG.p7b], variants: mkVariants([{c:'أبيض',hex:'#fff'},{c:'وردي باودر',hex:'#fbcfdd'}], ['S','M','L','XL'], 10),
    onOffer: true, createdAt: Date.now(),
  },
  {
    id: 'p8', name: 'جاكيت جلد صناعي بقلنسوة', categoryId: 'cat-jackets',
    description: 'جاكيت بخامة شبيهة بالجلد بقلنسوة واقية يضفي لمسة جريئة عصرية على إطلالتك في الأجواء الباردة.',
    price: 549, oldPrice: 679, images: [IMG.p8a, IMG.p8b], variants: mkVariants([{c:'أسود',hex:'#222'},{c:'بني',hex:'#7c421a'}], ['M','L','XL'], 7),
    onOffer: true, createdAt: Date.now(),
  },
];

export const seedData: AppData = {
  categories,
  products,
  orders: [],
  shippingZones: [
    { id: 'z-cairo', name: 'القاهرة', price: 50 },
    { id: 'z-giza', name: 'الجيزة', price: 50 },
    { id: 'z-alex', name: 'الإسكندرية', price: 60 },
    { id: 'z-qalyubia', name: 'القليوبية', price: 55 },
    { id: 'z-sharqia', name: 'الشرقية', price: 65 },
    { id: 'z-dakahlia', name: 'الدقهلية', price: 65 },
    { id: 'z-beheira', name: 'البحيرة', price: 70 },
    { id: 'z-gharbia', name: 'الغربية', price: 60 },
    { id: 'z-monufia', name: 'المنوفية', price: 60 },
    { id: 'z-kafr', name: 'كفر الشيخ', price: 70 },
    { id: 'z-fayoum', name: 'الفيوم', price: 75 },
    { id: 'z-benisuef', name: 'بني سويف', price: 75 },
    { id: 'z-minya', name: 'المنيا', price: 85 },
    { id: 'z-asyut', name: 'أسيوط', price: 90 },
    { id: 'z-suhaj', name: 'سوهاج', price: 95 },
    { id: 'z-qena', name: 'قنا', price: 100 },
    { id: 'z-luxor', name: 'الأقصر', price: 110 },
    { id: 'z-aswan', name: 'أسوان', price: 120 },
    { id: 'z-redsea', name: 'البحر الأحمر', price: 110 },
    { id: 'z-sinai', name: 'شمال سيناء', price: 130 },
    { id: 'z-southsinai', name: 'جنوب سيناء', price: 130 },
    { id: 'z-matrouh', name: 'مطروح', price: 110 },
    { id: 'z-wadgedid', name: 'الوادي الجديد', price: 130 },
    { id: 'z-ismailia', name: 'الإسماعيلية', price: 70 },
    { id: 'z-suez', name: 'السويس', price: 70 },
    { id: 'z-port', name: 'بورسعيد', price: 80 },
    { id: 'z-domiatt', name: 'دمياط', price: 70 },
  ],
  offers: {
    enabled: true,
    title: 'عروض الأسبوع الذهبي',
    subtitle: 'خصم 10% على تشكيلة مختارة لمدة أسبوع كامل — لا تفوتي الفرصة',
    globalDiscountPercent: 10,
    freeShippingEnabled: true,
    freeShippingThreshold: 1200,
  },
  info: {
    brandName: 'كنوز ستايل',
    brandNameEn: 'KNOUZ STYLE',
    tagline: 'أناقة المرأة العصرية',
    phone: '+201111843806',
    whatsapp: '+201111843806',
    address: '136 شارع طومان باي، أمام شركة الغاز، الزيتون (بجوار مدرسة دار السعادة مباشرة)',
    workingHours: 'يوميًا من 10 صباحًا إلى 10 مساءً',
    locationUrl: 'https://maps.app.goo.gl/3smiEeVmCFaLWVCf8?g_st=iw',
    instaPayNumber: '01098765432',
    facebook: 'https://www.facebook.com/share/19ozUNspEM/',
    instagram: 'https://www.instagram.com/knouz_fashion',
    tiktok: 'https://www.tiktok.com/@knouz.fashion',
    telegram: 'https://t.me/+EjXlIzjarFI2MDNk',
    adminPassword: '5555',
    announcement: 'خصم 10% لمدة أسبوع كامل — أسعار تبدأ من 199 جنيه — التوصيل لجميع المحافظات',
    heroTitle: 'كنوز ستايل',
    heroSubtitle: 'حيث تلتقي الأناقة بالأنوثة',
    heroImage: IMG.hero,
    priceFrom: 199,
  },
  version: 1,
};

export { IMG };
