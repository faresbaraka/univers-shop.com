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
      className="group relative flex flex-col bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
      id={`product-card-${product.id}`}
      onClick={() => onSelect?.(product)}
    >
      {/* Category and stock badge */}
      <div className={`absolute top-3 ${isRtl ? 'right-3' : 'left-3'} z-10 flex flex-wrap gap-1.5 max-w-[80%]`}>
        <span className="bg-slate-900/80 backdrop-blur-md text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
          {product.category}
        </span>
        {product.stock < 3 && product.stock > 0 && (
          <span className="bg-amber-500/90 backdrop-blur-md text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
            {language === 'ar' ? 'وشك النفاد' : language === 'en' ? 'Almost Out' : 'Presque épuisé'}
          </span>
        )}
        {product.originalPrice && product.originalPrice > product.price && (
          <span className="bg-red-600/95 backdrop-blur-md text-white text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-0.5 animate-pulse">
            -{Math.round((1 - product.price / product.originalPrice) * 100)}%
          </span>
        )}
      </div>

      {/* SSL badge over product for trust */}
      <div className={`absolute top-3 ${isRtl ? 'left-3' : 'right-3'} z-10 text-[9px] bg-emerald-500/90 backdrop-blur-md text-white px-2 py-1 rounded-full font-semibold flex items-center gap-1 shadow-xs shadow-emerald-500/10`}>
        <ShieldCheck className="w-3 h-3" />
        <span className="hidden xs:inline">{language === 'ar' ? 'آمن 100%' : language === 'en' ? 'Secure Buy' : 'Achat Sécurisé'}</span>
      </div>

      {/* Product Image */}
      <div className="relative aspect-square w-full bg-slate-50 overflow-hidden">
        <img
          src={product.imageUrl}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500 rounded-t-3xl"
        />
        
        {/* Trust Badges directly on image corner */}
        <div className={`absolute bottom-3 ${isRtl ? 'right-3' : 'left-3'} z-10 flex flex-col gap-1.5`}>
          {isPopular && (
            <span className="bg-sky-500/90 backdrop-blur-md text-white text-[9px] font-extrabold px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-sm">
              <TrendingUp className="w-3 h-3" />
              <span>{language === 'ar' ? 'شائع جداً' : language === 'en' ? 'Popular Product' : 'Produit Populaire'}</span>
            </span>
          )}
          {isReliable && (
            <span className="bg-emerald-500/90 backdrop-blur-md text-white text-[9px] font-extrabold px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-sm">
              <Award className="w-3 h-3" />
              <span>{language === 'ar' ? 'بائع موثوق' : language === 'en' ? 'Reliable Seller' : 'Vendeur Fiable'}</span>
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
              className={`p-2 rounded-full backdrop-blur-md shadow-md border transition-all hover:scale-110 active:scale-90 cursor-pointer ${
                liked 
                  ? 'bg-rose-500 text-white border-rose-400' 
                  : 'bg-white/95 text-slate-700 border-slate-100 hover:text-rose-500'
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
              className="p-2 rounded-full bg-white/95 backdrop-blur-md text-slate-700 border border-slate-100 shadow-md transition-all hover:scale-110 active:scale-90 hover:text-sky-600 cursor-pointer"
              title="Partager ce produit"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        )}

        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex items-center justify-center">
            <span className="bg-rose-500 text-white font-display font-semibold text-sm px-4 py-2 rounded-xl shadow-lg">
              {language === 'ar' ? 'نفذت الكمية' : language === 'en' ? 'Out of Stock' : 'Rupture de Stock'}
            </span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex flex-1 flex-col p-5" dir={isRtl ? 'rtl' : 'ltr'}>
        <h3 className="font-display font-semibold text-slate-800 text-base line-clamp-1 group-hover:text-sky-600 transition-colors">
          {product.name}
        </h3>
        
        {/* Star rating social proof */}
        <div className="flex items-center gap-1 mt-1.5">
          <div className="flex items-center text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={`w-3.5 h-3.5 ${i < Math.floor(rating) ? 'fill-current' : 'text-slate-200'}`} 
              />
            ))}
          </div>
          <span className="text-xs font-bold text-slate-700 ml-1">{rating}</span>
          <span className="text-[10px] text-slate-400 font-medium">({reviews})</span>
        </div>

        <p className="mt-2 text-xs text-slate-500 line-clamp-2 h-8 leading-snug">
          {product.description}
        </p>

        {/* Sales count label */}
        <div className="mt-2.5 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-ping" />
          <span className="text-[10px] font-extrabold text-sky-600 uppercase tracking-wider">
            {translate('sales_count_label', language, { count: product.salesCount })}
          </span>
        </div>

        {/* Info footer */}
        <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-50">
          <div className="flex flex-col">
            <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">
              {language === 'ar' ? 'السعر' : language === 'en' ? 'Price' : 'Prix'}
            </span>
            <div className="flex flex-col">
              <span className={`text-xl font-display font-extrabold ${product.originalPrice && product.originalPrice > product.price ? 'text-red-600' : 'text-slate-900'}`}>
                {product.price.toLocaleString('fr-DZ')} <span className="text-xs font-semibold text-sky-600 ml-0.5">DA</span>
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-[11px] text-slate-400 line-through font-mono">
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
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-md cursor-pointer ${
              isOutOfStock
                ? 'bg-slate-100 text-slate-400 shadow-none cursor-not-allowed'
                : 'bg-sky-600 text-white hover:bg-sky-700 shadow-sky-600/15 hover:shadow-sky-600/25'
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
