import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Package, 
  Truck, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  ArrowLeft, 
  Phone, 
  MapPin, 
  Undo2, 
  X,
  FileText,
  Clock
} from 'lucide-react';
import { Order, StoreSettings } from '../types';
import DeliveryMap from './DeliveryMap';

interface BuyerOrderPortalProps {
  orders: Order[];
  onUpdateOrderFields: (orderId: string, fields: Partial<Order>) => void;
  onClose: () => void;
  sellerPhone: string;
  onShowToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
  storeSettings?: StoreSettings;
}

export default function BuyerOrderPortal({ orders, onUpdateOrderFields, onClose, sellerPhone, onShowToast, storeSettings }: BuyerOrderPortalProps) {
  const [searchMethod, setSearchMethod] = useState<'id' | 'phone'>('phone');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Order[]>([]);
  const [searched, setSearched] = useState(false);
  
  // Return requests state
  const [requestingReturnOrderId, setRequestingReturnOrderId] = useState<string | null>(null);
  const [returnReasonCode, setReturnReasonCode] = useState('defect');
  const [returnDetail, setReturnDetail] = useState('');

  // Auto-load client's own orders if saved in localStorage
  useEffect(() => {
    try {
      const savedIds = JSON.parse(localStorage.getItem('univers_shop_my_orders') || '[]');
      if (Array.isArray(savedIds) && savedIds.length > 0) {
        // Find matching orders
        const localOrders = orders.filter(o => savedIds.includes(o.id));
        if (localOrders.length > 0) {
          setResults(localOrders);
          setSearched(true);
        }
      }
    } catch (e) {
      console.warn("Could not load local order history:", e);
    }
  }, [orders]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    let matched: Order[] = [];
    if (searchMethod === 'id') {
      const formattedId = query.trim().toUpperCase();
      matched = orders.filter(o => o.id.toUpperCase().includes(formattedId) || o.transactionId.toUpperCase().includes(formattedId));
    } else {
      // Search by phone, stripping spaces
      const formattedPhone = query.replace(/\s+/g, '');
      matched = orders.filter(o => o.customerPhone.replace(/\s+/g, '').includes(formattedPhone));
    }

    setResults(matched);
    setSearched(true);
  };

  const submitReturnRequest = (orderId: string) => {
    if (!returnDetail.trim()) {
      if (onShowToast) {
        onShowToast("Veuillez fournir quelques détails sur le motif de votre retour.", "error");
      } else {
        console.warn("Veuillez fournir quelques détails sur le motif de votre retour.");
      }
      return;
    }

    const reasons: Record<string, string> = {
      defect: "Article défectueux ou endommagé",
      size: "Taille / Modèle incorrect",
      not_match: "Ne correspond pas aux photos/description",
      regret: "Changement d'avis / Plus besoin",
      other: "Autre motif"
    };

    const finalReason = `[${reasons[returnReasonCode] || 'Autre'}] : ${returnDetail}`;

    onUpdateOrderFields(orderId, {
      returnStatus: 'requested',
      returnReason: finalReason,
      returnDate: new Date().toLocaleDateString('fr-DZ', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    });

    // Close form and show feedback
    setRequestingReturnOrderId(null);
    setReturnDetail('');
    if (onShowToast) {
      onShowToast("Votre demande de retour sécurisée a été envoyée avec succès au service client Univers Shop. Notre personnel va l'examiner sous 24 heures.", "success");
    } else {
      console.log("Votre demande de retour sécurisée a été envoyée.");
    }
  };

  const getStepProgressIndex = (status: Order['orderStatus']) => {
    switch (status) {
      case 'received': return 0;
      case 'processing': return 1;
      case 'shipped': return 2;
      case 'delivered': return 3;
      case 'returned': return 4;
      default: return 0;
    }
  };

  const getReturnBadgeClass = (status: Order['returnStatus']) => {
    switch (status) {
      case 'requested': return 'bg-amber-50 text-amber-800 border border-amber-200';
      case 'approved': return 'bg-emerald-50 text-emerald-800 border border-emerald-200';
      case 'rejected': return 'bg-rose-50 text-rose-800 border border-rose-200';
      default: return '';
    }
  };

  const getReturnLabel = (status: Order['returnStatus']) => {
    switch (status) {
      case 'requested': return 'Retour demandé (En attente d\'examen)';
      case 'approved': return 'Retour Accepté (Remboursement ou échange en cours)';
      case 'rejected': return 'Retour Refusé par le vendeur';
      default: return '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex justify-center p-4 sm:p-6 md:p-10">
      <div className="bg-white rounded-[32px] w-full max-w-4xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col animate-fade-in my-auto max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 text-white flex justify-between items-center relative flex-shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1 bg-[#0052FF] text-white rounded-lg"><Package className="w-5 h-5 text-white" /></span>
              <h2 className="font-display font-black text-lg tracking-tight uppercase">Suivi de Commande & Historique</h2>
            </div>
            <p className="text-slate-400 text-xs">Consultez l'historique de vos achats, suivez le colis en temps réel et gérez vos retours.</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors cursor-pointer"
            title="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Panel Zone */}
        <div className="bg-slate-50 p-6 border-b border-slate-150 flex-shrink-0">
          <form onSubmit={handleSearch} className="space-y-4 max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-4 text-xs font-bold text-slate-700">
              <span className="text-slate-400 uppercase tracking-wider text-[10px]">Méthode de recherche :</span>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input 
                  type="radio" 
                  name="searchMethod" 
                  checked={searchMethod === 'phone'} 
                  onChange={() => setSearchMethod('phone')} 
                  className="accent-[#0052FF]"
                />
                Numéro de Téléphone
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input 
                  type="radio" 
                  name="searchMethod" 
                  checked={searchMethod === 'id'} 
                  onChange={() => setSearchMethod('id')} 
                  className="accent-[#0052FF]"
                />
                ID Commande / Facture
              </label>
            </div>

            <div className="relative flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                <input
                  type={searchMethod === 'phone' ? 'tel' : 'text'}
                  placeholder={searchMethod === 'phone' ? 'Saisissez votre numéro (Ex: 0558926754)' : 'Saisissez l\'identifiant (Ex: ORD-129483)'}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0052FF]/20 focus:border-[#0052FF] font-medium"
                />
              </div>
              <button
                type="submit"
                className="bg-[#0052FF] hover:bg-sky-600 text-white font-bold px-6 py-3 rounded-2xl text-xs transition-colors shadow-md shadow-sky-600/15 cursor-pointer"
              >
                Rechercher
              </button>
            </div>
          </form>
        </div>

        {/* Content Container (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!searched ? (
            <div className="text-center py-12 max-w-sm mx-auto space-y-3">
              <Clock className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-800 text-sm">Prêt à suivre vos expéditions ?</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-sans">
                Entrez le numéro de téléphone utilisé lors de votre achat ou votre identifiant de facture unique pour afficher votre historique et demander un retour.
              </p>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-12 max-w-sm mx-auto space-y-3">
              <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
              <h3 className="font-bold text-slate-800 text-sm">Aucune commande trouvée</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-sans">
                Nous n'avons trouvé aucune commande correspondant à votre saisie. Veillez à saisir le bon numéro ou l'ID requis. Vous pouvez appeler notre support client au <span className="font-bold">{sellerPhone}</span>.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Résultats ({results.length} commande{results.length > 1 ? 's' : ''} trouvée{results.length > 1 ? 's' : ''})
                </span>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                  Canal Client Sécurisé SSL
                </span>
              </div>

              {results.map((order) => {
                const currentStepIdx = getStepProgressIndex(order.orderStatus);
                const isReturned = order.orderStatus === 'returned';

                return (
                  <div 
                    key={order.id}
                    className="border border-slate-200 rounded-3xl p-5 md:p-6 bg-white space-y-6 hover:border-slate-300 shadow-xs relative"
                  >
                    
                    {/* Invoice header row */}
                    <div className="flex flex-wrap justify-between items-start gap-4 pb-4 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-400 uppercase">Facture</span>
                          <span className="font-mono font-black text-slate-800 text-sm">{order.id}</span>
                          <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-sm">
                            {order.transactionDate}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium mt-1 font-sans">
                          Référence de transaction : <span className="font-mono">{order.transactionId}</span>
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-1.5">
                        <span className="font-black text-slate-900 text-base font-mono">
                          {order.totalAmount.toLocaleString('fr-DZ')} DA
                        </span>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 bg-slate-50 border px-2 py-0.5 rounded">
                          Mode de paiement : <span className="text-slate-800 uppercase">{order.paymentMethod}</span>
                        </div>
                      </div>
                    </div>

                    {/* Timeline Tracker Progress Bar */}
                    <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100/80">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-6">Suivi logistique en direct d'Algérie Poste</p>
                      
                      <div className="relative">
                        {/* Connecting Line */}
                        <div className="absolute top-4 left-4 right-4 h-1 bg-slate-200 -z-0"></div>
                        <div 
                          className="absolute top-4 left-4 h-1 bg-sky-500 -z-0 transition-all duration-500"
                          style={{ width: `${(Math.min(currentStepIdx, 3) / 3) * 100}%` }}
                        ></div>

                        {/* Steps Nodes */}
                        <div className="relative z-10 flex justify-between items-start text-center">
                          {[
                            { label: 'Reçu', desc: 'Bordereau créé', icon: FileText },
                            { label: 'Préparation', desc: 'Emballage soigné', icon: Clock },
                            { label: 'Expédié', desc: 'En route wilaya', icon: Truck },
                            { label: 'Livré', desc: 'Arrivé chez vous', icon: CheckCircle },
                          ].map((step, idx) => {
                            const StepIcon = step.icon;
                            let nodeBg = 'bg-slate-100 border-slate-205 text-slate-400';
                            let labelColor = 'text-slate-400';

                            if (idx < currentStepIdx) {
                              nodeBg = 'bg-[#0052FF] border-[#0052FF] text-white';
                              labelColor = 'text-slate-800 font-bold';
                            } else if (idx === currentStepIdx) {
                              nodeBg = 'bg-sky-500 border-sky-500 text-white animate-pulse';
                              labelColor = 'text-sky-600 font-extrabold';
                            }

                            return (
                              <div key={idx} className="flex flex-col items-center">
                                <div className={`w-9 h-9 ${nodeBg} rounded-full border-2 flex items-center justify-center transition-all duration-300`}>
                                  <StepIcon className="w-4 h-4" />
                                </div>
                                <span className={`text-[11px] mt-2 ${labelColor}`}>{step.label}</span>
                                <span className="text-[9px] text-slate-400 mt-0.5 leading-snug font-sans hidden sm:block max-w-[80px]">
                                  {step.desc}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Live interactive map */}
                    <DeliveryMap orderStatus={order.orderStatus} orderId={order.id} googleMapsApiKey={storeSettings?.googleMapsApiKey} customerWilaya={order.customerWilaya} customerAddress={order.customerAddress} />

                    {/* Order Details Matrix */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
                      {/* Delivery Address Details */}
                      <div className="space-y-2.5 bg-slate-50/20 p-4 rounded-2xl border border-slate-100 font-sans text-xs">
                        <div className="flex items-center gap-1.5 text-slate-800 font-bold">
                          <MapPin className="w-4 h-4 text-[#0052FF]" />
                          <span>Adresse de livraison déclarée :</span>
                        </div>
                        <div className="pl-5 space-y-1 text-slate-600 font-medium">
                          <p className="font-semibold text-slate-850">{order.customerName}</p>
                          <p>{order.customerPhone}</p>
                          <p className="font-semibold text-slate-800">{order.customerWilaya}</p>
                          <p className="text-slate-400 italic text-[11px] leading-relaxed">{order.customerAddress}</p>
                        </div>
                        <div className="pt-2 pl-5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                            order.paymentStatus === 'verified' 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                              : order.paymentStatus === 'failed' 
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            Paiement : {order.paymentStatus === 'verified' ? 'Vérifié' : order.paymentStatus === 'failed' ? 'Rejeté/Faux' : 'En cours de validation'}
                          </span>
                        </div>
                      </div>

                      {/* Items Ordered */}
                      <div className="space-y-2.5 bg-slate-50/20 p-4 rounded-2xl border border-slate-100 text-xs font-sans">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Articles compris dans cette caisse</p>
                        <div className="space-y-1.5 divide-y divide-slate-100/60 max-h-32 overflow-y-auto">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center py-1.5">
                              <span className="text-slate-700 font-medium truncate max-w-[200px]" title={item.name}>
                                {item.name}
                              </span>
                              <div className="flex items-center gap-3 font-semibold">
                                <span className="text-slate-400 text-[11px]">x{item.quantity}</span>
                                <span className="text-slate-900">{item.price.toLocaleString('fr-DZ')} DA</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* RETURNS HANDLER WORKFLOW */}
                    <div className="border-t border-slate-100 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 font-sans">
                      {/* Active Return Status Alert */}
                      {order.returnStatus && order.returnStatus !== 'none' ? (
                        <div className={`p-3.5 rounded-2xl text-xs flex items-start gap-2.5 w-full ${getReturnBadgeClass(order.returnStatus)}`}>
                          <RefreshCw className="w-5 h-5 flex-shrink-0 animate-spin text-amber-600 mt-0.5" style={{ animationDuration: order.returnStatus === 'requested' ? '6s' : '0s' }} />
                          <div className="space-y-1 leading-normal">
                            <p className="font-bold">{getReturnLabel(order.returnStatus)}</p>
                            <p className="opacity-90 text-[11px]">Motif déclaré : <b>{order.returnReason}</b></p>
                            {order.adminReturnNotes && <p className="mt-1 pb-1 text-[11px] font-bold border-t border-black/10 pt-1">Note du magasinier : "{order.adminReturnNotes}"</p>}
                            
                            {order.returnStatus === 'approved' && (
                              <p className="text-[11px] font-semibold text-emerald-800 bg-white/40 p-2 rounded-lg mt-1.5 border border-emerald-300 flex items-center gap-1.5">
                                <Phone className="w-3.5 h-3.5" />
                                Support Univers : Envoyez une preuve d'expédition ou appelez direct au <b>{sellerPhone}</b> pour finaliser le virement CCP d'avoir.
                              </p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="text-[11px] text-slate-500 font-medium leading-relaxed max-w-sm">
                            ⚠️ <b>Politique de retour de 7 jours :</b> Vous disposez d'une garantie totale d'échange ou de remboursement après réception de votre commande.
                          </div>

                          {requestingReturnOrderId !== order.id ? (
                            <button
                              type="button"
                              onClick={() => setRequestingReturnOrderId(order.id)}
                              className="px-4 py-2 border border-slate-300 hover:border-amber-500 text-slate-700 hover:text-amber-700 bg-white hover:bg-amber-50 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer flex-shrink-0"
                            >
                              <Undo2 className="w-4 h-4 text-amber-500" />
                              Faire une demande de retour
                            </button>
                          ) : (
                            <div className="mt-3 bg-amber-50/60 p-4 rounded-2xl border border-amber-250 w-full space-y-3">
                              <div className="flex justify-between items-center">
                                <h4 className="font-bold text-xs text-amber-900 flex items-center gap-1.5">
                                  <Undo2 className="w-4 h-4 text-amber-700" />
                                  Détails de votre demande de retour sécurisée
                                </h4>
                                <button 
                                  type="button" 
                                  onClick={() => setRequestingReturnOrderId(null)}
                                  className="text-[11px] font-bold text-amber-800 hover:underline bg-white px-2 py-0.5 rounded cursor-pointer border border-amber-200"
                                >
                                  Annuler
                                </button>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                <div className="sm:col-span-1">
                                  <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Motif de retour</label>
                                  <select
                                    value={returnReasonCode}
                                    onChange={(e) => setReturnReasonCode(e.target.value)}
                                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500"
                                  >
                                    <option value="defect">1. Article Défectueux / Cassé</option>
                                    <option value="size">2. Taille / Couleur incorrecte</option>
                                    <option value="not_match">3. Non conforme aux photos</option>
                                    <option value="regret">4. Plus besoin / Changement d'avis</option>
                                    <option value="other">5. Autre motif</option>
                                  </select>
                                </div>
                                <div className="sm:col-span-2">
                                  <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Description détaillée (CCP + Remarques, etc.)</label>
                                  <input
                                    type="text"
                                    placeholder="Expliquez brièvement le défaut ou l'erreur commise..."
                                    value={returnDetail}
                                    onChange={(e) => setReturnDetail(e.target.value)}
                                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                                  />
                                </div>
                              </div>

                              <div className="flex justify-end gap-2 pt-1">
                                <button
                                  type="button"
                                  onClick={() => submitReturnRequest(order.id)}
                                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shadow-md shadow-amber-600/10 cursor-pointer transition-colors"
                                >
                                  Fidéliser la Demande de Retour
                                </button>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-150 flex flex-wrap justify-between items-center gap-3 text-xs text-slate-500 font-sans flex-shrink-0">
          <p className="flex items-center gap-1">
            <span>🛡️</span> Garanties de transactions supervisées par <b>Univers Shop</b>
          </p>
          <div className="flex gap-4">
            <a href={`tel:${sellerPhone}`} className="text-sky-600 hover:underline font-bold flex items-center gap-1">
              <Phone className="w-3.5 h-3.5" />
              Assistance direct : {sellerPhone}
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
