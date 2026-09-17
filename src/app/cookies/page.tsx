import React from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: "Cookie Notice | Manila Wine Collector's Choice",
  description: "Information regarding cookies and local storage utilized on the Manila Wine Collector's Choice microsite.",
};

export default function CookiesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-ink text-ivory">
      <Header />
      
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Link href="/" className="inline-flex items-center gap-2 text-xs text-gold hover:underline mb-8">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Campaign
        </Link>

        <h1 className="font-serif text-3xl sm:text-4xl text-ivory mb-4">
          Cookie Policy & Storage Notice
        </h1>
        <p className="text-xs text-ivory/50 uppercase tracking-wider mb-10">
          Last Updated: September 2026 • Manila Wine
        </p>

        <div className="prose prose-invert prose-sm max-w-none space-y-8 text-ivory/80 leading-relaxed font-light">
          <section>
            <h2 className="font-serif text-xl text-ivory mb-2 font-normal">1. Essential Cookies & Storage</h2>
            <p>
              The Manila Wine Collector&apos;s Choice microsite uses strictly necessary cookies and browser storage 
              to operate its core functionality and ensure legal compliance:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>mw_age_confirmed:</strong> Remembers your age confirmation (18+) so you do not encounter 
                the age verification screen repeatedly during your session.
              </li>
              <li>
                <strong>mw_collector_session:</strong> A secure, HTTP-only authentication cookie used to maintain 
                your authenticated voter session and allow you to cast and view your vote.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl text-ivory mb-2 font-normal">2. Analytics & Performance</h2>
            <p>
              We implement privacy-friendly measurement events to understand overall site engagement (e.g., how many visitors view the collection). 
              Our analytics implementation never logs or transmits personally identifiable information, your email address, or your preferred bottle number.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-ivory mb-2 font-normal">3. Managing Your Cookies</h2>
            <p>
              You can control or clear cookies through your browser settings. However, disabling essential cookies 
              will prevent you from signing in, verifying your age, or participating in the community vote.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
