-- ====================================================================
-- MANILA WINE COLLECTOR'S CHOICE — DATABASE SCHEMA & ROW LEVEL SECURITY
-- ====================================================================

-- 1. PROFILES
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  avatar_url text,
  role text not null default 'user' check (role in ('user', 'admin')),
  age_confirmed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. CAMPAIGNS
create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  status text not null default 'draft' check (status in ('draft', 'coming_soon', 'voting_open', 'voting_closed', 'winner_announced', 'priority_sale', 'archived')),
  access_mode text not null default 'public_authenticated' check (access_mode in ('public_authenticated', 'invite_only')),
  headline text not null,
  intro_copy text not null,
  story_copy text not null,
  vote_opens_at timestamptz,
  vote_closes_at timestamptz,
  timezone text not null default 'Asia/Manila',
  show_vote_counts_mode text not null default 'signed_in_only' check (show_vote_counts_mode in ('hidden', 'signed_in_only', 'public')),
  planned_quantity int not null default 100,
  price_display_mode text not null default 'starting_from' check (price_display_mode in ('starting_from', 'range', 'hidden')),
  min_price_php numeric(12, 2),
  max_price_php numeric(12, 2),
  main_shop_url text default 'https://manila-wine.com',
  priority_sale_url text,
  winning_design_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. DESIGNS
create table if not exists public.designs (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  code text not null,
  title text not null,
  subtitle text,
  description text,
  alt_text text not null,
  original_image_path text not null,
  full_image_path text not null,
  thumbnail_path text not null,
  sort_order int not null default 0,
  is_published boolean not null default true,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_designs_campaign_sort on public.designs(campaign_id, sort_order);

-- 4. VOTES
create table if not exists public.votes (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  design_id uuid not null references public.designs(id) on delete restrict,
  source text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_campaign_user_vote unique (campaign_id, user_id)
);

create index if not exists idx_votes_campaign_design on public.votes(campaign_id, design_id);
create index if not exists idx_votes_created_at on public.votes(created_at);

-- 5. VOTE EVENTS (Append-only audit trail)
create table if not exists public.vote_events (
  id uuid primary key default gen_random_uuid(),
  vote_id uuid not null references public.votes(id) on delete cascade,
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  from_design_id uuid references public.designs(id) on delete set null,
  to_design_id uuid not null references public.designs(id) on delete restrict,
  event_type text not null check (event_type in ('created', 'changed', 'invalidated')),
  reason text,
  created_at timestamptz not null default now()
);

-- 6. PLEDGES (Register Interest)
create table if not exists public.pledges (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  design_id uuid references public.designs(id) on delete set null,
  status text not null default 'active' check (status in ('active', 'withdrawn', 'converted')),
  preferred_number int check (preferred_number is null or (preferred_number >= 1 and preferred_number <= 100)),
  interest_tier text not null default 'any_available' check (interest_tier in ('any_available', 'specific_standard', 'premium_collector')),
  nonbinding_acknowledged_at timestamptz not null default now(),
  campaign_updates_consent_at timestamptz not null default now(),
  marketing_consent_at timestamptz,
  withdrawn_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_campaign_user_pledge unique (campaign_id, user_id)
);

create index if not exists idx_pledges_campaign_user on public.pledges(campaign_id, user_id);
create index if not exists idx_pledges_preferred_number on public.pledges(campaign_id, preferred_number);

-- 7. INVITATIONS
create table if not exists public.invitations (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  email_normalized text not null,
  reference_code text unique not null,
  status text not null default 'pending' check (status in ('pending', 'sent', 'visited', 'voted', 'pledged', 'deactivated')),
  sent_at timestamptz,
  first_visited_at timestamptz,
  joined_user_id uuid references public.profiles(id) on delete set null,
  voted_at timestamptz,
  pledged_at timestamptz,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_invitations_campaign_email on public.invitations(campaign_id, email_normalized);

-- 8. CONSENT EVENTS
create table if not exists public.consent_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  consent_type text not null,
  granted boolean not null,
  policy_version text not null default '1.0',
  ip_hash text,
  user_agent text,
  created_at timestamptz not null default now()
);

-- 9. ADMIN AUDIT LOG
create table if not exists public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references public.profiles(id) on delete set null,
  actor_email text,
  action text not null,
  entity_type text not null,
  entity_id text,
  before_state jsonb,
  after_state jsonb,
  reason text,
  created_at timestamptz not null default now()
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================
alter table public.profiles enable row level security;
alter table public.campaigns enable row level security;
alter table public.designs enable row level security;
alter table public.votes enable row level security;
alter table public.vote_events enable row level security;
alter table public.pledges enable row level security;
alter table public.invitations enable row level security;
alter table public.consent_events enable row level security;
alter table public.admin_audit_log enable row level security;

-- Profiles: users read/update their own profile. Admins read all.
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Admins can view all profiles" on public.profiles
  for select using (exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
  ));

-- Campaigns: Anyone can read public campaigns. Admins can manage all.
create policy "Public can view published campaigns" on public.campaigns
  for select using (status != 'draft' or exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
  ));

create policy "Admins manage campaigns" on public.campaigns
  for all using (exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
  ));

-- Designs: Anyone can view active published designs
create policy "Public can view published designs" on public.designs
  for select using (is_published = true and archived_at is null);

create policy "Admins manage designs" on public.designs
  for all using (exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
  ));

-- Votes: Users can see only their own vote record. Admins can see all.
create policy "Users see own vote" on public.votes
  for select using (auth.uid() = user_id);

create policy "Users can cast or change own vote" on public.votes
  for insert with check (
    auth.uid() = user_id and exists (
      select 1 from public.campaigns c
      where c.id = campaign_id
      and c.status = 'voting_open'
      and (c.vote_closes_at is null or c.vote_closes_at > now())
    )
  );

create policy "Users can update own vote" on public.votes
  for update using (
    auth.uid() = user_id and exists (
      select 1 from public.campaigns c
      where c.id = campaign_id
      and c.status = 'voting_open'
      and (c.vote_closes_at is null or c.vote_closes_at > now())
    )
  );

create policy "Admins see all votes" on public.votes
  for select using (exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
  ));

-- Pledges: Users see only their own pledge.
create policy "Users see own pledge" on public.pledges
  for select using (auth.uid() = user_id);

create policy "Users manage own pledge" on public.pledges
  for all using (auth.uid() = user_id);

create policy "Admins see all pledges" on public.pledges
  for select using (exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
  ));

-- Invitations: Admins manage all.
create policy "Admins manage invitations" on public.invitations
  for all using (exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
  ));

-- Admin Audit Log: Admins only.
create policy "Admins view audit log" on public.admin_audit_log
  for select using (exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
  ));

-- ====================================================================
-- SAFE AGGREGATION VIEW FOR VOTE COUNTS
-- Does not expose user identities or personal information
-- ====================================================================
create or replace view public.design_vote_counts as
select 
  d.id as design_id,
  d.campaign_id,
  d.code,
  d.title,
  count(v.id)::int as total_votes
from public.designs d
left join public.votes v on v.design_id = d.id
where d.is_published = true and d.archived_at is null
group by d.id, d.campaign_id, d.code, d.title;
