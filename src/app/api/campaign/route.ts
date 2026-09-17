import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { CampaignDataResponse } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug') || 'philippines-collectors-edition';

    const db = getDb();
    const campaign = db.getCampaignBySlug(slug);
    const user = await getCurrentUser();

    // Check if voting phase is currently open
    const isVotingOpen = campaign.status === 'voting_open';
    const isPastDeadline = campaign.vote_closes_at ? new Date() > new Date(campaign.vote_closes_at) : false;
    const votingPhaseActive = isVotingOpen && !isPastDeadline;

    // Get user's active vote and pledge if signed in
    const userVote = user ? db.getUserVote(campaign.id, user.id) : null;
    const userPledge = user ? db.getUserPledge(campaign.id, user.id) : null;

    // Check access permission for invite-only campaigns
    let canVote = votingPhaseActive;
    if (user && campaign.access_mode === 'invite_only') {
      canVote = canVote && db.isEmailAllowed(campaign.id, user.email);
    }

    // Determine vote counts visibility based on campaign settings and user session
    let showCounts = false;
    if (campaign.show_vote_counts_mode === 'public') {
      showCounts = true;
    } else if (campaign.show_vote_counts_mode === 'signed_in_only') {
      showCounts = Boolean(user);
    } else if (campaign.show_vote_counts_mode === 'hidden') {
      // Hidden from all regular users, visible to admin
      showCounts = user?.role === 'admin';
    }

    // If campaign has closed and winner announced, counts are revealed
    if (campaign.status === 'winner_announced' || campaign.status === 'voting_closed') {
      showCounts = true;
    }

    const rawDesigns = db.getDesigns(campaign.id, false);
    const voteCounts = db.getVoteCounts(campaign.id);

    let totalVotesCount = 0;
    Object.values(voteCounts).forEach(cnt => {
      totalVotesCount += cnt;
    });

    const designs = rawDesigns.map(d => ({
      ...d,
      vote_count: showCounts ? (voteCounts[d.id] || 0) : undefined,
    }));

    const response: CampaignDataResponse = {
      campaign,
      designs,
      userVote,
      userPledge,
      canVote,
      votingPhaseActive,
      showCounts,
      totalVotesCount: showCounts ? totalVotesCount : 0,
    };

    return NextResponse.json(response);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch campaign';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
