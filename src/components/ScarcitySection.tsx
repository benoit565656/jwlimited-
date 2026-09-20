import React from 'react';
import { Award, Users, Gem } from 'lucide-react';

export function ScarcitySection() {
  const points = [
    {
      icon: Gem,
      title: '100 Individually Numbered Bottles Planned',
      desc: 'An ultra-rare production run designed specifically for Philippine collectors and connoisseurs. Each bottle will feature an engraved edition number from 1 to 100.',
    },
    {
      icon: Users,
      title: 'Community-Selected Artwork',
      desc: 'The final design that proceeds to brand evaluation and master glasscrafting is determined exclusively by community votes from Manila Wine collectors.',
    },
    {
      icon: Award,
      title: 'Priority Access for Registered Collectors',
      desc: 'Those who register non-binding interest will receive the winner announcement first and priority advance opportunity before any public release.',
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-ink-deep border-b border-charcoal-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {points.map((pt, i) => {
            const Icon = pt.icon;
            return (
              <div
                key={i}
                className="p-8 bg-charcoal/40 backdrop-blur-sm border border-charcoal-border hover:border-gold/50 transition-all duration-300 flex flex-col items-start"
              >
                <div className="w-12 h-12 bg-ink text-gold flex items-center justify-center mb-6 border border-gold/30">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-headline text-xl text-ivory uppercase tracking-normal mb-2 font-semibold">
                  {pt.title}
                </h3>
                <p className="font-serif text-sm text-ivory/70 leading-relaxed font-light">
                  {pt.desc}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
