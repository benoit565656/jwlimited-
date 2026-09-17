import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { 
  checkBrevoStatus, 
  generateLuxuryEmailHtml, 
  injectTemplateToBrevo, 
  sendTestEmail, 
  launchCampaignBlast,
  parseAndDeduplicateEmails,
  getBrevoConfig
} from '@/lib/brevo';

export const dynamic = 'force-dynamic';

/**
 * GET:
 * - If ?format=html: returns rendered HTML document for live iframe preview
 * - Default: returns Brevo connection status, sender details, and default template metadata
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const format = searchParams.get('format');
    const subject = searchParams.get('subject') || undefined;
    const headline = searchParams.get('headline') || undefined;
    const previewText = searchParams.get('previewText') || undefined;
    const ctaText = searchParams.get('ctaText') || undefined;
    const apiKeyOverride = searchParams.get('apiKey') || undefined;

    // Generate responsive HTML
    const html = generateLuxuryEmailHtml({
      subject,
      headline,
      previewText,
      ctaText,
    });

    if (format === 'html') {
      return new NextResponse(html, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'X-Frame-Options': 'SAMEORIGIN',
        },
      });
    }

    // Otherwise return connection status & config
    const status = await checkBrevoStatus(apiKeyOverride);
    const config = getBrevoConfig(apiKeyOverride);

    return NextResponse.json({
      status,
      config: {
        senderEmail: config.senderEmail,
        senderName: config.senderName,
        hasApiKey: Boolean(config.apiKey),
        maskedKey: config.apiKey ? `${config.apiKey.slice(0, 12)}...${config.apiKey.slice(-6)}` : null,
      },
      previewSubject: subject || 'Exclusive Invitation: Shape the 100-Bottle Johnnie Walker Philippines Edition',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * POST:
 * Handles actions:
 * 1. 'check-status' -> test Brevo API connection
 * 2. 'inject-template' -> create or update template in Brevo
 * 3. 'send-test' -> send single test email
 * 4. 'parse-emails' -> preview deduplicated valid and invalid emails
 * 5. 'launch-blast' -> send email blast to provided list
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const action = body.action;

    switch (action) {
      case 'check-status': {
        const status = await checkBrevoStatus(body.apiKey);
        return NextResponse.json({ status });
      }

      case 'inject-template': {
        const result = await injectTemplateToBrevo({
          name: body.templateName,
          subject: body.subject,
          htmlContent: body.htmlContent,
          overrideApiKey: body.apiKey,
        });
        return NextResponse.json(result);
      }

      case 'send-test': {
        if (!body.toEmail) {
          return NextResponse.json({ error: 'Recipient email address is required' }, { status: 400 });
        }
        const result = await sendTestEmail({
          toEmail: body.toEmail,
          subject: body.subject,
          htmlContent: body.htmlContent,
          overrideApiKey: body.apiKey,
        });
        return NextResponse.json(result);
      }

      case 'parse-emails': {
        const parsed = parseAndDeduplicateEmails(body.rawText || '');
        return NextResponse.json(parsed);
      }

      case 'launch-blast': {
        const emails: string[] = Array.isArray(body.emails) 
          ? body.emails 
          : parseAndDeduplicateEmails(body.rawText || '').valid;

        if (emails.length === 0) {
          return NextResponse.json({ error: 'No valid recipient email addresses provided' }, { status: 400 });
        }

        const result = await launchCampaignBlast({
          emails,
          subject: body.subject,
          htmlContent: body.htmlContent,
          campaignName: body.campaignName,
          createBrevoList: body.createBrevoList !== false,
          overrideApiKey: body.apiKey,
        });

        return NextResponse.json(result);
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
