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
          <span className="text-xs uppercase tracking-widest text-gold font-semibold">
            Community Curation Process
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-ivory font-normal tracking-tight">
            Your vote shapes the bottle
          </h2>
          <p className="text-base text-ivory/70 leading-relaxed font-light">
            This edition is being created for collectors who want something genuinely rare and distinctly Filipino. 
            Review each concept, choose the design that speaks to you, and help decide which artwork moves forward. 
            Only one vote is allowed per person.
          </p>
        </div>

        {/* 3 Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div 
                key={step.number}
                className="relative p-8 rounded-lg bg-charcoal/50 border border-charcoal-border hover:border-gold/40 transition-all duration-300 group"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded bg-ink flex items-center justify-center text-gold border border-gold/30 group-hover:border-gold transition-colors">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="font-serif text-3xl font-light text-ivory/20 group-hover:text-gold/40 transition-colors">
                    {step.number}
                  </span>
                </div>

                <h3 className="font-serif text-xl text-ivory mb-3 font-normal">
                  {step.title}
                </h3>

                <p className="text-sm text-ivory/70 leading-relaxed">
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
