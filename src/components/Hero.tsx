'use client';

import React from 'react';
import Image from 'next/image';
import { useCampaign } from '@/context/CampaignContext';
import { ArrowDown, Sparkles, CheckCircle2, Award } from 'lucide-react';
import { formatPhp } from '@/lib/utils';

export function Hero() {
  const { campaign, designs, userVote } = useCampaign();

  const minPrice = campaign?.min_price_php;
  const status = campaign?.status;

  // Status badges
  let statusBadge = (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-gold/10 text-gold border border-gold/30">
      <Sparkles className="w-3.5 h-3.5" />
      Community Voting Open
    </span>
  );

  if (status === 'draft') {
    statusBadge = (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-charcoal text-ivory/60 border border-white/20">
        Preview Mode (Draft)
      </span>
    );
  } else if (status === 'voting_closed') {
    statusBadge = (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-wine/20 text-wine-light border border-wine/40">
        Voting Concluded — Finalizing Results
      </span>
    );
  } else if (status === 'winner_announced') {
    statusBadge = (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-gold/20 text-gold border border-gold">
        <Award className="w-3.5 h-3.5" />
        Winning Design Announced
      </span>
    );
  }

  // Hero showcase image: Concept 11 or first concept
  const heroConcept = designs.find(d => d.id === campaign?.winning_design_id) || 
                      designs.find(d => d.code === 'Concept 11') || 
                      designs[0];

  const totalDesigns = designs.length || 15;

  return (
    <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 border-b border-charcoal-border bg-gradient-to-b from-ink via-ink-deep to-ink">
      {/* Subtle ambient lighting effect */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-wine/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-gold/5 rounded-full blur-3xl pointer-events-none" />

      {/* Atmospheric subtle background design artwork */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
        <div className="relative w-full h-full">
          <Image
            src={heroConcept?.full_image_path || '/concepts/full/concept-11.webp'}
            alt=""
            fill
            priority
            className="object-cover object-center opacity-[0.07] scale-105 filter blur-[0.5px] mix-blend-screen"
          />
          {/* Subtle multi-layer gradient mask ensuring copy has 100% pristine contrast */}
          <div className="absolute inset-0 bg-gradient-to-b from-ink/90 via-ink/60 to-ink" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink via-transparent to-ink/90 opacity-90" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Editorial Copy Column */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
              {statusBadge}
              <span className="text-xs uppercase tracking-widest text-ivory/60 font-medium">
                100 numbered bottles. One winning design.
              </span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-ivory font-normal tracking-tight leading-[1.12]">
              A Philippines Edition, <span className="italic text-gold font-serif">Chosen by You</span>
            </h1>

            <p className="text-base sm:text-lg text-ivory/80 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-light">
              Help choose the artwork for a proposed Johnnie Walker Blue Label edition celebrating the Philippines. 
              Review the {totalDesigns} concept artworks and vote for the design you would be proud to collect, display, or give.
            </p>

            {/* Campaign Key Highlights */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-charcoal-border/80 max-w-lg mx-auto lg:mx-0">
              <div className="text-center lg:text-left">
                <span className="block text-xl sm:text-2xl font-serif text-gold font-medium">100</span>
                <span className="text-[11px] uppercase tracking-wider text-ivory/50">Numbered Bottles</span>
              </div>
              <div className="text-center lg:text-left">
                <span className="block text-xl sm:text-2xl font-serif text-gold font-medium">{totalDesigns}</span>
                <span className="text-[11px] uppercase tracking-wider text-ivory/50">Bottle Concepts</span>
              </div>
              <div className="text-center lg:text-left">
                <span className="block text-xl sm:text-2xl font-serif text-gold font-medium">1 Vote</span>
                <span className="text-[11px] uppercase tracking-wider text-ivory/50">Per Collector</span>
              </div>
            </div>

            {/* Call to Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <a
                href="#designs"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 rounded bg-wine hover:bg-wine-light text-white font-semibold text-sm tracking-wider uppercase shadow-wine-glow transition-all duration-200 group"
              >
                Explore the Designs
                <ArrowDown className="w-4 h-4 ml-2 group-hover:translate-y-0.5 transition-transform" />
              </a>

              {userVote ? (
                <div className="inline-flex items-center gap-2 px-4 py-3 rounded bg-charcoal border border-gold/40 text-xs text-gold">
                  <CheckCircle2 className="w-4 h-4 text-gold flex-shrink-0" />
                  <span>Your vote is active</span>
                </div>
              ) : (
                <a
                  href="#how-it-works"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded border border-ivory/20 hover:border-gold text-ivory text-sm font-medium tracking-wide transition-colors"
                >
                  How Voting Works
                </a>
              )}
            </div>

            {/* Required Regulatory / Project Disclosure */}
            <p className="text-[11px] text-ivory/45 leading-relaxed pt-2 max-w-xl mx-auto lg:mx-0">
              Proposed limited edition. Final production, design details, pricing
              {minPrice ? ` (expected from ${formatPhp(minPrice)})` : ''}, and availability remain subject to confirmation and brand approval.
            </p>
          </div>

          {/* Right Hero Bottle Showcase (Hero Arrangement) */}
          <div className="lg:col-span-5 flex justify-center">
            {heroConcept && (
              <div className="relative w-full max-w-md group">
                {/* Glowing pedestal backing */}
                <div className="absolute inset-0 bg-gradient-to-t from-gold/15 to-transparent rounded-2xl blur-xl" />
                
                <div className="relative p-4 rounded-xl bg-charcoal/90 border border-gold/30 shadow-luxury transition-all duration-300 group-hover:border-gold/60">
                  <div className="relative aspect-[3/2] w-full overflow-hidden rounded bg-ink-deep flex items-center justify-center">
                    <Image
                      src={heroConcept.full_image_path}
                      alt={heroConcept.alt_text}
                      fill
                      sizes="(max-width: 768px) 100vw, 500px"
                      className="object-contain p-2 group-hover:scale-[1.02] transition-transform duration-500"
                      priority
                    />
                  </div>

                  <div className="mt-3.5 flex items-center justify-between text-xs px-1">
                    <div>
                      <span className="font-serif font-medium text-ivory text-sm block">
                        {heroConcept.title}
                      </span>
                      <span className="text-[11px] text-gold/80 tracking-wide">
                        Four-Facet Panorama View
                      </span>
                    </div>
                    <a
                      href="#designs"
                      className="px-3 py-1 rounded bg-charcoal-muted hover:bg-wine text-ivory text-[11px] font-medium tracking-wider uppercase border border-white/10 hover:border-wine transition-colors"
                    >
                      View All {totalDesigns}
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
