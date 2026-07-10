import React from 'react';

export function ILovePdfLogo({ className = "h-9" }: { className?: string }) {
  return (
    <div className="flex items-center space-x-2.5 select-none">
      {/* Red Squircle Ribbon Icon matching user screenshot */}
      <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" rx="26" fill="#CC0000" />
        {/* Swooping white ribbon symbol */}
        <path
          d="M48.5 15C44 15 41 22 41 33C41 48 46 59 55 70C63 79 78 82 85 75C89 71 88 64 80 61C73 58 64 61 56 67C47 57 39 48 31 52C23 56 16 68 20 78C24 86 35 84 45 72C50 64 53 52 55 36C57 24 55 15 48.5 15Z"
          stroke="white"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M45 42C48 52 57 60 70 63"
          stroke="white"
          strokeWidth="6"
          strokeLinecap="round"
        />
      </svg>

      {/* I ❤️ PDFMaster typography */}
      <div className="flex items-center space-x-1 font-display font-black tracking-tight">
        <span className="text-xl md:text-2xl text-slate-900 dark:text-white">I</span>
        {/* Heart Symbol ❤️ */}
        <svg viewBox="0 0 24 24" className="w-5 h-5 md:w-6 md:h-6 text-red-600 fill-red-600 animate-pulse-slow" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
        <span className="text-xl md:text-2xl font-black bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 bg-clip-text text-transparent">
          PDFMaster
        </span>
      </div>
    </div>
  );
}
