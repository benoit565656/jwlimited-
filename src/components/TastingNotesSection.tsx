'use client';

import React from 'react';
import { Award, Compass, Sparkles, ShieldCheck } from 'lucide-react';

export function TastingNotesSection() {
  const flavorNotes = [
    {
      facet: 'NOSE',
      title: 'Mellow Dry Smoke & Honey',
      description: 'A rounded, velvety nose with gentle dry smokiness artfully intertwined with sweet raisins, fresh vanilla pods, and honeyed floral nuances.',
      highlights: ['Dry Smoke', 'Honeycomb', 'Raisin', 'Vanilla Pod'],
      accentColor: 'border-gold/40',
    },
    {
      facet: 'PALATE',
      title: 'Dark Chocolate & Hazelnut',
      description: 'An explosion of flavor revealing hazelnuts, dark cocoa, honey, and sandalwood, layered with candied orange peel and luscious rich malt.',
      highlights: ['Dark Chocolate', 'Hazelnut', 'Candied Orange', 'Sandalwood'],
      accentColor: 'border-jw-copper/40',
    },
    {
      facet: 'FINISH',
      title: 'Luxuriously Long & Smoky',
      description: 'An exceptionally long, warming finish with Johnnie Walker’s signature peat smoke lingering in delicate, sophisticated harmony.',
      highlights: ['Lingering Peat', 'Aged Oak', 'Velvet Spice', 'Fine Smoke'],
      accentColor: 'border-gold/40',
    },
  ];

  return (
    <section id="tasting-notes" className="relative py-24 md:py-32 bg-ink-deep border-b border-charcoal-border overflow-hidden">
      {/* Ambient sapphire and copper lighting */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-jw-blue/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-[450px] h-[450px] bg-jw-copper/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header: Rarity Statement */}
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 text-[11px] font-bold uppercase tracking-jw text-gold bg-gold/10 border border-gold/30">
            <Award className="w-3.5 h-3.5 text-gold" />
            Scotch Whisky Royalty • 1 in 10,000 Casks
          </div>

          <h2 className="font-headline text-4xl sm:text-5xl lg:text-6xl text-ivory font-bold uppercase tracking-tight leading-[1.02]">
            Made with Unparalleled Reserves
          </h2>

          <p className="font-serif text-lg sm:text-xl text-ivory/80 leading-relaxed font-light">
            Only one in 10,000 casks – including precious reserves from irreplaceable &apos;ghost&apos; distilleries – 
            are hand-selected by our Master Blender to craft this peerlessly smooth Scotch whisky.
          </p>

          <p className="text-xs uppercase tracking-jw text-ivory/45 font-mono">
            Johnnie Walker Blue Label Core Profile • 40% ABV • Blended Scotch Whisky
          </p>
        </div>

        {/* 3-Part Flavour Deconstruction Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-20">
          {flavorNotes.map((note, idx) => (
            <div
              key={note.facet}
              className={`relative p-8 bg-charcoal/50 backdrop-blur-sm border ${note.accentColor} hover:border-gold transition-all duration-300 group flex flex-col justify-between`}
            >
              {/* Corner numbering & facet */}
              <div>
                <div className="flex items-center justify-between border-b border-charcoal-border pb-4 mb-6">
                  <span className="font-headline text-sm font-bold tracking-jw-wide uppercase text-gold">
                    {note.facet}
                  </span>
                  <span className="text-[11px] font-mono text-ivory/30 group-hover:text-gold/60 transition-colors">
                    0{idx + 1} / 03
                  </span>
                </div>

                <h3 className="font-headline text-2xl text-ivory uppercase tracking-normal mb-3 font-semibold group-hover:text-white transition-colors">
                  {note.title}
                </h3>

                <p className="font-serif text-sm sm:text-base text-ivory/75 leading-relaxed font-light mb-6">
                  {note.description}
                </p>
              </div>

              {/* Highlight chips */}
              <div className="pt-4 border-t border-charcoal-border/60">
                <span className="block text-[10px] uppercase tracking-jw text-ivory/40 mb-2 font-medium">
                  Dominant Notes
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {note.highlights.map(h => (
                    <span
                      key={h}
                      className="px-2.5 py-0.5 text-[11px] bg-ink text-ivory/80 border border-charcoal-border font-medium"
                    >
                      {h}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Master Blender Tribute Quote Card */}
        <div className="relative p-8 md:p-14 bg-gradient-to-r from-jw-blue-deep via-charcoal to-ink-deep border border-gold/30 shadow-luxury">
          {/* Giant decorative quotation glyph */}
          <div className="absolute top-6 left-6 md:top-10 md:left-10 text-jw-copper/25 pointer-events-none select-none font-serif text-8xl md:text-9xl leading-none">
            &ldquo;
          </div>

          <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
            <p className="font-serif text-2xl sm:text-3xl lg:text-4xl text-ivory font-normal italic leading-snug">
              &quot;Johnnie Walker Blue Label embodies rarity and ultra-premium quality. It represents centuries of blending heritage brought to life.&quot;
            </p>

            <div className="pt-2">
              <span className="block font-headline text-xl sm:text-2xl text-jw-copper font-bold uppercase tracking-jw">
                Dr. Emma Walker
              </span>
              <span className="block font-serif text-sm text-ivory/60 italic mt-1">
                Johnnie Walker’s Master Blender
              </span>
            </div>

            <div className="pt-4 flex flex-wrap justify-center items-center gap-6 text-xs uppercase tracking-jw text-ivory/50">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-gold" />
                Guaranteed Authenticity
              </span>
              <span className="text-charcoal-border">•</span>
              <span className="inline-flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-gold" />
                100 Individually Numbered Bottles
              </span>
              <span className="text-charcoal-border">•</span>
              <span className="inline-flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-gold" />
                Diageo Global Standard
              </span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
