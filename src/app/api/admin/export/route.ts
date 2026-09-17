import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function escapeCsvCell(val: unknown): string {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

function arrayToCsv(headers: string[], rows: (string | number | boolean | null | undefined)[][]): string {
  const headerLine = headers.map(escapeCsvCell).join(',');
  const lines = rows.map(r => r.map(escapeCsvCell).join(','));
  return [headerLine, ...lines].join('\r\n');
}

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'votes'; // 'votes' | 'pledges' | 'designs' | 'invitations'
    const campaignId = searchParams.get('campaign_id');
    const db = getDb();
    const campaign = campaignId ? db.getCampaignById(campaignId) : db.getCampaignBySlug();

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    let csvContent = '';
    let filename = `manila-wine-${type}-${new Date().toISOString().split('T')[0]}.csv`;

    if (type === 'votes') {
      const votes = db.getVotesExport(campaign.id);
      const headers = [
        'Vote ID',
        'Voter Email',
        'Selected Concept Code',
        'Selected Concept Title',
        'Has Registered Pledge',
        'Preferred Number',
        'Pledge Tier',
        'UTM Source',
        'UTM Medium',
        'UTM Campaign',
        'Voted At (UTC)',
        'Last Updated At (UTC)',
      ];
      const rows = votes.map(v => [
        v.vote_id,
        v.user_email,
        v.design_code,
        v.design_title,
        v.has_pledge ? 'Yes' : 'No',
        v.pledged_number,
        v.pledge_tier,
        v.utm_source,
        v.utm_medium,
        v.utm_campaign,
        v.voted_at,
        v.last_updated_at,
      ]);
      csvContent = arrayToCsv(headers, rows);
    } else if (type === 'pledges') {
      const pledges = db.getPledgesExport(campaign.id);
      const headers = [
        'Pledge ID',
        'Collector Email',
        'Status',
        'Preferred Number (1-100)',
        'Interest Tier',
        'Associated Design Code',
        'Associated Design Title',
        'Campaign Updates Consent',
        'Marketing Consent',
        'Pledged At (UTC)',
        'Withdrawn At (UTC)',
      ];
      const rows = pledges.map(p => [
        p.pledge_id,
        p.user_email,
        p.status,
        p.preferred_number,
        p.interest_tier,
        p.associated_design_code,
        p.associated_design_title,
        p.campaign_updates_consent ? 'Yes' : 'No',
        p.marketing_news_consent ? 'Yes' : 'No',
        p.pledged_at,
        p.withdrawn_at,
      ]);
      csvContent = arrayToCsv(headers, rows);
    } else if (type === 'designs') {
      const designs = db.getDesigns(campaign.id, true);
      const counts = db.getVoteCounts(campaign.id);
      let total = 0;
      Object.values(counts).forEach(c => total += c);

      const headers = [
        'Design Code',
        'Title',
        'Subtitle',
        'Total Votes',
        'Vote Share %',
        'Sort Order',
        'Status',
        'Is Winner',
      ];
      const rows = designs.map(d => {
        const vCount = counts[d.id] || 0;
        const share = total > 0 ? ((vCount / total) * 100).toFixed(1) + '%' : '0.0%';
        return [
          d.code,
          d.title,
          d.subtitle || '',
          vCount,
          share,
          d.sort_order,
          d.is_published ? 'Published' : 'Unpublished',
          campaign.winning_design_id === d.id ? 'YES' : 'NO',
        ];
      });
      csvContent = arrayToCsv(headers, rows);
    } else if (type === 'invitations') {
      const invitations = db.getInvitations(campaign.id);
      const headers = [
        'Email',
        'Reference Code',
        'Status',
        'Sent At',
        'Visited At',
        'Voted At',
        'Pledged At',
      ];
      const rows = invitations.map(i => [
        i.email_normalized,
        i.reference_code,
        i.status,
        i.sent_at || '',
        i.first_visited_at || '',
        i.voted_at || '',
        i.pledged_at || '',
      ]);
      csvContent = arrayToCsv(headers, rows);
    }

    db.logAudit({
      actor_email: user.email,
      action: 'EXPORT_CSV',
      entity_type: type,
      entity_id: campaign.id,
      reason: `Admin downloaded CSV export for ${type}`,
    });

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Export failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
