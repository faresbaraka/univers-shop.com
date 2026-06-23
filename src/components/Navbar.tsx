import React, { useState } from 'react';
import { ShoppingCart, ShieldCheck, Phone, Key, UserCheck, Menu, X, Check, Trophy } from 'lucide-react';
import { CartItem } from '../types';

interface NavbarProps {
  cart: CartItem[];
  onOpenCart: () => void;
  isAdmin: boolean;
  onToggleAdmin: (status: boolean) => void;
  onOpenOrderPortal: () => void;
  sellerPhone: string;
  storeName?: string;
  logoUrl?: string;
  userPoints?: number;
  onOpenQuestLog?: () => void;
}

export default function Navbar({ 
  cart, 
  onOpenCart, 
  isAdmin, 
  onToggleAdmin, 
  onOpenOrderPortal, 
  sellerPhone, 
  storeName, 
  logoUrl,
  userPoints = 0,
  onOpenQuestLog
}: NavbarProps) {
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [pinCode, setPinCode] = useState('');
  const [errorPin, setErrorPin] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleAdminAuth = (e: React.FormEvent) => {
    e.preventDefault();
    // Default secret PIN is the first 4 digits of their phone, or simply 1234. Let's accept 1234 or 0558
    if (pinCode === '1234' || pinCode === '0558') {
      onToggleAdmin(true);
      setShowAdminLogin(false);
      setPinCode('');
      setErrorPin('');
    } else {
      setErrorPin('Code PIN incorrect. Utilisez "1234" ou "0558".');
    }
  };

  const handleLogout = () => {
    onToggleAdmin(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            {logoUrl ? (
              <img 
                src={logoUrl} 
                alt={storeName || "Univers Shop"} 
                className="h-10 w-auto object-contain max-w-[160px] cursor-pointer"
                onClick={() => window.location.reload()}
                referrerPolicy="no-referrer"
              />
            ) : (
              <span className="font-display font-black text-2xl tracking-tighter text-[#0052FF] select-none uppercase">
                {storeName || "Univers Shop"}
              </span>
            )}
            <div className="hidden sm:flex items-center gap-1 text-[10px] uppercase font-bold text-[#059669] bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100/50">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Garantie Sécurisée</span>
            </div>
          </div>

          {/* Contact Seller - Primary Requirement */}
          <a 
            href={`tel:${sellerPhone}`} 
            className="hidden md:flex items-center gap-2 bg-[#FF5C00] hover:bg-[#E05200] text-white px-5 py-2.5 rounded-full font-bold text-sm shadow-md shadow-[#FF5C00]/25 hover:scale-[1.02] transition-all cursor-pointer"
            id="navbar-phone-btn"
          >
            <span>📞</span>
            <span>{sellerPhone}</span>
          </a>

          {/* Action Actions / Buttons */}
          <div className="flex items-center gap-2">
            {/* Status indicators for security */}
            <div className="security-badge-active hidden lg:flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 border border-slate-100 py-1.5 px-3 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="font-medium">Certificat SSL Sécurisé (AES-256)</span>
            </div>

            {/* Direct Order tracking button */}
            {!isAdmin && (
              <button
                onClick={onOpenOrderPortal}
                className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 text-slate-700 hover:text-[#0052FF] hover:border-[#0052FF]/50 text-xs font-bold px-3 py-2 rounded-xl transition-all cursor-pointer"
                id="buyer-tracking-trigger"
              >
                <span>📦 Suivi & Retours</span>
              </button>
            )}

            {/* Gamified Missions & Level Badge */}
            {!isAdmin && onOpenQuestLog && (
              <button
                onClick={onOpenQuestLog}
                className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 hover:border-amber-300 text-amber-700 text-xs font-bold px-3 py-2 rounded-xl transition-all cursor-pointer hover:bg-amber-100/50"
                id="quest-log-trigger"
                title="Consulter vos missions économies et récompenses"
              >
                <Trophy className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                <span>{userPoints} pts</span>
              </button>
            )}

            {/* Shopping Cart Button */}
            {!isAdmin && (
              <button
                onClick={onOpenCart}
                className="relative p-2.5 text-slate-700 hover:text-sky-600 hover:bg-slate-50 rounded-xl transition-all duration-200"
                aria-label="Panier"
                id="cart-trigger-btn"
              >
                <ShoppingCart className="w-6 h-6" />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white">
                    {cartCount}
                  </span>
                )}
              </button>
            )}

            {/* Admin toggle dashboard */}
            {isAdmin ? (
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline-flex items-center gap-1 bg-sky-50 text-sky-700 text-xs font-semibold px-3 py-1.5 rounded-lg border border-sky-100">
                  <UserCheck className="w-3.5 h-3.5" />
                  Mode Vendeur
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-slate-900 text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
                  id="admin-logout-btn"
                >
                  Quitter
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAdminLogin(true)}
                className="flex items-center gap-1.5 border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-semibold px-3.5 py-2.5 rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
                id="admin-login-trigger-btn"
              >
                <Key className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Espace Vendeur</span>
              </button>
            )}

            {/* Mobile menu trigger */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
              className="p-2 md:hidden text-slate-600 rounded-lg hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile responsive drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-4 space-y-3">
          {!isAdmin && (
            <button
              onClick={() => {
                onOpenOrderPortal();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-1.5 bg-[#0052FF]/10 text-[#0052FF] text-xs font-bold py-3 px-4 rounded-xl hover:bg-[#0052FF]/15 transition-all cursor-pointer"
            >
              <span>📦 Suivre mon colis & Retours</span>
            </button>
          )}
          <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
            <div className="flex items-center gap-2 text-slate-600">
              <Phone className="w-4 h-4 text-sky-600" />
              <span className="text-xs font-semibold text-slate-800">Assistance client direct</span>
            </div>
            <a href={`tel:${sellerPhone}`} className="text-sm font-bold text-sky-600">{sellerPhone}</a>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 p-3 rounded-xl border border-emerald-100">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="font-medium">Commandes & paiements 100% sécurisés</span>
          </div>
        </div>
      )}

      {/* Admin Passcode Modal */}
      {showAdminLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-100 transform transition-all">
            <div className="bg-slate-900 p-6 text-white text-center relative">
              <button 
                onClick={() => { setShowAdminLogin(false); setErrorPin(''); }} 
                className="absolute top-4 right-4 p-1.5 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <Key className="w-10 h-10 mx-auto text-sky-400 mb-2" />
              <h3 className="font-display font-bold text-lg">Espace Vendeur Sécurisé</h3>
              <p className="text-slate-400 text-xs mt-1">Saisissez votre code PIN administrateur pour lister vos produits et voir vos commandes.</p>
            </div>
            <form onSubmit={handleAdminAuth} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                  Code PIN d'accès
                </label>
                <input
                  type="password"
                  placeholder="Ex: 1234"
                  maxLength={6}
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value)}
                  className="w-full text-center text-2xl font-mono tracking-widest bg-slate-50 border border-slate-200 rounded-xl py-3 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  autoFocus
                />
                {errorPin && (
                  <p className="text-xs text-rose-500 font-semibold mt-2 text-center bg-rose-50 p-2 rounded-lg">
                    {errorPin}
                  </p>
                )}
              </div>
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <p className="text-[11px] text-slate-500 text-center">
                  💡 Note de test : Entrez le code PIN <span className="font-bold text-slate-700">1234</span> ou <span className="font-bold text-slate-700">0558</span> pour vous connecter.
                </p>
              </div>
              <button
                type="submit"
                className="w-full bg-slate-900 text-white font-semibold py-3 rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-950/10 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                Accéder au Tableau de Bord
              </button>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
