import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { emailService } from '@/lib/email';

export const dynamic = 'force-dynamic';

const VoteSchema = z.object({
  campaign_id: z.string().uuid(),
  design_id: z.string().uuid(),
  source: z.string().optional(),
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
  utm_content: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required to vote' }, { status: 401 });
    }

    if (!user.age_confirmed) {
      return NextResponse.json({ error: 'Legal drinking age confirmation required' }, { status: 403 });
    }

    const body = await req.json();
    const parsed = VoteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid vote parameters', details: parsed.error.format() }, { status: 400 });
    }

    const { campaign_id, design_id, ...metadata } = parsed.data;
    const db = getDb();

    // Invite-only check
    const campaign = db.getCampaignById(campaign_id);
    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    if (campaign.access_mode === 'invite_only' && !db.isEmailAllowed(campaign_id, user.email)) {
      return NextResponse.json({ error: 'Your email is not on the private invitation list for this campaign' }, { status: 403 });
    }

    // Cast or change vote atomically
    const { vote, isChange } = db.castOrChangeVote(
      campaign_id,
      user.id,
      design_id,
      metadata
    );

    // If first vote, trigger confirmation email
    if (!isChange) {
      const design = db.getAllDesigns(campaign_id).find(d => d.id === design_id);
      if (design) {
        // Send email in background
        emailService.sendVoteConfirmation(user.email, design.title, design.code).catch(err => {
          console.error('Vote email dispatch failed:', err);
        });
      }
    }

    // Return updated vote and current counts
    const counts = db.getVoteCounts(campaign_id);

    return NextResponse.json({
      success: true,
      vote,
      isChange,
      message: isChange 
        ? 'Your vote was successfully moved to the new design.' 
        : 'Vote recorded. Thank you for helping choose the Philippines edition.',
      counts,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to record vote';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const campaignId = req.nextUrl.searchParams.get('campaign_id') || 'e29d749a-14d2-4ce0-8d59-20f5efc34001';
    const targetEmail = req.nextUrl.searchParams.get('email');

    const db = getDb();
    if (targetEmail && user.role === 'admin') {
      db.resetUserVoteByEmail(campaignId, targetEmail);
    } else {
      db.resetUserVote(campaignId, user.id);
    }

    return NextResponse.json({
      success: true,
      message: 'Vote and pledge reset successfully. You can now cast a new vote.',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to reset vote';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
