import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const UpdateDesignSchema = z.object({
  id: z.string().min(1),
  code: z.string().optional(),
  title: z.string().min(1).optional(),
  subtitle: z.string().nullable().optional(),
  description: z.string().optional(),
  alt_text: z.string().optional(),
  original_image_path: z.string().optional(),
  full_image_path: z.string().optional(),
  thumbnail_path: z.string().optional(),
  is_published: z.boolean().optional(),
});

const CreateDesignSchema = z.object({
  campaign_id: z.string().min(1),
  code: z.string().optional(),
  title: z.string().min(1, 'Title is required'),
  subtitle: z.string().nullable().optional(),
  description: z.string().optional(),
  alt_text: z.string().optional(),
  original_image_path: z.string().optional(),
  full_image_path: z.string().optional(),
  thumbnail_path: z.string().optional(),
  is_published: z.boolean().optional(),
});

const ReorderSchema = z.object({
  campaign_id: z.string().min(1),
  ordered_ids: z.array(z.string().min(1)),
});

const SetWinnerSchema = z.object({
  campaign_id: z.string().min(1),
  winning_design_id: z.string().min(1).nullable(),
});

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const campaignId = searchParams.get('campaign_id');
    if (!campaignId) {
      return NextResponse.json({ error: 'campaign_id is required' }, { status: 400 });
    }

    const db = getDb();
    const designs = db.getAllDesigns(campaignId);
    const campaign = db.getCampaignById(campaignId);

    return NextResponse.json({ designs, winning_design_id: campaign?.winning_design_id || null });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const parsed = UpdateDesignSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.format() }, { status: 400 });
    }

    const { id, ...updates } = parsed.data;
    const db = getDb();
    const updated = db.updateDesign(id, updates, user.email);

    return NextResponse.json({ success: true, design: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST: Create, Reorder or set winner
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');
    const body = await req.json();
    const db = getDb();

    if (action === 'create' || (!action && body.title && body.campaign_id)) {
      const parsed = CreateDesignSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: 'Invalid concept data', details: parsed.error.format() }, { status: 400 });
      }
      const created = db.createDesign(parsed.data.campaign_id, parsed.data, user.email);
      return NextResponse.json({ success: true, design: created });
    }

    if (action === 'reorder') {
      const parsed = ReorderSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: 'Invalid reorder data' }, { status: 400 });
      }
      db.reorderDesigns(parsed.data.campaign_id, parsed.data.ordered_ids, user.email);
      return NextResponse.json({ success: true, message: 'Designs reordered' });
    }

    if (action === 'set_winner') {
      const parsed = SetWinnerSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: 'Invalid winner data' }, { status: 400 });
      }
      db.updateCampaign(parsed.data.campaign_id, {
        winning_design_id: parsed.data.winning_design_id,
        status: parsed.data.winning_design_id ? 'winner_announced' : undefined,
      }, user.email);

      return NextResponse.json({ success: true, winning_design_id: parsed.data.winning_design_id });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE: Safe archive design
export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const designId = searchParams.get('design_id');
    if (!designId) {
      return NextResponse.json({ error: 'design_id is required' }, { status: 400 });
    }

    const db = getDb();
    const archived = db.archiveDesign(designId, user.email);
    return NextResponse.json({ success: true, design: archived });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Archive failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
