/**
 * Manila Wine Collector's Choice Email Service Adapter
 * 
 * Supports:
 * 1. Resend API when RESEND_API_KEY is configured.
 * 2. Safe local logger / test mode when credentials are not yet configured.
 * 3. Export to CSV for Manila Wine's existing marketing CRM.
 */

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export const emailService = {
  async sendEmail(payload: EmailPayload): Promise<{ success: boolean; id?: string; mode: string }> {
    const apiKey = process.env.RESEND_API_KEY;
    const fromAddress = process.env.EMAIL_FROM_ADDRESS || 'collectors@manila-wine.com';
    const fromName = process.env.EMAIL_FROM_NAME || "Manila Wine Collector's Choice";

    if (apiKey && apiKey.startsWith('re_')) {
      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: `${fromName} <${fromAddress}>`,
            to: payload.to,
            subject: payload.subject,
            html: payload.html,
            text: payload.text,
          }),
        });
        const data = await res.json();
        return { success: res.ok, id: data.id, mode: 'resend_live' };
      } catch (err) {
        console.error('Failed to dispatch via Resend:', err);
        return { success: false, mode: 'resend_error' };
      }
    }

    // Development / evaluation safe sandbox log
    console.log(`\n================== [OUTGOING EMAIL SANDBOX] ==================`);
    console.log(`To: ${payload.to}`);
    console.log(`Subject: ${payload.subject}`);
    console.log(`Preview: ${payload.text || payload.html.replace(/<[^>]*>?/gm, '').slice(0, 160)}...`);
    console.log(`===============================================================\n`);

    return { success: true, id: `mock-${Date.now()}`, mode: 'sandbox_logged' };
  },

  // Template 1: Vote Confirmation
  async sendVoteConfirmation(email: string, designTitle: string, designCode: string) {
    const html = `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #171717; line-height: 1.6;">
        <div style="text-align: center; padding: 24px 0; border-bottom: 2px solid #C7A35A;">
          <h2 style="color: #9E1B32; margin: 0; font-size: 24px; letter-spacing: 2px; text-transform: uppercase;">Manila Wine</h2>
          <p style="color: #666; font-size: 13px; margin: 4px 0 0 0; letter-spacing: 1px;">COLLECTOR'S CHOICE — 100 NUMBERED BOTTLES</p>
        </div>
        <div style="padding: 32px 16px;">
          <h1 style="font-size: 22px; color: #171717; margin-bottom: 16px;">Your vote has been recorded</h1>
          <p>Thank you for helping choose the design for the proposed 100-bottle <strong>Johnnie Walker Blue Label Philippines Limited Edition</strong>.</p>
          <div style="background-color: #F7F3EB; border-left: 4px solid #C7A35A; padding: 16px 20px; margin: 24px 0;">
            <p style="margin: 0; font-size: 13px; text-transform: uppercase; color: #777; letter-spacing: 1px;">Your Selected Design</p>
            <h3 style="margin: 6px 0 0 0; color: #9E1B32; font-size: 18px;">${designTitle}</h3>
          </div>
          <p style="font-size: 14px; color: #555;">You may review or change your vote at any time until the community voting period concludes.</p>
        </div>
        <div style="border-top: 1px solid #E5E5E5; padding: 24px 16px; font-size: 12px; color: #888; text-align: center;">
          <p style="margin: 0 0 8px 0;"><strong>Enjoy Responsibly.</strong> For adults of legal drinking age only.</p>
          <p style="margin: 0;">Manila Wine Collector's Choice • Proposed Limited Edition Project • <a href="https://manila-wine.com" style="color: #9E1B32;">Visit Main Shop</a></p>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: email,
      subject: `Vote Recorded: ${designCode} — Manila Wine Collector's Choice`,
      html,
    });
  },

  // Template 2: Pledge / Priority-List Confirmation
  async sendPledgeConfirmation(email: string, preferredNumber: number | null, tier: string) {
    const tierLabels: Record<string, string> = {
      any_available: 'Any Available Number',
      specific_standard: `Specific Number (${preferredNumber ? '#' + preferredNumber : 'Unspecified'})`,
      premium_collector: `Premium Collector Number (${preferredNumber ? '#' + preferredNumber : '1, 8, 88, 100'})`,
    };

    const html = `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #171717; line-height: 1.6;">
        <div style="text-align: center; padding: 24px 0; border-bottom: 2px solid #C7A35A;">
          <h2 style="color: #9E1B32; margin: 0; font-size: 24px; letter-spacing: 2px; text-transform: uppercase;">Manila Wine</h2>
          <p style="color: #666; font-size: 13px; margin: 4px 0 0 0; letter-spacing: 1px;">PRIORITY COLLECTOR REGISTRY</p>
        </div>
        <div style="padding: 32px 16px;">
          <h1 style="font-size: 22px; color: #171717; margin-bottom: 16px;">You are on the Priority List</h1>
          <p>We have successfully registered your non-binding interest for the proposed 100-bottle Philippines Limited Edition.</p>
          <div style="background-color: #F7F3EB; border: 1px solid #DFBF77; padding: 20px; margin: 24px 0; border-radius: 4px;">
            <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Preference Tier:</strong> ${tierLabels[tier] || tier}</p>
            ${preferredNumber ? `<p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Preferred Bottle Number:</strong> #${preferredNumber}</p>` : ''}
            <p style="margin: 8px 0 0 0; font-size: 12px; color: #666; font-style: italic;">
              *Reminder: This is a non-binding expression of interest. It does not constitute a deposit, purchase, or guaranteed reservation. Bottle numbers will be allocated only if advance purchasing opens.
            </p>
          </div>
          <p style="font-size: 14px; color: #444;">As a registered collector, you will receive advance notification when the winning design is confirmed and prior to any public release.</p>
        </div>
        <div style="border-top: 1px solid #E5E5E5; padding: 24px 16px; font-size: 12px; color: #888; text-align: center;">
          <p style="margin: 0 0 8px 0;"><strong>Enjoy Responsibly.</strong> For adults of legal drinking age only.</p>
          <p style="margin: 0;">Manila Wine Collector's Choice • <a href="https://manila-wine.com" style="color: #9E1B32;">manila-wine.com</a></p>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: email,
      subject: `Priority Registry Confirmed — Manila Wine Collector's Choice`,
      html,
    });
  },

  // Template 3: Pledge Withdrawn
  async sendPledgeWithdrawn(email: string) {
    const html = `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #171717; line-height: 1.6; padding: 24px 16px;">
        <h2 style="color: #9E1B32;">Priority Interest Withdrawn</h2>
        <p>Your non-binding interest for the Manila Wine Collector's Choice edition has been withdrawn per your request.</p>
        <p>Your design vote remains recorded and active. If you change your mind, you can re-register your interest at any time while the campaign remains open.</p>
        <p style="font-size: 12px; color: #888; margin-top: 32px;">Manila Wine Collector's Choice</p>
      </div>
    `;
    return this.sendEmail({
      to: email,
      subject: `Interest Withdrawn — Manila Wine Collector's Choice`,
      html,
    });
  },

  // Template 4: Winning Design Announcement
  async sendWinnerAnnouncement(email: string, winningTitle: string) {
    const html = `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #171717; line-height: 1.6;">
        <div style="text-align: center; padding: 24px 0; border-bottom: 2px solid #C7A35A;">
          <h2 style="color: #9E1B32;">The Winning Design Has Been Chosen</h2>
        </div>
        <div style="padding: 32px 16px;">
          <p>Following our community vote, we are thrilled to announce the selected artwork for the planned 100-bottle Philippines Edition:</p>
          <div style="background-color: #F7F3EB; border: 1px solid #C7A35A; padding: 20px; text-align: center; margin: 24px 0;">
            <h3 style="color: #9E1B32; font-size: 22px; margin: 0;">${winningTitle}</h3>
          </div>
          <p>Thank you for contributing your vote and shaping this collector's milestone.</p>
        </div>
      </div>
    `;
    return this.sendEmail({
      to: email,
      subject: `Winning Design Announced: ${winningTitle} — Manila Wine`,
      html,
    });
  },

  // Template 5: Priority-Sale Opening Notification
  async sendPrioritySaleNotice(email: string, saleUrl: string) {
    const html = `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #171717; line-height: 1.6;">
        <div style="text-align: center; padding: 24px 0; border-bottom: 2px solid #C7A35A;">
          <h2 style="color: #9E1B32;">Advance Purchasing Is Now Open</h2>
        </div>
        <div style="padding: 32px 16px;">
          <p>As a registered collector on our priority list, you now have private advance access to acquire your bottle from the 100 individually numbered Philippines edition.</p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${saleUrl}" style="background-color: #9E1B32; color: #FFFFFF; padding: 14px 32px; text-decoration: none; font-weight: bold; border-radius: 4px; display: inline-block;">Access Priority Advance Purchase</a>
          </div>
          <p style="font-size: 13px; color: #666;">Allocations are strictly subject to remaining bottle availability.</p>
        </div>
      </div>
    `;
    return this.sendEmail({
      to: email,
      subject: `Exclusive Priority Access: Johnnie Walker Blue Philippines Edition`,
      html,
    });
  },
};
