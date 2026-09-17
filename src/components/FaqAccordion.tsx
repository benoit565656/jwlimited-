'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      q: 'Is my vote a purchase?',
      a: 'No. Voting is completely free and creates no order, deposit, or payment obligation whatsoever.',
    },
    {
      q: 'What does registering my interest mean?',
      a: 'It informs Manila Wine that you may want to acquire a bottle if production proceeds. It is entirely non-binding and entitles you to priority campaign updates and advance purchase details before any public release.',
    },
    {
      q: 'How many bottles will be produced?',
      a: 'The proposed edition is strictly limited to 100 individually numbered bottles for the entire Philippines archipelago.',
    },
    {
      q: 'Why can some bottle numbers cost more?',
      a: 'Certain milestone and auspicious numbers—notably Bottle No. 1, repeating double numbers like 8 and 88, and No. 100—are traditionally prized by fine spirit collectors. Final price tiers will be published before advance purchasing opens.',
    },
    {
      q: 'Can I choose my number now?',
      a: 'You may indicate your number preference in the registry form, but numbers are not reserved during the community voting phase. Official number allocation will occur only if and when advance purchasing commences.',
    },
    {
      q: 'Can I change my vote?',
      a: 'Yes. While the voting period is active, you can return to this page, review the concepts, and move your vote to another design. You will always maintain exactly one active vote.',
    },
    {
      q: 'When will the winning design be announced?',
      a: 'The campaign schedule and announcement dates will be confirmed and displayed on this page. Registered collectors will receive the winning announcement directly via email before public posting.',
    },
    {
      q: 'Is this edition already confirmed?',
      a: 'This is an exploratory collector project. Final production, artwork details, pricing, timing, and availability remain subject to brand and manufacturing approvals.',
    },
  ];

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-20 md:py-28 bg-ink border-b border-charcoal-border scroll-mt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <span className="text-xs uppercase tracking-widest text-gold font-semibold">
            Common Inquiries
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-ivory font-normal tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-ivory/70 font-light">
            Everything you need to know about the voting process, numbering, and priority access.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="border border-charcoal-border rounded-lg bg-charcoal/40 overflow-hidden transition-colors"
              >
                <button
                  onClick={() => toggle(idx)}
                  className="w-full px-6 py-4.5 text-left flex items-center justify-between gap-4 hover:bg-charcoal/60 transition-colors focus:outline-none focus:ring-1 focus:ring-gold"
                  aria-expanded={isOpen}
                >
                  <span className="font-serif text-base sm:text-lg text-ivory font-normal">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-gold flex-shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-gold' : 'text-ivory/50'
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-ivory/75 leading-relaxed border-t border-charcoal-border/50 bg-ink/30 animate-in fade-in duration-150">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
