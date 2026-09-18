import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { getCurrentUser } from '@/lib/auth';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const designId = formData.get('design_id') as string | null;
    const customSlug = formData.get('slug') as string | null;
    const code = formData.get('code') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
    }

    const mime = file.type;
    if (!mime.startsWith('image/')) {
      return NextResponse.json({ error: 'Uploaded file is not an image' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const timestamp = Date.now();
    let baseSlug = 'concept-custom';
    if (customSlug) {
      baseSlug = customSlug.toLowerCase().replace(/[^a-z0-9_-]/g, '-');
    } else if (code) {
      baseSlug = code.toLowerCase().replace(/[^a-z0-9_-]/g, '-');
    }
    const fileSlug = `${baseSlug}-${timestamp}`;

    const originalDir = path.join(process.cwd(), 'public', 'concepts', 'original');
    const fullDir = path.join(process.cwd(), 'public', 'concepts', 'full');
    const thumbsDir = path.join(process.cwd(), 'public', 'concepts', 'thumbs');

    [originalDir, fullDir, thumbsDir].forEach((dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });

    const originalExt = path.extname(file.name).toLowerCase() || '.png';
    const originalFilename = `${fileSlug}${originalExt}`;
    const webpFilename = `${fileSlug}.webp`;

    const originalFilePath = path.join(originalDir, originalFilename);
    const fullFilePath = path.join(fullDir, webpFilename);
    const thumbFilePath = path.join(thumbsDir, webpFilename);

    fs.writeFileSync(originalFilePath, buffer);

    await sharp(buffer)
      .webp({ quality: 90, effort: 4 })
      .toFile(fullFilePath);

    await sharp(buffer)
      .resize({ width: 600, fit: 'contain' })
      .webp({ quality: 85, effort: 4 })
      .toFile(thumbFilePath);

    const original_image_path = `/concepts/original/${originalFilename}`;
    const full_image_path = `/concepts/full/${webpFilename}`;
    const thumbnail_path = `/concepts/thumbs/${webpFilename}`;

    let updatedDesign = null;
    if (designId) {
      const db = getDb();
      try {
        updatedDesign = db.updateDesign(
          designId,
          {
            original_image_path,
            full_image_path,
            thumbnail_path,
          },
          user.email
        );
      } catch (e) {
        console.warn('Could not auto-update design with ID:', designId, e);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Image uploaded and processed successfully',
      original_image_path,
      full_image_path,
      thumbnail_path,
      design: updatedDesign,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Image upload failed';
    console.error('Image upload error:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
