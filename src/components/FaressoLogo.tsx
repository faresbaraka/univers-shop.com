import React from 'react';

interface FaressoLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  showIcons?: boolean;
  className?: string;
}

export default function FaressoLogo({
  size = 'md',
  showTagline = false,
  showIcons = false,
  className = ''
}: FaressoLogoProps) {
  // Height sizing
  const heights = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-16',
    xl: 'h-24'
  };

  const textSizes = {
    sm: 'text-base sm:text-lg',
    md: 'text-xl sm:text-2xl',
    lg: 'text-3xl sm:text-4xl',
    xl: 'text-4xl sm:text-6xl'
  };

  const logoMarkSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20'
  };

  return (
    <div className={`inline-flex flex-col items-center justify-center select-none ${className}`}>
      <div className="flex items-center gap-2.5">
        {/* Custom FARESSØ Metallic FC USB Logo Mark */}
        <div className={`relative flex items-center justify-center ${logoMarkSizes[size]}`}>
          <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-[0_2px_10px_rgba(255,255,255,0.15)]" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="silverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="35%" stopColor="#E2E8F0" />
                <stop offset="70%" stopColor="#94A3B8" />
                <stop offset="100%" stopColor="#64748B" />
              </linearGradient>
              <linearGradient id="silverGlow" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#CBD5E1" stopOpacity="0.4" />
              </linearGradient>
            </defs>

            {/* Stylized Upper 'F' Top Arm */}
            <path 
              d="M35 15 H105 L90 35 H55 V52 H95 L80 68 H55 V105 H35 V15 Z" 
              fill="url(#silverGrad)" 
            />
            
            {/* USB Plug detail on F arm */}
            <rect x="85" y="23" width="12" height="7" rx="1" fill="#0F172A" />
            <rect x="88" y="25" width="2" height="3" fill="url(#silverGrad)" />
            <rect x="92" y="25" width="2" height="3" fill="url(#silverGrad)" />

            {/* Lower 'C' Wrapped Cable Hook */}
            <path 
              d="M35 60 C 20 60, 10 75, 10 90 C 10 105, 25 115, 55 115 H75 V100 H55 C 32 100, 26 92, 26 88 C 26 78, 35 75, 48 75 H55 V60 H35 Z" 
              fill="url(#silverGrad)" 
            />
            {/* Cable Plug Pin */}
            <rect x="68" y="103" width="10" height="9" rx="1.5" fill="url(#silverGrad)" />
            <rect x="71" y="105" width="2" height="5" fill="#0F172A" />
            <rect x="75" y="105" width="2" height="5" fill="#0F172A" />
          </svg>
        </div>

        {/* Wordmark: FARESSØ */}
        <div className="flex flex-col">
          <div className={`font-display font-black tracking-wider ${textSizes[size]} text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 drop-shadow-sm leading-none flex items-center`}>
            <span>FARESS</span>
            {/* Custom Ø with diagonal slash */}
            <span className="relative inline-block ml-0.5">
              O
              <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="w-[120%] h-[3px] bg-gradient-to-r from-white to-slate-300 transform -rotate-[35deg] shadow-sm rounded-full"></span>
              </span>
            </span>
            <span className="text-sky-400 text-xs font-bold ml-1 self-start uppercase tracking-widest bg-sky-500/10 border border-sky-500/30 px-1.5 py-0.5 rounded-md">
              OFFICIAL
            </span>
          </div>
        </div>
      </div>

      {/* Tagline POWER • CONNECT • GO */}
      {showTagline && (
        <div className="flex items-center justify-center gap-2 mt-2 w-full max-w-xs text-[10px] sm:text-xs font-mono font-bold tracking-[0.25em] text-slate-300 uppercase">
          <span className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-slate-500 to-slate-300"></span>
          <span className="text-white drop-shadow-xs">POWER</span>
          <span className="text-sky-400">•</span>
          <span className="text-white drop-shadow-xs">CONNECT</span>
          <span className="text-sky-400">•</span>
          <span className="text-white drop-shadow-xs">GO</span>
          <span className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-slate-500 to-slate-300"></span>
        </div>
      )}

      {/* Cable / Power / Audio Icons */}
      {showIcons && (
        <div className="flex items-center justify-center gap-6 mt-3 pt-3 border-t border-slate-800/80 text-slate-400 text-xs">
          {/* USB Icon */}
          <div className="flex items-center gap-1 hover:text-white transition-colors">
            <svg className="w-4 h-4 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v10M12 12l4-3M12 12l-4-3" />
              <rect x="10" y="2" width="4" height="4" rx="1" fill="currentColor" />
              <circle cx="16" cy="9" r="1.5" />
              <rect x="6.5" y="7.5" width="3" height="3" />
              <circle cx="12" cy="18" r="3" />
            </svg>
            <span className="text-[10px] font-mono text-slate-400">USB-C</span>
          </div>
          <span className="text-slate-700">|</span>
          {/* Power Icon */}
          <div className="flex items-center gap-1 hover:text-white transition-colors">
            <svg className="w-4 h-4 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="currentColor" />
            </svg>
            <span className="text-[10px] font-mono text-slate-400">FAST CHARGE</span>
          </div>
          <span className="text-slate-700">|</span>
          {/* Cable Loop Icon */}
          <div className="flex items-center gap-1 hover:text-white transition-colors">
            <svg className="w-4 h-4 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="8" />
              <path d="M12 4v4M12 16v4" />
            </svg>
            <span className="text-[10px] font-mono text-slate-400">CONNECT</span>
          </div>
        </div>
      )}
    </div>
  );
}
