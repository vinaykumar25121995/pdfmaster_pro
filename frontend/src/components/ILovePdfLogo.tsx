import React from 'react';

export function ILovePdfLogo({ className = "h-12 w-12", showBadge = false }: { className?: string; showBadge?: boolean }) {
  return (
    <div className="flex items-center justify-center select-none">
      <img
        src="/logo.png"
        alt="I Love PDFMaster View & Edit"
        className={`${className} object-contain rounded-xl drop-shadow-md`}
      />
    </div>
  );
}
