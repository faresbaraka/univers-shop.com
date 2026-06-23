import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Star, ShieldCheck, Heart, Share2, Eye, ShoppingCart, 
  Play, Award, ArrowRight, User, ThumbsUp, Send, CheckCircle2 
} from 'lucide-react';
import { Product } from '../types';
import { Language, translate } from '../lib/translations';
import { motion, AnimatePresence } from 'motion/react';

interface ProductDetailModalProps {
  product: Product;
  allProducts: Product[];
  onAddToCart: (product: Product) => void;
  onClose: () => void;
  language?: Language;
  onShowToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
  likes: number;
}

export default function ProductDetailModal({ 
  product, 
  allProducts, 
  onAddToCart, 
  onClose, 
  language = 'fr', 
  onShowToast 
}: ProductDetailModalProps) {
  const isRtl = language === 'ar';
  
  // Real-time viewer count simulation
  const [viewers, setViewers] = useState(7);
  useEffect(() => {
    // Generate organic random number of viewers shifting every 5-8 seconds
    const interval = setInterval(() => {
      setViewers(prev => {
        const delta = Math.random() > 0.5 ? 1 : -1;
        const next = prev + delta * Math.floor(Math.random() * 3);
        return Math.max(3, Math.min(19, next));
      });
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Image Zoom states
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const [isZoomed, setIsZoomed] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imgRef.current) return;
    const { left, top, width, height } = imgRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  // Video Simulator state
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  // Reviews State
  const [reviewsList, setReviewsList] = useState<Review[]>([]);
  const [newReviewName, setNewReviewName] = useState('');
  const [newReviewComment, setNewReviewComment] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [likedReviews, setLikedReviews] = useState<string[]>([]);

  // Initialize simulated reviews based on product id
  useEffect(() => {
    const seed = product.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const mockNames = [
      "Sofiane Rahmani", "Yasmine Belkacem", "Karim Haddad", 
      "Amel Chérif", "Fares Bouaziz", "Meriem Djebbar"
    ];
    const mockComments = {
      fr: [
        "Excellent produit, la qualité est incroyable et la livraison à Alger s'est faite en 24h seulement !",
        "Je recommande vivement. Conforme à la description et vendeur très sérieux.",
        "Franchement bluffé par la rapidité. Très bien emballé et support réactif !",
        "Parfait, rien à redire. Rapport qualité prix imbattable sur le marché algérien."
      ],
      ar: [
        "منتج رائع جداً، جودة عالية وتوصيل سريع للغاية في وهران في غضون يومين فقط!",
        "أنصح الجميع بالتعامل مع هذا المتجر، المصداقية والخدمة الممتازة.",
        "تغليف ممتاز ومحكم والتوصيل لباب المنزل. شكراً لكم.",
        "خدمة عملاء ممتازة والمنتج ممتاز ومطابق تماماً للصور المعروضة."
      ],
      en: [
        "Superb quality, perfectly matched with description. Delivered to Constantine very fast!",
        "Highly recommended store. Fast local support and premium customer service.",
        "Everything was great, sturdy packaging, and very helpful seller phone support.",
        "Excellent value for money. Definitely buying from Univers Shop again!"
      ]
    };

    const currentComments = mockComments[language] || mockComments['fr'];
    const seededReviews: Review[] = [];
    
    // Seed 3 reviews
    for (let i = 0; i < 3; i++) {
      const nameIndex = (seed + i) % mockNames.length;
      const commentIndex = (seed + i) % currentComments.length;
      const rating = 4 + ((seed + i) % 2); // 4 or 5 stars
      
      seededReviews.push({
        id: `rev-${product.id}-${i}`,
        name: mockNames[nameIndex],
        rating,
        comment: currentComments[commentIndex],
        date: new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000).toLocaleDateString(language === 'ar' ? 'ar-DZ' : 'fr-DZ', {
          year: 'numeric', month: 'long', day: 'numeric'
        }),
        verified: true,
        likes: 2 + (seed % 15) + i
      });
    }
    
    setReviewsList(seededReviews);
  }, [product, language]);

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewName.trim() || !newReviewComment.trim()) {
      onShowToast?.(
        language === 'ar' ? "يرجى ملء جميع الحقول!" : "Veuillez remplir tous les champs !",
        "error"
      );
      return;
    }

    const review: Review = {
      id: `rev-custom-${Date.now()}`,
      name: newReviewName,
      rating: newReviewRating,
      comment: newReviewComment,
      date: new Date().toLocaleDateString(language === 'ar' ? 'ar-DZ' : 'fr-DZ', {
        year: 'numeric', month: 'long', day: 'numeric'
      }),
      verified: true,
      likes: 0
    };

    setReviewsList(prev => [review, ...prev]);
    setNewReviewName('');
    setNewReviewComment('');
    setNewReviewRating(5);
    onShowToast?.(
      language === 'ar' ? "تم نشر مراجعتك بنجاح! شكراً لك." : "Votre avis a été publié avec succès ! Merci.",
      "success"
    );
  };

  const handleLikeReview = (reviewId: string) => {
    if (likedReviews.includes(reviewId)) return;
    setLikedReviews(prev => [...prev, reviewId]);
    setReviewsList(prev => prev.map(r => r.id === reviewId ? { ...r, likes: r.likes + 1 } : r));
  };

  // Recommendations: products from same category, excluding current
  const recommendedProducts = allProducts
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 3);

  // Average rating calculated from seeded
  const avgRating = parseFloat(
    (reviewsList.reduce((acc, r) => acc + r.rating, 0) / (reviewsList.length || 1)).toFixed(1)
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-md flex justify-center p-4 sm:p-6 md:p-10">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: "spring", duration: 0.4 }}
        className="bg-white rounded-[32px] w-full max-w-5xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col my-auto max-h-[90vh] relative"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* Floating Close Button */}
        <button 
          onClick={onClose}
          className={`absolute top-4 ${isRtl ? 'left-4' : 'right-4'} z-30 p-2.5 bg-slate-900/10 hover:bg-slate-900/20 text-slate-800 rounded-full transition-colors cursor-pointer`}
          title="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
          
          {/* Main Grid: Images & Actions */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            
            {/* Left: Product Images & Video Simulator (5 cols) */}
            <div className="md:col-span-5 space-y-4">
              
              {/* Main Image with Zoom Magnifier */}
              <div 
                className="relative aspect-square w-full bg-slate-50 border border-slate-100 rounded-3xl overflow-hidden cursor-crosshair group shadow-inner"
                onMouseMove={handleMouseMove}
                onMouseEnter={() => setIsZoomed(true)}
                onMouseLeave={() => setIsZoomed(false)}
              >
                <img
                  ref={imgRef}
                  src={product.imageUrl}
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover transition-transform duration-100"
                  style={{
                    transform: isZoomed ? 'scale(2.2)' : 'scale(1)',
                    transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`
                  }}
                />

                {/* Secure Trust Stamp */}
                <div className={`absolute bottom-3 ${isRtl ? 'left-3' : 'right-3'} z-10 text-[9px] bg-emerald-600/90 text-white font-extrabold px-3 py-1 rounded-full flex items-center gap-1 shadow-md shadow-emerald-600/10`}>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{language === 'ar' ? 'ضمان أصلي 100%' : 'Garantie 100% Authentique'}</span>
                </div>
              </div>

              {/* Video Simulator Section */}
              <div className="border border-slate-150 rounded-2xl p-4 bg-slate-50/50 space-y-3">
                <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Play className="w-4 h-4 text-[#0052FF]" />
                  <span>{translate('video_demonstration', language)}</span>
                </h4>

                <div 
                  className="relative rounded-xl overflow-hidden aspect-video bg-slate-900 border border-slate-800 flex items-center justify-center cursor-pointer group shadow-md"
                  onClick={() => setIsVideoPlaying(!isVideoPlaying)}
                >
                  {isVideoPlaying ? (
                    <div className="absolute inset-0 flex flex-col justify-between p-3 bg-slate-950 font-mono text-[10px] text-emerald-400">
                      <div className="flex justify-between items-center border-b border-emerald-950 pb-1">
                        <span>● LIVE_STREAM_SIMULATOR</span>
                        <span className="animate-pulse">REC 1080p</span>
                      </div>
                      <div className="text-center space-y-1.5 py-4">
                        <p className="text-xs font-bold text-white">{product.name}</p>
                        <p className="opacity-75">{translate('video_placeholder_text', language)}</p>
                        <div className="w-16 h-1.5 bg-emerald-950 mx-auto rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-400 w-2/3 animate-ping" />
                        </div>
                      </div>
                      <div className="flex justify-between text-[9px] opacity-85">
                        <span>0:14 / 2:30</span>
                        <span>Univers Shop HQ</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <img 
                        src={product.imageUrl} 
                        alt="Video preview" 
                        referrerPolicy="no-referrer"
                        className="absolute inset-0 w-full h-full object-cover opacity-30 filter blur-xs group-hover:scale-102 transition-transform duration-500" 
                      />
                      <div className="relative z-10 w-12 h-12 rounded-full bg-[#0052FF] text-white flex items-center justify-center shadow-lg group-hover:bg-[#0052FF]/95 group-hover:scale-110 transition-all duration-300">
                        <Play className="w-6 h-6 fill-current text-white ml-0.5" />
                      </div>
                    </>
                  )}
                </div>
              </div>

            </div>

            {/* Right: Detailed text & CTA Buying Engine (7 cols) */}
            <div className="md:col-span-7 space-y-6">
              
              {/* Product Header */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="bg-[#0052FF]/10 text-[#0052FF] text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md">
                    {product.category}
                  </span>
                  
                  {/* Stock tag */}
                  {product.stock > 0 ? (
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-bold px-2.5 py-1 rounded-md">
                      {language === 'ar' ? 'متوفر في المخزن' : 'En stock'} ({product.stock})
                    </span>
                  ) : (
                    <span className="bg-rose-50 text-rose-700 border border-rose-100 text-[10px] font-bold px-2.5 py-1 rounded-md">
                      {language === 'ar' ? 'منتهي من المخزن' : 'Rupture de Stock'}
                    </span>
                  )}
                </div>

                <h1 className="font-display font-black text-slate-950 text-xl sm:text-2xl leading-tight">
                  {product.name}
                </h1>

                {/* Rating summary */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <div className="flex items-center text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-4 h-4 ${i < Math.floor(avgRating) ? 'fill-current text-amber-400' : 'text-slate-200'}`} 
                      />
                    ))}
                  </div>
                  <span className="text-sm font-bold text-slate-800">{avgRating} / 5</span>
                  <span className="text-slate-300 font-medium">|</span>
                  <span className="text-xs font-bold text-[#0052FF] bg-[#0052FF]/5 px-2.5 py-1 rounded-full">
                    {translate('reviews_title', language, { count: reviewsList.length })}
                  </span>
                </div>
              </div>

              {/* LIVE VIEWER COUNT & POPULARITY SOCIAL PROOF */}
              <div className="bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-150 rounded-2xl p-4 space-y-2.5">
                <div className="flex items-center gap-2 text-sky-950">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                  <p className="text-xs font-black">
                    {translate(viewers === 1 ? 'live_views_one' : 'live_views_multi', language, { count: viewers })}
                  </p>
                </div>
                
                <p className="text-[11px] text-sky-800 font-semibold leading-relaxed pl-5">
                  🔥 {translate('popularity_high', language, { count: product.salesCount })}
                </p>

                <p className="text-[11px] text-emerald-800 font-semibold leading-relaxed pl-5">
                  🛡️ {translate('reliable_seller', language)}
                </p>
              </div>

              {/* Price Block */}
              <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">
                    {language === 'ar' ? 'سعر البيع الممتاز' : 'Prix de Vente Spécial'}
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-display font-black text-[#0052FF]">
                      {product.price.toLocaleString('fr-DZ')} <span className="text-xs font-bold ml-0.5">DA</span>
                    </span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-xs text-slate-400 line-through font-mono font-medium">
                        {product.originalPrice.toLocaleString('fr-DZ')} DA
                      </span>
                    )}
                  </div>
                </div>

                {product.originalPrice && product.originalPrice > product.price && (
                  <div className="bg-red-500 text-white font-black text-[10px] uppercase px-3 py-1.5 rounded-lg animate-pulse">
                    {language === 'ar' ? 'تخفيض' : 'Réduction'} -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                  </div>
                )}
              </div>

              {/* Product description */}
              <div className="space-y-2">
                <h3 className="font-display font-bold text-slate-900 text-sm">
                  {translate('product_details', language)}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-sans whitespace-pre-line bg-white border border-slate-100 rounded-2xl p-4 shadow-2xs">
                  {product.description}
                </p>
              </div>

              {/* BIG CONVERSION BUY ACTION BUTTON */}
              <div className="pt-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    onAddToCart(product);
                    onShowToast?.(
                      language === 'ar' ? "تمت إضافة المنتج إلى سلتك!" : "Produit ajouté à votre panier !",
                      "success"
                    );
                  }}
                  disabled={product.stock <= 0}
                  className={`w-full py-4 rounded-2xl text-xs font-black uppercase tracking-wider shadow-lg flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
                    product.stock <= 0
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                      : 'bg-[#0052FF] hover:bg-sky-600 text-white shadow-[#0052FF]/20 animate-pulse hover:animate-none'
                  }`}
                >
                  <ShoppingCart className="w-4 h-4 text-white" />
                  <span>{translate('buy_now', language)}</span>
                </motion.button>
              </div>

            </div>
          </div>

          {/* SIMILAR RECOMMENDED PRODUCTS SECTION */}
          {recommendedProducts.length > 0 && (
            <div className="border-t border-slate-100 pt-8 space-y-4">
              <h3 className="font-display font-black text-slate-900 text-base flex items-center gap-2">
                <Award className="w-4.5 h-4.5 text-[#0052FF]" />
                <span>{translate('similar_products', language)}</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {recommendedProducts.map((p) => (
                  <div 
                    key={p.id}
                    onClick={() => {
                      // Click on recommendation swaps current product view
                      onClose();
                      setTimeout(() => {
                        const card = document.getElementById(`product-card-${p.id}`);
                        card?.click();
                      }, 100);
                    }}
                    className="group border border-slate-150 rounded-2xl p-3 bg-white hover:border-sky-500 hover:shadow-md transition-all duration-300 cursor-pointer flex gap-3 items-center"
                  >
                    <img 
                      src={p.imageUrl} 
                      alt={p.name} 
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-xl object-cover" 
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-xs text-slate-800 truncate group-hover:text-sky-600">
                        {p.name}
                      </h4>
                      <p className="font-black text-[11px] text-[#0052FF] mt-0.5">
                        {p.price.toLocaleString('fr-DZ')} DA
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* REVIEWS HUB SECTION (Star ratings, list, and write review form) */}
          <div className="border-t border-slate-100 pt-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            
            {/* Reviews list (7 cols) */}
            <div className="md:col-span-7 space-y-4">
              <h3 className="font-display font-black text-slate-950 text-base">
                {translate('reviews_title', language, { count: reviewsList.length })}
              </h3>

              {reviewsList.length === 0 ? (
                <div className="bg-slate-50 rounded-2xl p-6 text-center text-xs text-slate-500">
                  {translate('no_reviews', language)}
                </div>
              ) : (
                <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
                  {reviewsList.map((review) => (
                    <div 
                      key={review.id}
                      className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 space-y-2 font-sans"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs">
                            {review.name.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-xs text-slate-800">{review.name}</span>
                              {review.verified && (
                                <span className="bg-emerald-50 text-emerald-700 text-[8px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                  <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                                  <span>{translate('verified_buyer_badge', language)}</span>
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-400">{review.date}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-0.5 text-amber-400">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-3 h-3 ${i < review.rating ? 'fill-current' : 'text-slate-200'}`} 
                            />
                          ))}
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed font-sans font-medium">
                        {review.comment}
                      </p>

                      <div className="flex justify-end">
                        <button
                          onClick={() => handleLikeReview(review.id)}
                          className={`text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                            likedReviews.includes(review.id)
                              ? 'text-sky-600'
                              : 'text-slate-400 hover:text-slate-600'
                          }`}
                        >
                          <ThumbsUp className="w-3 h-3" />
                          <span>{review.likes}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Write review form (5 cols) */}
            <div className="md:col-span-5 bg-slate-50 border border-slate-150 rounded-2xl p-5">
              <h3 className="font-display font-black text-slate-900 text-sm mb-3">
                {translate('write_review', language)}
              </h3>

              <form onSubmit={handleAddReview} className="space-y-4">
                
                {/* Stars selector */}
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">
                    {translate('star_rating_label', language)}
                  </label>
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setNewReviewRating(i + 1)}
                        className="p-0.5 hover:scale-110 active:scale-95 transition-all cursor-pointer"
                      >
                        <Star className={`w-6 h-6 ${i < newReviewRating ? 'fill-current text-amber-400' : 'text-slate-300'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">
                    {translate('checkout_fullname', language)}
                  </label>
                  <input 
                    type="text"
                    required
                    placeholder={translate('review_name_placeholder', language)}
                    value={newReviewName}
                    onChange={(e) => setNewReviewName(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#0052FF] font-medium"
                  />
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">
                    {language === 'ar' ? 'ملاحظاتك وتقييمك' : 'Commentaire'}
                  </label>
                  <textarea 
                    rows={3}
                    required
                    placeholder={translate('review_comment_placeholder', language)}
                    value={newReviewComment}
                    onChange={(e) => setNewReviewComment(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#0052FF] font-medium resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#0052FF] hover:bg-sky-600 text-white font-black text-xs uppercase rounded-xl shadow-md shadow-[#0052FF]/10 flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{translate('review_submit', language)}</span>
                </button>

              </form>
            </div>

          </div>

        </div>
      </motion.div>
    </div>
  );
}
