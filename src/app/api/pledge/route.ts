import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { emailService } from '@/lib/email';

export const dynamic = 'force-dynamic';

const PledgeSchema = z.object({
  campaign_id: z.string().uuid(),
  bottle_count: z.number().int().min(1).max(100).default(1),
  preferred_number: z.number().int().min(1).max(100).nullable().optional(),
  interest_tier: z.enum(['any_available', 'specific_standard', 'premium_collector']),
  acknowledged_nonbinding: z.literal(true, {
    errorMap: () => ({ message: 'You must acknowledge that this interest is non-binding' }),
  }),
  marketing_consent: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required to register interest' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = PledgeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.format() }, { status: 400 });
    }

    const { campaign_id, bottle_count, preferred_number, interest_tier, marketing_consent } = parsed.data;
    const db = getDb();

    const campaign = db.getCampaignById(campaign_id);
    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    const pledge = db.createOrUpdatePledge(campaign_id, user.id, {
      bottle_count: bottle_count ?? 1,
      preferred_number: preferred_number ?? null,
      interest_tier,
      marketing_consent: Boolean(marketing_consent),
    });

    // Send pledge confirmation email in background
    emailService.sendPledgeConfirmation(user.email, pledge.preferred_number, pledge.interest_tier, pledge.bottle_count).catch(err => {
      console.error('Pledge confirmation email error:', err);
    });

    return NextResponse.json({
      success: true,
      pledge,
      message: "You're on the priority list. We'll tell you which design wins and contact you first if advance purchasing opens. Your preferred number is not reserved yet.",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to register interest';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

// DELETE /api/pledge: Withdraw pledge without affecting active vote
export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const campaignId = searchParams.get('campaign_id');
    if (!campaignId) {
      return NextResponse.json({ error: 'campaign_id is required' }, { status: 400 });
    }

    const db = getDb();
    const pledge = db.withdrawPledge(campaignId, user.id);

    // Notify via email
    emailService.sendPledgeWithdrawn(user.email).catch(err => {
      console.error('Pledge withdrawal email error:', err);
    });

    return NextResponse.json({
      success: true,
      pledge,
      message: 'Your interest has been withdrawn. Your design vote remains active.',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to withdraw interest';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
