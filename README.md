# Manila Wine Collector's Choice Microsite

> **"A Philippines Edition, Chosen by You"**  
> Proposed 100-bottle individually numbered Johnnie Walker Blue Label Philippines limited edition community curation, voting, and non-binding purchase interest registry.

---

## Quick Start (Local Development)

```bash
# 1. Install dependencies
npm install

# 2. Process artwork assets (Originals -> 1536x1024 WebP full & 600w responsive thumbnails)
npm run process-assets

# 3. Run automated tests
npm test

# 4. Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) for the public microsite.  
Visit [http://localhost:3000/admin](http://localhost:3000/admin) for the Admin Management Dashboard.

---

## Architecture & Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS with extracted authentic Manila Wine brand palette (Charcoal `#222529`, Wine Red `#9E1B32`, Warm Ivory `#F7F3EB`, Metallic Accent Gold `#C7A35A`)
- **Image Optimization**: Sharp pipeline converting 11 high-res PNG artworks into WebP derivatives (full & thumbnail), reducing bandwidth by >85% without cropping.
- **Database & Storage**: Dual-mode data repository. Runs with zero setup on a local atomic store (`data/store.json`) with full transactional integrity, or connects to PostgreSQL / Supabase with migrations (`supabase/migrations/001_initial_schema.sql`).
- **Auth**: Google OAuth, Facebook OAuth, and passwordless email 6-digit OTP / magic link.
- **Email Adapter**: Modular adapter (`src/lib/email.ts`) supporting Resend in production and sandbox logging in development, plus CSV exports for existing marketing CRM.

---

## Key Features & Acceptance Verification

1. **11 Preserved Bottle Concepts**: All 11 supplied artworks displayed in uncropped 3:2 contain format with neutral luxury cards, descriptive heritage themes, and accessible alt texts.
2. **Interactive Lightbox**: Fullscreen accessible modal with zoom in/out, keyboard navigation (Arrow keys, Esc), concept descriptions, and direct voting controls.
3. **Strict One-Vote Constraint**: Enforced atomically at database and API levels. Repeated clicks or submissions never duplicate votes.
4. **Vote Migration**: Voters can move their vote to another design while voting is open. Counters accurately decrement and increment without data loss.
5. **Vote Count Visibility Rules**:
   - `signed_in_only` (default): vote totals visible only to authenticated collectors.
   - `public`: visible to all.
   - `hidden`: concealed until campaign closes.
6. **Non-Binding Collector Registry (Pledge)**:
   - Configurable price copy (`From ₱X`, `Expected ₱X-₱Y`, or unset disclosure).
   - Optional preferred bottle number (1–100) and interest tiers.
   - Withdrawing a pledge leaves the voter's design vote completely intact.
7. **Role-Protected Admin Dashboard (`/admin`)**:
   - Live metrics (voters, pledges, conversion rate, vote distribution bar chart).
   - State machine controller (`draft`, `coming_soon`, `voting_open`, `voting_closed`, `winner_announced`, `priority_sale`, `archived`).
   - Winner designation tool.
   - Full CSV exports for votes, pledges, designs, and invitations.
   - VIP invitation bulk import with duplicates and invalid email reporting.
   - Immutable audit logging.
8. **Age Gate (18+)**: Legal drinking age modal with cookie persistence.
9. **Legal Starter Documents**: Pre-formatted `/terms`, `/privacy`, and `/cookies` pages clearly flagging items for Manila Wine counsel review.

---

## Database Migrations & Supabase Setup

When connecting to Supabase:
1. Create a new Supabase project.
2. Open the **SQL Editor** in Supabase.
3. Run the contents of `supabase/migrations/001_initial_schema.sql`.
4. Run `supabase/seed.sql` to populate the initial draft campaign and the 11 artworks.
5. Set `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in your production environment.

---

## Authentication Provider Setup

### 1. Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/) > **APIs & Services** > **Credentials**.
2. Create **OAuth 2.0 Client ID** (Web application).
3. Add Authorized Redirect URI: `https://<YOUR_SUBDOMAIN>/api/auth/callback/google` (or Supabase Auth callback URL).
4. Add Client ID and Client Secret to environment variables.

### 2. Facebook OAuth
1. Go to [Meta for Developers](https://developers.facebook.com/) > **My Apps**.
2. Add **Facebook Login**.
3. Set Valid OAuth Redirect URIs: `https://<YOUR_SUBDOMAIN>/api/auth/callback/facebook` (or Supabase Auth callback URL).
4. Add App ID and App Secret to environment variables.

### 3. Passwordless Email (Magic Link / OTP)
- Set `RESEND_API_KEY` in `.env.local` to send live verification emails, or use the built-in development sandbox logger.

---

## Custom Subdomain & DNS Configuration

To deploy on a dedicated subdomain of `manila-wine.com` (e.g. `collectors.manila-wine.com` or `blue.manila-wine.com`):

1. **DNS Provider (Cloudflare / Host)**:
   - Add a `CNAME` record:
     - **Type**: `CNAME`
     - **Name**: `collectors` (or desired subdomain)
     - **Target**: `cname.vercel-dns.com` (or your hosting platform CNAME)
     - **Proxy status**: DNS only (or Proxied if configuring Cloudflare SSL)
2. **Vercel / Production Host**:
   - In Project Settings > **Domains**, add `collectors.manila-wine.com`.
   - Vercel will automatically provision a free Let's Encrypt SSL certificate.
3. **Environment**:
   - Update `NEXT_PUBLIC_APP_URL=https://collectors.manila-wine.com`.

---

## Pre-Launch Checklist

Before setting status to `voting_open`:

- [ ] Confirm custom subdomain (e.g., `collectors.manila-wine.com`) and apply DNS CNAME.
- [ ] Set minimum price (`min_price_php`) in Admin Campaign Settings.
- [ ] Set voting opening date and closing deadline (`vote_opens_at`, `vote_closes_at`).
- [ ] Review and approve legal wording on `/terms` and `/privacy`.
- [ ] Configure production Google and Facebook OAuth client secrets.
- [ ] Configure `RESEND_API_KEY` for transactional email delivery.
- [ ] Set `ADMIN_DEFAULT_EMAIL` to the authorized Manila Wine staff account.
- [ ] Import previous Blue Label buyers' VIP emails via Admin Invitations tab if running in `invite_only` mode.
- [ ] Toggle Campaign Status from `draft` to `voting_open`.
