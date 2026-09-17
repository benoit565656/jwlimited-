import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const campaignId = searchParams.get('campaign_id');
    const db = getDb();
    const campaign = campaignId ? db.getCampaignById(campaignId) : db.getCampaignBySlug();

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    const invitations = db.getInvitations(campaign.id);
    return NextResponse.json({ invitations });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const { campaign_id, emails } = body;

    if (!campaign_id || !Array.isArray(emails)) {
      return NextResponse.json({ error: 'campaign_id and emails array required' }, { status: 400 });
    }

    const db = getDb();
    const result = db.importInvitations(campaign_id, emails);

    db.logAudit({
      actor_email: user.email,
      action: 'IMPORT_INVITATIONS',
      entity_type: 'invitations',
      entity_id: campaign_id,
      after_state: result,
      reason: `Admin imported ${result.imported} new invitations (${result.duplicates} duplicates, ${result.invalid} invalid)`,
    });

    return NextResponse.json({ success: true, result });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Import failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
