'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { useCampaign } from '@/context/CampaignContext';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Check, ArrowRight, Award, RotateCcw } from 'lucide-react';

export function LightboxModal() {
  const {
    lightboxDesignId,
    setLightboxDesignId,
    designs,
    campaign,
    userVote,
    votingPhaseActive,
    showCounts,
    initiateVote,
  } = useCampaign();

  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOrigin, setPanOrigin] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  // Find index of current design
  const currentIndex = designs.findIndex(d => d.id === lightboxDesignId);
  const design = designs[currentIndex];

  const resetZoom = useCallback(() => {
    setZoomLevel(1);
    setPanOrigin({ x: 50, y: 50 });
  }, []);

  const handleClose = useCallback(() => {
    setLightboxDesignId(null);
    resetZoom();
  }, [setLightboxDesignId, resetZoom]);

  const handlePrev = useCallback(() => {
    resetZoom();
    if (currentIndex > 0) {
      setLightboxDesignId(designs[currentIndex - 1].id);
    } else {
      setLightboxDesignId(designs[designs.length - 1].id);
    }
  }, [currentIndex, designs, setLightboxDesignId, resetZoom]);

  const handleNext = useCallback(() => {
    resetZoom();
    if (currentIndex < designs.length - 1) {
      setLightboxDesignId(designs[currentIndex + 1].id);
    } else {
      setLightboxDesignId(designs[0].id);
    }
  }, [currentIndex, designs, setLightboxDesignId, resetZoom]);

  const handleToggleZoom = () => {
    if (zoomLevel > 1) {
      resetZoom();
    } else {
      setZoomLevel(2.5);
      setPanOrigin({ x: 50, y: 50 });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (zoomLevel <= 1 || !imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setPanOrigin({ x, y });
  };

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (zoomLevel > 1) {
      resetZoom();
    } else if (imageContainerRef.current) {
      const rect = imageContainerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
      const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
      setPanOrigin({ x, y });
      setZoomLevel(2.5);
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (e.deltaY < 0) {
      // scroll up -> zoom in
      e.preventDefault();
      setZoomLevel(prev => Math.min(3.5, Number((prev + 0.5).toFixed(1))));
    } else if (e.deltaY > 0 && zoomLevel > 1) {
      // scroll down -> zoom out
      e.preventDefault();
      setZoomLevel(prev => {
        const next = Number((prev - 0.5).toFixed(1));
        if (next <= 1) {
          setPanOrigin({ x: 50, y: 50 });
          return 1;
        }
        return next;
      });
    }
  };

  // Touch handling for mobile
  const minSwipeDistance = 50;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEndX(null);
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (zoomLevel > 1 && imageContainerRef.current) {
      // If zoomed in, pan around via touch
      const rect = imageContainerRef.current.getBoundingClientRect();
      const touch = e.targetTouches[0];
      const x = Math.max(0, Math.min(100, ((touch.clientX - rect.left) / rect.width) * 100));
      const y = Math.max(0, Math.min(100, ((touch.clientY - rect.top) / rect.height) * 100));
      setPanOrigin({ x, y });
      return;
    }
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (zoomLevel > 1) return;
    if (!touchStartX || !touchEndX) return;
    const distance = touchStartX - touchEndX;
    if (distance > minSwipeDistance) {
      handleNext();
    } else if (distance < -minSwipeDistance) {
      handlePrev();
    }
  };

  // Keyboard navigation
  useEffect(() => {
    if (!lightboxDesignId) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxDesignId, handleClose, handlePrev, handleNext]);

  if (!lightboxDesignId || !design) return null;

  const isUserSelection = userVote?.design_id === design.id;
  const isWinner = campaign?.winning_design_id === design.id;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="lightbox-title"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-2 sm:p-4 md:p-6 animate-in fade-in duration-200 select-none"
    >
      {/* Top action toolbar */}
      <div className="absolute top-3 sm:top-4 left-3 sm:left-4 right-3 sm:right-4 z-30 flex justify-between items-center text-ivory">
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-[11px] sm:text-xs uppercase tracking-widest text-gold font-semibold truncate max-w-[200px] sm:max-w-none">
            {design.code} • {currentIndex + 1} of {designs.length}
          </span>
          {isWinner && (
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-gold text-ink font-semibold text-[10px] sm:text-[11px] tracking-wider uppercase">
              <Award className="w-3 h-3" />
              Winning Design
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Zoom Toggle */}
          <button
            onClick={handleToggleZoom}
            aria-label={zoomLevel > 1 ? 'Zoom out' : 'Zoom in 2.5x'}
            className={`p-1.5 sm:p-2 rounded-full border transition-all ${
              zoomLevel > 1 
                ? 'bg-gold text-ink border-gold font-bold shadow-gold-subtle' 
                : 'bg-charcoal/80 hover:bg-charcoal text-ivory/80 hover:text-white border-white/10'
            }`}
            title={zoomLevel > 1 ? 'Zoom out (1x)' : 'Zoom in (2.5x Inspection)'}
          >
            {zoomLevel > 1 ? <ZoomOut className="w-4 h-4 sm:w-5 sm:h-5" /> : <ZoomIn className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>

          {/* Close Lightbox */}
          <button
            onClick={handleClose}
            aria-label="Close Lightbox"
            className="p-1.5 sm:p-2 rounded-full bg-charcoal/80 hover:bg-charcoal text-ivory/80 hover:text-white border border-white/10 transition-colors"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={handlePrev}
        aria-label="Previous Concept Artwork"
        className="absolute left-1.5 sm:left-4 z-20 p-2 sm:p-3 rounded-full bg-charcoal/70 hover:bg-charcoal text-ivory/80 hover:text-white border border-white/10 transition-all hover:scale-105 active:scale-95"
      >
        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      <button
        onClick={handleNext}
        aria-label="Next Concept Artwork"
        className="absolute right-1.5 sm:right-4 z-20 p-2 sm:p-3 rounded-full bg-charcoal/70 hover:bg-charcoal text-ivory/80 hover:text-white border border-white/10 transition-all hover:scale-105 active:scale-95"
      >
        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      {/* Main Lightbox Content Area */}
      <div className="relative w-full h-full max-w-6xl flex flex-col justify-center items-center pt-12 sm:pt-14 pb-20 sm:pb-24 overflow-y-auto no-scrollbar">
        
        {/* Interactive Magnifying Loupe Container */}
        <div 
          ref={imageContainerRef}
          onMouseMove={handleMouseMove}
          onClick={handleImageClick}
          onWheel={handleWheel}
          className={`relative w-full max-h-[62vh] sm:max-h-[70vh] aspect-[3/2] flex items-center justify-center overflow-hidden rounded-xl bg-black/40 border border-white/5 ${
            zoomLevel > 1 ? 'cursor-zoom-out' : 'cursor-zoom-in'
          }`}
        >
          <div
            className="relative w-full h-full will-change-transform"
            style={{
              transform: `scale(${zoomLevel})`,
              transformOrigin: `${panOrigin.x}% ${panOrigin.y}%`,
              transition: zoomLevel === 1 
                ? 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), transform-origin 0.2s ease-out' 
                : 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), transform-origin 0.08s ease-out',
            }}
          >
            <Image
              src={zoomLevel > 1 ? (design.original_image_path || design.full_image_path) : design.full_image_path}
              alt={design.alt_text}
              fill
              sizes="(max-width: 768px) 100vw, 1600px"
              className="object-contain p-2"
              priority
              unoptimized={Boolean(
                (design.original_image_path || design.full_image_path)?.startsWith('data:') || 
                (design.original_image_path || design.full_image_path)?.startsWith('http')
              )}
            />
          </div>

          {/* Floating Zoom Details Badge */}
          {zoomLevel > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 px-3.5 py-1.5 rounded-full bg-ink/90 border border-gold/40 backdrop-blur-md text-[11px] text-gold font-medium shadow-luxury flex items-center gap-2.5 animate-in fade-in">
              <span>{zoomLevel}x Magnification &bull; Move cursor to inspect</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  resetZoom();
                }}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-charcoal hover:bg-gold hover:text-ink text-ivory/80 transition-colors text-[10px] uppercase font-bold"
              >
                <RotateCcw className="w-2.5 h-2.5" />
                Reset
              </button>
            </div>
          )}
        </div>

        {/* Bottom Details Drawer */}
        <div className="w-full max-w-2xl bg-charcoal/90 border border-gold/30 rounded-lg p-4 sm:p-5 mt-3 sm:mt-4 text-center shadow-luxury">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            <div className="text-left w-full sm:w-auto">
              <div className="flex items-center gap-2 mb-1">
                <h3 id="lightbox-title" className="font-serif text-base sm:text-lg text-ivory">
                  {design.title}
                </h3>
                {showCounts && (
                  <span className="text-[11px] sm:text-xs px-2 py-0.5 rounded bg-ink text-gold border border-gold/30 font-medium">
                    {design.vote_count ?? 0} votes
                  </span>
                )}
              </div>
              <p className="text-xs text-ivory/70 max-w-md line-clamp-2">
                {design.description}
              </p>
            </div>

            <div className="flex-shrink-0 w-full sm:w-auto">
              {votingPhaseActive && (
                isUserSelection ? (
                  <div className="w-full sm:w-auto px-4 sm:px-5 py-2 sm:py-2.5 rounded bg-wine/30 text-gold border border-gold/40 text-xs font-semibold tracking-wider uppercase inline-flex items-center justify-center gap-1.5">
                    <Check className="w-4 h-4 text-gold" />
                    Your Vote
                  </div>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      initiateVote(design.id);
                    }}
                    className="w-full sm:w-auto px-4 sm:px-5 py-2 sm:py-2.5 rounded bg-wine hover:bg-wine-light text-white text-xs font-semibold tracking-wider uppercase shadow-wine-glow inline-flex items-center justify-center gap-2 transition-colors"
                  >
                    {userVote ? 'Move Vote Here' : 'Vote for this Design'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
