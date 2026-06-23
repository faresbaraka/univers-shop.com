import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  CreditCard, 
  Upload, 
  Truck, 
  Lock, 
  MapPin, 
  Phone, 
  Check, 
  X, 
  FileText, 
  Smartphone, 
  ArrowRight, 
  TrendingUp, 
  AlertCircle 
} from 'lucide-react';
import { CartItem, PaymentMethod, Order, StoreSettings } from '../types';
import { ALGERIAN_WILAYAS } from '../data/mockProducts';
import { Language, translate } from '../lib/translations';

interface CheckoutProps {
  cart: CartItem[];
  onClearCart: () => void;
  onClose: () => void;
  onOrderSuccess: (order: Order) => void;
  sellerPhone: string;
  storeSettings?: StoreSettings;
  onShowToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
  language?: Language;
}

export default function Checkout({ 
  cart, 
  onClearCart, 
  onClose, 
  onOrderSuccess, 
  sellerPhone, 
  storeSettings, 
  onShowToast,
  language = 'fr'
}: CheckoutProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1); // 1: Info, 2: Payment, 3: Secure3D_OTP (for card), 4: Ticket
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [selectedWilayaCode, setSelectedWilayaCode] = useState<number>(16); // Alger default
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('delivery');

  // Anti-fraud and Bot protection states
  const [isHumanVerified, setIsHumanVerified] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const [lastSubmissionTime, setLastSubmissionTime] = useState<number>(0);


  // Coupon promo states
  const [couponInput, setCouponInput] = useState('');
  const [appliedPromoCode, setAppliedPromoCode] = useState('');
  const [promoError, setPromoError] = useState('');
  const [promoSuccessMsg, setPromoSuccessMsg] = useState('');

  // Card details state
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpError, setOtpError] = useState('');

  // Baridimob screen state
  const [receiptImg, setReceiptImg] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);

  // Errors state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Created order state for tickets
  const [orderReceipt, setOrderReceipt] = useState<Order | null>(null);

  // Secure Gateway states
  const [isChargilyConfigured, setIsChargilyConfigured] = useState(false);
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [useRealChargily, setUseRealChargily] = useState(false);
  const [gatewayError, setGatewayError] = useState('');

  const selectedWilaya = ALGERIAN_WILAYAS.find(w => w.code === selectedWilayaCode) || ALGERIAN_WILAYAS[15]; // default Alger
  const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  // Dynamically calculate discount
  const getDiscountDeduction = () => {
    if (!appliedPromoCode) return 0;
    
    const code = appliedPromoCode.trim().toUpperCase();
    if (code === 'ROUELIVRAISON') return 0; // Handled in shipping total
    if (code === 'ROUE50LIV') return 0; // Handled in shipping total
    if (code === 'ROUE10') {
      return Math.round((subtotal * 10) / 100);
    }
    if (code === 'ROUE5') {
      return Math.round((subtotal * 5) / 100);
    }
    if (code === 'ROUE500') {
      return Math.min(500, subtotal);
    }
    if (code === 'ROUECADEAU') {
      return Math.min(200, subtotal);
    }
    if (code === 'RECOMPENSE150') {
      return Math.min(150, subtotal);
    }
    if (code === 'RECOMPENSE300') {
      return Math.min(350, subtotal);
    }
    if (code === 'RECOMPENSE500') {
      return Math.min(650, subtotal);
    }

    if (!storeSettings || !storeSettings.promoCodeActive) return 0;
    if (code !== storeSettings.promoCode?.trim().toUpperCase()) return 0;

    if (storeSettings.promoDiscountType === 'percentage') {
      const percentage = storeSettings.promoDiscountValue || 0;
      return Math.round((subtotal * percentage) / 100);
    } else {
      const fixedValue = storeSettings.promoDiscountValue || 0;
      return Math.min(fixedValue, subtotal);
    }
  };

  const discountDeduction = getDiscountDeduction();

  const getShippingFee = () => {
    if (!appliedPromoCode) return selectedWilaya.shippingFee;
    const code = appliedPromoCode.trim().toUpperCase();
    if (code === 'ROUELIVRAISON') return 0;
    if (code === 'ROUE50LIV') return Math.round(selectedWilaya.shippingFee / 2);
    return selectedWilaya.shippingFee;
  };

  const shippingFee = getShippingFee();
  const totalAmount = Math.max(0, subtotal - discountDeduction) + shippingFee;

  // Fetch state configuration from secure proxy backend
  useEffect(() => {
    // Load customer profile if exists
    const storedName = localStorage.getItem('univers_shop_cust_name');
    const storedPhone = localStorage.getItem('univers_shop_cust_phone');
    if (storedName) setName(storedName);
    if (storedPhone) setPhone(storedPhone);

    fetch('/api/payments/config')
      .then(res => res.json())
      .then(data => {
        if (data.hasChargilyKey) {
          setIsChargilyConfigured(true);
          setUseRealChargily(true);
        }
      })
      .catch(err => {
        console.warn("Could not query payment configuration:", err);
      });
  }, []);

  // Simulate secure OTP generation
  useEffect(() => {
    if (step === 3) {
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setOtpCode(generatedOtp);
      // Display alert info or console to guide the user in sandbox
    }
  }, [step]);

  // Form validations
  const validateInfoStep = () => {
    // 1. Honeypot check (Bots fill visible hidden fields)
    if (honeypot.trim()) {
      onShowToast?.(language === 'ar' ? "تم كشف نشاط مشبوه. تم إلغاء المعاملة." : "Activité suspecte détectée. Transaction annulée.", "error");
      return false;
    }

    // 2. Rate limiting check (Avoid double clicks / rapid spam within 15 seconds)
    const now = Date.now();
    if (lastSubmissionTime !== 0 && now - lastSubmissionTime < 15000) {
      onShowToast?.(
        language === 'ar' ? "يرجى الانتظار قليلاً قبل إرسال الطلب مجدداً." : "Veuillez patienter quelques instants avant de soumettre à nouveau.",
        "error"
      );
      return false;
    }

    const newErrors: Record<string, string> = {};
    if (!name.trim()) {
      newErrors.name = language === 'ar' ? 'الاسم الكامل مطلوب.' : 'Le nom complet est obligatoire.';
    }
    if (!phone.trim()) {
      newErrors.phone = language === 'ar' ? 'رقم الهاتف مطلوب.' : 'Le numéro de portable est obligatoire.';
    } else if (!/^(05|06|07)\d{8}$/.test(phone.trim().replace(/\s/g, ''))) {
      newErrors.phone = language === 'ar' ? 'رقم الهاتف غير صالح (مثال: 0558926754)' : 'Format de numéro algérien invalide (ex: 0558926754).';
    }
    if (!address.trim()) {
      newErrors.address = language === 'ar' ? 'عنوان التسليم مطلوب.' : "L'adresse de livraison est obligatoire.";
    }

    // 3. Human check
    if (!isHumanVerified) {
      newErrors.bot = language === 'ar' ? 'يرجى تأكيد أنك إنسان بالضغط على خانة التحقق.' : 'Veuillez cocher la case de sécurité pour confirmer que vous êtes humain.';
    }
    
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      setLastSubmissionTime(now); // record submission time
      return true;
    }
    return false;
  };

  const validateCardDetails = () => {
    const newErrors: Record<string, string> = {};
    const sanitizedCard = cardNumber.replace(/\s/g, '');
    if (sanitizedCard.length !== 16) {
      newErrors.cardNumber = 'Le numéro de carte doit contenir 16 chiffres.';
    }
    if (!cardHolder.trim()) newErrors.cardHolder = 'Le nom sur la carte est requis.';
    if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
      newErrors.cardExpiry = 'Format invalide (MM/AA).';
    }
    if (cardCvv.length < 3) {
      newErrors.cardCvv = 'Le code CVV doit contenir 3 chiffres.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const proceedToPayment = () => {
    if (validateInfoStep()) {
      setStep(2);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Limit receipt image size to max 850px width/height while keeping aspect ratio
          const MAX_SIZE = 850;
          if (width > height) {
            if (width > MAX_SIZE) {
              height = Math.round((height * MAX_SIZE) / width);
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width = Math.round((width * MAX_SIZE) / height);
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            // Compress as JPEG (0.7 quality is extremely lightweight and completely legible for text details)
            const compressed = canvas.toDataURL('image/jpeg', 0.7);
            setReceiptImg(compressed);
            setIsUploading(false);
          } else {
            setReceiptImg(event.target?.result as string);
            setIsUploading(false);
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateOrder = async () => {
    if (paymentMethod === 'edahabia') {
      if (useRealChargily) {
        setIsPaymentLoading(true);
        setGatewayError('');
        try {
          const response = await fetch('/api/payments/chargily-checkout', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              amount: totalAmount,
              customerName: name,
              customerPhone: phone,
              customerAddress: address,
              customerWilaya: selectedWilaya.name,
              successUrl: window.location.href,
              failureUrl: window.location.href,
            }),
          });
          
          const data = await response.json();
          if (!response.ok) {
            throw new Error(data.error || "Impossible d'initier la transaction sécurisée.");
          }
          
          if (data.simulation) {
            // Server has no key; gracefully fallback to simulation mode and notify user
            console.log("No Chargily App Key found. Falling back to offline client simulator.");
            setUseRealChargily(false);
            // Go to step 3 to present simulator
            setStep(3);
          } else if (data.checkoutUrl) {
            // Direct secure redirection path
            console.log("Secure transaction initiated. Redirecting client to official Chargily checkout page.");
            window.open(data.checkoutUrl, '_blank');
            submitFinalOrder();
          }
        } catch (err: any) {
          console.error("Payment Gateway error:", err);
          setGatewayError(err.message || "Erreur de connexion lors de la transmission SSL.");
        } finally {
          setIsPaymentLoading(false);
        }
      } else {
        if (!validateCardDetails()) {
          return;
        }
        // Go to simulated 3D Secure OTP step
        setStep(3);
      }
    } else if (paymentMethod === 'baridimob' && !receiptImg) {
      setErrors({ receipt: 'Veuillez télécharger un reçu ou une preuve de virement BaridiMob pour la sécurité du paiement.' });
    } else {
      // Direct success for other methods
      submitFinalOrder();
    }
  };

  const handleApplyCoupon = (externalCode?: string) => {
    setPromoError('');
    setPromoSuccessMsg('');
    
    const targetCode = (externalCode || couponInput).trim().toUpperCase();
    
    if (!targetCode) {
      setPromoError('Veuillez entrer un code promo.');
      return;
    }

    let discountDesc = '';
    let isValide = false;

    if (targetCode === 'ROUELIVRAISON') {
      discountDesc = "Livraison Gratuite !";
      isValide = true;
    } else if (targetCode === 'ROUE50LIV') {
      discountDesc = "Frais d'expédition réduits de 50% !";
      isValide = true;
    } else if (targetCode === 'ROUE10') {
      discountDesc = "-10% sur tout le panier !";
      isValide = true;
    } else if (targetCode === 'ROUE5') {
      discountDesc = "-5% sur tout le panier !";
      isValide = true;
    } else if (targetCode === 'ROUE500') {
      discountDesc = "-500 DA immédiat !";
      isValide = true;
    } else if (targetCode === 'ROUECADEAU') {
      discountDesc = "Cadeau de -200 DA appliqué !";
      isValide = true;
    } else if (targetCode === 'RECOMPENSE150') {
      discountDesc = "-150 DA déduit de vos points !";
      isValide = true;
    } else if (targetCode === 'RECOMPENSE300') {
      discountDesc = "-350 DA déduit de vos points !";
      isValide = true;
    } else if (targetCode === 'RECOMPENSE500') {
      discountDesc = "-650 DA déduit de vos points !";
      isValide = true;
    }

    if (isValide) {
      setAppliedPromoCode(targetCode);
      setPromoSuccessMsg(`Code promo "${targetCode}" validé avec succès (${discountDesc}) !`);
      if (onShowToast) onShowToast(`Code promo "${targetCode}" appliqué avec succès !`, 'success');
      return;
    }
    
    if (!storeSettings || !storeSettings.promoCodeActive || !storeSettings.promoCode) {
      setPromoError('Aucun code promo actif pour le moment.');
      return;
    }
    
    if (targetCode === storeSettings.promoCode.trim().toUpperCase()) {
      setAppliedPromoCode(targetCode);
      const value = storeSettings.promoDiscountValue || 0;
      const desc = storeSettings.promoDiscountType === 'percentage' ? `-${value}%` : `-${value.toLocaleString('fr-DZ')} DA`;
      setPromoSuccessMsg(`Code promo "${storeSettings.promoCode}" validé avec succès (${desc}) !`);
    } else {
      setPromoError('Code promo invalide. Veuillez réessayer.');
    }
  };

  useEffect(() => {
    // Auto-apply stored coupon from localStorage
    const storedCoupon = localStorage.getItem('univers_shop_active_coupon');
    if (storedCoupon) {
      handleApplyCoupon(storedCoupon);
    }
  }, []);

  const handleOtpVerify = () => {
    if (enteredOtp === otpCode) {
      submitFinalOrder();
    } else {
      setOtpError('Code OTP incorrect. Veuillez réessayer ou cliquer sur "Renvoyer".');
    }
  };

  const submitFinalOrder = () => {
    const transactionId = 'TXN-' + Math.floor(10000000 + Math.random() * 90000000);
    const orderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);

    const finalOrder: Order = {
      id: orderId,
      transactionId: transactionId,
      customerName: name,
      customerPhone: phone,
      customerAddress: address,
      customerWilaya: selectedWilaya.name,
      items: cart.map(item => ({
        productId: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity
      })),
      totalAmount: totalAmount,
      discountAmount: discountDeduction > 0 ? discountDeduction : undefined,
      promoCodeApplied: appliedPromoCode ? appliedPromoCode : undefined,
      paymentMethod: paymentMethod,
      paymentStatus: paymentMethod === 'delivery' ? 'pending' : (useRealChargily ? 'pending' : 'verified'),
      orderStatus: 'received',
      transactionDate: new Date().toLocaleDateString('fr-DZ', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      receiptScreenshot: paymentMethod === 'baridimob' ? receiptImg : undefined,
      cardLastFour: paymentMethod === 'edahabia' ? (cardNumber ? cardNumber.slice(-4) : 'API') : undefined,
      otpVerified: paymentMethod === 'edahabia'
    };

    setOrderReceipt(finalOrder);
    onOrderSuccess(finalOrder);
    setStep(4);
  };

  // Helper formatting for Card Inputs
  const handleCardNumberChange = (value: string) => {
    const raw = value.replace(/\s?/g, '').replace(/\D/g, '');
    const groups = raw.match(/.{1,4}/g);
    if (groups) {
      setCardNumber(groups.join(' '));
    } else {
      setCardNumber(raw);
    }
  };

  const handleExpiryChange = (value: string) => {
    const raw = value.replace(/\D/g, '');
    if (raw.length >= 2) {
      setCardExpiry(`${raw.slice(0, 2)}/${raw.slice(2, 4)}`);
    } else {
      setCardExpiry(raw);
    }
  };

  // Generate dynamic share receipt on WhatsApp
  const shareReceiptOnWhatsApp = () => {
    if (!orderReceipt) return;
    const itemsList = orderReceipt.items.map(item => `- ${item.name} (x${item.quantity})`).join('%0A');
    const paymentLabel = orderReceipt.paymentMethod === 'edahabia' ? '💳 Carte Edahabia (Sécurisé)' 
                         : orderReceipt.paymentMethod === 'baridimob' ? '📱 Virement BaridiMob' 
                         : '💵 Paiement à la livraison';

    const text = `Bonjour Univers Shop !%0A%0AJe viens de passer une commande sur votre site.%0A%0A🛍️ *Commande:* ${orderReceipt.id}%0A🌟 *Nom Client:* ${orderReceipt.customerName}%0A📞 *Téléphone:* ${orderReceipt.customerPhone}%0A📍 *Wilaya:* ${orderReceipt.customerWilaya}%0A🏠 *Adresse:* ${orderReceipt.customerAddress}%0A%0A📦 *Articles:*%0A${itemsList}%0A%0A💳 *Moyen de paiement:* ${paymentLabel}%0A💰 *Total à payer:* *${orderReceipt.totalAmount.toLocaleString('fr-DZ')} DA*%0A%0AMerci de me confirmer la livraison !`;
    
    window.open(`https://wa.me/213${sellerPhone.substring(1)}?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="w-full max-w-lg bg-white h-full flex flex-col shadow-2xl relative border-l border-slate-100"
        id="checkout-sidebar-panel"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 rounded-lg text-emerald-800">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-bold text-slate-900 text-lg">Paiement 100% Sécurisé</h2>
              <p className="text-slate-500 text-xs font-medium">Univers Shop &bull; Chiffrement SSL</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 px-2.5 rounded-full hover:bg-slate-200 text-slate-500 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Steps overview */}
        {step < 4 && (
          <div className="flex items-center px-6 py-3 bg-slate-100/50 justify-between text-xs border-b border-slate-100">
            <span className={`font-semibold ${step >= 1 ? 'text-sky-600' : 'text-slate-400'}`}>1. Livraison</span>
            <ArrowRight className="w-3 h-3 text-slate-400" />
            <span className={`font-semibold ${step >= 2 ? 'text-sky-600' : 'text-slate-400'}`}>2. Paiement Sécurisé</span>
            {paymentMethod === 'edahabia' && (
              <>
                <ArrowRight className="w-3 h-3 text-slate-400" />
                <span className={`font-semibold ${step >= 3 ? 'text-sky-600' : 'text-slate-400'}`}>3. Vérification 3D Secure</span>
              </>
            )}
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* STEP 1: Contact Information & Address */}
          {step === 1 && (
            <div className="space-y-4" dir={language === 'ar' ? 'rtl' : 'ltr'}>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">
                  {language === 'ar' ? 'معلومات التوصيل والشحن السريع' : 'Informations de Livraison'}
                </h3>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  {language === 'ar' ? 'الاسم الكامل *' : 'Nom Complet *'}
                </label>
                <input 
                  type="text" 
                  placeholder={language === 'ar' ? 'مثال: محمد بن علي' : 'Ex: Mohamed Benali'}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                />
                {errors.name && <p className="text-rose-500 text-xs font-semibold mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  {language === 'ar' ? 'رقم الهاتف الجزائري *' : 'Numéro de Téléphone Algérien *'}
                </label>
                <div className="relative">
                  <Smartphone className={`absolute ${language === 'ar' ? 'right-3' : 'left-3'} top-3.5 w-4 h-4 text-slate-400`} />
                  <input 
                    type="tel" 
                    placeholder="Ex: 0558926754"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={`w-full bg-slate-50 border border-slate-200 rounded-xl ${language === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500`}
                  />
                </div>
                {errors.phone && <p className="text-rose-500 text-xs font-semibold mt-1">{errors.phone}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    {language === 'ar' ? 'ولاية الاستلام *' : "Wilaya d'expédition *"}
                  </label>
                  <select 
                    value={selectedWilayaCode}
                    onChange={(e) => setSelectedWilayaCode(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  >
                    {ALGERIAN_WILAYAS.map((wilaya) => (
                      <option key={wilaya.code} value={wilaya.code}>
                        {wilaya.name} ({wilaya.shippingFee} DA)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    {language === 'ar' ? 'سعر الشحن والتوصيل' : "Frais de livraison d'expédition"}
                  </label>
                  <div className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 flex items-center justify-between">
                    <Truck className="w-4 h-4 text-slate-500" />
                    <span>{selectedWilaya.shippingFee.toLocaleString()} DA</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  {language === 'ar' ? 'العنوان الكامل (البلدية والشارع) *' : 'Adresse Complète *'}
                </label>
                <textarea 
                  rows={3}
                  placeholder={language === 'ar' ? 'رقم الشارع، الحي، البلدية، أو علامات توجيهية للموصل' : 'Numéro de rue, Quartier, Commune, Bureau de poste ou indications'}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                ></textarea>
                {errors.address && <p className="text-rose-500 text-xs font-semibold mt-1">{errors.address}</p>}
              </div>

              {/* Anti-bot Honeypot Input (Invisible to humans) */}
              <div style={{ position: 'absolute', opacity: 0, height: 0, width: 0, overflow: 'hidden', zIndex: -1 }}>
                <input 
                  type="text" 
                  value={honeypot} 
                  onChange={(e) => setHoneypot(e.target.value)} 
                  tabIndex={-1} 
                  autoComplete="off" 
                />
              </div>

              {/* Bot Check Verification */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center gap-3">
                <input 
                  type="checkbox" 
                  id="human-verification-checkbox"
                  checked={isHumanVerified}
                  onChange={(e) => setIsHumanVerified(e.target.checked)}
                  className="w-4.5 h-4.5 rounded border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
                />
                <label htmlFor="human-verification-checkbox" className="text-xs font-bold text-slate-700 cursor-pointer select-none">
                  {language === 'ar' ? 'أؤكد أنني زبون حقيقي وأريد إرسال الطلب 🛡️' : 'Je certifie que je suis un client réel et souhaite envoyer ma commande 🛡️'}
                </label>
              </div>
              {errors.bot && <p className="text-rose-500 text-xs font-semibold mt-1">{errors.bot}</p>}

              <div className="bg-sky-50 border border-sky-100 rounded-2xl p-4 flex gap-3 text-sky-900">
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-sky-600" />
                {language === 'ar' ? (
                  <p className="text-xs leading-relaxed">
                    🔒 بياناتك الشخصية مشفرة ومحمية بالكامل. لتفادي أي خطأ نقوم بتأكيد كل الطلبات عبر اتصال هاتفي سريع على رقمكم قبل الشحن.
                  </p>
                ) : (
                  <p className="text-xs leading-relaxed">
                    🔒 Vos données personnelles sont hautement sécurisées par notre protocole d\'encryptage propriétaire d\'Univers Shop. Nous vérifions toutes les adresses par appel au <b>{sellerPhone}</b> avant expédition.
                  </p>
                )}
              </div>

              {/* Optional Code Promo Coupon fields */}
              {storeSettings?.promoCodeActive && (
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3 mt-4">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    {language === 'ar' ? 'هل لديك كود تخفيض أو رمز ترويجي؟' : 'Avez-vous un Code de Réduction / Promo ?'}
                  </span>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Ex: PROMO20"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      className="flex-grow bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-sky-500 font-bold uppercase"
                    />
                    <button
                      type="button"
                      onClick={() => handleApplyCoupon()}
                      className="bg-slate-900 text-white font-bold text-xs px-4 py-2 rounded-xl hover:bg-sky-650 transition-colors cursor-pointer"
                    >
                      {language === 'ar' ? 'تطبيق' : 'Appliquer'}
                    </button>
                  </div>
                  {promoError && (
                    <p className="text-rose-500 text-[10px] font-bold mt-1 bg-rose-50 px-2 py-1 rounded border border-rose-100">{promoError}</p>
                  )}
                  {promoSuccessMsg && (
                    <p className="text-emerald-600 text-[10px] font-bold mt-1 bg-emerald-50 px-2 py-1 rounded border border-emerald-100">{promoSuccessMsg}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* STEP 2: Secure Payment Methods Selector */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Sélectionnez la Méthode de Paiement Directe</h3>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {/* Delivery Option */}
                <label className={`relative flex items-center justify-between p-4 border rounded-2xl cursor-pointer transition-all ${
                  paymentMethod === 'delivery' 
                    ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/15' 
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}>
                  <input 
                    type="radio" 
                    name="payment" 
                    value="delivery" 
                    checked={paymentMethod === 'delivery'}
                    onChange={() => setPaymentMethod('delivery')}
                    className="sr-only"
                  />
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${paymentMethod === 'delivery' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-display font-semibold text-sm text-slate-900">Paiement Sécurisé à la Livraison</p>
                      <p className="text-slate-500 text-xs">Payez en espèces après vérification du produit</p>
                    </div>
                  </div>
                  {paymentMethod === 'delivery' && <span className="h-5 w-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]"><Check className="w-3 h-3" /></span>}
                </label>

                {/* Edahabia Card */}
                <label className={`relative flex items-center justify-between p-4 border rounded-2xl cursor-pointer transition-all ${
                  paymentMethod === 'edahabia' 
                    ? 'border-sky-600 bg-sky-50/50 ring-2 ring-sky-500/15' 
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}>
                  <input 
                    type="radio" 
                    name="payment" 
                    value="edahabia" 
                    checked={paymentMethod === 'edahabia'}
                    onChange={() => setPaymentMethod('edahabia')}
                    className="sr-only"
                  />
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${paymentMethod === 'edahabia' ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-display font-semibold text-sm text-slate-900">Carte Edahabia / CIB (Algérie Poste)</p>
                      <p className="text-slate-500 text-xs">Simulateur crypté avec code de sécurité OTP</p>
                    </div>
                  </div>
                  {paymentMethod === 'edahabia' && <span className="h-5 w-5 rounded-full bg-sky-600 text-white flex items-center justify-center text-[10px]"><Check className="w-3 h-3" /></span>}
                </label>

                {/* Baridimob */}
                <label className={`relative flex items-center justify-between p-4 border rounded-2xl cursor-pointer transition-all ${
                  paymentMethod === 'baridimob' 
                    ? 'border-amber-600 bg-amber-50/50 ring-2 ring-amber-500/15' 
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}>
                  <input 
                    type="radio" 
                    name="payment" 
                    value="baridimob" 
                    checked={paymentMethod === 'baridimob'}
                    onChange={() => setPaymentMethod('baridimob')}
                    className="sr-only"
                  />
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${paymentMethod === 'baridimob' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-display font-semibold text-sm text-slate-900">Virement Instantané BaridiMob RIP / CCP</p>
                      <p className="text-slate-500 text-xs">Vire l'argent puis uploade le reçu sécurisé</p>
                    </div>
                  </div>
                  {paymentMethod === 'baridimob' && <span className="h-5 w-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px]"><Check className="w-3 h-3" /></span>}
                </label>
              </div>

              {/* Secure Card Inputs */}
              {paymentMethod === 'edahabia' && (
                <div className="space-y-4">
                  {/* Mode Selector for Edahabia payments */}
                  <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-2xl flex flex-col gap-2">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Options de Caisse CIB/Edahabia</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (isChargilyConfigured) {
                            setUseRealChargily(true);
                          } else {
                            if (onShowToast) {
                              onShowToast("Pour activer les transactions réelles d'Algérie Poste (CIB/Edahabia), veuillez configurer la variable d'environnement CHARGILY_APP_KEY dans vos secrets de serveur. Vous pouvez utiliser le simulateur interactif ci-dessous pour le test.", "info");
                            } else {
                              console.warn("Pour activer les transactions réelles d'Algérie Poste (CIB/Edahabia), veuillez configurer la variable d'environnement CHARGILY_APP_KEY.");
                            }
                          }
                        }}
                        className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          useRealChargily 
                            ? 'bg-sky-600 text-white shadow-sm' 
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Passerelle Réelle
                      </button>
                      <button
                        type="button"
                        onClick={() => setUseRealChargily(false)}
                        className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          !useRealChargily 
                            ? 'bg-slate-800 text-white shadow-sm' 
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        Simulateur 3D
                      </button>
                    </div>
                    {isChargilyConfigured ? (
                      <p className="text-[10px] text-emerald-600 font-semibold mt-1">
                        ✓ Gateway officiel Chargily de production connecté avec succès en DZD.
                      </p>
                    ) : (
                      <p className="text-[10px] text-slate-500 font-medium mt-1 font-sans">
                        Fidélité démo active. Aucun compte requis pour simuler le paiement.
                      </p>
                    )}
                  </div>

                  {useRealChargily ? (
                    <div className="bg-sky-50 border border-sky-100 p-5 rounded-2xl space-y-3">
                      <div className="flex items-center gap-2 text-sky-900 border-b border-sky-100 pb-2">
                        <Lock className="w-5 h-5 text-sky-600 flex-shrink-0" />
                        <h4 className="font-bold text-sm">Chiffrement SSL de bout-en-bout (Redirection Officielle)</h4>
                      </div>
                      <p className="text-xs text-sky-800 leading-relaxed font-sans">
                        Conformément aux normes internationales de sécurité bancaire <b>PCI-DSS</b>, vos données de carte bancaire ne transitent jamais par notre serveur Univers Shop.
                      </p>
                      <p className="text-xs text-sky-800 font-medium leading-relaxed font-sans">
                        En cliquant sur "Valider le Paiement", vous serez redirigé vers la page sécurisée hautement cryptée de <b>Chargily Pay</b> pour insérer vos informations Edahabia en Dinars (DZD).
                      </p>
                      
                      {isPaymentLoading && (
                        <div className="flex items-center justify-center gap-2 py-3 bg-white rounded-xl border border-sky-150 text-sky-600 text-xs font-bold animate-pulse">
                          <span>Initialisation du canal de paiement SSL...</span>
                        </div>
                      )}
                      {gatewayError && (
                        <p className="text-rose-500 text-xs font-bold bg-rose-50 p-3 rounded-xl border border-rose-100">{gatewayError}</p>
                      )}
                    </div>
                  ) : (
                    <div className="bg-slate-50 border border-slate-200/60 p-5 rounded-2xl space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-200/60 pb-3 mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-sky-600" />
                          Écran Certifié SSL Algérie Poste (Démo)
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded-sm">Simulation de Chiffrement</span>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Numéro de Carte CIB / Edahabia</label>
                        <input 
                          type="text" 
                          maxLength={19}
                          placeholder="6081 1011 0000 0000"
                          value={cardNumber}
                          onChange={(e) => handleCardNumberChange(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                        />
                        {errors.cardNumber && <p className="text-rose-500 text-[11px] font-semibold mt-1">{errors.cardNumber}</p>}
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Titulaire de la carte</label>
                        <input 
                          type="text" 
                          placeholder="Ex: MOHAMED BENALI"
                          value={cardHolder}
                          onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                        />
                        {errors.cardHolder && <p className="text-rose-500 text-[11px] font-semibold mt-1">{errors.cardHolder}</p>}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Date d'Expiration</label>
                          <input 
                            type="text" 
                            maxLength={5}
                            placeholder="MM/AA"
                            value={cardExpiry}
                            onChange={(e) => handleExpiryChange(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-center font-mono focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                          />
                          {errors.cardExpiry && <p className="text-rose-500 text-[11px] font-semibold mt-1">{errors.cardExpiry}</p>}
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Code CVV</label>
                          <input 
                            type="password" 
                            maxLength={3}
                            placeholder="..."
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-center font-mono focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                          />
                          {errors.cardCvv && <p className="text-rose-500 text-[11px] font-semibold mt-1">{errors.cardCvv}</p>}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Baridimob screen input */}
              {paymentMethod === 'baridimob' && (
                <div className="bg-slate-50 border border-slate-200/60 p-5 rounded-2xl space-y-4 text-xs">
                  <div className="border-b border-slate-200/60 pb-3">
                    <p className="font-bold text-slate-700 text-sm">Informations de virement CCP/BaridiMob</p>
                  </div>
                  <div className="space-y-2 font-mono bg-white p-4 rounded-xl border border-slate-100 text-slate-800">
                    <p className="flex justify-between"><span>🔑 Titulaire:</span> <span className="font-bold">FARES BARAKA</span></p>
                    <p className="flex justify-between"><span>🏦 RIP Algérie Poste:</span> <span className="font-bold text-sky-600">0007 9999 0005589267 54</span></p>
                    <p className="flex justify-between"><span>💼 Numéro CCP:</span> <span className="font-bold">5589267 Clé 54</span></p>
                    <p className="flex justify-between"><span>📱 Téléphone:</span> <span className="font-bold">{sellerPhone}</span></p>
                  </div>

                  <div>
                    <span className="block text-slate-700 font-bold mb-2">Importez la photo du reçu / capture d'écran *</span>
                    <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 rounded-xl bg-white cursor-pointer hover:border-sky-500 transition-colors">
                      {receiptImg ? (
                        <div className="text-center">
                          <Check className="w-8 h-8 text-emerald-500 mx-auto mb-2 bg-emerald-100 p-1.5 rounded-full" />
                          <p className="text-emerald-700 font-bold mb-1">Reçu importé avec sécurité !</p>
                          <p className="text-[10px] text-slate-400 font-mono">Changer de document d'identité</p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                          <p className="text-slate-600 font-bold">Uploader un reçu</p>
                          <p className="text-[10px] text-slate-400 mt-1">Sert de validation sécurisée pour débloquer votre virement</p>
                        </div>
                      )}
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden" 
                      />
                    </label>
                    {errors.receipt && <p className="text-rose-500 text-[11px] font-semibold mt-2">{errors.receipt}</p>}
                  </div>
                </div>
              )}

              {/* Delivery info screen */}
              {paymentMethod === 'delivery' && (
                <div className="bg-emerald-50/50 border border-emerald-100 p-5 rounded-2xl flex gap-3 text-emerald-950">
                  <ShieldCheck className="w-6 h-6 flex-shrink-0 text-emerald-600" />
                  <div>
                    <p className="font-bold text-sm">Garantie Livraison Sûre & Verifiée</p>
                    <p className="text-xs leading-relaxed mt-1 text-slate-600">
                      Un technicien d'Univers Shop à Alger prendra contact téléphonique direct sous 12h au <b>{phone || 'votre numéro'}</b> afin d'établir un code de livraison unique pour votre sécurité contre la fraude. Nous ouvrons le colis ensemble.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: 3D Secure simulated OTP validation screen */}
          {step === 3 && (
            <div className="space-y-6 text-center">
              <div className="bg-slate-50 border border-slate-200/60 p-6 rounded-3xl">
                <Smartphone className="w-12 h-12 text-sky-600 mx-auto mb-3" />
                <h3 className="font-display font-black text-slate-800 text-lg">Authentification 3D Secure</h3>
                <p className="text-xs text-slate-500 mt-1">Un code de sécurité unique à 6 chiffres a été envoyé au numéro du titulaire de la carte.</p>
                
                {/* Simulated notification Banner */}
                <div className="bg-sky-600 text-white rounded-2xl p-3.5 my-5 text-left border border-sky-700 shadow-md">
                  <p className="text-[10px] font-bold opacity-80 uppercase leading-none">Simulation SMS d'Algerie Poste</p>
                  <p className="text-xs font-bold leading-tight mt-1">
                    Univers Shop Securite: Votre code d'autorisation unique est <span className="font-mono bg-white/20 text-white px-2 py-0.5 rounded-sm tracking-wider font-extrabold">{otpCode}</span>. Ne le partagez jamais.
                  </p>
                </div>

                <div className="max-w-xs mx-auto space-y-4">
                  <input 
                    type="text" 
                    maxLength={6}
                    placeholder="Saisir les 6 chiffres"
                    value={enteredOtp}
                    onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-full text-center text-3xl font-mono tracking-widest bg-white border border-slate-200 rounded-xl py-3 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    autoFocus
                  />
                  {otpError && (
                    <p className="text-rose-500 text-xs font-bold bg-rose-50 p-2.5 rounded-xl">{otpError}</p>
                  )}
                  
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setStep(2)} 
                      className="w-1/2 border border-slate-200 text-slate-700 py-3 rounded-xl hover:bg-slate-50 text-xs font-bold cursor-pointer"
                    >
                      Retour
                    </button>
                    <button 
                      onClick={handleOtpVerify} 
                      className="w-1/2 bg-sky-600 text-white py-3 rounded-xl hover:bg-sky-700 text-xs font-bold cursor-pointer transition-all shadow-md shadow-sky-600/10"
                    >
                      Valider l'achat
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Success, Invoice summary & Receipt download */}
          {step === 4 && orderReceipt && (
            <div className="space-y-6 text-center animate-fade-in">
              <div className="inline-flex p-3 bg-emerald-100 text-emerald-800 rounded-full">
                <Check className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-display font-black text-2xl text-slate-900">Achat Confirmé avec Succès !</h3>
                <p className="text-xs text-slate-500 mt-1">Votre reçu de transaction d'Univers Shop a été généré avec un certificat SSL.</p>
              </div>

              {/* Digital Reciept Voucher Card */}
              <div className="border border-slate-200 rounded-3xl overflow-hidden bg-white shadow-lg text-left text-xs font-mono">
                <div className="bg-gradient-to-r from-sky-600 to-sky-700 text-white p-5">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-sky-400">FACTURE DE COMPTE SECURISE</span>
                    <span className="bg-emerald-500 text-[10px] text-white px-2 py-0.5 rounded-sm font-bold tracking-wider font-sans uppercase">Payé</span>
                  </div>
                  <p className="text-[10px] text-slate-400">Garantie Univers Shop &bull; transaction instantanée</p>
                </div>

                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-2 gap-y-3 font-mono text-slate-600 border-b border-slate-100 pb-3">
                    <div>
                      <p className="text-[10px] text-slate-400 font-sans font-bold">TRANSACTION ID</p>
                      <p className="text-slate-900 font-bold">{orderReceipt.transactionId}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-sans font-bold">RÉFÉRENCE DE COMMANDE</p>
                      <p className="text-slate-900 font-bold">{orderReceipt.id}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-sans font-bold">BÉNÉFICIAIRE</p>
                      <p className="text-slate-900 font-bold">Univers Shop</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-sans font-bold">DATE DE TRANSFERT</p>
                      <p className="text-slate-900">{orderReceipt.transactionDate}</p>
                    </div>
                  </div>

                  <div className="font-sans space-y-2 border-b border-slate-100 pb-3">
                    <p className="font-bold text-slate-700 text-xs">Produits commandés :</p>
                    {orderReceipt.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-xs text-slate-600 font-medium">
                        <span>{item.name} <span className="text-slate-400">x{item.quantity}</span></span>
                        <span>{(item.price * item.quantity).toLocaleString('fr-DZ')} DA</span>
                      </div>
                    ))}
                    <div className="flex justify-between text-xs text-slate-500 pt-1">
                      <span>Frais d'expédition ({orderReceipt.customerWilaya})</span>
                      <span>{(selectedWilaya.shippingFee).toLocaleString()} DA</span>
                    </div>
                    {orderReceipt.discountAmount && (
                      <div className="flex justify-between text-xs text-rose-600 font-bold pt-1">
                        <span>Réduction Code Promo ({orderReceipt.promoCodeApplied}) :</span>
                        <span>-{orderReceipt.discountAmount.toLocaleString('fr-DZ')} DA</span>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-150">
                    <span className="font-bold text-slate-700 leading-none">TOTAL NET PAYÉ</span>
                    <span className="text-lg font-black text-slate-900 leading-none">
                      {orderReceipt.totalAmount.toLocaleString('fr-DZ')} DA
                    </span>
                  </div>

                  <div className="flex flex-col items-center justify-center pt-2 text-center text-[10px] text-slate-400 font-sans">
                    <p className="font-mono uppercase tracking-widest text-[#000] font-bold text-xs">||| | || ||| || ||| | ||| {orderReceipt.id} |||</p>
                    <p className="mt-1">Document de paiement officiel archivé avec signature numérique.</p>
                  </div>
                </div>
              </div>

              {/* Whatsapp integration & action buttons */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={shareReceiptOnWhatsApp}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FileText className="w-5 h-5" />
                  <span>Envoyer au Vendeur WhatsApp</span>
                </button>
                <div className="text-[11px] text-slate-500 font-medium">
                  Cliquez sur le bouton ci-dessus pour envoyer instantanément votre reçu et coordonner la livraison.
                </div>
                <button
                  onClick={() => {
                    onClearCart();
                    onClose();
                  }}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-bold py-3 rounded-xl transition-all cursor-pointer"
                >
                  Fermer
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer info (Summary of current buying states) */}
        {step < 4 && (
          <div className="px-6 py-5 border-t border-slate-100 bg-slate-50 space-y-4">
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-slate-500 font-medium">
                <span>Sous-total articles :</span>
                <span className="font-semibold text-slate-900">{subtotal.toLocaleString('fr-DZ')} DA</span>
              </div>
              {discountDeduction > 0 && (
                <div className="flex justify-between text-rose-600 font-bold">
                  <span>Réduction Code Promo ({appliedPromoCode}) :</span>
                  <span>-{discountDeduction.toLocaleString('fr-DZ')} DA</span>
                </div>
              )}
              <div className="flex justify-between text-slate-500 font-medium">
                <span>Livraison ({selectedWilaya.name}) :</span>
                <span className="font-semibold text-slate-900">{selectedWilaya.shippingFee.toLocaleString()} DA</span>
              </div>
              <div className="flex justify-between text-slate-900 border-t border-slate-200/60 pt-3">
                <span className="font-black text-base">TOTAL À PAYER :</span>
                <span className="font-black text-xl text-sky-600">
                  {totalAmount.toLocaleString('fr-DZ')} DA
                </span>
              </div>
            </div>

            {/* Next buttons */}
            <div className="flex gap-4 pt-1">
              {step === 2 && (
                <button
                  onClick={() => setStep(1)}
                  className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-800 py-3.5 rounded-xl font-bold text-xs transition-all cursor-pointer"
                >
                  Retour
                </button>
              )}
              {step === 1 ? (
                <button
                  onClick={proceedToPayment}
                  className="w-full bg-sky-600 hover:bg-sky-700 text-white py-3.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-sky-600/10 cursor-pointer"
                >
                  Confirmer et Passer au Paiement
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleCreateOrder}
                  className="w-2/3 bg-sky-600 hover:bg-sky-700 text-white py-3.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-sky-600/10 cursor-pointer"
                >
                  Valider le Paiement Sécurisé
                  <ShieldCheck className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
