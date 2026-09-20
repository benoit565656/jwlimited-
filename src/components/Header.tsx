'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCampaign } from '@/context/CampaignContext';
import { Menu, X, User, ExternalLink, ShieldCheck, LogOut, RefreshCw } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';

export function Header() {
  const { campaign, currentUser, userVote, resetVote, setAuthModalOpen, logout } = useCampaign();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const mainShopUrl = campaign?.main_shop_url || 'https://manila-wine.com';

  const navLinks = [
    { label: 'The Edition', href: '#edition' },
    { label: 'Designs', href: '#designs' },
    { label: 'Tasting Notes', href: '#tasting-notes' },
    { label: 'How it Works', href: '#how-it-works' },
    { label: 'FAQ', href: '#faq' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-ink/95 backdrop-blur border-b border-charcoal-border/80 transition-all duration-200">
      {/* Top micro-bar for contact & luxury accent */}
      <div className="hidden sm:block border-b border-charcoal-border/40 bg-ink-deep/60 px-4 py-1.5 text-xs text-ivory/60">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <span className="tracking-widest uppercase text-[10px] text-gold/90 font-medium">
            Proposed Limited Production • 100 Numbered Bottles
          </span>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Customer Concierge: <a href="tel:+639178600808" className="hover:text-gold transition-colors">+63917 860 0808</a></span>
            <span className="text-ivory/20">|</span>
            <a
              href={mainShopUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent('shop_link_clicked', { location: 'top_bar' })}
              className="hover:text-ivory inline-flex items-center gap-1 transition-colors"
            >
              Main Wine Shop <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-gold rounded p-1">
              <div className="relative h-8 sm:h-10 w-36 sm:w-48 md:w-52">
                <Image
                  src="/brand/logo.webp"
                  alt="Manila Wine"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <div className="hidden lg:flex flex-col border-l border-gold/40 pl-3">
                <span className="font-serif text-xs uppercase tracking-widest text-gold font-semibold">Collector&apos;s Choice</span>
                <span className="text-[10px] tracking-wider text-ivory/50">Philippines Edition</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-7" aria-label="Main Navigation">
            {navLinks.map(link => (
              <a
                key={link.href}
                href={link.href}
                className="relative py-1 text-[11px] font-semibold uppercase tracking-jw text-ivory/80 hover:text-gold transition-colors group"
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-full h-[1px] bg-gold scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-200" />
              </a>
            ))}
          </nav>

          {/* User Account / Auth CTAs */}
          <div className="hidden md:flex items-center space-x-4">
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-full border border-gold/40 bg-charcoal/80 hover:border-gold text-ivory text-xs font-medium tracking-wide transition-colors focus:outline-none focus:ring-2 focus:ring-gold"
                  aria-expanded={userDropdownOpen}
                >
                  <div className="w-6 h-6 rounded-full bg-wine flex items-center justify-center text-white text-[11px] font-bold">
                    {currentUser.email.charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-[130px] truncate">{currentUser.email}</span>
                </button>

                {userDropdownOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-56 bg-charcoal border border-gold/30 rounded shadow-luxury py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-charcoal-border text-xs">
                      <p className="text-ivory/50">Signed in as</p>
                      <p className="text-ivory font-medium truncate">{currentUser.email}</p>
                      {currentUser.role === 'admin' && (
                        <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase bg-gold/20 text-gold rounded border border-gold/30">
                          Administrator
                        </span>
                      )}
                    </div>

                    {currentUser.role === 'admin' && (
                      <Link
                        href="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-gold hover:bg-ink-soft transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        Admin Dashboard
                      </Link>
                    )}

                    {userVote && (
                      <button
                        onClick={async () => {
                          setUserDropdownOpen(false);
                          if (window.confirm('Reset your vote and registered interest so you can test voting again?')) {
                            await resetVote();
                          }
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-xs text-gold/80 hover:text-gold hover:bg-ink-soft transition-colors text-left"
                      >
                        <RefreshCw className="w-4 h-4 text-gold" />
                        Reset My Vote (Testing)
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs text-ivory/70 hover:text-white hover:bg-ink-soft transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4 text-wine-light" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold tracking-jw uppercase bg-ink-deep hover:bg-gold hover:text-ink text-gold border border-gold/70 transition-all duration-300"
              >
                <User className="w-3.5 h-3.5" />
                Sign In
              </button>
            )}

            <a
              href="#designs"
              className="inline-flex items-center px-5 py-2 text-xs font-bold tracking-jw uppercase bg-gold text-ink hover:bg-gold-light border border-gold transition-all duration-300 shadow-gold-subtle"
            >
              Cast Vote
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-2 sm:space-x-3">
            {!currentUser && (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded text-[10px] sm:text-[11px] font-semibold tracking-wider uppercase border border-gold/60 text-gold whitespace-nowrap"
              >
                Sign In
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 sm:p-2 rounded text-ivory hover:text-gold focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-charcoal-border bg-ink-deep px-4 pt-3 pb-6 space-y-4">
          <div className="space-y-2">
            {navLinks.map(link => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-medium text-ivory hover:text-gold"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="pt-3 border-t border-charcoal-border space-y-3">
            {currentUser ? (
              <div className="space-y-2">
                <div className="px-3 py-1 text-xs text-ivory/60 truncate">
                  {currentUser.email}
                </div>
                {currentUser.role === 'admin' && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 text-sm font-medium text-gold"
                  >
                    Admin Dashboard
                  </Link>
                )}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full text-left px-3 py-2 text-sm font-medium text-wine-light"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setAuthModalOpen(true);
                }}
                className="w-full py-2.5 text-center text-xs font-semibold tracking-wider uppercase bg-wine text-white rounded"
              >
                Sign In to Vote
              </button>
            )}

            <a
              href={mainShopUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center text-xs text-ivory/60 hover:text-ivory py-2"
            >
              Visit Manila Wine Shop &rarr;
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
