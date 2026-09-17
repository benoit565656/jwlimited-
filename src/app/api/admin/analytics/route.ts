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

    const analytics = db.getCampaignAnalytics(campaign.id);
    const auditLogs = db.getAuditLogs(50);

    return NextResponse.json({
      analytics,
      auditLogs,
      campaign,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
