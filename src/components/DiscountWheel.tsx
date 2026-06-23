import React, { useState, useEffect } from 'react';
import { Gift, Sparkles, X, RotateCcw } from 'lucide-react';

interface DiscountWheelProps {
  onApplyPromo: (code: string, type: 'percentage' | 'fixed', value: number) => void;
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  onCompleteQuest?: (questId: string, pts: number, name: string) => void;
}

const SECTORS = [
  { label: 'Livraison Gratuite', code: 'ROUELIVRAISON', type: 'percentage', value: 100, color: '#0F766E' }, // Deep Emerald
  { label: '-10% sur tout', code: 'ROUE10', type: 'percentage', value: 10, color: '#0369A1' }, // Sky Blue
  { label: '-500 DA direct', code: 'ROUE500', type: 'fixed', value: 500, color: '#D97706' }, // Amber Gold
  { label: 'Cadeau Surprise 🎁', code: 'ROUECADEAU', type: 'fixed', value: 1, color: '#B45309' }, // Warm Orange
  { label: '-5% sur tout', code: 'ROUE5', type: 'percentage', value: 5, color: '#6366F1' }, // Indigo
  { label: 'Livraison -50%', code: 'ROUE50LIV', type: 'percentage', value: 50, color: '#7C3AED' } // Violet
];

export default function DiscountWheel({ onApplyPromo, onShowToast, onCompleteQuest }: DiscountWheelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [hasSpun, setHasSpun] = useState<boolean>(() => {
    return localStorage.getItem('univers_shop_wheel_spun') === 'true';
  });
  const [wonPrize, setWonPrize] = useState<string | null>(() => {
    return localStorage.getItem('univers_shop_wheel_prize');
  });

  // Synthesize sound effects using Web Audio API
  const playWheelTick = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch (_) {}
  };

  const playSuccessSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
      osc.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.3); // C6
      
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (_) {}
  };

  const handleSpin = () => {
    if (hasSpun || isSpinning) return;

    setIsSpinning(true);
    // Give 50 points to the gamification system
    if (onCompleteQuest) {
      onCompleteQuest('wheel_spun', 50, "Tourner la roue de réduction");
    }

    // Determine winning sector randomly
    const winningSectorIndex = Math.floor(Math.random() * SECTORS.length);
    const sectorAngle = 360 / SECTORS.length;
    
    // Total spin calculation: at least 5 full rotations (1800 deg) plus the center of the winning sector
    // We negate the winning sector angle to match the pointer at the top (which is 90 or 270 deg)
    // The pointer is at the very top (90 deg). Standard angle increases clockwise.
    // Winning sector target angle = 360 - (winningSectorIndex * sectorAngle) - (sectorAngle / 2)
    const extraAngle = 360 - (winningSectorIndex * sectorAngle) - (sectorAngle / 2);
    const totalRotation = 3600 + extraAngle; // 10 full spins plus angle
    
    setRotation(totalRotation);

    // Play tick-clicks periodically during spinning
    let ticks = 0;
    const tickInterval = setInterval(() => {
      ticks++;
      if (ticks < 35) {
        playWheelTick();
      } else {
        clearInterval(tickInterval);
      }
    }, 100);

    setTimeout(() => {
      clearInterval(tickInterval);
      setIsSpinning(false);
      
      const prize = SECTORS[winningSectorIndex];
      setWonPrize(prize.label);
      setHasSpun(true);
      
      localStorage.setItem('univers_shop_wheel_spun', 'true');
      localStorage.setItem('univers_shop_wheel_prize', prize.label);
      
      // Inject the code into the client checkout promo code system
      onApplyPromo(prize.code, prize.type as 'percentage' | 'fixed', prize.value);
      
      playSuccessSound();
      onShowToast(`🎉 Félicitations ! Vous avez gagné : ${prize.label}. Le code promo "${prize.code}" a été appliqué !`, 'success');
    }, 4000);
  };

  return (
    <>
      {/* Floating Gift Box Toggle Button */}
      <div className="fixed bottom-24 right-5 z-40">
        <button
          onClick={() => setIsOpen(true)}
          className="relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-rose-600 to-amber-500 text-white shadow-2xl hover:scale-110 active:scale-95 transition-all cursor-pointer group"
          id="discount-wheel-trigger"
        >
          <div className="absolute inset-0 rounded-full bg-rose-500/30 animate-ping opacity-75 group-hover:hidden"></div>
          <Gift className="w-7 h-7 text-white animate-pulse" />
          {/* Small tooltip bubble */}
          <span className="absolute -top-10 right-0 bg-slate-900 text-white font-bold text-[10px] px-2.5 py-1 rounded-full whitespace-nowrap shadow-md flex items-center gap-1">
            🎁 Roue Cadeau !
          </span>
        </button>
      </div>

      {/* Immersive Modal View */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-100 relative p-6 sm:p-8 transform scale-100 transition-all text-center">
            
            {/* Close Button */}
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-5 right-5 p-1.5 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 hover:text-slate-800 transition-colors cursor-pointer z-10"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Glowing background header */}
            <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-teal-500 via-sky-500 to-violet-500"></div>

            <div className="mb-4">
              <span className="inline-flex p-3 bg-gradient-to-tr from-rose-500 to-amber-500 text-white rounded-full shadow-md shadow-rose-500/20 mb-2">
                <Gift className="w-8 h-8 text-white" />
              </span>
              <h3 className="font-display font-black text-2xl text-slate-900 tracking-tight flex items-center justify-center gap-2">
                Roue de Réduction Surprise <span className="animate-bounce">🎁</span>
              </h3>
              <p className="text-slate-500 text-xs mt-1.5 max-w-sm mx-auto">
                Chaque visiteur peut faire tourner la roue de la fortune une unique fois pour gagner un coupon de réduction immédiat ou un virement cadeau !
              </p>
            </div>

            {/* SPIN WHEEL CANVAS / SVG CONTAINER */}
            <div className="relative my-8 flex justify-center">
              {/* Pointer Arrow */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[22px] border-t-red-600 drop-shadow-md"></div>

              {/* Wheel Body wrapper */}
              <div 
                className="w-64 h-64 sm:w-72 sm:h-72 rounded-full border-8 border-slate-900 shadow-2xl relative overflow-hidden transition-transform ease-out duration-[4000ms]"
                style={{ 
                  transform: `rotate(${rotation}deg)`,
                  transitionTimingFunction: 'cubic-bezier(0.1, 0.8, 0.1, 1)'
                }}
              >
                {/* SVG Sectors */}
                <svg viewBox="0 0 100 100" className="w-full h-full select-none">
                  {SECTORS.map((sec, i) => {
                    const sectorAngle = 360 / SECTORS.length;
                    const startAngle = i * sectorAngle;
                    const endAngle = (i + 1) * sectorAngle;
                    
                    // Convert degrees to radians
                    const startRad = (startAngle - 90) * Math.PI / 180;
                    const endRad = (endAngle - 90) * Math.PI / 180;
                    
                    // Arc coordinates
                    const x1 = 50 + 50 * Math.cos(startRad);
                    const y1 = 50 + 50 * Math.sin(startRad);
                    const x2 = 50 + 50 * Math.cos(endRad);
                    const y2 = 50 + 50 * Math.sin(endRad);
                    
                    const largeArcFlag = sectorAngle > 180 ? 1 : 0;
                    const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

                    // Text position coordinates
                    const textRad = (startAngle + sectorAngle / 2 - 90) * Math.PI / 180;
                    const textX = 50 + 28 * Math.cos(textRad);
                    const textY = 50 + 28 * Math.sin(textRad);
                    const textRotation = startAngle + sectorAngle / 2;

                    return (
                      <g key={i}>
                        <path d={pathData} fill={sec.color} stroke="#0f172a" strokeWidth="0.5" />
                        <text
                          x={textX}
                          y={textY}
                          fill="#ffffff"
                          fontSize="3"
                          fontWeight="black"
                          textAnchor="middle"
                          transform={`rotate(${textRotation}, ${textX}, ${textY})`}
                        >
                          {sec.label}
                        </text>
                      </g>
                    );
                  })}
                  {/* Central glowing pin */}
                  <circle cx="50" cy="50" r="7" fill="#1e293b" stroke="#ffffff" strokeWidth="2" />
                  <circle cx="50" cy="50" r="3" fill="#ffffff" />
                </svg>
              </div>
            </div>

            {/* BUTTON CONTROLS */}
            <div className="space-y-4 max-w-sm mx-auto">
              {!hasSpun ? (
                <button
                  onClick={handleSpin}
                  disabled={isSpinning}
                  className={`w-full py-4.5 rounded-2xl text-sm font-black uppercase tracking-wider transition-all shadow-lg ${
                    isSpinning
                      ? 'bg-slate-100 text-slate-400 border border-slate-200 shadow-none cursor-not-allowed'
                      : 'bg-gradient-to-r from-rose-600 via-amber-500 to-rose-600 text-white hover:opacity-95 shadow-rose-600/20 cursor-pointer hover:scale-[1.01]'
                  }`}
                >
                  {isSpinning ? '🎰 Tirage surprise...' : '🔥 Tourner la Roue !'}
                </button>
              ) : (
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-center space-y-2">
                  <div className="flex items-center justify-center gap-1 text-emerald-800 text-xs font-extrabold uppercase">
                    <Sparkles className="w-4 h-4 text-emerald-500 animate-spin" />
                    <span>Réduction Gagnée !</span>
                  </div>
                  <p className="text-slate-800 text-sm font-black">
                    "{wonPrize}"
                  </p>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    Félicitations ! Le coupon a été injecté directement à votre panier. Vous le verrez automatiquement déduit lors du checkout !
                  </p>
                </div>
              )}

              <p className="text-[10px] text-slate-400 font-medium">
                💡 Offre réservée aux clients de Univers Shop. Une seule participation par appareil.
              </p>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
