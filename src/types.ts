export type ID = string;

export interface Variant {
  id: ID;
  color: string;
  colorHex: string;
  sizes: { size: string; stock: number }[];
}

export interface Product {
  id: ID;
  name: string;
  categoryId: ID;
  description: string;
  price: number; // current selling price (after discount if any)
  oldPrice?: number; // original price before discount
  images: string[];
  variants: Variant[];
  badge?: string;
  featured?: boolean;
  onOffer?: boolean;
  createdAt: number;
}

export interface Category {
  id: ID;
  name: string;
  image: string;
  description?: string;
}

export interface CartItem {
  key: string; // productId|variantId|size
  productId: ID;
  variantId: ID;
  size: string;
  qty: number;
  addedAt: number;
}

export type OrderStatus = 'new' | 'preparing' | 'shipped' | 'completed' | 'cancelled';
export type PaymentMethod = 'cod' | 'instapay';

export interface OrderLine {
  productId: ID;
  productName: string;
  categoryName: string;
  variantId: ID;
  color: string;
  size: string;
  qty: number;
  unitPrice: number;
  lineTotal: number;
}

export interface Order {
  id: ID;
  ref: string; // human readable
  customerName: string;
  phone: string;
  governorate: string;
  address: string;
  notes?: string;
  paymentMethod: PaymentMethod;
  instapayReceiptAttached: boolean;
  lines: OrderLine[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  status: OrderStatus;
  createdAt: number;
}

export interface ShippingZone {
  id: ID;
  name: string;
  price: number;
}

export interface OfferSettings {
  enabled: boolean;
  title: string;
  subtitle: string;
  globalDiscountPercent: number; // 0-100
  freeShippingEnabled: boolean;
  freeShippingThreshold: number;
}

export interface StoreInfo {
  brandName: string;
  brandNameEn: string;
  tagline: string;
  phone: string;
  whatsapp: string;
  address: string;
  workingHours: string;
  locationUrl: string;
  instaPayNumber: string;
  facebook: string;
  instagram: string;
  tiktok: string;
  telegram: string;
  adminPassword: string;
  announcement: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  priceFrom: number;
}

export interface AppData {
  categories: Category[];
  products: Product[];
  orders: Order[];
  shippingZones: ShippingZone[];
  offers: OfferSettings;
  info: StoreInfo;
  version: number;
}
