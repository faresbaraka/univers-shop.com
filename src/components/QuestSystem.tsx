import React, { useState, useEffect } from 'react';
import { Trophy, CheckCircle, Circle, ArrowRight, Award, ShieldCheck, Sparkles, User, Gift, Phone } from 'lucide-react';

interface QuestSystemProps {
  userPoints: number;
  completedQuests: string[];
  onAddPoints: (pts: number) => void;
  onCompleteQuest: (questId: string, pts: number, name: string) => void;
  onApplyPromo: (code: string, type: 'percentage' | 'fixed', value: number) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  isOpen: boolean;
  onClose: () => void;
  customerName: string;
  customerPhone: string;
  onUpdateProfile: (name: string, phone: string) => void;
}

const QUESTS = [
  { id: 'profil_complet', name: 'Profil Complété', desc: 'Renseignez votre nom et votre numéro pour la livraison', pts: 100, hint: 'Remplir le mini-formulaire ci-dessous' },
  { id: 'favori', name: 'Coup de Cœur', desc: 'Ajoutez un produit de la boutique en favori', pts: 50, hint: 'Cliquer sur le cœur d\'un article' },
  { id: 'partage', name: 'Ambassadeur', desc: 'Partagez le lien d\'un produit', pts: 50, hint: 'Cliquer sur l\'icône de partage d\'un article' },
  { id: 'wheel_spun', name: 'Roue de la Chance', desc: 'Tournez la roue surprise pour un gain surprise', pts: 50, hint: 'Lancer la roue cadeau en bas à droite' },
  { id: 'chat_ia', name: 'Yanis l\'Expert', desc: 'Discutez avec notre assistant commercial IA Yanis', pts: 40, hint: 'Envoyer un message à l\'IA Yanis' },
  { id: 'order_placed', name: 'Fidélité Commande', desc: 'Enregistrez votre première commande sur le site', pts: 200, hint: 'Finaliser un achat au panier' }
];

const REWARDS = [
  { id: 'rew_150', pts: 150, discount: 150, label: '-150 DA sur votre panier', code: 'RECOMPENSE150' },
  { id: 'rew_300', pts: 300, discount: 350, label: '-350 DA sur votre panier (Bonus !)', code: 'RECOMPENSE300' },
  { id: 'rew_500', pts: 500, discount: 650, label: '-650 DA sur votre panier (Elite !)', code: 'RECOMPENSE500' }
];

export default function QuestSystem({
  userPoints,
  completedQuests,
  onAddPoints,
  onCompleteQuest,
  onApplyPromo,
  onShowToast,
  isOpen,
  onClose,
  customerName,
  customerPhone,
  onUpdateProfile
}: QuestSystemProps) {
  const [localName, setLocalName] = useState(customerName);
  const [localPhone, setLocalPhone] = useState(customerPhone);
  const [redeemedRewards, setRedeemedRewards] = useState<string[]>(() => {
    return JSON.parse(localStorage.getItem('univers_shop_redeemed_rewards') || '[]');
  });

  // Calculate Level and progress
  // Level thresholds: Lvl 1 (0-150), Lvl 2 (150-350), Lvl 3 (350-600), Lvl 4 (600+)
  const getLevelInfo = (pts: number) => {
    if (pts < 150) {
      return { level: 1, title: 'Acheteur Novice 🌱', nextThreshold: 150, prevThreshold: 0 };
    } else if (pts < 350) {
      return { level: 2, title: 'Économiste Malin 🦉', nextThreshold: 350, prevThreshold: 150 };
    } else if (pts < 600) {
      return { level: 3, title: 'Chasseur de Bons Plans 🎯', nextThreshold: 600, prevThreshold: 350 };
    } else {
      return { level: 4, title: 'Client Élite Privilège 💎', nextThreshold: 1000, prevThreshold: 600 };
    }
  };

  const lvlInfo = getLevelInfo(userPoints);
  const xpInCurrentLvl = userPoints - lvlInfo.prevThreshold;
  const xpNeededForNext = lvlInfo.nextThreshold - lvlInfo.prevThreshold;
  const progressPercent = Math.min(100, Math.max(0, (xpInCurrentLvl / xpNeededForNext) * 100));

  useEffect(() => {
    setLocalName(customerName);
    setLocalPhone(customerPhone);
  }, [customerName, customerPhone]);

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!localName.trim() || !localPhone.trim()) {
      onShowToast('Veuillez remplir votre nom et votre numéro de téléphone.', 'error');
      return;
    }
    onUpdateProfile(localName, localPhone);
    onCompleteQuest('profil_complet', 100, 'Profil Complété');
  };

  const redeemReward = (reward: typeof REWARDS[0]) => {
    if (userPoints < reward.pts) {
      onShowToast(`Points insuffisants. Vous avez besoin de ${reward.pts} points.`, 'error');
      return;
    }

    // Deduct points (add negative points)
    onAddPoints(-reward.pts);

    // Apply coupon
    onApplyPromo(reward.code, 'fixed', reward.discount);

    const updatedRedeemed = [...redeemedRewards, reward.id];
    setRedeemedRewards(updatedRedeemed);
    localStorage.setItem('univers_shop_redeemed_rewards', JSON.stringify(updatedRedeemed));

    onShowToast(`🎉 Récompense débloquée ! Le code promo "${reward.code}" de -${reward.discount} DA est maintenant appliqué à votre panier !`, 'success');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-55 flex justify-end bg-slate-900/60 backdrop-blur-xs font-sans">
      <div className="w-full max-w-md bg-white h-full flex flex-col shadow-2xl border-l border-slate-100 animate-slide-in relative">
        
        {/* Header */}
        <div className="bg-slate-900 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h2 className="font-display font-black text-slate-100 text-base">Mission Économies 🎁</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1 px-2.5 rounded-full hover:bg-white/10 text-slate-300 font-bold transition-all text-sm cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Quest Log Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
          
          {/* LEVEL DASHBOARD CARD */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-5 text-white shadow-xl border border-slate-700/50 relative overflow-hidden">
            <div className="absolute inset-0 bg-white/5 pointer-events-none select-none mix-blend-overlay"></div>
            
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Votre Grade</p>
                <h4 className="font-display font-black text-base text-amber-300 mt-0.5">{lvlInfo.title}</h4>
              </div>
              <div className="bg-white/15 px-3 py-1.5 rounded-2xl border border-white/10 text-center">
                <span className="text-[10px] text-slate-300 font-bold">NIVEAU</span>
                <p className="font-display font-black text-lg leading-none mt-0.5 text-sky-400">{lvlInfo.level}</p>
              </div>
            </div>

            {/* XP progress bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium text-slate-300">
                <span>{userPoints} points accumulés</span>
                <span>Prochain grade : {lvlInfo.nextThreshold} pts</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-3.5 p-0.5 border border-slate-700">
                <div 
                  className="bg-gradient-to-r from-amber-500 to-emerald-400 h-2.5 rounded-full transition-all duration-500 shadow-sm"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* ACTIVE QUESTS LOG */}
          <div className="space-y-3">
            <h3 className="font-display font-bold text-slate-900 text-sm flex items-center gap-1.5 border-b border-slate-200 pb-2">
              <Award className="w-4 h-4 text-sky-600" />
              Défis du moment
            </h3>
            <div className="space-y-2.5">
              {QUESTS.map((quest) => {
                const isCompleted = completedQuests.includes(quest.id);
                return (
                  <div 
                    key={quest.id} 
                    className={`p-3.5 rounded-2xl border transition-all ${
                      isCompleted 
                        ? 'bg-emerald-50/70 border-emerald-100 text-slate-700' 
                        : 'bg-white border-slate-150 text-slate-800 shadow-2xs hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {isCompleted ? (
                          <CheckCircle className="w-5 h-5 text-emerald-500" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-300" />
                        )}
                      </div>
                      <div className="flex-1 space-y-0.5">
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-extrabold ${isCompleted ? 'text-emerald-800 line-through' : 'text-slate-900'}`}>
                            {quest.name}
                          </span>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                            isCompleted 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : 'bg-sky-50 text-sky-600 border border-sky-100'
                          }`}>
                            +{quest.pts} XP
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-normal">{quest.desc}</p>
                        {!isCompleted && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-sky-600 mt-1 bg-sky-50/50 px-2 py-0.5 rounded-md border border-sky-100/30">
                            💡 {quest.hint}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* MINI PROFILE FORM FOR QUEST 1 */}
          {!completedQuests.includes('profil_complet') && (
            <div className="bg-amber-50/50 border border-amber-100 rounded-3xl p-4.5 space-y-3.5">
              <div className="flex items-center gap-2 text-amber-800">
                <User className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-extrabold uppercase tracking-wide">Compléter vos coordonnées (+100 pts)</span>
              </div>
              <form onSubmit={handleProfileSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-1">Nom Complet</label>
                    <input
                      type="text"
                      placeholder="Ex: Fares Baraka"
                      value={localName}
                      onChange={(e) => setLocalName(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-1">Téléphone</label>
                    <input
                      type="tel"
                      placeholder="Ex: 0550 00 00 00"
                      value={localPhone}
                      onChange={(e) => setLocalPhone(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs py-2 rounded-xl transition-colors cursor-pointer"
                >
                  Enregistrer & Récupérer +100 Points 🎁
                </button>
              </form>
            </div>
          )}

          {/* REWARDS STORE */}
          <div className="space-y-3">
            <h3 className="font-display font-bold text-slate-900 text-sm flex items-center gap-1.5 border-b border-slate-200 pb-2">
              <Gift className="w-4 h-4 text-emerald-600" />
              Boutique Récompenses
            </h3>
            <p className="text-[11px] text-slate-500 max-w-sm">
              Échangez vos points contre des coupons de réductions déductibles instantanément au panier.
            </p>
            <div className="space-y-2.5">
              {REWARDS.map((rew) => {
                const canRedeem = userPoints >= rew.pts;
                return (
                  <div 
                    key={rew.id}
                    className="bg-white border border-slate-150 rounded-2xl p-3.5 flex items-center justify-between shadow-2xs"
                  >
                    <div className="space-y-0.5">
                      <p className="text-xs font-black text-slate-800">{rew.label}</p>
                      <p className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                        <span>Coût :</span>
                        <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100/30">
                          {rew.pts} pts
                        </span>
                      </p>
                    </div>
                    <button
                      onClick={() => redeemReward(rew)}
                      disabled={!canRedeem}
                      className={`px-3.5 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-1 cursor-pointer ${
                        canRedeem
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white hover:scale-105 active:scale-95 shadow-md shadow-emerald-600/10'
                          : 'bg-slate-100 text-slate-400 border border-slate-200 shadow-none cursor-not-allowed'
                      }`}
                    >
                      <span>Débloquer</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* FOOTER */}
          <div className="bg-slate-100 rounded-2xl p-3.5 border border-slate-200 text-center">
            <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">
              🛡️ Économies Garantes : Vos points restent stockés sur votre appareil et s'accumulent au fil de vos actions.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
