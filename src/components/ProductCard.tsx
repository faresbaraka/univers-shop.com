import React from 'react';
import { ShoppingCart, ShieldCheck } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  key?: string;
  product: Product;
  onAddToCart: (product: Product) => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const isOutOfStock = product.stock <= 0;

  return (
    <div 
      className="group relative flex flex-col bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
      id={`product-card-${product.id}`}
    >
      {/* Category and stock badge */}
      <div className="absolute top-3 left-3 z-10 flex gap-2">
        <span className="bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
          {product.category}
        </span>
        {product.stock < 3 && product.stock > 0 && (
          <span className="bg-amber-500/90 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
            Presque épuisé
          </span>
        )}
        {product.originalPrice && product.originalPrice > product.price && (
          <span className="bg-red-600/95 backdrop-blur-md text-white text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-0.5 animate-pulse">
            Promo -{Math.round((1 - product.price / product.originalPrice) * 100)}%
          </span>
        )}
      </div>

      {/* SSL badge over product for trust */}
      <div className="absolute top-3 right-3 z-10 text-[9px] bg-emerald-500/90 backdrop-blur-md text-white px-2 py-1 rounded-full font-semibold flex items-center gap-1 shadow-xs shadow-emerald-500/10">
        <ShieldCheck className="w-3 h-3" />
        <span>Achat Sécurisé</span>
      </div>

      {/* Product Image */}
      <div className="relative aspect-square w-full bg-slate-50 overflow-hidden">
        <img
          src={product.imageUrl}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500 rounded-t-3xl"
        />
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex items-center justify-center">
            <span className="bg-rose-500 text-white font-display font-semibold text-sm px-4 py-2 rounded-xl shadow-lg">
              Rupture de Stock
            </span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display font-semibold text-slate-800 text-base line-clamp-1 group-hover:text-sky-600 transition-colors">
          {product.name}
        </h3>
        <p className="mt-1 text-xs text-slate-500 line-clamp-2 h-8 leading-snug">
          {product.description}
        </p>

        {/* Info footer */}
        <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-50">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Prix</span>
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
            onClick={() => onAddToCart(product)}
            disabled={isOutOfStock}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-md cursor-pointer ${
              isOutOfStock
                ? 'bg-slate-100 text-slate-400 shadow-none cursor-not-allowed'
                : 'bg-sky-600 text-white hover:bg-sky-700 shadow-sky-600/15 hover:shadow-sky-600/25'
            }`}
            id={`add-to-cart-${product.id}`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Acheter</span>
          </button>
        </div>
      </div>
    </div>
  );
}
