import React from 'react';

export function ILovePdfLogo({ className = "h-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 40" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <text x="5" y="32" fontFamily="serif" fontSize="34" fontWeight="900" fill="currentColor">I</text>
      <g transform="translate(26, 8)">
        <path d="M15,29.5 C15,29.5 0,18.5 0,9.5 C0,4.2 4.2,0 9.5,0 C12.5,0 15,1.5 15,1.5 C15,1.5 17.5,0 20.5,0 C25.8,0 30,4.2 30,9.5 C30,18.5 15,29.5 15,29.5 Z" fill="#e22127"/>
        <path d="M18,0 L30,12 L18,12 Z" fill="white" className="dark:hidden" />
        <path d="M18,0 L30,12 L18,12 Z" fill="#1e293b" className="hidden dark:block" />
      </g>
      <text x="64" y="32" fontFamily="serif" fontSize="34" fontWeight="900" fill="currentColor" letterSpacing="-1">PDF</text>
    </svg>
  );
}
