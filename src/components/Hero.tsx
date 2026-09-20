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

  // Status badges - JW luxury rectangular styling
  let statusBadge = (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold tracking-jw uppercase bg-gold/15 text-gold border border-gold/40">
      <Sparkles className="w-3 h-3 text-gold" />
      Community Voting Open
    </span>
  );

  if (status === 'draft') {
    statusBadge = (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold tracking-jw uppercase bg-charcoal text-ivory/60 border border-white/20">
        Preview Mode (Draft)
      </span>
    );
  } else if (status === 'voting_closed') {
    statusBadge = (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold tracking-jw uppercase bg-wine/20 text-wine-light border border-wine/40">
        Voting Concluded
      </span>
    );
  } else if (status === 'winner_announced') {
    statusBadge = (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold tracking-jw uppercase bg-gold/20 text-gold border border-gold">
        <Award className="w-3 h-3" />
        Winning Design Announced
      </span>
    );
  }

  // Hero showcase image: Concept 11 or first concept
  const heroConcept = designs.find(d => d.id === campaign?.winning_design_id) || 
                      designs.find(d => d.code === 'Concept 11') || 
                      designs[0];

  const totalDesigns = designs.length || 22;
  const wallpaperUrl = campaign?.hero_wallpaper_url || '/brand/hero-wallpaper-2k.webp';
  const wallpaperOpacity = typeof campaign?.hero_wallpaper_opacity === 'number'
    ? Math.min(Math.max(campaign.hero_wallpaper_opacity, 0), 100) / 100
    : 0.55;

  return (
    <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 border-b border-charcoal-border bg-gradient-to-b from-ink via-ink-deep to-ink">
      {/* Subtle ambient lighting effect */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-wine/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-gold/5 rounded-full blur-3xl pointer-events-none" />

      {/* Cinematic luxury wallpaper background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
        <div className="relative w-full h-full">
          <Image
            src={wallpaperUrl}
            alt="Johnnie Walker Blue Label Philippines Edition"
            fill
            priority
            unoptimized={Boolean(wallpaperUrl.startsWith('data:') || wallpaperUrl.startsWith('http'))}
            style={{ opacity: wallpaperOpacity }}
            className="object-cover object-center lg:object-[center_35%] scale-100 transition-opacity duration-700"
          />
          {/* Directional gradient mask: deep ink backdrop for left copy, luminous transparency for wallpaper artwork */}
          <div className="absolute inset-0 bg-gradient-to-r from-ink/95 via-ink/75 to-ink/20 lg:via-ink/50" />
          <div className="absolute inset-0 bg-gradient-to-b from-ink/80 via-transparent to-ink" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Editorial Copy Column */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
              {statusBadge}
              <span className="text-[11px] uppercase tracking-jw text-ivory/60 font-medium">
                100 Numbered Bottles • One Winning Design
              </span>
            </div>

            <div className="space-y-1">
              <span className="block font-headline text-xs sm:text-sm uppercase tracking-jw-wide text-gold/90 font-semibold">
                Johnnie Walker Blue Label • Proposed Release
              </span>
              <h1 className="font-headline text-4xl sm:text-6xl lg:text-7xl text-ivory font-bold uppercase tracking-tight leading-[0.98]">
                A Philippines Edition
              </h1>
              <span className="block font-serif italic text-gold text-3xl sm:text-4xl lg:text-5xl font-normal pt-1">
                Chosen by You
              </span>
            </div>

            <p className="text-base sm:text-lg text-ivory/80 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-light">
              Help choose the artwork for a proposed Johnnie Walker Blue Label edition celebrating the Philippines. 
              Review the {totalDesigns} master concept artworks and vote for the design you would be proud to collect, display, or give.
            </p>

            {/* Campaign Key Highlights */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-charcoal-border/80 max-w-lg mx-auto lg:mx-0">
              <div className="text-center lg:text-left">
                <span className="block text-2xl sm:text-3xl font-headline text-gold font-bold">100</span>
                <span className="text-[10px] uppercase tracking-jw text-ivory/60 font-medium">Numbered Bottles</span>
              </div>
              <div className="text-center lg:text-left">
                <span className="block text-2xl sm:text-3xl font-headline text-gold font-bold">{totalDesigns}</span>
                <span className="text-[10px] uppercase tracking-jw text-ivory/60 font-medium">Bottle Concepts</span>
              </div>
              <div className="text-center lg:text-left">
                <span className="block text-2xl sm:text-3xl font-headline text-gold font-bold">1 Vote</span>
                <span className="text-[10px] uppercase tracking-jw text-ivory/60 font-medium">Per Collector</span>
              </div>
            </div>

            {/* Call to Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <a
                href="#designs"
                className="jw-btn-primary w-full sm:w-auto group"
              >
                Explore the Designs
                <ArrowDown className="w-4 h-4 ml-2 group-hover:translate-y-0.5 transition-transform" />
              </a>

              {userVote ? (
                <div className="inline-flex items-center gap-2 px-6 py-3.5 bg-ink-deep border border-gold/40 text-xs font-bold uppercase tracking-jw text-gold">
                  <CheckCircle2 className="w-4 h-4 text-gold flex-shrink-0" />
                  <span>Your vote is active</span>
                </div>
              ) : (
                <a
                  href="#how-it-works"
                  className="jw-btn-outline w-full sm:w-auto"
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
                
                <div className="relative p-4 rounded-xl bg-charcoal/85 backdrop-blur-md border border-gold/30 shadow-luxury transition-all duration-300 group-hover:border-gold/60">
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
                      <span className="text-[10px] uppercase tracking-jw text-gold font-semibold">
                        Four-Facet Panorama View
                      </span>
                    </div>
                    <a
                      href="#designs"
                      className="px-3 py-1.5 bg-ink hover:bg-gold hover:text-ink text-ivory text-[10px] font-bold tracking-jw uppercase border border-gold/40 hover:border-gold transition-colors"
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
