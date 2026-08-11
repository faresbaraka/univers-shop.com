import React, { useState } from 'react';
import { 
  Zap, 
  Smartphone, 
  BatteryCharging, 
  ShieldCheck, 
  Check, 
  Phone, 
  ShoppingCart, 
  Sparkles, 
  Search, 
  Award, 
  Cpu, 
  Layers, 
  Sliders, 
  Truck, 
  Send,
  HelpCircle,
  Clock,
  ChevronRight
} from 'lucide-react';
import { Product } from '../types';
import { Language } from '../lib/translations';
import FaressoLogo from './FaressoLogo';

interface FaressoTechCornerProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  language: Language;
  onClose: () => void;
  sellerPhone?: string;
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

// Preset Device Configurations for Compatibility Checker
const DEVICE_DATABASE = [
  {
    id: 'iphone-15-16',
    name: 'iPhone 16 / 15 Pro & Max (USB-C)',
    brand: 'Apple',
    icon: '🍎',
    maxWattage: '30W PD',
    cableNeeded: 'USB-C vers USB-C 100W Tressé Kevlar',
    recommendedCharger: 'Chargeur GaN 65W Triple Port FARESSØ Matrix',
    magSafe: true,
    chargingTime0to80: '25 mins avec FARESSØ GaN'
  },
  {
    id: 'iphone-12-14',
    name: 'iPhone 14 / 13 / 12 / SE (Lightning)',
    brand: 'Apple',
    icon: '🍎',
    maxWattage: '27W PD',
    cableNeeded: 'USB-C vers Lightning Renforcé',
    recommendedCharger: 'Chargeur Rapide 30W PD FARESSØ Express',
    magSafe: true,
    chargingTime0to80: '28 mins avec FARESSØ 30W'
  },
  {
    id: 'samsung-s24-ultra',
    name: 'Samsung Galaxy S24 / S23 / S22 Ultra (PPS 45W)',
    brand: 'Samsung',
    icon: '📱',
    maxWattage: '45W Super Fast Charge 2.0 (PPS)',
    cableNeeded: 'Câble USB-C 100W 5A E-Marker',
    recommendedCharger: 'Chargeur GaN 65W PPS FARESSØ Matrix',
    magSafe: false,
    chargingTime0to80: '22 mins (PPS Fast Charge)'
  },
  {
    id: 'xiaomi-redmi-poco',
    name: 'Xiaomi 14 / Redmi Note 13 / POCO (67W-120W)',
    brand: 'Xiaomi',
    icon: '⚡',
    maxWattage: '67W / 120W HyperCharge',
    cableNeeded: 'Câble USB-C 100W Tressé Haute Ampérage',
    recommendedCharger: 'Chargeur Rapide GaN 65W Triple Port',
    magSafe: false,
    chargingTime0to80: '19 mins'
  },
  {
    id: 'macbook-ipad',
    name: 'MacBook Air/Pro, iPad Pro & PC Portable USB-C',
    brand: 'Laptop & Tablet',
    icon: '💻',
    maxWattage: '65W à 100W Power Delivery',
    cableNeeded: 'Câble USB-C 100W PD FARESSØ Ultra-Pro',
    recommendedCharger: 'Bloc GaN 65W / Hub USB-C 8-en-1',
    magSafe: false,
    chargingTime0to80: '45 mins (Charge complète Laptop)'
  }
];

export default function FaressoTechCorner({
  products,
  onAddToCart,
  language,
  onClose,
  sellerPhone = '0558926754',
  onShowToast
}: FaressoTechCornerProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDevice, setSelectedDevice] = useState<string>('iphone-15-16');
  
  // Charging simulator state
  const [batteryLevel, setBatteryLevel] = useState<number>(15);

  // Custom order form state
  const [customPhoneModel, setCustomPhoneModel] = useState<string>('');
  const [customPhoneNum, setCustomPhoneNum] = useState<string>('');
  const [selectedPacks, setSelectedPacks] = useState<string[]>(['Câble 100W', 'Chargeur GaN 65W']);
  const [customSubmitted, setCustomSubmitted] = useState<boolean>(false);

  // Filter tech products
  const techProducts = products.filter(p => {
    const isTech = ['Power & Câbles', 'Chargeurs GaN', 'Power Banks', 'Connect & Hubs', 'Audio High-Tech', 'Accessoires Auto', 'Électronique', 'Accessoires'].some(cat => 
      p.category.toLowerCase().includes(cat.toLowerCase()) || p.name.toLowerCase().includes('faress')
    );
    if (!isTech) return false;

    if (selectedCategory !== 'all' && !p.category.toLowerCase().includes(selectedCategory.toLowerCase())) {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
    }

    return true;
  });

  const activeDeviceData = DEVICE_DATABASE.find(d => d.id === selectedDevice) || DEVICE_DATABASE[0];

  const handleCustomOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPhoneModel.trim() || !customPhoneNum.trim()) {
      onShowToast('Veuillez renseigner votre modèle de téléphone et numéro de téléphone.', 'error');
      return;
    }
    setCustomSubmitted(true);
    onShowToast('Demande enregistrée ! L\'équipe FARESSØ vous contactera dans les plus brefs délais.', 'success');
  };

  const togglePackSelection = (item: string) => {
    if (selectedPacks.includes(item)) {
      setSelectedPacks(selectedPacks.filter(i => i !== item));
    } else {
      setSelectedPacks([...selectedPacks, item]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-20 animate-fade-in">
      {/* Top Metallic Header Banner */}
      <div className="bg-gradient-to-b from-black via-slate-900 to-slate-950 border-b border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-3">
              <FaressoLogo size="lg" showTagline={true} showIcons={true} />
              <p className="text-slate-300 text-xs sm:text-sm max-w-xl font-sans mt-2">
                Laboratoire & Boutique Officielle des chargeurs rapides GaN III, câbles tressés 100W PD, Power Banks MagSafe et accessoires premium pour smartphones.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <a
                href={`tel:${sellerPhone}`}
                className="flex items-center gap-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-bold px-5 py-3 rounded-2xl shadow-lg shadow-sky-500/20 transition duration-200 transform hover:scale-105"
              >
                <Phone className="w-4 h-4" />
                <span>Service Client FARESSØ : {sellerPhone}</span>
              </a>

              <button
                onClick={onClose}
                className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-bold px-4 py-3 rounded-2xl transition duration-200"
              >
                ← Retour à la Boutique
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-12">

        {/* SECTION 1: INTERACTIVE SMARTPHONE COMPATIBILITY CHECKER */}
        <section className="bg-gradient-to-br from-slate-900 via-slate-900/90 to-black border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="flex items-center gap-2 text-sky-400 text-xs font-mono font-bold tracking-widest uppercase mb-2">
            <Cpu className="w-4 h-4" />
            <span>DIAGNOSTIC & COMPATIBILITÉ FARESSØ</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-display font-black text-white tracking-tight mb-6">
            Quel est votre smartphone ? Trouvez l'équipement idéal
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Device Selection Buttons */}
            <div className="lg:col-span-5 space-y-2.5">
              <p className="text-xs text-slate-400 font-medium mb-3">Sélectionnez votre appareil :</p>
              {DEVICE_DATABASE.map(dev => (
                <button
                  key={dev.id}
                  onClick={() => setSelectedDevice(dev.id)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 flex items-center justify-between cursor-pointer ${
                    selectedDevice === dev.id
                      ? 'bg-gradient-to-r from-sky-950 to-slate-900 border-sky-500 text-white shadow-lg shadow-sky-500/10'
                      : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{dev.icon}</span>
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-white">{dev.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">Charge optimale : {dev.maxWattage}</p>
                    </div>
                  </div>
                  {selectedDevice === dev.id && (
                    <span className="w-6 h-6 rounded-full bg-sky-500 text-white flex items-center justify-center text-xs font-bold">
                      ✓
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Right: Recommended Tech Specs Card */}
            <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-3xl p-6 relative flex flex-col justify-between h-full space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded-md border border-sky-500/20">
                      Spécifications Recommandées FARESSØ
                    </span>
                    <h3 className="text-xl font-black text-white mt-1">{activeDeviceData.name}</h3>
                  </div>
                  <span className="text-3xl">{activeDeviceData.icon}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
                    <p className="text-[10px] font-mono text-slate-400 uppercase">Puissance Max Acceptée</p>
                    <p className="text-sm font-black text-sky-400 mt-0.5">{activeDeviceData.maxWattage}</p>
                  </div>

                  <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
                    <p className="text-[10px] font-mono text-slate-400 uppercase">Temps de Charge 0-80%</p>
                    <p className="text-sm font-black text-emerald-400 mt-0.5">{activeDeviceData.chargingTime0to80}</p>
                  </div>

                  <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
                    <p className="text-[10px] font-mono text-slate-400 uppercase">Câble Recommandé</p>
                    <p className="text-xs font-bold text-slate-200 mt-0.5">{activeDeviceData.cableNeeded}</p>
                  </div>

                  <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
                    <p className="text-[10px] font-mono text-slate-400 uppercase">MagSafe Sans Fil</p>
                    <p className="text-xs font-bold text-slate-200 mt-0.5">
                      {activeDeviceData.magSafe ? '⚡ Compatible MagSafe 15W' : '🔌 Charge Filaire Ultra-Rapide'}
                    </p>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-sky-950/60 to-indigo-950/60 border border-sky-800/50 p-4 rounded-2xl flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-white">Équipement conseillé :</p>
                    <p className="text-xs text-sky-300 font-mono">{activeDeviceData.recommendedCharger}</p>
                  </div>
                  <Zap className="w-6 h-6 text-amber-400 animate-pulse" />
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => {
                  const matchingProd = products.find(p => p.name.toLowerCase().includes('gan') || p.name.toLowerCase().includes('100w')) || products[0];
                  if (matchingProd) {
                    onAddToCart(matchingProd);
                    onShowToast(`Équipement compatible recommandé ajouté au panier !`, 'success');
                  }
                }}
                className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-black py-3.5 px-6 rounded-2xl shadow-xl shadow-sky-500/20 transition duration-200 flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Ajouter le Pack Compatible au Panier</span>
              </button>
            </div>
          </div>
        </section>

        {/* SECTION 2: CHARGING SPEED SIMULATOR */}
        <section className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
              ⚡ SIMULATEUR DE CHARGE EN DIRECT
            </span>
            <h2 className="text-2xl font-black text-white">Comparez la vitesse FARESSØ vs Chargeur Standard</h2>
            <p className="text-xs text-slate-400">
              Glissez le curseur pour simuler le niveau actuel de votre batterie et observer le gain de temps :
            </p>

            <div className="pt-4 space-y-2">
              <div className="flex justify-between text-xs font-mono text-slate-300 font-bold">
                <span>Niveau de batterie : {batteryLevel}%</span>
                <span className={batteryLevel < 30 ? 'text-rose-400' : 'text-emerald-400'}>
                  {batteryLevel < 30 ? 'Batterie Faible' : 'Prêt à charger'}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="90"
                value={batteryLevel}
                onChange={(e) => setBatteryLevel(Number(e.target.value))}
                className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 text-left">
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
                <p className="text-xs font-bold text-slate-400 uppercase">Ancien Chargeur 5W Standard</p>
                <p className="text-2xl font-black text-slate-300 mt-1">
                  ~ {Math.round((100 - batteryLevel) * 1.8)} minutes
                </p>
                <p className="text-[10px] text-slate-500 mt-1">Lent, chauffe importante et usure prématurée</p>
              </div>

              <div className="bg-gradient-to-br from-sky-950 to-slate-900 p-5 rounded-2xl border border-sky-500/50 shadow-lg shadow-sky-500/10">
                <p className="text-xs font-bold text-sky-400 uppercase">FARESSØ GaN III 65W / 100W PD</p>
                <p className="text-2xl font-black text-emerald-400 mt-1">
                  ~ {Math.round((100 - batteryLevel) * 0.35)} minutes !
                </p>
                <p className="text-[10px] text-sky-300/80 mt-1">Charge froide intelligente & Puce E-Marker</p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: FARESSØ CATALOG GRID */}
        <section className="space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">Catalogue High-Tech FARESSØ</h2>
              <p className="text-xs text-slate-400 mt-1">Câbles, chargeurs, power banks et accessoires d'origine garantie</p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
              {[
                { id: 'all', label: 'Tout' },
                { id: 'power', label: 'Câbles 100W' },
                { id: 'chargeurs', label: 'Chargeurs GaN' },
                { id: 'power banks', label: 'Power Banks' },
                { id: 'audio', label: 'Audio' },
                { id: 'auto', label: 'Auto' }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                      : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search bar */}
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher un accessoire (ex: 100W, MagSafe, USB-C)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500 transition"
            />
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {techProducts.map(prod => (
              <div 
                key={prod.id} 
                className="bg-slate-900/90 border border-slate-800/80 rounded-3xl overflow-hidden hover:border-slate-700 transition duration-300 flex flex-col justify-between group shadow-xl"
              >
                <div>
                  <div className="relative h-48 bg-slate-950 overflow-hidden">
                    <img 
                      src={prod.imageUrl} 
                      alt={prod.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-mono font-bold text-sky-400 border border-sky-500/30">
                      {prod.category}
                    </div>
                    {prod.originalPrice && (
                      <div className="absolute top-3 right-3 bg-rose-500 text-white px-2 py-0.5 rounded-md text-[10px] font-black">
                        -{Math.round(((prod.originalPrice - prod.price) / prod.originalPrice) * 100)}%
                      </div>
                    )}
                  </div>

                  <div className="p-5 space-y-3">
                    <h3 className="font-bold text-sm text-white line-clamp-2 group-hover:text-sky-400 transition">
                      {prod.name}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {prod.description}
                    </p>

                    <div className="flex items-center gap-2 pt-2 border-t border-slate-800 text-[10px] text-slate-400 font-mono">
                      <span className="flex items-center gap-1 text-emerald-400">
                        <Check className="w-3 h-3" /> En Stock
                      </span>
                      <span>•</span>
                      <span>Garantie 1 An FARESSØ</span>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-lg font-black text-white font-mono">
                      {prod.price.toLocaleString()} DA
                    </span>
                    {prod.originalPrice && (
                      <span className="block text-[10px] text-slate-500 line-through font-mono">
                        {prod.originalPrice.toLocaleString()} DA
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      onAddToCart(prod);
                      onShowToast(`${prod.name} ajouté au panier !`, 'success');
                    }}
                    className="bg-sky-500 hover:bg-sky-400 text-white p-3 rounded-2xl shadow-lg shadow-sky-500/20 transition transform active:scale-95 cursor-pointer"
                    title="Ajouter au panier"
                  >
                    <ShoppingCart className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 4: DEMANDE DE PACK SUR MESURE / GROS */}
        <section className="bg-gradient-to-r from-slate-900 via-slate-950 to-black border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl">
          <div className="max-w-2xl mx-auto text-center space-y-4">
            <FaressoLogo size="md" showTagline={false} />
            <h2 className="text-2xl font-black text-white">Besoin d'un Pack d'Accessoires ou Commande Spéciale ?</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Indiquez votre modèle de téléphone et les accessoires souhaités. Notre équipe vous préparera la meilleure combinaison au meilleur prix.
            </p>

            {customSubmitted ? (
              <div className="bg-emerald-950/60 border border-emerald-800 text-emerald-300 p-6 rounded-2xl space-y-2 animate-fade-in">
                <p className="font-bold text-sm">✅ Demande transmise avec succès !</p>
                <p className="text-xs text-emerald-400">Un conseiller FARESSØ vous appellera au {customPhoneNum} très rapidement.</p>
                <button
                  onClick={() => setCustomSubmitted(false)}
                  className="mt-2 text-xs underline font-bold hover:text-white"
                >
                  Envoyer une autre demande
                </button>
              </div>
            ) : (
              <form onSubmit={handleCustomOrderSubmit} className="space-y-4 text-left pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Modèle de votre smartphone / tablette :</label>
                  <input
                    type="text"
                    placeholder="Ex: iPhone 15 Pro Max, Samsung S24 Ultra, Xiaomi 13T..."
                    value={customPhoneModel}
                    onChange={(e) => setCustomPhoneModel(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Cochez les accessoires nécessaires :</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      'Câble 100W Tressé',
                      'Chargeur GaN 65W',
                      'Power Bank MagSafe',
                      'Support Voiture Auto',
                      'Coque Renforcée',
                      'Écouteurs Sans Fil'
                    ].map(item => (
                      <button
                        type="button"
                        key={item}
                        onClick={() => togglePackSelection(item)}
                        className={`p-2.5 rounded-xl border text-left text-xs font-bold transition flex items-center justify-between ${
                          selectedPacks.includes(item)
                            ? 'bg-sky-500/20 border-sky-500 text-sky-300'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <span>{item}</span>
                        {selectedPacks.includes(item) && <Check className="w-3.5 h-3.5 text-sky-400" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Numéro de téléphone (Algérie) :</label>
                  <input
                    type="tel"
                    placeholder="Ex: 0558926754"
                    value={customPhoneNum}
                    onChange={(e) => setCustomPhoneNum(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-black py-3.5 px-6 rounded-2xl shadow-xl shadow-sky-500/20 transition duration-200 cursor-pointer text-xs uppercase tracking-wider"
                >
                  Envoyer ma Demande sur Mesure FARESSØ
                </button>
              </form>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}
