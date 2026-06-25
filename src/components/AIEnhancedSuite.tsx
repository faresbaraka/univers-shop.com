import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, ShoppingBag, Eye, HelpCircle, ArrowRight, X, ArrowUp, Check, 
  RotateCw, RefreshCw, Layers, ShieldCheck, Heart, User, CheckCircle2,
  Trash2, Plus, BarChart2, Smartphone, AlertTriangle, HelpCircle as HelpIcon, Scale,
  Camera, Upload, Sliders, ChevronDown, CheckCircle
} from 'lucide-react';
import { Product } from '../types';
import { motion, AnimatePresence } from 'motion/react';

// ==========================================
// 1. BACK TO TOP BUTTON
// ==========================================
export function BackToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      id="back-to-top-btn"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-24 left-5 z-40 p-3 bg-slate-900 text-white rounded-full shadow-2xl hover:bg-sky-600 hover:scale-110 active:scale-95 transition-all cursor-pointer border border-slate-800"
      title="Retour en haut"
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  );
}

// ==========================================
// 2. SHOP THE LOOK
// ==========================================
interface ShopTheLookProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export function ShopTheLook({ products, onAddToCart, onShowToast }: ShopTheLookProps) {
  const [activeLook, setActiveLook] = useState<'tech' | 'sport'>('tech');

  // Find actual products in catalog to bundle
  const packTechIds = ['prod-2', 'prod-5', 'prod-4']; // Sony WH-1000XM5, Sac BANGE, Galaxy Watch
  const packSportIds = ['prod-6', 'prod-5']; // Pegasus 40, Sac BANGE

  const techProducts = products.filter(p => packTechIds.includes(p.id));
  const sportProducts = products.filter(p => packSportIds.includes(p.id));

  const buyEntireLook = (look: 'tech' | 'sport') => {
    const targetProducts = look === 'tech' ? techProducts : sportProducts;
    if (targetProducts.length === 0) {
      onShowToast("Certains produits du look ne sont plus disponibles.", "error");
      return;
    }
    targetProducts.forEach(p => onAddToCart(p));
    onShowToast(`🎉 Look Complet ajouté au panier ! Remise Look appliquée lors de la caisse.`, 'success');
  };

  return (
    <div className="bg-white border border-slate-150 rounded-[32px] p-6 sm:p-8 shadow-sm" id="shop-the-look-section">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md">
            <Sparkles className="w-3.5 h-3.5" /> Espace "Shop The Look"
          </span>
          <h3 className="font-display font-black text-slate-950 text-base sm:text-lg tracking-tight mt-1">
            Tendances Algériennes 2026
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Achetez des styles complets coordonnés par nos stylistes IA avec une remise exclusive de lot !
          </p>
        </div>

        {/* Toggle Controls */}
        <div className="flex gap-2 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setActiveLook('tech')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeLook === 'tech' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            💻 Look Business Nomade
          </button>
          <button
            onClick={() => setActiveLook('sport')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeLook === 'sport' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            👟 Look Athlétique Urbain
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Look Image / Collage (5 cols) */}
        <div className="md:col-span-5 relative overflow-hidden rounded-2xl aspect-[4/3] md:aspect-[3/4] bg-slate-900 shadow-md group">
          <img 
            src={activeLook === 'tech' 
              ? 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&q=80&w=600'
              : 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&q=80&w=600'
            } 
            alt="Look Style"
            className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
          <div className="absolute bottom-5 inset-x-5 space-y-1 text-white">
            <span className="text-[10px] uppercase font-black tracking-wider text-sky-400">Coordinateurs IA</span>
            <h4 className="font-display font-black text-base sm:text-lg">
              {activeLook === 'tech' ? 'Style Nomade Connecté' : 'Sprint Urbain'}
            </h4>
            <p className="text-[11px] text-slate-300 leading-tight">
              {activeLook === 'tech' 
                ? "Idéal pour travailler en déplacement, café ou coworking avec un confort total."
                : "Une respirabilité optimale et une modularité idéale pour l'exercice quotidien."
              }
            </p>
          </div>
        </div>

        {/* Look Items grid (7 cols) */}
        <div className="md:col-span-7 space-y-5">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">
            Articles inclus dans ce look :
          </h4>

          <div className="space-y-3">
            {(activeLook === 'tech' ? techProducts : sportProducts).map((p) => (
              <div 
                key={p.id}
                className="flex items-center gap-4 p-3 bg-slate-50 border border-slate-150 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <img 
                  src={p.imageUrl} 
                  alt={p.name} 
                  className="w-12 h-12 object-cover rounded-lg border border-slate-200"
                />
                <div className="flex-1 min-w-0">
                  <h5 className="font-semibold text-xs text-slate-900 truncate">{p.name}</h5>
                  <p className="text-[10px] text-slate-500 font-bold">{p.category}</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-xs text-slate-900">{p.price.toLocaleString('fr-DZ')} DA</p>
                  <span className="text-[9px] text-emerald-600 font-bold">En stock</span>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400">Total du Look</p>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="font-display font-black text-xl text-[#0052FF]">
                  {activeLook === 'tech' ? '92 500 DA' : '31 000 DA'}
                </span>
                <span className="text-xs text-slate-400 line-through font-mono">
                  {activeLook === 'tech' ? '97 800 DA' : '32 300 DA'}
                </span>
              </div>
              <p className="text-[9px] text-emerald-600 font-bold mt-0.5">🔥 Remise Spéciale Styliste IA de -5% appliquée</p>
            </div>

            <button
              onClick={() => buyEntireLook(activeLook)}
              className="px-6 py-3 bg-[#0052FF] hover:bg-sky-600 text-white font-black text-xs uppercase rounded-xl shadow-lg shadow-[#0052FF]/10 hover:shadow-[#0052FF]/20 cursor-pointer flex items-center justify-center gap-1.5 transition-all self-stretch sm:self-auto"
            >
              <ShoppingBag className="w-4 h-4" />
              Acheter le Look Complet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 3. PRODUCT COMPARATOR
// ==========================================
interface ProductComparatorProps {
  comparedProducts: Product[];
  onRemove: (id: string) => void;
  onClear: () => void;
  onAddToCart: (product: Product) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductComparator({ 
  comparedProducts, 
  onRemove, 
  onClear, 
  onAddToCart,
  isOpen,
  onClose 
}: ProductComparatorProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-md flex justify-center p-4 sm:p-6 md:p-10 animate-fade-in" id="comparator-modal-view">
      <div className="bg-white rounded-[32px] w-full max-w-4xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col my-auto max-h-[90vh] relative animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-100 rounded-lg text-indigo-800">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-bold text-slate-900 text-base">Comparateur de Produits Côte-à-Côte</h2>
              <p className="text-slate-500 text-xs font-medium">Comparez les spécifications pour choisir le modèle idéal !</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {comparedProducts.length > 0 && (
              <button 
                onClick={onClear}
                className="text-xs text-rose-500 hover:text-rose-600 font-bold px-3 py-1.5 hover:bg-rose-50 rounded-lg cursor-pointer"
              >
                Tout effacer
              </button>
            )}
            <button 
              onClick={onClose}
              className="p-1.5 bg-slate-200/80 hover:bg-slate-200 text-slate-600 rounded-full cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-grow overflow-x-auto p-6">
          {comparedProducts.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <Sliders className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="text-slate-500 text-sm font-semibold">Aucun produit à comparer.</p>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">Ajoutez des produits au comparateur en cliquant sur l'icône de balance des fiches produits.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[600px] text-xs">
              <thead>
                <tr className="border-b border-slate-150">
                  <th className="py-4 px-3 text-slate-400 uppercase tracking-wider font-extrabold w-1/4">Spécifications</th>
                  {comparedProducts.map(p => (
                    <th key={p.id} className="py-4 px-3 w-1/4 relative group">
                      <button 
                        onClick={() => onRemove(p.id)}
                        className="absolute top-2 right-2 p-1 bg-rose-50 text-rose-500 rounded-full hover:bg-rose-100 cursor-pointer opacity-80 hover:opacity-100"
                        title="Retirer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                      <div className="text-center space-y-2">
                        <img src={p.imageUrl} alt={p.name} className="w-20 h-20 object-cover mx-auto rounded-xl border border-slate-100 shadow-2xs" />
                        <h4 className="font-bold text-slate-900 line-clamp-2 leading-tight">{p.name}</h4>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {/* Price Row */}
                <tr>
                  <td className="py-4 px-3 font-extrabold text-slate-400 uppercase">Prix</td>
                  {comparedProducts.map(p => (
                    <td key={p.id} className="py-4 px-3 text-center text-[#0052FF] font-black text-sm">
                      {p.price.toLocaleString('fr-DZ')} DA
                    </td>
                  ))}
                </tr>
                {/* Category Row */}
                <tr>
                  <td className="py-4 px-3 font-extrabold text-slate-400 uppercase">Catégorie</td>
                  {comparedProducts.map(p => (
                    <td key={p.id} className="py-4 px-3 text-center">
                      <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md font-bold uppercase text-[9px]">
                        {p.category}
                      </span>
                    </td>
                  ))}
                </tr>
                {/* Stock Row */}
                <tr>
                  <td className="py-4 px-3 font-extrabold text-slate-400 uppercase">Disponibilité</td>
                  {comparedProducts.map(p => (
                    <td key={p.id} className="py-4 px-3 text-center">
                      {p.stock > 0 ? (
                        <span className="text-emerald-600 font-bold">En stock ({p.stock})</span>
                      ) : (
                        <span className="text-rose-600 font-bold">Rupture de stock</span>
                      )}
                    </td>
                  ))}
                </tr>
                {/* Popularity Row */}
                <tr>
                  <td className="py-4 px-3 font-extrabold text-slate-400 uppercase">Score Popularité</td>
                  {comparedProducts.map(p => (
                    <td key={p.id} className="py-4 px-3 text-center">
                      🔥 {p.salesCount} ventes enregistrées
                    </td>
                  ))}
                </tr>
                {/* Rating Row */}
                <tr>
                  <td className="py-4 px-3 font-extrabold text-slate-400 uppercase">Note Client</td>
                  {comparedProducts.map(p => {
                    const seed = p.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                    const score = (4.2 + (seed % 9) / 10).toFixed(1);
                    return (
                      <td key={p.id} className="py-4 px-3 text-center font-bold text-amber-500">
                        ⭐ {score} / 5.0
                      </td>
                    );
                  })}
                </tr>
                {/* Description Row */}
                <tr>
                  <td className="py-4 px-3 font-extrabold text-slate-400 uppercase">Caractéristiques</td>
                  {comparedProducts.map(p => (
                    <td key={p.id} className="py-4 px-3 text-slate-500 text-xs leading-relaxed max-w-[200px] text-justify font-sans">
                      {p.description}
                    </td>
                  ))}
                </tr>
                {/* Buy CTA Row */}
                <tr>
                  <td className="py-4 px-3"></td>
                  {comparedProducts.map(p => (
                    <td key={p.id} className="py-4 px-3 text-center">
                      <button
                        onClick={() => {
                          onAddToCart(p);
                        }}
                        disabled={p.stock <= 0}
                        className={`px-4 py-2 text-[10px] uppercase font-black rounded-lg transition-all cursor-pointer ${
                          p.stock <= 0
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : 'bg-[#0052FF] hover:bg-sky-600 text-white shadow-md'
                        }`}
                      >
                        Ajouter au Panier
                      </button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 4. VIRTUAL TRY-ON (AR SIMULATOR)
// ==========================================
interface VirtualTryOnProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const MODELS = [
  { id: 'model1', name: 'Sofiane', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300' },
  { id: 'model2', name: 'Yasmine', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300' },
  { id: 'model3', name: 'Karim', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300' }
];

export function VirtualTryOn({ product, isOpen, onClose, onShowToast }: VirtualTryOnProps) {
  const [selectedModel, setSelectedModel] = useState<string>('model1');
  const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(null);
  const [scale, setScale] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const isWatch = product.category.toLowerCase().includes('électronique') || product.name.toLowerCase().includes('montre');
  const isClothing = product.category.toLowerCase().includes('mode');
  const isGlasses = product.name.toLowerCase().includes('lunettes');
  const isAudio = product.category.toLowerCase().includes('audio') || product.name.toLowerCase().includes('casque');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedPhoto(event.target?.result as string);
        onShowToast("Votre photo a été chargée avec succès ! Essayage virtuel actif.", "success");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-950/80 backdrop-blur-md flex justify-center p-4 sm:p-6 animate-fade-in" id="virtual-try-on-modal">
      <div className="bg-white rounded-[32px] w-full max-w-2xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col my-auto max-h-[90vh] relative animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-sky-100 rounded-lg text-sky-800">
              <Camera className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="font-display font-bold text-slate-900 text-sm sm:text-base">Essayage Virtuel Assisté par IA</h2>
              <p className="text-slate-500 text-xs font-medium">Visualisez l'article sur vous avant de valider la livraison !</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 bg-slate-200/80 hover:bg-slate-200 text-slate-600 rounded-full cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Workspace */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 flex-grow overflow-y-auto">
          {/* Controls (5 cols) */}
          <div className="md:col-span-5 space-y-5 font-sans">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">1. Choisissez un Mannequin</span>
              <div className="grid grid-cols-3 gap-2">
                {MODELS.map(m => (
                  <button
                    key={m.id}
                    onClick={() => {
                      setUploadedPhoto(null);
                      setSelectedModel(m.id);
                    }}
                    className={`border p-1 rounded-xl overflow-hidden transition-all text-center cursor-pointer ${
                      selectedModel === m.id && !uploadedPhoto
                        ? 'border-sky-500 ring-2 ring-sky-500/15'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <img src={m.url} alt={m.name} className="w-12 h-12 rounded-lg mx-auto object-cover" />
                    <span className="text-[10px] font-bold mt-1 block text-slate-700">{m.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Ou Uploadez votre Photo</span>
              <label className="border border-dashed border-slate-200 hover:border-sky-500 transition-colors p-4 rounded-xl flex flex-col items-center justify-center cursor-pointer text-center bg-slate-50/50">
                <Upload className="w-5 h-5 text-slate-400 mb-1" />
                <span className="text-xs font-semibold text-slate-800">Prendre/Uploader une photo</span>
                <span className="text-[9px] text-slate-400 mt-0.5">Sert de toile d'essayage</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleFileUpload} 
                />
              </label>
            </div>

            <div className="space-y-3.5 pt-3 border-t border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">2. Ajustez l'Article</span>
              
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-bold text-slate-600">
                  <span>Zoom Article</span>
                  <span>{scale}%</span>
                </div>
                <input 
                  type="range" 
                  min="40" 
                  max="180" 
                  value={scale} 
                  onChange={(e) => setScale(Number(e.target.value))}
                  className="w-full accent-sky-600" 
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-bold text-slate-600">
                  <span>Rotation</span>
                  <span>{rotation}°</span>
                </div>
                <input 
                  type="range" 
                  min="-180" 
                  max="180" 
                  value={rotation} 
                  onChange={(e) => setRotation(Number(e.target.value))}
                  className="w-full accent-sky-600" 
                />
              </div>

              <button
                onClick={() => {
                  setScale(100);
                  setRotation(0);
                  setPosition({ x: 0, y: 0 });
                }}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Réinitialiser
              </button>
            </div>
          </div>

          {/* AR Stage (7 cols) */}
          <div className="md:col-span-7 bg-slate-900 rounded-2xl aspect-square relative overflow-hidden flex items-center justify-center border border-slate-850 shadow-inner group">
            {/* Background Image: mannequin or upload */}
            <img 
              src={uploadedPhoto || MODELS.find(m => m.id === selectedModel)?.url} 
              alt="AR Canvas" 
              className="w-full h-full object-cover select-none"
            />

            {/* Overlayered product mockup that can be dragged/pinched */}
            <div
              className={`absolute cursor-move select-none transition-all duration-75 ${
                isDragging ? 'scale-[1.02] cursor-grabbing' : ''
              }`}
              style={{
                transform: `translate(${position.x}px, ${position.y}px) rotate(${rotation}deg) scale(${scale / 100})`,
                width: isWatch ? '60px' : isAudio ? '160px' : isGlasses ? '100px' : '150px',
                zIndex: 30,
                // Default position overrides depending on category to make try on immediately centered
                top: isGlasses ? '35%' : isAudio ? '25%' : isWatch ? '70%' : '35%'
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <img 
                src={product.imageUrl} 
                alt={product.name} 
                className="w-full h-auto drop-shadow-2xl select-none"
                draggable="false"
              />
            </div>

            {/* Interactive Grid overlay overlaying tech calibration vibe */}
            <div className="absolute inset-0 bg-sky-500/5 select-none pointer-events-none border border-sky-500/20 rounded-2xl">
              <div className="absolute top-4 left-4 font-mono text-[9px] text-sky-400 tracking-wider">
                <span className="block">CALIBRATION: ACTIVE</span>
                <span className="block text-slate-400 mt-0.5">X: {position.x} Y: {position.y} | ROT: {rotation}°</span>
              </div>
              <div className="absolute top-4 right-4 bg-emerald-500/20 text-emerald-400 font-mono text-[9px] px-2 py-0.5 rounded border border-emerald-500/30">
                IA SECURE 3D
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 5. SIZE GUIDE & 3D INTERACTIVE RENDER
// ==========================================
interface SizeGuideAnd3DProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export function SizeGuideAnd3D({ product, isOpen, onClose }: SizeGuideAnd3DProps) {
  // Size calculator states
  const [height, setHeight] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [fit, setFit] = useState<'fitted' | 'normal' | 'oversized'>('normal');
  const [calculatedSize, setCalculatedSize] = useState<string | null>(null);

  // 3D CSS rotate state
  const [threeDRotation, setThreeDRotation] = useState(0);

  useEffect(() => {
    if (isOpen) {
      // Periodic automatic slight rotation to indicate 3D vector model can be rotated
      const timer = setInterval(() => {
        setThreeDRotation(prev => (prev + 1) % 360);
      }, 35);
      return () => clearInterval(timer);
    }
  }, [isOpen]);

  const calculateSize = (e: React.FormEvent) => {
    e.preventDefault();
    const h = Number(height);
    const w = Number(weight);
    if (!h || !w) return;

    // Sizing Matrix logic
    let size = 'M';
    if (h < 165) {
      if (w < 60) size = 'S';
      else if (w < 75) size = 'M';
      else size = 'L';
    } else if (h <= 180) {
      if (w < 65) size = 'S';
      else if (w < 80) size = 'M';
      else if (w < 95) size = 'L';
      else size = 'XL';
    } else {
      if (w < 75) size = 'M';
      else if (w < 90) size = 'L';
      else if (w < 105) size = 'XL';
      else size = 'XXL';
    }

    // Fit adjustment
    if (fit === 'fitted' && size !== 'S') {
      if (size === 'M') size = 'S';
      else if (size === 'L') size = 'M';
      else if (size === 'XL') size = 'L';
      else if (size === 'XXL') size = 'XL';
    } else if (fit === 'oversized' && size !== 'XXL') {
      if (size === 'S') size = 'M';
      else if (size === 'M') size = 'L';
      else if (size === 'L') size = 'XL';
      else if (size === 'XL') size = 'XXL';
    }

    setCalculatedSize(size);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-md flex justify-center p-4 sm:p-6 animate-fade-in" id="sizeguide-3d-modal">
      <div className="bg-white rounded-[32px] w-full max-w-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col my-auto max-h-[90vh] relative animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-violet-100 rounded-lg text-violet-800">
              <Scale className="w-5 h-5 animate-spin" style={{ animationDuration: '4s' }} />
            </div>
            <div>
              <h2 className="font-display font-bold text-slate-900 text-sm sm:text-base">Guide des Tailles Intelligent & Modélisation 3D</h2>
              <p className="text-slate-500 text-xs font-medium">L'intelligence artificielle au service d'un ajustement parfait de votre commande !</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 bg-slate-200/80 hover:bg-slate-200 text-slate-600 rounded-full cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content body */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 overflow-y-auto flex-grow">
          {/* Left: Size guide input form */}
          <div className="space-y-5">
            <div className="border-b border-slate-100 pb-2">
              <h3 className="font-display font-extrabold text-slate-950 text-xs uppercase tracking-wider">Calculateur Intelligent</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Saisissez vos mensurations pour estimer votre taille optimale pour ce produit.</p>
            </div>

            <form onSubmit={calculateSize} className="space-y-4 font-sans text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Votre Taille (cm)</label>
                  <input 
                    type="number" 
                    required 
                    min="120" 
                    max="220"
                    placeholder="Ex: 178"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500/10"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Votre Poids (kg)</label>
                  <input 
                    type="number" 
                    required 
                    min="30" 
                    max="180"
                    placeholder="Ex: 72"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500/10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Coupe de style souhaitée</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['fitted', 'normal', 'oversized'] as const).map(f => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFit(f)}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold capitalize cursor-pointer transition-all ${
                        fit === f
                          ? 'border-violet-500 bg-violet-50 text-violet-700 font-extrabold shadow-sm'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-500'
                      }`}
                    >
                      {f === 'fitted' ? 'Ajustée' : f === 'normal' ? 'Standard' : 'Ample / XXL'}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-slate-900 text-white font-black uppercase text-xs rounded-xl tracking-wider hover:bg-slate-800 transition-all cursor-pointer shadow-md"
              >
                Calculer la Taille Optimale
              </button>
            </form>

            <AnimatePresence>
              {calculatedSize && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-center space-y-1.5 font-sans"
                >
                  <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Taille recommandée par l'IA</p>
                  <p className="font-display font-black text-3xl text-emerald-800 tracking-tight">
                    {calculatedSize}
                  </p>
                  <p className="text-[11px] text-emerald-600 font-medium">
                    Ce modèle convient à votre morphologie avec un indice de satisfaction estimé à 96%.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right: CSS rotating 3D item render */}
          <div className="space-y-5 flex flex-col justify-between">
            <div className="border-b border-slate-100 pb-2">
              <h3 className="font-display font-extrabold text-slate-950 text-xs uppercase tracking-wider">Modélisation 3D Vectorielle</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Faites glisser ou regardez le modèle s'animer à 360° pour inspecter sa forme.</p>
            </div>

            {/* Rotating container */}
            <div className="relative aspect-square w-full bg-slate-50 border border-slate-100 rounded-3xl overflow-hidden flex items-center justify-center p-6 shadow-inner group">
              <div 
                className="w-48 h-48 transition-transform duration-75 relative"
                style={{
                  transform: `rotateY(${threeDRotation}deg) rotateX(10deg)`,
                  transformStyle: 'preserve-3d',
                  perspective: '1000px'
                }}
              >
                {/* Simulated CSS 3D panels using shadows and multiple layered frames of product */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <img 
                    src={product.imageUrl} 
                    alt="3D Front" 
                    className="w-full h-full object-contain drop-shadow-xl" 
                    style={{ transform: 'translateZ(15px)' }}
                  />
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-70">
                  <img 
                    src={product.imageUrl} 
                    alt="3D Back" 
                    className="w-full h-full object-contain filter brightness-95" 
                    style={{ transform: 'translateZ(-15px) rotateY(180deg)' }}
                  />
                </div>
              </div>

              {/* 3D control overlay */}
              <div className="absolute bottom-4 inset-x-4 flex items-center justify-between pointer-events-none">
                <span className="text-[10px] font-mono text-slate-400 bg-white/80 border border-slate-150 px-2.5 py-1 rounded-full shadow-2xs">
                  Axe Y: {threeDRotation}°
                </span>

                <button 
                  onClick={() => setThreeDRotation(prev => (prev + 90) % 360)}
                  className="pointer-events-auto p-1.5 bg-white border border-slate-150 text-slate-600 rounded-xl hover:bg-slate-50 shadow-2xs cursor-pointer"
                  title="Pivoter de 90°"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 6. OUT-OF-STOCK ALERTS (SMS/WHATSAPP)
// ==========================================
interface StockAlertModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export function StockAlertModal({ product, isOpen, onClose, onShowToast }: StockAlertModalProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [platform, setPlatform] = useState<'SMS' | 'WhatsApp'>('WhatsApp');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) return;
    
    // Save in local storage simulating subscription
    const currentAlerts = JSON.parse(localStorage.getItem('univers_shop_stock_alerts') || '[]');
    currentAlerts.push({ productId: product.id, phone: phoneNumber, channel: platform, date: new Date().toISOString() });
    localStorage.setItem('univers_shop_stock_alerts', JSON.stringify(currentAlerts));

    setIsSubmitted(true);
    onShowToast(`🔔 Inscription réussie ! Vous serez alerté par ${platform} dès le retour en stock de ${product.name}.`, 'success');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in" id="stock-alert-modal">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative animate-scale-up text-center">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <Smartphone className="w-6 h-6 text-indigo-600 animate-bounce" />
            </div>
            
            <h3 className="text-base font-bold text-slate-900 font-display">
              Alerte de Retour en Stock 🔔
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
              Cet article "<b>{product.name}</b>" est actuellement victime de son succès. Laissez votre numéro pour recevoir une notification instantanée et gratuite !
            </p>

            <div className="space-y-3 font-sans text-xs text-left">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Votre Numéro Algérien</label>
                <input 
                  type="tel" 
                  required
                  placeholder="Ex: 0558926754"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Canal de Notification Préféré</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPlatform('WhatsApp')}
                    className={`py-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                      platform === 'WhatsApp'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-extrabold shadow-sm'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-500'
                    }`}
                  >
                    💬 WhatsApp
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlatform('SMS')}
                    className={`py-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                      platform === 'SMS'
                        ? 'border-blue-500 bg-blue-50 text-blue-700 font-extrabold shadow-sm'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-500'
                    }`}
                  >
                    📱 SMS Standard
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#0052FF] hover:bg-sky-600 text-white font-black text-xs uppercase rounded-xl tracking-wider shadow-lg shadow-[#0052FF]/10 transition-all cursor-pointer"
              >
                M'alerter dès Réapprovisionnement
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4 py-4">
            <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="text-base font-bold text-slate-900 font-display">Inscription Confirmée !</h3>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto font-sans">
              Merci ! Vous recevrez un message de confirmation sur votre compte <b>{platform}</b> ({phoneNumber}) lors du réapprovisionnement de nos rayons.
            </p>
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Fermer la fenêtre
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
