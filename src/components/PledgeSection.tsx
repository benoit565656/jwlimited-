'use client';

import React, { useState, useEffect } from 'react';
import { useCampaign } from '@/context/CampaignContext';
import { InterestTier } from '@/types';
import { ShieldCheck, Check, AlertCircle, Trash2, ArrowRight, BookmarkCheck } from 'lucide-react';
import { formatPhp } from '@/lib/utils';

export function PledgeSection() {
  const {
    campaign,
    currentUser,
    userVote,
    userPledge,
    designs,
    submitPledge,
    withdrawPledge,
    setAuthModalOpen,
  } = useCampaign();

  const [interestedBuying, setInterestedBuying] = useState(true);
  const [bottleCount, setBottleCount] = useState<number>(1);
  const [preferredNumber, setPreferredNumber] = useState<string>('');
  const [interestTier, setInterestTier] = useState<InterestTier>('any_available');
  const [nonbindingAck, setNonbindingAck] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Sync existing pledge values into form if user has an active pledge
  useEffect(() => {
    if (userPledge && userPledge.status === 'active') {
      setBottleCount(userPledge.bottle_count || 1);
      setPreferredNumber(userPledge.preferred_number ? String(userPledge.preferred_number) : '');
      setInterestTier(userPledge.interest_tier);
      setNonbindingAck(true);
      setMarketingConsent(Boolean(userPledge.marketing_consent_at));
    }
  }, [userPledge]);

  const minPrice = campaign?.min_price_php;
  const maxPrice = campaign?.max_price_php;
  const priceMode = campaign?.price_display_mode || 'starting_from';

  let pricingCopy = 'Expected bottle pricing and collector tier guidelines will be confirmed before production opens.';
  if (minPrice && priceMode === 'starting_from') {
    pricingCopy = `From ${formatPhp(minPrice)}; premium numbers priced separately.`;
  } else if (minPrice && maxPrice && priceMode === 'range') {
    pricingCopy = `Expected price: ${formatPhp(minPrice)}–${formatPhp(maxPrice)}, depending on bottle number.`;
  } else if (minPrice) {
    pricingCopy = `Expected to start from ${formatPhp(minPrice)}.`;
  }

  const userVotedDesign = userVote ? designs.find(d => d.id === userVote.design_id) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setAuthModalOpen(true);
      return;
    }

    if (!interestedBuying) {
      setFeedbackMsg({ type: 'error', text: 'Please check the box confirming your interest in acquiring bottles.' });
      return;
    }

    if (!nonbindingAck) {
      setFeedbackMsg({ type: 'error', text: 'You must acknowledge that this is a non-binding expression of interest.' });
      return;
    }

    let prefNum: number | null = null;
    if (preferredNumber.trim()) {
      const num = parseInt(preferredNumber.trim(), 10);
      if (isNaN(num) || num < 1 || num > 100) {
        setFeedbackMsg({ type: 'error', text: 'Preferred bottle number must be an integer between 1 and 100.' });
        return;
      }
      prefNum = num;
    }

    setIsSubmitting(true);
    setFeedbackMsg(null);

    const res = await submitPledge({
      bottle_count: bottleCount,
      preferred_number: prefNum,
      interest_tier: interestTier,
      acknowledged_nonbinding: true,
      marketing_consent: marketingConsent,
    });

    if (res.success) {
      setFeedbackMsg({ type: 'success', text: res.message || 'Successfully registered on the priority list.' });
    } else {
      setFeedbackMsg({ type: 'error', text: res.message || 'Failed to register interest.' });
    }
    setIsSubmitting(false);
  };

  const handleWithdraw = async () => {
    if (!window.confirm('Are you sure you want to withdraw your priority interest? Your design vote will remain active.')) {
      return;
    }

    setIsWithdrawing(true);
    setFeedbackMsg(null);

    const res = await withdrawPledge();
    if (res.success) {
      setFeedbackMsg({ type: 'success', text: res.message || 'Interest withdrawn.' });
      setPreferredNumber('');
      setNonbindingAck(false);
    } else {
      setFeedbackMsg({ type: 'error', text: res.message || 'Failed to withdraw interest.' });
    }
    setIsWithdrawing(false);
  };

  const hasActivePledge = userPledge && userPledge.status === 'active';

  return (
    <section id="edition" className="py-20 md:py-28 bg-ink border-b border-charcoal-border scroll-mt-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="bg-charcoal/80 border border-gold/40 rounded-2xl p-5 sm:p-8 md:p-12 shadow-luxury relative overflow-hidden">
          {/* Subtle gold luxury decorative accent */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-gold/5 rounded-full blur-3xl pointer-events-none" />

          {/* Section Header */}
          <div className="max-w-2xl mb-8 space-y-3">
            <span className="text-xs uppercase tracking-widest text-gold font-semibold flex items-center gap-2">
              <BookmarkCheck className="w-4 h-4 text-gold" />
              Optional Collector Registry
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-ivory font-normal tracking-tight">
              Want first access to the winning edition?
            </h2>
            <p className="text-sm text-ivory/75 leading-relaxed font-light">
              Only 100 individually numbered bottles are planned. {pricingCopy} Premium collector numbers—such as No. 1, No. 8, No. 88, and No. 100—may command higher prices. 
              Registering your interest is free and non-binding. If production proceeds, you will receive the result and advance-purchase details before the public release.
            </p>
          </div>

          {/* Active status banner */}
          {hasActivePledge && (
            <div className="mb-8 p-4 rounded-lg bg-gold/10 border border-gold/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-gold flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-semibold text-gold">You are on the Priority Collector List</h4>
                  <p className="text-xs text-ivory/70">
                    Quantity: <strong className="text-gold">{userPledge.bottle_count || 1} {(userPledge.bottle_count || 1) === 1 ? 'bottle' : 'bottles'}</strong> • 
                    Preference: {userPledge.preferred_number ? `Bottle #${userPledge.preferred_number}` : 'Any Available'} • 
                    Linked to your vote: <strong>{userVotedDesign?.code || 'None selected yet'}</strong>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleWithdraw}
                disabled={isWithdrawing}
                className="px-3 py-1.5 rounded text-xs text-wine-light hover:text-white hover:bg-wine/20 border border-wine/30 transition-colors flex items-center gap-1.5 flex-shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Withdraw Interest
              </button>
            </div>
          )}

          {feedbackMsg && (
            <div className={`mb-6 p-4 rounded text-xs flex items-center gap-2.5 ${
              feedbackMsg.type === 'success' 
                ? 'bg-gold/15 text-gold border border-gold/40' 
                : 'bg-wine/20 text-wine-light border border-wine/40'
            }`}>
              {feedbackMsg.type === 'success' ? <Check className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
              <span>{feedbackMsg.text}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Collector Email (Read-only prefilled or prompt to sign in) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs uppercase tracking-wider text-ivory/60 mb-1.5">
                  Collector Email
                </label>
                {currentUser ? (
                  <input
                    type="email"
                    value={currentUser.email}
                    readOnly
                    className="w-full px-4 py-2.5 bg-ink/60 border border-charcoal-border rounded text-xs text-ivory/80 cursor-not-allowed"
                  />
                ) : (
                  <div className="flex items-center justify-between px-4 py-2 bg-ink/60 border border-charcoal-border rounded">
                    <span className="text-xs text-ivory/40">Sign in required</span>
                    <button
                      type="button"
                      onClick={() => setAuthModalOpen(true)}
                      className="text-xs text-gold underline hover:text-gold-light"
                    >
                      Sign In
                    </button>
                  </div>
                )}
                <span className="text-[11px] text-ivory/40 mt-1 block">
                  Priority notifications are delivered to your verified account email.
                </span>
              </div>

              {/* Linked Vote Design */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-ivory/60 mb-1.5">
                  Associated Vote Design
                </label>
                <div className="px-4 py-2.5 bg-ink/60 border border-charcoal-border rounded text-xs text-ivory">
                  {userVotedDesign ? (
                    <span className="text-gold font-medium">
                      {userVotedDesign.title} ({userVotedDesign.code})
                    </span>
                  ) : (
                    <span className="text-ivory/50">
                      No vote recorded yet. (Your vote will link automatically upon voting)
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Bottle Quantity Selection */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs uppercase tracking-wider text-ivory/60">
                  Desired Bottle Quantity
                </label>
                <span className="text-xs font-semibold text-gold">
                  {bottleCount} {bottleCount === 1 ? 'Bottle' : 'Bottles'} requested
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                {[1, 2, 3, 5, 6, 10].map(num => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setBottleCount(num)}
                    className={`px-3.5 py-2 rounded text-xs font-semibold tracking-wider transition-all duration-150 border ${
                      bottleCount === num
                        ? 'bg-wine text-white border-wine-light shadow-wine-glow'
                        : 'bg-ink/50 text-ivory/80 border-charcoal-border hover:border-gold/50 hover:text-white'
                    }`}
                  >
                    {num} {num === 1 ? 'Bottle' : 'Bottles'}
                  </button>
                ))}

                {/* Custom Quantity Stepper */}
                <div className="flex items-center rounded border border-charcoal-border bg-ink/60 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setBottleCount(prev => Math.max(1, prev - 1))}
                    className="px-3 py-1.5 text-ivory/70 hover:text-gold hover:bg-ink transition-colors font-bold text-sm"
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={bottleCount}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val)) {
                        setBottleCount(Math.max(1, Math.min(100, val)));
                      }
                    }}
                    className="w-12 text-center py-1 bg-transparent text-xs font-semibold text-gold focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    aria-label="Custom bottle quantity"
                  />
                  <button
                    type="button"
                    onClick={() => setBottleCount(prev => Math.min(100, prev + 1))}
                    className="px-3 py-1.5 text-ivory/70 hover:text-gold hover:bg-ink transition-colors font-bold text-sm"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>
              <span className="text-[11px] text-ivory/45 mt-1.5 block">
                Whether requesting 1 bottle for your private cellar or multiple bottles (e.g. 5 bottles for gifting or collector suites), indicate your desired allocation.
              </span>
            </div>

            {/* Interest Tier Selection */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-ivory/60 mb-2">
                Number Allocation Preference
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    tier: 'any_available',
                    label: 'Any Available Number',
                    desc: 'Standard pricing tier; first priority allocation.',
                  },
                  {
                    tier: 'specific_standard',
                    label: 'Specific Standard Number',
                    desc: 'Request a specific milestone number (1–100).',
                  },
                  {
                    tier: 'premium_collector',
                    label: 'Premium Collector Number',
                    desc: 'High-collectible tier (e.g. #1, #8, #88, #100).',
                  },
                ].map(item => (
                  <label
                    key={item.tier}
                    className={`p-4 rounded border cursor-pointer transition-colors block ${
                      interestTier === item.tier
                        ? 'border-gold bg-gold/5 text-ivory'
                        : 'border-charcoal-border bg-ink/40 text-ivory/70 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <input
                        type="radio"
                        name="interest_tier"
                        value={item.tier}
                        checked={interestTier === item.tier}
                        onChange={() => setInterestTier(item.tier as InterestTier)}
                        className="text-wine focus:ring-gold"
                      />
                      <span className="text-xs font-semibold text-ivory">{item.label}</span>
                    </div>
                    <span className="text-[11px] text-ivory/50 block pl-5">
                      {item.desc}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Preferred Number input */}
            {(interestTier === 'specific_standard' || interestTier === 'premium_collector') && (
              <div className="max-w-xs">
                <label htmlFor="preferred-number-input" className="block text-xs uppercase tracking-wider text-ivory/60 mb-1.5">
                  Preferred Bottle Number (1–100)
                </label>
                <input
                  id="preferred-number-input"
                  type="number"
                  min={1}
                  max={100}
                  value={preferredNumber}
                  onChange={(e) => setPreferredNumber(e.target.value)}
                  placeholder="e.g. 88"
                  className="w-full px-4 py-2.5 bg-ink rounded border border-charcoal-border focus:border-gold text-xs text-ivory"
                />
                <span className="text-[11px] text-ivory/40 mt-1 block">
                  Numbers are not reserved now. Final allocation occurs during advance purchase.
                </span>
              </div>
            )}

            {/* Required and Optional Consents */}
            <div className="space-y-3 pt-4 border-t border-charcoal-border/70">
              <label className="flex items-start gap-3 cursor-pointer text-xs text-ivory/80">
                <input
                  type="checkbox"
                  checked={interestedBuying}
                  onChange={(e) => setInterestedBuying(e.target.checked)}
                  required
                  className="mt-0.5 rounded border-charcoal-border text-wine focus:ring-gold"
                />
                <span>
                  <strong>I am interested in acquiring {bottleCount} {bottleCount === 1 ? 'bottle' : 'bottles'}</strong> if production proceeds. (Required)
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer text-xs text-ivory/80">
                <input
                  type="checkbox"
                  checked={nonbindingAck}
                  onChange={(e) => setNonbindingAck(e.target.checked)}
                  required
                  className="mt-0.5 rounded border-charcoal-border text-wine focus:ring-gold"
                />
                <span>
                  <strong>I understand this is a non-binding expression of interest</strong>, not a reservation, order, or purchase guarantee. (Required)
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer text-xs text-ivory/60">
                <input
                  type="checkbox"
                  checked={marketingConsent}
                  onChange={(e) => setMarketingConsent(e.target.checked)}
                  className="mt-0.5 rounded border-charcoal-border text-wine focus:ring-gold"
                />
                <span>
                  I would also like to receive Manila Wine news, special wine offerings, and private releases. (Optional)
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3.5 rounded bg-wine hover:bg-wine-light text-white font-semibold text-xs tracking-wider uppercase shadow-wine-glow transition-all duration-200 inline-flex items-center gap-2"
              >
                {isSubmitting ? 'Registering...' : hasActivePledge ? 'Update My Interest' : 'Register My Interest'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </form>

        </div>

      </div>
    </section>
  );
}
