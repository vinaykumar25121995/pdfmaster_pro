import React from 'react';

export function ILovePdfLogo({ className = "h-11 w-11", showBadge = true }: { className?: string; showBadge?: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center text-center select-none group py-1">
      {/* 3D Silver & Deep Red Brushed Metal Secondary Emblem */}
      <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="logoBgGrad" cx="50%" cy="40%" r="65%">
            <stop offset="0%" stopColor="#D81130" />
            <stop offset="65%" stopColor="#8E0A1F" />
            <stop offset="100%" stopColor="#4A040F" />
          </radialGradient>
          <linearGradient id="logoSilverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="30%" stopColor="#E2E8F0" />
            <stop offset="60%" stopColor="#94A3B8" />
            <stop offset="100%" stopColor="#F8FAFC" />
          </linearGradient>
        </defs>
        <rect width="100" height="100" rx="23" fill="url(#logoBgGrad)" />
        <path
          d="M44.5 36.5C44.5 28.5 45.5 19.5 49 19.5C52.5 19.5 53 27 50 36.5C46.5 47.5 39.5 60 32 68.5C26 75.5 21 78 19 75.5C17 73 19.5 67 25 62.5C31 57.5 41 54.5 53 55.5C65 56.5 75.5 58 78.5 54.5C81.5 51 76 47.5 66.5 49.5C57.5 51.5 49 48.5 44.5 36.5Z"
          stroke="url(#logoSilverGrad)"
          strokeWidth="7.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M45 22C45 16 50 15 52 19C54 23 53 32 49 42L37 65C34 71 28 76 24 75C20 74 20 68 24 63C28 58 38 54 49 54L64 57C73 59 79 59 80 54C81 49 75 47 68 49C61 51 53 52 45 44"
          stroke="url(#logoSilverGrad)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Directly below the icon: I [Ruby Heart ❤️] PDFMaster */}
      <div className="flex items-center justify-center space-x-1.5 mt-1.5 font-display font-black tracking-tight leading-none">
        <span className="text-xs md:text-sm font-extrabold text-slate-800 dark:text-slate-100 drop-shadow-sm">I</span>
        {/* Ruby Gemstone Symbolic Heart ❤️ */}
        <span className="inline-flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-4 h-4 md:w-4.5 md:h-4.5 drop-shadow" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="rubyHeart" cx="35%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#FF4D6D" />
                <stop offset="55%" stopColor="#C9184A" />
                <stop offset="100%" stopColor="#590D22" />
              </radialGradient>
            </defs>
            <path
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              fill="url(#rubyHeart)"
              stroke="#E2E8F0"
              strokeWidth="1"
            />
          </svg>
        </span>
        <span className="text-xs md:text-sm font-black tracking-wider uppercase bg-gradient-to-r from-slate-800 via-slate-600 to-slate-900 dark:from-white dark:via-slate-200 dark:to-slate-300 bg-clip-text text-transparent">
          PDFMaster
        </span>
      </div>

      {/* VIEW & EDIT Metallic Pill Badge */}
      {showBadge && (
        <div className="mt-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-slate-100 via-white to-slate-200 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 border border-slate-300 dark:border-slate-600 shadow-sm">
          <span className="text-[9px] md:text-[10px] font-black tracking-widest text-red-700 dark:text-red-400 uppercase">
            VIEW &amp; EDIT
          </span>
        </div>
      )}
    </div>
  );
}
