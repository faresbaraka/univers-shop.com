import React, { useState } from 'react';
import { ShoppingCart, ShieldCheck, Heart, Share2, Star, Award, TrendingUp, Sliders } from 'lucide-react';
import { Product } from '../types';
import { Language, translate } from '../lib/translations';

interface ProductCardProps {
  key?: string;
  product: Product;
  onAddToCart: (product: Product) => void;
  onHeart?: (product: Product) => void;
  onShare?: (product: Product) => void;
  language?: Language;
  onSelect?: (product: Product) => void;
}

export default function ProductCard({ product, onAddToCart, onHeart, onShare, language = 'fr', onSelect }: ProductCardProps) {
  const isOutOfStock = product.stock <= 0;
  const [liked, setLiked] = useState(false);

  // Generate simulated reviews rating & count based on product id for consistency
  const getRating = (id: string) => {
    const sum = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const rating = 4.5 + (sum % 5) * 0.1; // 4.5 to 4.9
    const reviews = 12 + (sum % 80);
    return { rating: parseFloat(rating.toFixed(1)), reviews };
  };

  const { rating, reviews } = getRating(product.id);
  const isPopular = product.salesCount > 10;
  const isReliable = product.stock > 3; // custom logic for high reliability badge

  const isRtl = language === 'ar';

  return (
    <div 
      className="group relative flex flex-col bg-[#0E1017] rounded-2xl overflow-hidden border border-slate-800/80 hover:border-sky-500/40 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
      id={`product-card-${product.id}`}
      onClick={() => onSelect?.(product)}
    >
      {/* Category and stock badge */}
      <div className={`absolute top-3 ${isRtl ? 'right-3' : 'left-3'} z-10 flex flex-wrap gap-1.5 max-w-[80%]`}>
        <span className="bg-slate-950/80 backdrop-blur-md text-slate-300 text-[9px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-slate-800">
          {product.category}
        </span>
        {product.stock < 3 && product.stock > 0 && (
          <span className="bg-amber-500/90 backdrop-blur-md text-slate-950 text-[9px] font-mono font-bold px-2.5 py-0.5 rounded-full">
            {language === 'ar' ? 'وشك النفاد' : language === 'en' ? 'Almost Out' : 'Presque épuisé'}
          </span>
        )}
        {product.originalPrice && product.originalPrice > product.price && (
          <span className="bg-rose-600/90 backdrop-blur-md text-white text-[9px] font-mono font-black px-2 py-0.5 rounded-full flex items-center gap-0.5">
            -{Math.round((1 - product.price / product.originalPrice) * 100)}%
          </span>
        )}
      </div>

      {/* SSL badge over product for trust */}
      <div className={`absolute top-3 ${isRtl ? 'left-3' : 'right-3'} z-10 text-[9px] bg-slate-950/80 backdrop-blur-md text-emerald-400 border border-emerald-500/30 px-2 py-1 rounded-full font-mono font-bold flex items-center gap-1 shadow-sm`}>
        <ShieldCheck className="w-3 h-3 text-emerald-400" />
        <span className="hidden xs:inline">{language === 'ar' ? 'آمن 100%' : language === 'en' ? 'Secure' : 'Sécurisé'}</span>
      </div>

      {/* Product Image */}
      <div className="relative aspect-square w-full bg-slate-950 overflow-hidden">
        <img
          src={product.imageUrl}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500 rounded-t-2xl opacity-90 group-hover:opacity-100"
        />
        
        {/* Trust Badges directly on image corner */}
        <div className={`absolute bottom-3 ${isRtl ? 'right-3' : 'left-3'} z-10 flex flex-col gap-1.5`}>
          {isPopular && (
            <span className="bg-slate-950/90 backdrop-blur-md text-sky-400 border border-sky-500/30 text-[9px] font-mono font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-sm uppercase tracking-wider">
              <TrendingUp className="w-3 h-3 text-sky-400" />
              <span>{language === 'ar' ? 'شائع' : language === 'en' ? 'Popular' : 'Populaire'}</span>
            </span>
          )}
          {isReliable && (
            <span className="bg-slate-950/90 backdrop-blur-md text-emerald-400 border border-emerald-500/30 text-[9px] font-mono font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-sm uppercase tracking-wider">
              <Award className="w-3 h-3 text-emerald-400" />
              <span>{language === 'ar' ? 'موثوق' : language === 'en' ? 'Verified' : 'Certifié'}</span>
            </span>
          )}
        </div>

        {/* Interactive Floating Action Buttons */}
        {!isOutOfStock && (
          <div className={`absolute bottom-3 ${isRtl ? 'left-3' : 'right-3'} z-10 flex flex-col gap-2 opacity-90 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300`}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLiked(!liked);
                if (onHeart) onHeart(product);
              }}
              className={`p-2 rounded-xl backdrop-blur-md shadow-md border transition-all hover:scale-110 active:scale-90 cursor-pointer ${
                liked 
                  ? 'bg-rose-500 text-white border-rose-400' 
                  : 'bg-slate-900/90 text-slate-300 border-slate-700 hover:text-rose-400'
              }`}
              title="Ajouter aux favoris"
            >
              <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onShare) onShare(product);
              }}
              className="p-2 rounded-xl bg-slate-900/90 backdrop-blur-md text-slate-300 border border-slate-700 shadow-md transition-all hover:scale-110 active:scale-90 hover:text-sky-400 cursor-pointer"
              title="Partager ce produit"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        )}

        {isOutOfStock && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center">
            <span className="bg-rose-600/90 border border-rose-500 text-white font-mono font-bold text-xs uppercase tracking-wider px-4 py-2 rounded-xl shadow-lg">
              {language === 'ar' ? 'نفذت الكمية' : language === 'en' ? 'Out of Stock' : 'Rupture de Stock'}
            </span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex flex-1 flex-col p-5" dir={isRtl ? 'rtl' : 'ltr'}>
        <h3 className="font-display font-bold text-slate-100 text-base line-clamp-1 group-hover:text-sky-400 transition-colors tracking-tight">
          {product.name}
        </h3>
        
        {/* Star rating social proof */}
        <div className="flex items-center gap-1 mt-1.5">
          <div className="flex items-center text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={`w-3.5 h-3.5 ${i < Math.floor(rating) ? 'fill-current' : 'text-slate-800'}`} 
              />
            ))}
          </div>
          <span className="text-xs font-mono font-bold text-slate-300 ml-1">{rating}</span>
          <span className="text-[10px] text-slate-500 font-mono">({reviews})</span>
        </div>

        <p className="mt-2 text-xs text-slate-400 line-clamp-2 h-8 leading-snug">
          {product.description}
        </p>

        {/* Sales count label */}
        <div className="mt-2.5 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-ping" />
          <span className="text-[10px] font-mono font-bold text-sky-400 uppercase tracking-widest">
            {translate('sales_count_label', language, { count: product.salesCount })}
          </span>
        </div>

        {/* Info footer */}
        <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-800/80">
          <div className="flex flex-col">
            <span className="text-[9px] uppercase font-mono font-bold text-slate-500 tracking-wider">
              {language === 'ar' ? 'السعر' : language === 'en' ? 'Price' : 'Prix'}
            </span>
            <div className="flex flex-col">
              <span className="text-xl font-mono font-black text-white">
                {product.price.toLocaleString('fr-DZ')} <span className="text-xs font-mono font-semibold text-sky-400 ml-0.5">DA</span>
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-[11px] text-slate-500 line-through font-mono">
                  {product.originalPrice.toLocaleString('fr-DZ')} DA
                </span>
              )}
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product);
            }}
            disabled={isOutOfStock}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl font-mono font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer ${
              isOutOfStock
                ? 'bg-slate-800 text-slate-500 shadow-none cursor-not-allowed border border-slate-700'
                : 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white border border-sky-400/30 shadow-sky-500/20 active:scale-95'
            }`}
            id={`add-to-cart-${product.id}`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>{translate('add_to_cart', language)}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
