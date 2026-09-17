import React from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AlertCircle, ArrowLeft } from 'lucide-react';

export const metadata = {
  title: "Campaign Terms & Disclaimers | Manila Wine Collector's Choice",
  description: "Terms governing participation in the Manila Wine Collector's Choice Philippines Limited Edition voting and interest registry.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-ink text-ivory">
      <Header />
      
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Link href="/" className="inline-flex items-center gap-2 text-xs text-gold hover:underline mb-8">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Campaign
        </Link>

        {/* Legal Review Alert Flag */}
        <div className="p-4 rounded-lg bg-wine/20 border border-wine/40 text-xs text-wine-light mb-10 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="block font-semibold">Legal Notice / Subject to Counsel Review:</strong>
            The terms below constitute the operational draft for the Manila Wine Collector&apos;s Choice campaign and must be formally confirmed by Manila Wine prior to final production release.
          </div>
        </div>

        <h1 className="font-serif text-3xl sm:text-4xl text-ivory mb-4">
          Campaign Terms & Conditions
        </h1>
        <p className="text-xs text-ivory/50 uppercase tracking-wider mb-10">
          Last Updated: September 2026 • Manila Wine Philippines
        </p>

        <div className="prose prose-invert prose-sm max-w-none space-y-8 text-ivory/80 leading-relaxed font-light">
          <section>
            <h2 className="font-serif text-xl text-ivory mb-2 font-normal">1. Purpose & Scope of Campaign</h2>
            <p>
              The Manila Wine Collector&apos;s Choice campaign is a community-driven market validation initiative. 
              Its purpose is to invite registered collectors to evaluate 11 concept artworks and vote on a proposed 
              100-bottle Philippines-inspired Johnnie Walker Blue Label limited edition.
            </p>
            <p>
              Participation is open strictly to verified individuals who are at least 18 years of age (the legal drinking age in the Republic of the Philippines).
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-ivory mb-2 font-normal">2. Proposed Edition Status</h2>
            <p>
              All concepts, imagery, bottle previews, and numbering referenced on this website are part of an exploratory project. 
              Nothing on this website constitutes a representation or warranty that production has commenced or that official brand 
              authorization has been irrevocably granted. 
              The project is designated as <strong>planned production, subject to final brand and manufacturing approval</strong>.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-ivory mb-2 font-normal">3. Community Voting Rules</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Each verified participant is entitled to cast exactly one (1) vote for one design.</li>
              <li>A participant may freely modify their active vote while the campaign voting period remains open. Any modification updates the existing vote and does not create an additional ballot.</li>
              <li>Voting will automatically close at the scheduled deadline or at the discretion of Manila Wine administration.</li>
              <li>Any attempts at automated bot voting, identity spoofing, or fraudulent account generation will result in immediate disqualification and removal of votes.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl text-ivory mb-2 font-normal">4. Non-Binding Purchase Interest (Pledges)</h2>
            <p>
              Registering interest or specifying a preferred bottle number (1–100) is completely voluntary, free of charge, and 
              strictly <strong>non-binding</strong>.
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>A pledge is <strong>not</strong> a purchase, contract of sale, reservation, order, deposit, or guarantee of bottle availability.</li>
              <li>Preferred numbers submitted during this phase are informational only and do not hold or reserve bottle numbers.</li>
              <li>Registered collectors receive priority notification when advance purchasing opens, at which time allocation policies and binding purchase terms will apply.</li>
              <li>A participant may withdraw their expression of interest at any time while the campaign remains active without affecting their cast vote.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl text-ivory mb-2 font-normal">5. Pricing & Collectible Tiers</h2>
            <p>
              Indicated prices or price ranges are estimates. Manila Wine reserves the right to establish final retail pricing, taxes, 
              and premium tier valuations (for auspicious milestone numbers such as #1, #8, #88, #100) before opening advance orders.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-ivory mb-2 font-normal">6. Intellectual Property & Trademarks</h2>
            <p>
              Johnnie Walker, the Striding Figure device, Blue Label, and associated logos are registered trademarks of Diageo. 
              Manila Wine is an independent distributor and fine spirits merchant. The concept artwork showcased remains the 
              proprietary property of Manila Wine or its respective artists and cannot be copied, reproduced, or commercially 
              exploited without express written permission.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
