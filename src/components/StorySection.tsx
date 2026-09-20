import React from 'react';
import { Compass, CheckSquare, BellRing } from 'lucide-react';

export function StorySection() {
  const steps = [
    {
      number: '01',
      title: 'Explore',
      icon: Compass,
      description: 'Compare every proposed design and view the full four-facet bottle presentation in our high-resolution lightbox.',
    },
    {
      number: '02',
      title: 'Vote',
      icon: CheckSquare,
      description: 'Sign in securely and choose your favorite. Exactly one vote is allowed per collector, with the flexibility to move your vote while voting is open.',
    },
    {
      number: '03',
      title: 'Get priority access',
      icon: BellRing,
      description: 'Register your interest to hear the result first and receive advance-purchase information before any public release.',
    },
  ];

  return (
    <section id="how-it-works" className="py-20 md:py-28 bg-ink border-b border-charcoal-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
          <div className="inline-flex items-center px-3.5 py-1 text-[11px] font-bold uppercase tracking-jw text-gold bg-gold/10 border border-gold/30">
            Community Curation Process
          </div>
          <h2 className="font-headline text-3xl sm:text-5xl lg:text-6xl text-ivory font-bold uppercase tracking-tight leading-[1.02]">
            Your Vote Shapes The Bottle
          </h2>
          <p className="font-serif text-base sm:text-lg text-ivory/75 leading-relaxed font-light">
            This edition is being created for collectors who want something genuinely rare and distinctly Filipino. 
            Review each concept, choose the design that speaks to you, and help decide which artwork moves forward. 
            Exactly one vote is allowed per person.
          </p>
        </div>

        {/* 3 Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div 
                key={step.number}
                className="relative p-8 bg-charcoal/40 backdrop-blur-sm border border-charcoal-border hover:border-gold/60 transition-all duration-300 group"
              >
                <div className="flex items-center justify-between mb-6 border-b border-charcoal-border pb-4">
                  <div className="w-12 h-12 bg-ink flex items-center justify-center text-gold border border-gold/30 group-hover:border-gold transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="font-headline text-3xl font-bold text-ivory/20 group-hover:text-gold transition-colors tracking-tight">
                    {step.number}
                  </span>
                </div>

                <h3 className="font-headline text-xl text-ivory uppercase tracking-normal font-semibold mb-2">
                  {step.title}
                </h3>

                <p className="font-serif text-sm sm:text-base text-ivory/70 leading-relaxed font-light">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
