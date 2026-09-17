import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Phone, Mail, ShieldAlert } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-ink-deep text-ivory/70 border-t border-charcoal-border pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-charcoal-border">
          
          {/* Brand Info */}
          <div className="md:col-span-5 space-y-4">
            <div className="relative h-10 w-48">
              <Image
                src="/brand/logo.webp"
                alt="Manila Wine"
                fill
                className="object-contain filter brightness-110"
              />
            </div>
            <p className="text-xs text-ivory/60 leading-relaxed max-w-sm">
              The Philippines&apos; premier destination for authentic fine wines, spirits, and bespoke collector editions. Curated with care, delivered with confidence.
            </p>
            <div className="pt-2 text-xs space-y-2">
              <div className="flex items-center gap-2 text-ivory/80">
                <Phone className="w-3.5 h-3.5 text-gold" />
                <span>Customer Concierge: <a href="tel:+639178600808" className="hover:text-gold transition-colors">+63917 860 0808</a></span>
              </div>
              <div className="flex items-center gap-2 text-ivory/80">
                <Mail className="w-3.5 h-3.5 text-gold" />
                <span>Email: <a href="mailto:contact@manila-wine.com" className="hover:text-gold transition-colors">contact@manila-wine.com</a></span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs uppercase tracking-widest text-gold font-semibold">
              Campaign Navigation
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#edition" className="hover:text-gold transition-colors">The 100-Bottle Edition</a>
              </li>
              <li>
                <a href="#designs" className="hover:text-gold transition-colors">Concept Gallery</a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-gold transition-colors">How Voting Works</a>
              </li>
              <li>
                <a href="#faq" className="hover:text-gold transition-colors">Frequently Asked Questions</a>
              </li>
              <li>
                <a 
                  href="https://manila-wine.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-gold transition-colors text-ivory font-medium"
                >
                  Visit Main Manila Wine Shop &rarr;
                </a>
              </li>
            </ul>
          </div>

          {/* Legal & Governance */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-xs uppercase tracking-widest text-gold font-semibold">
              Legal & Policies
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/terms" className="hover:text-gold transition-colors">
                  Campaign Terms & Disclaimers
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-gold transition-colors">
                  Privacy Notice & Data Rights
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="hover:text-gold transition-colors">
                  Cookie Preferences & Notice
                </Link>
              </li>
            </ul>

            <div className="p-3 rounded bg-charcoal/50 border border-charcoal-border text-[11px] text-ivory/60 mt-4 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-wine-light flex-shrink-0 mt-0.5" />
              <span>
                <strong>Responsible Drinking:</strong> Drinking alcoholic beverages impairs your ability to drive a car or operate machinery, and may cause health problems. For adults 18+ only.
              </span>
            </div>
          </div>

        </div>

        {/* Bottom Disclaimer & Copyright */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left text-[11px] text-ivory/40">
          <p>
            &copy; {currentYear} Manila Wine. All rights reserved. Johnnie Walker and Blue Label are trademarks of Diageo. This microsite presents an independent proposal curated by Manila Wine for its collector community and is subject to final brand authorization.
          </p>
          <p className="flex-shrink-0">
            Collector&apos;s Choice microsite • Manila, Philippines
          </p>
        </div>

      </div>
    </footer>
  );
}
