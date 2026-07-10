import React from 'react';

export function ILovePdfLogo({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <div className="flex flex-col items-center justify-center text-center select-none group py-0.5">
      {/* Red Squircle Ribbon Icon matching reference image */}
      <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" rx="24" fill="#C8102E" />
        {/* Pixel-perfect white swooping ribbon loop matching reference image */}
        <path
          d="M44.5 36.5C44.5 28.5 45.5 19.5 49 19.5C52.5 19.5 53 27 50 36.5C46.5 47.5 39.5 60 32 68.5C26 75.5 21 78 19 75.5C17 73 19.5 67 25 62.5C31 57.5 41 54.5 53 55.5C65 56.5 75.5 58 78.5 54.5C81.5 51 76 47.5 66.5 49.5C57.5 51.5 49 48.5 44.5 36.5Z"
          stroke="white"
          strokeWidth="6.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M45 22C45 16 50 15 52 19C54 23 53 32 49 42L37 65C34 71 28 76 24 75C20 74 20 68 24 63C28 58 38 54 49 54L64 57C73 59 79 59 80 54C81 49 75 47 68 49C61 51 53 52 45 44"
          stroke="white"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Directly below the icon: I ❤️ PDFMaster */}
      <div className="flex items-center justify-center space-x-1 mt-1 font-display font-black tracking-tight leading-none">
        <span className="text-xs md:text-sm text-slate-900 dark:text-white font-extrabold">I</span>
        {/* Symbolic Heart ❤️ */}
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 md:w-4 md:h-4 text-red-600 fill-red-600 animate-pulse-slow" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
        <span className="text-xs md:text-sm font-black bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 bg-clip-text text-transparent">
          PDFMaster
        </span>
      </div>
    </div>
  );
}
