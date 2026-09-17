'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useCampaign } from '@/context/CampaignContext';
import { Check, X, ArrowRight, AlertTriangle } from 'lucide-react';

export function VoteConfirmDialog() {
  const {
    voteConfirmDesign,
    setVoteConfirmDesign,
    confirmVote,
    userVote,
    designs,
  } = useCampaign();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!voteConfirmDesign) return null;

  const handleClose = () => {
    setVoteConfirmDesign(null);
    setErrorMsg(null);
  };

  const isChange = Boolean(userVote && userVote.design_id !== voteConfirmDesign.id);
  const previousDesign = isChange 
    ? designs.find(d => d.id === userVote?.design_id) 
    : null;

  const handleConfirm = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);

    const res = await confirmVote(voteConfirmDesign.id);
    if (!res.success) {
      setErrorMsg(res.message || 'Failed to submit vote');
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="vote-confirm-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div className="relative w-full max-w-lg bg-charcoal border border-gold/40 rounded-xl shadow-luxury p-7 text-ivory">
        
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-ivory/60 hover:text-white rounded-full hover:bg-ink-soft transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <span className="text-xs uppercase tracking-widest text-gold font-semibold block mb-2">
          {isChange ? 'Change of Vote' : 'Confirm Selection'}
        </span>

        <h2 id="vote-confirm-title" className="font-serif text-2xl text-ivory mb-2">
          {isChange
            ? `Move your vote to ${voteConfirmDesign.code}?`
            : `Cast your vote for ${voteConfirmDesign.code}?`}
        </h2>

        {isChange && previousDesign && (
          <div className="my-4 p-3.5 rounded bg-wine/10 border border-wine/30 text-xs flex items-center gap-3">
            <AlertTriangle className="w-4 h-4 text-wine-light flex-shrink-0" />
            <span>
              This will safely transfer your active vote from <strong>{previousDesign.code}</strong> to <strong>{voteConfirmDesign.code}</strong>. You maintain exactly one vote.
            </span>
          </div>
        )}

        {/* Selected Artwork Preview */}
        <div className="my-5 flex items-center gap-4 p-4 rounded bg-ink/80 border border-charcoal-border">
          <div className="relative w-28 h-20 flex-shrink-0 bg-[#1E2024] rounded overflow-hidden">
            <Image
              src={voteConfirmDesign.thumbnail_path || voteConfirmDesign.full_image_path}
              alt={voteConfirmDesign.alt_text}
              fill
              className="object-contain p-1"
            />
          </div>
          <div>
            <span className="text-xs font-semibold text-gold block">
              {voteConfirmDesign.code}
            </span>
            <h4 className="font-serif text-base text-ivory">
              {voteConfirmDesign.title}
            </h4>
            <p className="text-xs text-ivory/60 line-clamp-1 mt-0.5">
              {voteConfirmDesign.subtitle || voteConfirmDesign.description}
            </p>
          </div>
        </div>

        {errorMsg && (
          <p className="text-xs text-wine-light mb-4">
            {errorMsg}
          </p>
        )}

        <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end mt-6">
          <button
            onClick={handleClose}
            className="px-5 py-2.5 rounded text-xs font-semibold tracking-wider uppercase text-ivory/70 hover:text-white border border-charcoal-border hover:bg-ink-soft transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded bg-wine hover:bg-wine-light text-white text-xs font-semibold tracking-wider uppercase shadow-wine-glow transition-colors flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            {isSubmitting ? 'Recording...' : isChange ? 'Confirm Vote Change' : 'Confirm My Vote'}
          </button>
        </div>

      </div>
    </div>
  );
}
