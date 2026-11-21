import { X, Minus, Plus, Trash2, ShoppingBag, Truck, Tag, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useStore } from '@/store/StoreContext';
import { EGP, variantStock, clamp } from '@/lib/utils';
import { useEffect, useMemo, useState } from 'react';
import type { PaymentMethod, Order, OrderLine } from '@/types';
import { orderRef, uid } from '@/lib/utils';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
  onCheckout?: () => void;
}

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { data, cart, updateCartQty, removeFromCart, clearCart, cartSubtotal, cartDiscount, pushToast, addOrder, clearCart: empty } = useStore();
  const [stage, setStage] = useState<'cart' | 'checkout' | 'done'>('cart');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [govId, setGovId] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [payment, setPayment] = useState<PaymentMethod>('cod');
  const [receiptAttached, setReceiptAttached] = useState(false);
  const [lastOrderRef, setLastOrderRef] = useState('');

  useEffect(() => {
    if (open) { setStage('cart'); document.body.style.overflow = 'hidden'; }
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const gov = data.shippingZones.find((z) => z.id === govId);
  const shipping = gov ? gov.price : 0;
  const freeShippingApplies = data.offers.freeShippingEnabled && data.offers.freeShippingThreshold > 0 && cartSubtotal >= data.offers.freeShippingThreshold;
  const finalShipping = freeShippingApplies ? 0 : shipping;
  const total = Math.max(0, cartSubtotal - cartDiscount) + finalShipping;

  const progress = useMemo(() => {
    if (!data.offers.freeShippingEnabled || data.offers.freeShippingThreshold <= 0) return null;
    const pct = clamp((cartSubtotal / data.offers.freeShippingThreshold) * 100, 0, 100);
    const remaining = Math.max(0, data.offers.freeShippingThreshold - cartSubtotal);
    return { pct, remaining, achieved: cartSubtotal >= data.offers.freeShippingThreshold };
  }, [data.offers, cartSubtotal]);

  const lineItems = cart.map((item) => {
    const p = data.products.find((x) => x.id === item.productId);
    const v = p?.variants.find((x) => x.id === item.variantId);
    return { item, product: p, variant: v };
  }).filter((x) => x.product);

  const canCheckout = name.trim() && phone.trim().length >= 8 && govId && address.trim() && cart.length > 0;

  const placeOrder = () => {
    if (!canCheckout) { pushToast('warning', 'أكملي بيانات الطلب: الاسم، الموبايل، المحافظة، والعنوان'); return; }
    const lines: OrderLine[] = lineItems.map(({ item, product, variant }) => ({
      productId: product!.id,
      productName: product!.name,
      categoryName: data.categories.find((c) => c.id === product!.categoryId)?.name ?? '',
      variantId: variant!.id,
      color: variant!.color,
      size: item.size,
      qty: item.qty,
      unitPrice: product!.price,
      lineTotal: product!.price * item.qty,
    }));
    const ref = orderRef(data.orders.length + 1001);
    const order: Order = {
      id: uid('ord'),
      ref,
      customerName: name.trim(),
      phone: phone.trim(),
      governorate: gov?.name ?? '',
      address: address.trim(),
      notes: notes.trim(),
      paymentMethod: payment,
      instapayReceiptAttached: payment === 'instapay' && receiptAttached,
      lines,
      subtotal: cartSubtotal,
      discount: cartDiscount,
      shipping: finalShipping,
      total,
      status: 'new',
      createdAt: Date.now(),
    };
    addOrder(order);
    // build WhatsApp message
    const msg = buildWhatsAppInvoice(order, data.info.brandName, gov?.name ?? '', data.info.instaPayNumber);
    const url = `https://wa.me/${data.info.whatsapp.replace(/[^\d]/g, '')}?text=${encodeURIComponent(msg)}`;
    setLastOrderRef(ref);
    setStage('done');
    pushToast('success', 'تم تسجيل طلبك بنجاح! جاري فتح واتساب لتأكيد الفاتورة');
    setTimeout(() => { window.open(url, '_blank'); }, 600);
  };

  const close = () => { onClose(); if (stage === 'done') { empty(); resetForm(); } };

  const resetForm = () => { setName(''); setPhone(''); setGovId(''); setAddress(''); setNotes(''); setPayment('cod'); setReceiptAttached(false); };

  return (
    <div className={`fixed inset-0 z-50 ${open ? '' : 'pointer-events-none'}`}>
      {/* overlay */}
      <div className={`absolute inset-0 bg-ink-950/70 backdrop-blur-sm transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}
        onClick={close} />
      {/* drawer */}
      <div className={`absolute top-0 bottom-0 left-0 w-full sm:max-w-md bg-cream-50 shadow-lift flex flex-col transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* header */}
        <div className="flex items-center justify-between gap-2 p-4 bg-white border-b border-cream-200">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary-700" />
            <h3 className="font-display font-black text-lg text-ink-900">
              {stage === 'cart' ? 'سلة المشتريات' : stage === 'checkout' ? 'إتمام الطلب' : 'تم الطلب'}
            </h3>
          </div>
          <button onClick={close} className="grid place-items-center h-10 w-10 rounded-full hover:bg-cream-100 text-ink-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* DONE */}
        {stage === 'done' ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 animate-fade-up">
            <div className="h-20 w-20 rounded-full bg-success-50 grid place-items-center mb-4">
              <CheckCircle2 className="h-12 w-12 text-success-600" />
            </div>
            <h4 className="font-display text-2xl font-black text-ink-900">تم تسجيل طلبك بنجاح!</h4>
            <p className="mt-2 text-ink-600">رقم الطلب: <span className="font-black text-primary-700">{lastOrderRef}</span></p>
            <p className="mt-1 text-sm text-ink-500">تم فتح واتساب لتأكيد الفاتورة. في حال لم يفتح، تواصلي معنا مباشرة.</p>
            <button onClick={() => { close(); }} className="btn-primary mt-6 px-6 py-3">تم</button>
          </div>
        ) : cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
            <div className="h-20 w-20 rounded-full bg-cream-100 grid place-items-center mb-4">
              <ShoppingBag className="h-10 w-10 text-ink-300" />
            </div>
            <h4 className="font-display text-xl font-black text-ink-900">سلتك فارغة</h4>
            <p className="mt-1 text-sm text-ink-500">أضيفي بعض المنتجات الرائعة لتبدأ التسوق</p>
            <button onClick={close} className="btn-outline mt-5 px-6 py-2.5">تصفّحي المنتجات</button>
          </div>
        ) : (
          <>
            {/* Free shipping progress */}
            {progress && stage === 'cart' && (
              <div className="p-3 bg-primary-50/70 border-b border-primary-100">
                <div className="flex items-center gap-2 text-xs font-bold mb-1.5">
                  <Truck className="h-4 w-4 text-primary-700" />
                  {progress.achieved ? (
                    <span className="text-success-700">🎉 رائع! حصلتِ على شحن مجاني</span>
                  ) : (
                    <span className="text-primary-800">أضيفي {EGP(progress.remaining)} للحصول على شحن مجاني</span>
                  )}
                </div>
                <div className="h-2 rounded-full bg-white overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-l from-primary-600 to-accent-400 transition-all duration-500" style={{ width: `${progress.pct}%` }} />
                </div>
              </div>
            )}

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {lineItems.map(({ item, product, variant }) => {
                const vStock = variant ? variantStock(variant) : 0;
                return (
                  <div key={item.key} className="card p-2.5 flex gap-3">
                    <img src={product!.images[0]} alt={product!.name}
                      className="h-20 w-20 rounded-2xl object-cover bg-cream-100 shrink-0"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = '0.2'; }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-bold text-sm text-ink-900 line-clamp-1">{product!.name}</h4>
                        <button onClick={() => removeFromCart(item.key)} className="text-ink-400 hover:text-error-600 transition shrink-0">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="mt-0.5 flex items-center gap-2 text-xs text-ink-500">
                        <span className="inline-flex items-center gap-1">
                          <span className="h-3 w-3 rounded-full ring-1 ring-cream-200" style={{ background: variant?.colorHex }} />
                          {variant?.color}
                        </span>
                        <span>·</span>
                        <span>مقاس {item.size}</span>
                      </div>
                      {vStock < item.qty && <div className="mt-1 text-[11px] font-bold text-warning-600">الكمية المتاحة: {vStock}</div>}
                      <div className="mt-1.5 flex items-center justify-between">
                        <div className="flex items-center rounded-xl border border-cream-200 bg-white">
                          <button onClick={() => updateCartQty(item.key, item.qty - 1)} className="grid place-items-center h-8 w-8 text-ink-700"><Minus className="h-3.5 w-3.5" /></button>
                          <span className="w-8 text-center text-sm font-black">{item.qty}</span>
                          <button onClick={() => updateCartQty(item.key, Math.min(vStock || item.qty + 1, item.qty + 1))} className="grid place-items-center h-8 w-8 text-ink-700"><Plus className="h-3.5 w-3.5" /></button>
                        </div>
                        <span className="font-display font-black text-primary-700">{EGP(product!.price * item.qty)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {stage === 'checkout' && (
                <CheckoutForm
                  data={data}
                  name={name} setName={setName}
                  phone={phone} setPhone={setPhone}
                  govId={govId} setGovId={setGovId}
                  address={address} setAddress={setAddress}
                  notes={notes} setNotes={setNotes}
                  payment={payment} setPayment={setPayment}
                  receiptAttached={receiptAttached} setReceiptAttached={setReceiptAttached}
                />
              )}
            </div>

            {/* Summary + actions */}
            <div className="p-3 bg-white border-t border-cream-200 space-y-2">
              <Row label="الإجمالي الفرعي" value={EGP(cartSubtotal)} />
              {cartDiscount > 0 && <Row label="الخصم" value={`- ${EGP(cartDiscount)}`} className="text-success-600" />}
              <Row label="الشحن" value={freeShippingApplies ? 'مجاني' : EGP(finalShipping)} className={freeShippingApplies ? 'text-success-600' : ''} />
              <div className="flex items-center justify-between pt-2 border-t border-cream-200">
                <span className="font-bold text-ink-700">الإجمالي</span>
                <span className="font-display font-black text-xl text-primary-700">{EGP(total)}</span>
              </div>

              {stage === 'cart' ? (
                <div className="flex gap-2 pt-1">
                  <button onClick={() => { clearCart(); pushToast('info', 'تم تفريغ السلة'); }} className="btn-ghost px-4 py-3 text-sm">
                    <Trash2 className="h-4 w-4" /> تفريغ
                  </button>
                  <button onClick={() => setStage('checkout')} className="btn-primary flex-1 py-3">
                    إتمام الطلب <ArrowLeft className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2 pt-1">
                  <button onClick={() => setStage('cart')} className="btn-ghost px-4 py-3 text-sm">رجوع</button>
                  <button onClick={placeOrder} disabled={!canCheckout} className="btn-gold flex-1 py-3 disabled:opacity-50">
                    <CheckCircle2 className="h-5 w-5" /> تأكيد الطلب وإرسال للواتساب
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Row({ label, value, className = '' }: { label: string; value: string; className?: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-ink-500">{label}</span>
      <span className={`font-bold ${className}`}>{value}</span>
    </div>
  );
}

interface CheckoutFormProps {
  data: ReturnType<typeof useStore>['data'];
  name: string; setName: (v: string) => void;
  phone: string; setPhone: (v: string) => void;
  govId: string; setGovId: (v: string) => void;
  address: string; setAddress: (v: string) => void;
  notes: string; setNotes: (v: string) => void;
  payment: PaymentMethod; setPayment: (p: PaymentMethod) => void;
  receiptAttached: boolean; setReceiptAttached: (v: boolean) => void;
}
function CheckoutForm({ data, name, setName, phone, setPhone, govId, setGovId, address, setAddress, notes, setNotes, payment, setPayment, receiptAttached, setReceiptAttached }: CheckoutFormProps) {
  return (
    <div className="card p-4 space-y-3 animate-fade-up">
      <h4 className="font-display font-black text-ink-900">بيانات التوصيل</h4>
      <div>
        <label className="label-knz">الاسم بالكامل *</label>
        <input className="input-knz" value={name} onChange={(e) => setName(e.target.value)} placeholder="مثال: سارة أحمد" />
      </div>
      <div>
        <label className="label-knz">رقم الموبايل *</label>
        <input className="input-knz" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01xxxxxxxxx" inputMode="tel" />
      </div>
      <div>
        <label className="label-knz">المحافظة / منطقة التوصيل *</label>
        <select className="input-knz" value={govId} onChange={(e) => setGovId(e.target.value)}>
          <option value="">اختاري المحافظة</option>
          {data.shippingZones.map((z) => (
            <option key={z.id} value={z.id}>{z.name} — {EGP(z.price)}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="label-knz">العنوان بالتفصيل *</label>
        <textarea className="input-knz min-h-20" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="الشارع، رقم العمارة، الدور، علامة مميزة" />
      </div>
      <div>
        <label className="label-knz">ملاحظات (اختياري)</label>
        <textarea className="input-knz min-h-16" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="أي تفاصيل إضافية للطلب" />
      </div>

      <div>
        <label className="label-knz">وسيلة الدفع *</label>
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={() => setPayment('cod')}
            className={`rounded-2xl border-2 p-3 text-right transition ${payment === 'cod' ? 'border-primary-600 bg-primary-50' : 'border-cream-200 bg-white'}`}>
            <div className="font-bold text-sm">الدفع عند الاستلام</div>
            <div className="text-xs text-ink-500">ادفعي نقدًا عند وصول الطلب</div>
          </button>
          <button type="button" onClick={() => setPayment('instapay')}
            className={`rounded-2xl border-2 p-3 text-right transition ${payment === 'instapay' ? 'border-primary-600 bg-primary-50' : 'border-cream-200 bg-white'}`}>
            <div className="font-bold text-sm">تحويل إنستا باي</div>
            <div className="text-xs text-ink-500">حوّلي وأرسلي إيصال التحويل</div>
          </button>
        </div>
      </div>

      {payment === 'instapay' && (
        <div className="rounded-2xl bg-accent-50 border border-accent-200 p-3 text-sm animate-fade-in">
          <div className="font-bold text-accent-800 flex items-center gap-1.5"><Tag className="h-4 w-4" /> بيانات التحويل عبر إنستا باي</div>
          <div className="mt-1.5 text-accent-900">رقم الموبايل: <span dir="ltr" className="font-black">{data.info.instaPayNumber}</span></div>
          <label className="mt-2 flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={receiptAttached} onChange={(e) => setReceiptAttached(e.target.checked)} className="h-4 w-4 accent-primary-700" />
            <span className="text-xs font-bold text-accent-800">سأرفق صورة إيصال التحويل في محادثة واتساب لتأكيد الطلب</span>
          </label>
        </div>
      )}
    </div>
  );
}

function buildWhatsAppInvoice(order: Order, brandName: string, govName: string, instaPayNumber: string): string {
  const lines = order.lines.map((l, i) =>
    `${i + 1}. ${l.productName} (${l.categoryName})\n   المقاس: ${l.size} | اللون: ${l.color} | العدد: ${l.qty}\n   السعر: ${l.lineTotal} ج.م`
  ).join('\n\n');
  const paymentText = order.paymentMethod === 'cod'
    ? 'الدفع عند الاستلام (COD)'
    : `تحويل إنستا باي على الرقم: ${instaPayNumber}\nإرفاق إيصال التحويل: ${order.instapayReceiptAttached ? 'تم — سأرفق الإيصال' : 'سيتم إرفاقه'}`;
  return [
    `*${brandName} — فاتورة طلب جديد*`,
    `رقم الطلب: ${order.ref}`,
    `---------------------------`,
    `*العميلة:* ${order.customerName}`,
    `*الموبايل:* ${order.phone}`,
    `*المحافظة:* ${govName}`,
    `*العنوان:* ${order.address}`,
    order.notes ? `*ملاحظات:* ${order.notes}` : '',
    `---------------------------`,
    `*تفاصيل الطلب:*`,
    lines,
    `---------------------------`,
    `*وسيلة الدفع:* ${paymentText}`,
    `---------------------------`,
    `إجمالي المنتجات: ${order.subtotal} ج.م`,
    order.discount > 0 ? `الخصم: -${order.discount} ج.م` : '',
    `الشحن: ${order.shipping === 0 ? 'مجاني' : order.shipping + ' ج.م'}`,
    `*الإجمالي النهائي: ${order.total} ج.م*`,
    `---------------------------`,
    `شكرًا لاختيارك ${brandName} 💖`,
  ].filter(Boolean).join('\n');
}
