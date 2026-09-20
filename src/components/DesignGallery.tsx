'use client';

import React from 'react';
import Image from 'next/image';
import { useCampaign } from '@/context/CampaignContext';
import { Check, Maximize2, Lock, ArrowRight, Award } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';

export function DesignGallery() {
  const {
    campaign,
    designs,
    currentUser,
    userVote,
    votingPhaseActive,
    showCounts,
    setAuthModalOpen,
    setLightboxDesignId,
    initiateVote,
  } = useCampaign();

  const handleOpenLightbox = (designId: string) => {
    trackEvent('lightbox_open', { design_id: designId });
    setLightboxDesignId(designId);
  };

  const isWinnerAnnounced = campaign?.status === 'winner_announced';
  const winningDesignId = campaign?.winning_design_id;

  return (
    <section id="designs" className="py-20 md:py-28 bg-ink-deep border-b border-charcoal-border scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title & Description */}
        <div className="max-w-3xl mb-14 space-y-3">
          <div className="inline-flex items-center px-3.5 py-1 text-[11px] font-bold uppercase tracking-jw text-gold bg-gold/10 border border-gold/30">
            The Master Catalog • 22 Concept Artworks
          </div>
          <h2 className="font-headline text-4xl sm:text-5xl lg:text-6xl text-ivory font-bold uppercase tracking-tight leading-[1.02]">
            The {designs.length || 22} Concept Artworks
          </h2>
          <p className="font-serif text-base sm:text-lg text-ivory/75 leading-relaxed font-light">
            Each artwork explores a distinct facet of Philippine natural wonder, indigenous heritage, and bespoke craftsmanship. 
            Select any bottle to view all four facets in high definition, then cast your decisive vote below.
          </p>

          {!currentUser && (
            <div className="mt-4 inline-flex items-center gap-2 px-3.5 py-1.5 bg-charcoal/80 border border-charcoal-border text-xs text-ivory/70">
              <Lock className="w-3.5 h-3.5 text-gold" />
              <span className="font-sans text-[11px] tracking-wide">Vote totals are visible once you sign in. Exactly one vote per collector.</span>
            </div>
          )}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {designs.map((design) => {
            const isUserSelection = userVote?.design_id === design.id;
            const isWinner = isWinnerAnnounced && winningDesignId === design.id;

            return (
              <article
                key={design.id}
                className={`group flex flex-col overflow-hidden transition-all duration-300 border ${
                  isUserSelection
                    ? 'bg-charcoal/90 border-gold shadow-gold-subtle ring-1 ring-gold'
                    : isWinner
                    ? 'bg-charcoal/90 border-gold/80 shadow-luxury ring-1 ring-gold/80'
                    : 'bg-charcoal/40 border-charcoal-border hover:border-gold/50 hover:bg-charcoal/60'
                }`}
              >
                {/* Visual Header / Concept Artwork Container (Mask) */}
                <div 
                  onClick={() => handleOpenLightbox(design.id)}
                  className="relative aspect-[3/2] w-full cursor-pointer overflow-hidden bg-[#16171A]"
                  tabIndex={0}
                  role="button"
                  aria-label={`View ${design.title} full screen`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleOpenLightbox(design.id);
                    }
                  }}
                >
                  {/* Subtle backdrop pattern for transparency safety */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40 pointer-events-none z-10" />

                  <Image
                    src={design.thumbnail_path || design.full_image_path}
                    alt={design.alt_text}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-contain p-2.5 transition-transform duration-700 ease-out group-hover:scale-135 group-hover:brightness-105 will-change-transform"
                    loading="lazy"
                    unoptimized={Boolean((design.thumbnail_path || design.full_image_path)?.startsWith('data:') || (design.thumbnail_path || design.full_image_path)?.startsWith('http'))}
                  />

                  {/* Badges Overlay */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                    {isWinner && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gold text-ink font-bold text-[10px] tracking-jw uppercase shadow-md">
                        <Award className="w-3.5 h-3.5" />
                        Winning Design
                      </span>
                    )}

                    {isUserSelection && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-wine text-white font-bold text-[10px] tracking-jw uppercase shadow-md">
                        <Check className="w-3.5 h-3.5" />
                        Your Vote
                      </span>
                    )}
                  </div>

                  {/* Lightbox Trigger Overlay Hint */}
                  <div className="absolute top-3 right-3 p-1.5 bg-ink/70 text-ivory/80 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity border border-charcoal-border">
                    <Maximize2 className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Card Information */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[11px] font-bold uppercase tracking-jw text-gold bg-gold/10 px-2 py-0.5 border border-gold/30">
                        {design.code}
                      </span>

                      {/* Vote Count Visibility */}
                      {showCounts ? (
                        <span className="text-[11px] font-mono text-ivory/80 px-2 py-0.5 bg-ink/80 border border-charcoal-border">
                          {design.vote_count ?? 0} {design.vote_count === 1 ? 'vote' : 'votes'}
                        </span>
                      ) : (
                        <span className="text-[10px] uppercase tracking-jw text-ivory/40">
                          Counts hidden
                        </span>
                      )}
                    </div>

                    <h3 className="font-headline text-2xl text-ivory uppercase tracking-normal mb-1 font-semibold group-hover:text-gold transition-colors">
                      {design.title}
                    </h3>

                    {design.subtitle && (
                      <p className="text-xs font-serif italic text-gold/80 mb-2.5">
                        {design.subtitle}
                      </p>
                    )}

                    <p className="font-serif text-xs sm:text-sm text-ivory/70 leading-relaxed line-clamp-3 font-light">
                      {design.description}
                    </p>
                  </div>

                  {/* Action Controls */}
                  <div className="pt-4 border-t border-charcoal-border flex items-center justify-between gap-3">
                    <button
                      onClick={() => handleOpenLightbox(design.id)}
                      className="text-[11px] font-bold tracking-jw uppercase text-ivory/60 hover:text-gold transition-colors inline-flex items-center gap-1 py-1"
                    >
                      Inspect Facets &rarr;
                    </button>

                    {/* Voting Button State */}
                    {votingPhaseActive ? (
                      isUserSelection ? (
                        <button
                          disabled
                          className="px-4 py-2 bg-gold/15 text-gold border border-gold/50 text-[11px] font-bold tracking-jw uppercase cursor-default inline-flex items-center gap-1.5"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Selected
                        </button>
                      ) : (
                        <button
                          onClick={() => initiateVote(design.id)}
                          className="px-4 py-2 bg-gold hover:bg-gold-light text-ink text-[11px] font-bold tracking-jw uppercase transition-colors shadow-gold-subtle inline-flex items-center gap-1.5"
                        >
                          {userVote ? 'Move Vote' : 'Vote'}
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )
                    ) : (
                      <button
                        onClick={() => !currentUser && setAuthModalOpen(true)}
                        className="px-3.5 py-1.5 bg-charcoal text-ivory/50 border border-charcoal-border text-[10px] uppercase tracking-jw cursor-default"
                      >
                        {campaign?.status === 'voting_closed' ? 'Voting Closed' : 'Voting Unavailable'}
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>

      </div>
    </section>
  );
}
