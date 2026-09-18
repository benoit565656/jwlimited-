/**
 * Brevo (Sendinblue) API Client & Email Campaign Dispatcher
 * 
 * Provides:
 * 1. Account status & connection validation (including IP authorization diagnostics)
 * 2. Responsive luxury HTML email template generation
 * 3. 1-Click template injection into Brevo builder (SMTP / Marketing Templates)
 * 4. Test email dispatcher (immediate delivery to specified inbox)
 * 5. High-speed batch email blast with recipient deduplication
 * 6. Contact list creation and marketing campaign scheduling in Brevo
 */

export interface BrevoConfig {
  apiKey: string;
  senderEmail: string;
  senderName: string;
  baseUrl: string;
}

export interface BrevoAccountStatus {
  connected: boolean;
  accountEmail?: string;
  companyName?: string;
  planType?: string;
  credits?: number;
  verifiedSender?: boolean;
  error?: string;
  isIpRestricted?: boolean;
  clientIp?: string;
  authUrl?: string;
}

export interface EmailRecipient {
  email: string;
  name?: string;
}

export interface TemplateOptions {
  subject?: string;
  previewText?: string;
  headline?: string;
  subheadline?: string;
  ctaText?: string;
  ctaUrl?: string;
  featuredDesignTitle?: string;
  featuredImageUrl?: string;
  galleryPreviewUrls?: string[];
  plannedBottles?: number;
  contactEmail?: string;
}

export function getBrevoConfig(overrideApiKey?: string): BrevoConfig {
  const apiKey = overrideApiKey || process.env.BREVO_API_KEY || '';
  const senderEmail = process.env.BREVO_SENDER_EMAIL || 'contact@manila-wine.com';
  const senderName = process.env.BREVO_SENDER_NAME || 'MANILA WINE';
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://jwlimited.manila-wine.com';

  return { apiKey, senderEmail, senderName, baseUrl };
}

/**
 * Robust email list parser and deduplicator
 */
export function parseAndDeduplicateEmails(rawText: string): {
  valid: string[];
  invalid: string[];
  total: number;
  duplicatesCount: number;
} {
  if (!rawText || !rawText.trim()) {
    return { valid: [], invalid: [], total: 0, duplicatesCount: 0 };
  }

  // Split by newlines, commas, semicolons, tabs, and spaces
  const rawTokens = rawText
    .split(/[\r\n,;\t ]+/)
    .map(t => t.trim().replace(/^["']|["']$/g, ''))
    .filter(Boolean);

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const seen = new Set<string>();
  const valid: string[] = [];
  const invalid: string[] = [];
  let duplicatesCount = 0;

  for (const token of rawTokens) {
    // If line has format "Name <email@domain.com>", extract email
    const bracketMatch = token.match(/<([^>]+)>/);
    const candidate = bracketMatch ? bracketMatch[1].trim() : token;

    if (emailRegex.test(candidate)) {
      const lower = candidate.toLowerCase();
      if (seen.has(lower)) {
        duplicatesCount++;
      } else {
        seen.add(lower);
        valid.push(lower);
      }
    } else {
      invalid.push(token);
    }
  }

  return {
    valid,
    invalid,
    total: rawTokens.length,
    duplicatesCount,
  };
}

/**
 * Checks Brevo API connection and verifies sender status
 */
export async function checkBrevoStatus(overrideApiKey?: string): Promise<BrevoAccountStatus> {
  const config = getBrevoConfig(overrideApiKey);

  if (!config.apiKey) {
    return {
      connected: false,
      error: 'Brevo API key is not configured. Please set BREVO_API_KEY in .env.local or enter it in the admin settings.',
    };
  }

  try {
    const res = await fetch('https://api.brevo.com/v3/account', {
      headers: {
        'api-key': config.apiKey,
        'Accept': 'application/json',
      },
    });

    const data = await res.json();

    if (!res.ok) {
      const msg: string = data.message || data.error || 'Unauthorized Brevo API key';
      
      // Detect IP authorization requirement
      if (msg.toLowerCase().includes('unrecognised ip') || msg.toLowerCase().includes('authorised_ips')) {
        const ipMatch = msg.match(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/);
        return {
          connected: false,
          error: msg,
          isIpRestricted: true,
          clientIp: ipMatch ? ipMatch[0] : undefined,
          authUrl: 'https://app.brevo.com/security/authorised_ips',
        };
      }

      return {
        connected: false,
        error: msg,
      };
    }

    // Check verified senders
    let verifiedSender = false;
    try {
      const sendersRes = await fetch('https://api.brevo.com/v3/senders', {
        headers: { 'api-key': config.apiKey, 'Accept': 'application/json' },
      });
      if (sendersRes.ok) {
        const sendersData = await sendersRes.json();
        const senders = sendersData.senders || [];
        verifiedSender = senders.some(
          (s: any) => s.email?.toLowerCase() === config.senderEmail.toLowerCase() && s.active !== false
        );
      }
    } catch {
      // sender check non-critical
    }

    // Extract credit info if present
    const plan = data.plan?.[0];
    const credits = plan?.credits ?? data.relay?.data?.credits;

    return {
      connected: true,
      accountEmail: data.email,
      companyName: data.companyName,
      planType: plan?.type || 'Standard',
      credits: typeof credits === 'number' ? credits : undefined,
      verifiedSender,
    };
  } catch (err: any) {
    return {
      connected: false,
      error: err.message || 'Network failure connecting to Brevo API',
    };
  }
}

/**
 * Generates an ultra-luxury, high-converting, fully responsive HTML email
 */
export function generateLuxuryEmailHtml(options: TemplateOptions = {}): string {
  const config = getBrevoConfig();
  const baseUrl = config.baseUrl;

  const subject = options.subject || 'Exclusive Invitation: Shape the 100-Bottle Johnnie Walker Philippines Edition';
  const previewText = options.previewText || 'Cast your decisive vote for the official 100-bottle Philippines Edition and reserve your numbered bottle.';
  const headline = options.headline || 'Exclusive Private Invitation';
  const subheadline = options.subheadline || 'A Milestone 100-Bottle Commemorative Edition';
  const ctaText = options.ctaText || 'EXPLORE ALL 22 DESIGNS & CAST YOUR VOTE';
  const ctaUrl = options.ctaUrl || `${baseUrl}#gallery`;
  const registryUrl = `${baseUrl}#edition`;
  const logoUrl = `${baseUrl}/brand/logo.png`;
  const heroBottleUrl = options.featuredImageUrl || `${baseUrl}/concepts/email-hero.jpg`;

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no">
  <title>${subject}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    body { margin: 0; padding: 0; width: 100% !important; background-color: #0A0A0A; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    .gold-button {
      background: linear-gradient(135deg, #D4AF37 0%, #AA7C11 100%);
      color: #0A0A0A !important;
      font-weight: 700;
      letter-spacing: 2px;
      text-transform: uppercase;
      text-decoration: none;
      padding: 16px 36px;
      display: inline-block;
      border-radius: 4px;
      font-size: 13px;
      box-shadow: 0 4px 15px rgba(212, 175, 55, 0.3);
    }
    @media only screen and (max-width: 600px) {
      .mobile-padding { padding-left: 20px !important; padding-right: 20px !important; }
      .mobile-title { font-size: 26px !important; line-height: 32px !important; }
      .mobile-stack { display: block !important; width: 100% !important; max-width: 100% !important; }
      .mobile-thumb { margin-bottom: 12px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #0A0A0A; color: #F5F2EB;">

  <!-- Preheader text (preview snippet in inbox) -->
  <div style="display: none; font-size: 1px; color: #0A0A0A; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
    ${previewText} &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
  </div>

  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0A0A0A;">
    <tr>
      <td align="center" style="padding: 24px 12px 40px 12px;">
        
        <!-- Main Container -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 620px; background-color: #141414; border: 1px solid #2A2A2A; border-radius: 8px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.8);">
          
          <!-- Top Accent Gold Bar -->
          <tr>
            <td height="4" style="background: linear-gradient(90deg, #9E1B32 0%, #D4AF37 50%, #9E1B32 100%);"></td>
          </tr>

          <!-- Header / Brand Logo -->
          <tr>
            <td align="center" style="padding: 32px 24px 24px 24px; border-bottom: 1px solid #222222;">
              <a href="${baseUrl}" target="_blank" style="text-decoration: none; display: inline-block;">
                <img src="${logoUrl}" alt="Manila Wine" width="210" style="width: 210px; max-width: 100%; height: auto; display: block; border: 0;" />
              </a>
              <div style="margin-top: 10px; font-size: 10px; letter-spacing: 3px; text-transform: uppercase; color: #D4AF37; font-weight: 600;">
                Private Client Services &bull; Collector's Choice
              </div>
            </td>
          </tr>

          <!-- Hero Section -->
          <tr>
            <td align="center" class="mobile-padding" style="padding: 36px 36px 20px 36px;">
              <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="display: inline-block; margin-bottom: 16px;">
                <tr>
                  <td style="background-color: rgba(212, 175, 55, 0.1); border: 1px solid rgba(212, 175, 55, 0.4); border-radius: 50px; padding: 6px 18px;">
                    <span style="color: #D4AF37; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;">
                      Strictly Limited to 100 Bottles
                    </span>
                  </td>
                </tr>
              </table>

              <h1 class="mobile-title" style="margin: 0 0 12px 0; font-family: 'Times New Roman', Georgia, serif; font-size: 30px; line-height: 38px; color: #F5F2EB; font-weight: 400; letter-spacing: 0.5px;">
                ${headline}
              </h1>

              <div style="color: #D4AF37; font-size: 14px; letter-spacing: 1px; text-transform: uppercase; font-weight: 500; margin-bottom: 24px;">
                Johnnie Walker Blue Label &bull; Philippines Limited Edition
              </div>

              <!-- Featured Bottle Artwork -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 8px 0 28px 0;">
                <tr>
                  <td align="center">
                    <div style="background: radial-gradient(circle, rgba(212,175,55,0.12) 0%, rgba(20,20,20,0) 70%); padding: 12px; border-radius: 8px;">
                      <a href="${ctaUrl}" target="_blank" style="text-decoration: none;">
                        <img src="${heroBottleUrl}" alt="Proposed Limited Edition Artwork" width="500" style="width: 100%; max-width: 500px; height: auto; display: block; border-radius: 6px; border: 1px solid #333333;" />
                      </a>
                    </div>
                    <div style="font-size: 11px; color: #888888; margin-top: 8px; font-style: italic;">
                      Concept 15: Treasures of the Philippines (Mayon, Banaue, Vigan, Tarsier & Karsts)
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Invitation Body Text -->
              <p style="margin: 0 0 18px 0; font-size: 15px; line-height: 25px; color: #D5D1C8; text-align: left;">
                Dear Collector,
              </p>
              <p style="margin: 0 0 18px 0; font-size: 15px; line-height: 25px; color: #D5D1C8; text-align: left;">
                Manila Wine is privileged to invite you to participate in an unprecedented collector’s milestone: the commissioning of an ultra-rare, proposed <strong>100-bottle Philippines Commemorative Edition</strong> of Johnnie Walker Blue Label.
              </p>
              <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 25px; color: #D5D1C8; text-align: left;">
                Instead of deciding behind closed doors, we have placed the ultimate creative choice into the hands of our private collectors. <strong>22 master design concepts</strong> have been curated—celebrating our heritage, landscapes, folklore, and triumphs.
              </p>

              <!-- Three Pillars Table -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #1B1B1B; border: 1px solid #2B2B2B; border-radius: 6px; margin: 24px 0; text-align: left;">
                <tr>
                  <td style="padding: 18px 20px;">
                    <div style="color: #D4AF37; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 4px;">
                      1. One Collector, One Vote
                    </div>
                    <div style="color: #A9A49B; font-size: 13px; line-height: 20px;">
                      Verified single-vote mechanism ensures that the final edition reflects genuine collector preference.
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 0 20px;"><div style="border-top: 1px solid #262626;"></div></td>
                </tr>
                <tr>
                  <td style="padding: 18px 20px;">
                    <div style="color: #D4AF37; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 4px;">
                      2. Flexible Bottle Quantity
                    </div>
                    <div style="color: #A9A49B; font-size: 13px; line-height: 20px;">
                      Express interest for 1, 2, 5, or more bottles directly on the non-binding Priority Registry.
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 0 20px;"><div style="border-top: 1px solid #262626;"></div></td>
                </tr>
                <tr>
                  <td style="padding: 18px 20px;">
                    <div style="color: #D4AF37; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 4px;">
                      3. First Rights on Bottle Numbers
                    </div>
                    <div style="color: #A9A49B; font-size: 13px; line-height: 20px;">
                      Registered participants receive priority allocation windows for specific bottle numbers (e.g. #1, #8, #88, #100) before any public allocation.
                    </div>
                  </td>
                </tr>
              </table>

              <!-- 22 Concepts Curation Callout -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #1B1B1B; border: 1px solid rgba(212, 175, 55, 0.3); border-radius: 6px; margin: 24px 0;">
                <tr>
                  <td align="center" style="padding: 18px 20px;">
                    <div style="color: #D4AF37; font-size: 13px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 6px;">
                      22 Master Heritage Concepts Curated
                    </div>
                    <div style="color: #A9A49B; font-size: 13px; line-height: 20px;">
                      From Mayon Volcano and Banaue to the mythological Bakunawa and Sarimanok — review all 22 bottle artworks in complete 360&deg; high-resolution detail.
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Prominent CTA Button -->
              <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin: 32px 0 16px 0;">
                <tr>
                  <td align="center" style="border-radius: 4px; background: #D4AF37;">
                    <a href="${ctaUrl}" target="_blank" class="gold-button">
                      ${ctaText} &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <div style="font-size: 12px; color: #888888; margin-bottom: 24px;">
                Voting takes under 30 seconds. No purchase required.
              </div>

              <!-- Secondary Link -->
              <div style="border-top: 1px solid #222222; padding-top: 20px; margin-top: 20px; font-size: 13px; color: #9E998F;">
                Already have a target bottle number in mind? <br />
                <a href="${registryUrl}" target="_blank" style="color: #D4AF37; text-decoration: underline; font-weight: 500;">
                  Submit your preference directly on the Priority Collector Registry &rarr;
                </a>
              </div>

            </td>
          </tr>

          <!-- Footer / Legal & Unsubscribe -->
          <tr>
            <td style="background-color: #0E0E0E; border-top: 1px solid #222222; padding: 28px 36px;" class="mobile-padding">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="font-size: 11px; line-height: 18px; color: #666666;">
                    <p style="margin: 0 0 8px 0; color: #888888;">
                      <strong style="color: #D4AF37;">MANILA WINE PRIVATE CLIENT SERVICES</strong><br />
                      Authorized Distributor &bull; Manila, Philippines
                    </p>
                    <p style="margin: 0 0 12px 0;">
                      <strong>Enjoy Responsibly.</strong> For adults of legal drinking age (18+) only. Do not forward to minors.
                    </p>
                    <p style="margin: 0 0 8px 0; font-size: 10px; color: #555555;">
                      This is a non-binding community curation project to gauge interest in a 100-bottle Philippines commemorative edition. Pledges are expressions of interest and do not constitute a financial transaction.
                    </p>
                    <p style="margin: 12px 0 0 0; font-size: 11px; color: #555555;">
                      You are receiving this invitation as a valued Manila Wine client.<br />
                      <a href="{{ unsubscribe }}" style="color: #888888; text-decoration: underline;">Unsubscribe from this campaign</a> &bull; 
                      <a href="${baseUrl}/privacy" style="color: #888888; text-decoration: underline;">Privacy Policy</a> &bull; 
                      <a href="https://manila-wine.com" style="color: #888888; text-decoration: underline;">Visit Main Shop</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
        <!-- End Container -->

      </td>
    </tr>
  </table>

</body>
</html>`;
}

/**
 * Injects or updates the luxury template in Brevo
 */
export async function injectTemplateToBrevo(params: {
  name?: string;
  subject?: string;
  htmlContent?: string;
  overrideApiKey?: string;
}): Promise<{ success: boolean; templateId?: number; message: string; previewUrl?: string }> {
  const config = getBrevoConfig(params.overrideApiKey);

  if (!config.apiKey) {
    return { success: false, message: 'Brevo API key is not configured.' };
  }

  const templateName = params.name || 'Manila Wine - JW Philippines 100 Bottles VIP Invitation';
  const subject = params.subject || 'Exclusive Invitation: Shape the 100-Bottle Johnnie Walker Philippines Edition';
  const htmlContent = params.htmlContent || generateLuxuryEmailHtml({ subject });

  try {
    // 1. Check if template already exists
    const listRes = await fetch('https://api.brevo.com/v3/smtp/templates?templateStatus=true&limit=50', {
      headers: { 'api-key': config.apiKey, 'Accept': 'application/json' },
    });

    let existingId: number | null = null;
    if (listRes.ok) {
      const listData = await listRes.json();
      const existing = (listData.templates || []).find(
        (t: any) => t.name?.toLowerCase() === templateName.toLowerCase()
      );
      if (existing) {
        existingId = existing.id;
      }
    }

    if (existingId) {
      // Update existing template
      const updateRes = await fetch(`https://api.brevo.com/v3/smtp/templates/${existingId}`, {
        method: 'PUT',
        headers: {
          'api-key': config.apiKey,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          templateName,
          subject,
          htmlContent,
          sender: {
            name: config.senderName,
            email: config.senderEmail,
          },
          isActive: true,
        }),
      });

      if (updateRes.ok) {
        return {
          success: true,
          templateId: existingId,
          message: `Successfully updated template #${existingId} in Brevo.`,
          previewUrl: `https://app.brevo.com/templates`,
        };
      }
    }

    // 2. Create new template
    const createRes = await fetch('https://api.brevo.com/v3/smtp/templates', {
      method: 'POST',
      headers: {
        'api-key': config.apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        templateName,
        subject,
        htmlContent,
        sender: {
          name: config.senderName,
          email: config.senderEmail,
        },
        isActive: true,
      }),
    });

    const createData = await createRes.json();

    if (!createRes.ok) {
      return {
        success: false,
        message: createData.message || createData.error || 'Failed to inject template into Brevo',
      };
    }

    return {
      success: true,
      templateId: createData.id,
      message: `Template successfully created and injected into your Brevo account (Template ID: #${createData.id}).`,
      previewUrl: `https://app.brevo.com/templates`,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Error communicating with Brevo API',
    };
  }
}

/**
 * Dispatches an instant test email to the specified address
 */
export async function sendTestEmail(params: {
  toEmail: string;
  subject?: string;
  htmlContent?: string;
  overrideApiKey?: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const config = getBrevoConfig(params.overrideApiKey);

  if (!config.apiKey) {
    return { success: false, error: 'Brevo API key is not configured.' };
  }

  const subject = params.subject || '[TEST PREVIEW] Exclusive Invitation: Shape the 100-Bottle Johnnie Walker Philippines Edition';
  const htmlContent = params.htmlContent || generateLuxuryEmailHtml({ subject });

  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': config.apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        sender: {
          name: config.senderName,
          email: config.senderEmail,
        },
        to: [{ email: params.toEmail }],
        subject,
        htmlContent,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      return {
        success: false,
        error: data.message || data.error || `Brevo returned status ${res.status}`,
      };
    }

    return {
      success: true,
      messageId: data.messageId,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Network error dispatching test email',
    };
  }
}

/**
 * High-speed batch campaign blast
 * Sends transactional batch emails and optionally creates a Brevo contact list
 */
export async function launchCampaignBlast(params: {
  emails: string[];
  subject?: string;
  htmlContent?: string;
  campaignName?: string;
  createBrevoList?: boolean;
  overrideApiKey?: string;
}): Promise<{
  success: boolean;
  totalRequested: number;
  sentCount: number;
  failedCount: number;
  messageIds: string[];
  errors: string[];
  brevoListId?: number;
}> {
  const config = getBrevoConfig(params.overrideApiKey);

  if (!config.apiKey) {
    return {
      success: false,
      totalRequested: params.emails.length,
      sentCount: 0,
      failedCount: params.emails.length,
      messageIds: [],
      errors: ['Brevo API key is not configured.'],
    };
  }

  const { valid } = parseAndDeduplicateEmails(params.emails.join('\n'));

  if (valid.length === 0) {
    return {
      success: false,
      totalRequested: 0,
      sentCount: 0,
      failedCount: 0,
      messageIds: [],
      errors: ['No valid email addresses provided.'],
    };
  }

  const subject = params.subject || 'Exclusive Invitation: Shape the 100-Bottle Johnnie Walker Philippines Edition';
  const htmlContent = params.htmlContent || generateLuxuryEmailHtml({ subject });

  let brevoListId: number | undefined;

  // Optional: create contact list in Brevo for CRM tracking
  if (params.createBrevoList) {
    try {
      // Find or create folder
      const listName = params.campaignName || `JW VIP Collectors - ${new Date().toISOString().slice(0, 10)}`;
      const listRes = await fetch('https://api.brevo.com/v3/contacts/lists', {
        method: 'POST',
        headers: {
          'api-key': config.apiKey,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          name: listName,
          folderId: 1, // default folder
        }),
      });
      if (listRes.ok) {
        const listData = await listRes.json();
        brevoListId = listData.id;
      }
    } catch {
      // List creation non-fatal
    }
  }

  const messageIds: string[] = [];
  const errors: string[] = [];
  let sentCount = 0;
  let failedCount = 0;

  // Dispatch in manageable concurrent batches (e.g. 10 at a time)
  const batchSize = 10;
  for (let i = 0; i < valid.length; i += batchSize) {
    const chunk = valid.slice(i, i + batchSize);
    
    await Promise.all(
      chunk.map(async (email) => {
        try {
          const res = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
              'api-key': config.apiKey,
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify({
              sender: {
                name: config.senderName,
                email: config.senderEmail,
              },
              to: [{ email }],
              subject,
              htmlContent,
            }),
          });

          const data = await res.json();
          if (res.ok && data.messageId) {
            sentCount++;
            messageIds.push(data.messageId);
          } else {
            failedCount++;
            errors.push(`${email}: ${data.message || 'Dispatch failed'}`);
          }
        } catch (err: any) {
          failedCount++;
          errors.push(`${email}: ${err.message || 'Request error'}`);
        }
      })
    );
  }

  return {
    success: sentCount > 0,
    totalRequested: valid.length,
    sentCount,
    failedCount,
    messageIds,
    errors: errors.slice(0, 15), // top errors
    brevoListId,
  };
}
