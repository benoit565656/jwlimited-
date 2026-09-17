'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Campaign, Design, Vote, Pledge, SessionUser, InterestTier } from '@/types';
import { trackEvent } from '@/lib/analytics';
import confetti from 'canvas-confetti';

interface CampaignContextType {
  campaign: Campaign | null;
  designs: Design[];
  currentUser: SessionUser | null;
  userVote: Vote | null;
  userPledge: Pledge | null;
  canVote: boolean;
  votingPhaseActive: boolean;
  showCounts: boolean;
  totalVotesCount: number;
  isLoading: boolean;
  authModalOpen: boolean;
  pendingAction: { type: 'vote' | 'pledge'; designId?: string } | null;
  lightboxDesignId: string | null;
  voteConfirmDesign: Design | null;
  
  // Actions
  setAuthModalOpen: (open: boolean) => void;
  setLightboxDesignId: (designId: string | null) => void;
  setVoteConfirmDesign: (design: Design | null) => void;
  initiateVote: (designId: string) => void;
  confirmVote: (designId: string) => Promise<{ success: boolean; message?: string }>;
  submitPledge: (data: {
    bottle_count?: number;
    preferred_number?: number | null;
    interest_tier: InterestTier;
    acknowledged_nonbinding: true;
    marketing_consent?: boolean;
  }) => Promise<{ success: boolean; message?: string }>;
  withdrawPledge: () => Promise<{ success: boolean; message?: string }>;
  refreshData: () => Promise<void>;
  logout: () => Promise<void>;
  setCurrentUser: (user: SessionUser | null) => void;
}

const CampaignContext = createContext<CampaignContextType | null>(null);

export function CampaignProvider({ children }: { children: React.ReactNode }) {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [designs, setDesigns] = useState<Design[]>([]);
  const [currentUser, setCurrentUser] = useState<SessionUser | null>(null);
  const [userVote, setUserVote] = useState<Vote | null>(null);
  const [userPledge, setUserPledge] = useState<Pledge | null>(null);
  const [canVote, setCanVote] = useState<boolean>(false);
  const [votingPhaseActive, setVotingPhaseActive] = useState<boolean>(false);
  const [showCounts, setShowCounts] = useState<boolean>(false);
  const [totalVotesCount, setTotalVotesCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modals and dialog states
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [pendingAction, setPendingAction] = useState<{ type: 'vote' | 'pledge'; designId?: string } | null>(null);
  const [lightboxDesignId, setLightboxDesignId] = useState<string | null>(null);
  const [voteConfirmDesign, setVoteConfirmDesign] = useState<Design | null>(null);

  const refreshData = useCallback(async () => {
    try {
      // Fetch session
      const authRes = await fetch('/api/auth/session');
      const authData = await authRes.json();
      setCurrentUser(authData.user || null);

      // Fetch campaign & designs
      const res = await fetch('/api/campaign');
      if (!res.ok) throw new Error('Failed to load campaign');
      const data = await res.json();

      setCampaign(data.campaign);
      setDesigns(data.designs);
      setUserVote(data.userVote);
      setUserPledge(data.userPledge);
      setCanVote(data.canVote);
      setVotingPhaseActive(data.votingPhaseActive);
      setShowCounts(data.showCounts);
      setTotalVotesCount(data.totalVotesCount);
    } catch (err) {
      console.error('Error refreshing campaign data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
    trackEvent('campaign_view');
  }, [refreshData]);

  // Handle voting initiation (with sign-in check)
  const initiateVote = useCallback((designId: string) => {
    trackEvent('vote_started', { design_id: designId });

    if (!currentUser) {
      // Save intent to execute immediately post-auth
      setPendingAction({ type: 'vote', designId });
      setAuthModalOpen(true);
      return;
    }

    const design = designs.find(d => d.id === designId);
    if (!design) return;

    // Show confirmation dialog before casting or changing
    setVoteConfirmDesign(design);
  }, [currentUser, designs]);

  // Execute vote submission
  const confirmVote = useCallback(async (designId: string) => {
    try {
      const res = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaign_id: campaign?.id,
          design_id: designId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit vote');
      }

      setUserVote(data.vote);
      setVoteConfirmDesign(null);

      // Trigger celebratory gold/wine confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.7 },
        colors: ['#C7A35A', '#9E1B32', '#F7F3EB', '#222529'],
      });

      trackEvent(data.isChange ? 'vote_changed' : 'vote_completed', {
        design_id: designId,
      });

      await refreshData();
      return { success: true, message: data.message };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to vote';
      return { success: false, message: msg };
    }
  }, [campaign?.id, refreshData]);

  // Register or update pledge
  const submitPledge = useCallback(async (pledgeData: {
    bottle_count?: number;
    preferred_number?: number | null;
    interest_tier: InterestTier;
    acknowledged_nonbinding: true;
    marketing_consent?: boolean;
  }) => {
    if (!currentUser) {
      setPendingAction({ type: 'pledge' });
      setAuthModalOpen(true);
      return { success: false, message: 'Please sign in first' };
    }

    trackEvent('pledge_started');

    try {
      const res = await fetch('/api/pledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaign_id: campaign?.id,
          ...pledgeData,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to register interest');

      setUserPledge(data.pledge);
      trackEvent('pledge_completed', { interest_tier: pledgeData.interest_tier });

      return { success: true, message: data.message };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error registering interest';
      return { success: false, message: msg };
    }
  }, [currentUser, campaign?.id]);

  // Withdraw pledge
  const withdrawPledge = useCallback(async () => {
    if (!campaign?.id) return { success: false, message: 'Campaign not found' };

    try {
      const res = await fetch(`/api/pledge?campaign_id=${campaign.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to withdraw');

      setUserPledge(data.pledge);
      trackEvent('pledge_withdrawn');
      return { success: true, message: data.message };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error withdrawing';
      return { success: false, message: msg };
    }
  }, [campaign?.id]);

  const logout = useCallback(async () => {
    await fetch('/api/auth/session', { method: 'POST' });
    setCurrentUser(null);
    setUserVote(null);
    setUserPledge(null);
    await refreshData();
  }, [refreshData]);

  return (
    <CampaignContext.Provider
      value={{
        campaign,
        designs,
        currentUser,
        userVote,
        userPledge,
        canVote,
        votingPhaseActive,
        showCounts,
        totalVotesCount,
        isLoading,
        authModalOpen,
        pendingAction,
        lightboxDesignId,
        voteConfirmDesign,
        setAuthModalOpen,
        setLightboxDesignId,
        setVoteConfirmDesign,
        initiateVote,
        confirmVote,
        submitPledge,
        withdrawPledge,
        refreshData,
        logout,
        setCurrentUser,
      }}
    >
      {children}
    </CampaignContext.Provider>
  );
}

export function useCampaign() {
  const ctx = useContext(CampaignContext);
  if (!ctx) throw new Error('useCampaign must be used within a CampaignProvider');
  return ctx;
}
