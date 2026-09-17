'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ShieldAlert, Check, X } from 'lucide-react';

export function AgeGateModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check cookie or localStorage
    const confirmed = localStorage.getItem('mw_age_confirmed') === 'true' ||
      document.cookie.includes('mw_age_confirmed=true');
    if (!confirmed) {
      setIsOpen(true);
    }
  }, []);

  const handleConfirm = () => {
    localStorage.setItem('mw_age_confirmed', 'true');
    document.cookie = 'mw_age_confirmed=true; path=/; max-age=31536000; SameSite=Lax';
    setIsOpen(false);
  };

  const handleDecline = () => {
    window.location.href = 'https://www.responsibility.org/';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-deep/90 backdrop-blur-md animate-fade-in">
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="age-gate-title"
        className="relative w-full max-w-md p-8 text-center bg-charcoal border border-gold/30 rounded-lg shadow-luxury text-ivory"
      >
        <div className="flex justify-center mb-6">
          <div className="relative h-12 w-48">
            <Image
              src="/brand/logo.webp"
              alt="Manila Wine"
              fill
              className="object-contain filter brightness-110"
              priority
            />
          </div>
        </div>

        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-wine/20 text-gold mb-4 border border-gold/40">
          <ShieldAlert className="w-6 h-6 text-gold" />
        </div>

        <h2 id="age-gate-title" className="font-serif text-2xl md:text-3xl text-ivory tracking-wide mb-3">
          Are you 18 or older?
        </h2>

        <p className="text-sm text-ivory/70 leading-relaxed mb-8 max-w-sm mx-auto">
          You must be of legal drinking age to enter this experience. Manila Wine supports responsible consumption.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={handleConfirm}
            className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium tracking-wider uppercase transition-all duration-200 bg-wine hover:bg-wine-light text-white rounded border border-wine-light/30 shadow-wine-glow hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-gold"
          >
            <Check className="w-4 h-4 mr-2" />
            Yes, enter
          </button>
          <button
            onClick={handleDecline}
            className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium tracking-wider uppercase transition-all duration-200 bg-charcoal-muted hover:bg-charcoal text-ivory/80 rounded border border-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/20"
          >
            <X className="w-4 h-4 mr-2" />
            No, leave
          </button>
        </div>

        <p className="text-[11px] text-ivory/40 mt-6 tracking-wide">
          Enjoy responsibly. Strictly for adults aged 18 and above.
        </p>
      </div>
    </div>
  );
}
