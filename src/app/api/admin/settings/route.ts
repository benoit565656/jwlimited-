import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const CampaignSettingsSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  headline: z.string().min(1),
  intro_copy: z.string().min(1),
  story_copy: z.string().min(1),
  status: z.enum([
    'draft',
    'coming_soon',
    'voting_open',
    'voting_closed',
    'winner_announced',
    'priority_sale',
    'archived',
  ]),
  access_mode: z.enum(['public_authenticated', 'invite_only']),
  show_vote_counts_mode: z.enum(['hidden', 'signed_in_only', 'public']),
  price_display_mode: z.enum(['starting_from', 'range', 'hidden']),
  min_price_php: z.number().nullable().optional(),
  max_price_php: z.number().nullable().optional(),
  vote_opens_at: z.string().nullable().optional(),
  vote_closes_at: z.string().nullable().optional(),
  timezone: z.string().default('Asia/Manila'),
  main_shop_url: z.string().url().optional(),
  priority_sale_url: z.string().nullable().optional(),
  hero_wallpaper_url: z.string().nullable().optional(),
  hero_wallpaper_opacity: z.number().min(0).max(100).nullable().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug') || 'philippines-collectors-edition';
    const db = getDb();
    const campaign = db.getCampaignBySlug(slug);

    return NextResponse.json({ campaign });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const parsed = CampaignSettingsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.format() }, { status: 400 });
    }

    const { id, ...updates } = parsed.data;
    const db = getDb();
    const updated = db.updateCampaign(id, updates, user.email);

    return NextResponse.json({ success: true, campaign: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
