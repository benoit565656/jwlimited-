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
        <div className="max-w-3xl mb-14">
          <span className="text-xs uppercase tracking-widest text-gold font-semibold">
            Proposed Concept Collection
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-ivory font-normal tracking-tight mt-2 mb-4">
            The {designs.length || 15} Concept Artworks
          </h2>
          <p className="text-base text-ivory/70 leading-relaxed font-light">
            Each artwork explores a distinct facet of Philippine natural wonder, indigenous heritage, and bespoke craftsmanship. 
            Tap any bottle to view all four facets in high definition, then cast your vote below.
          </p>

          {!currentUser && (
            <div className="mt-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded bg-charcoal/80 border border-charcoal-border text-xs text-ivory/70">
              <Lock className="w-3.5 h-3.5 text-gold" />
              <span>Vote totals are visible once you sign in. Exactly one vote per collector.</span>
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
                className={`flex flex-col rounded-xl overflow-hidden transition-all duration-300 ${
                  isUserSelection
                    ? 'bg-charcoal/90 ring-2 ring-gold shadow-gold-subtle'
                    : isWinner
                    ? 'bg-charcoal/90 ring-2 ring-gold/80 shadow-luxury'
                    : 'bg-charcoal/40 border border-charcoal-border hover:border-gold/30 hover:bg-charcoal/60'
                }`}
              >
                {/* Visual Header / Concept Artwork Container */}
                <div 
                  onClick={() => handleOpenLightbox(design.id)}
                  className="relative aspect-[3/2] w-full cursor-pointer overflow-hidden bg-[#1E2024] group"
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
                  <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/30 pointer-events-none" />

                  <Image
                    src={design.thumbnail_path || design.full_image_path}
                    alt={design.alt_text}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-contain p-3 group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />

                  {/* Badges Overlay */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                    {isWinner && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-gold text-ink-deep font-semibold text-[11px] tracking-wider uppercase shadow-md">
                        <Award className="w-3.5 h-3.5" />
                        Winning Design
                      </span>
                    )}

                    {isUserSelection && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-wine text-white font-semibold text-[11px] tracking-wider uppercase shadow-md">
                        <Check className="w-3.5 h-3.5" />
                        Your Vote
                      </span>
                    )}
                  </div>

                  {/* Lightbox Trigger Overlay Hint */}
                  <div className="absolute top-3 right-3 p-1.5 rounded-full bg-ink/60 text-ivory/80 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity">
                    <Maximize2 className="w-4 h-4" />
                  </div>
                </div>

                {/* Card Information */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-xs uppercase tracking-widest text-gold font-medium">
                        {design.code}
                      </span>

                      {/* Vote Count Visibility */}
                      {showCounts ? (
                        <span className="text-xs font-medium text-ivory/80 px-2 py-0.5 rounded bg-ink/60 border border-white/10">
                          {design.vote_count ?? 0} {design.vote_count === 1 ? 'vote' : 'votes'}
                        </span>
                      ) : (
                        <span className="text-[11px] text-ivory/40 italic">
                          Counts hidden
                        </span>
                      )}
                    </div>

                    <h3 className="font-serif text-xl text-ivory font-normal tracking-normal mb-1 group-hover:text-gold transition-colors">
                      {design.title}
                    </h3>

                    {design.subtitle && (
                      <p className="text-xs font-serif italic text-gold/80 mb-2.5">
                        {design.subtitle}
                      </p>
                    )}

                    <p className="text-xs text-ivory/70 leading-relaxed line-clamp-3">
                      {design.description}
                    </p>
                  </div>

                  {/* Action Controls */}
                  <div className="pt-3 border-t border-charcoal-border/70 flex items-center justify-between gap-3">
                    <button
                      onClick={() => handleOpenLightbox(design.id)}
                      className="text-xs text-ivory/60 hover:text-gold transition-colors inline-flex items-center gap-1 py-1"
                    >
                      Inspect Details &rarr;
                    </button>

                    {/* Voting Button State */}
                    {votingPhaseActive ? (
                      isUserSelection ? (
                        <button
                          disabled
                          className="px-4 py-2 rounded bg-wine/20 text-gold border border-gold/40 text-xs font-semibold tracking-wider uppercase cursor-default inline-flex items-center gap-1.5"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Selected
                        </button>
                      ) : (
                        <button
                          onClick={() => initiateVote(design.id)}
                          className="px-4 py-2 rounded bg-wine hover:bg-wine-light text-white text-xs font-semibold tracking-wider uppercase transition-colors shadow-wine-glow inline-flex items-center gap-1"
                        >
                          {userVote ? 'Move Vote Here' : 'Vote'}
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )
                    ) : (
                      <button
                        onClick={() => !currentUser && setAuthModalOpen(true)}
                        className="px-3.5 py-1.5 rounded bg-charcoal text-ivory/50 border border-white/10 text-xs cursor-default"
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
