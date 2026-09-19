export type CampaignStatus = 
  | 'draft'
  | 'coming_soon'
  | 'voting_open'
  | 'voting_closed'
  | 'winner_announced'
  | 'priority_sale'
  | 'archived';

export type AccessMode = 'public_authenticated' | 'invite_only';

export type VoteCountVisibility = 'hidden' | 'signed_in_only' | 'public';

export type PriceDisplayMode = 'starting_from' | 'range' | 'hidden';

export type InterestTier = 'any_available' | 'specific_standard' | 'premium_collector';

export type UserRole = 'user' | 'admin';

export interface Profile {
  id: string;
  email: string;
  display_name?: string | null;
  avatar_url?: string | null;
  role: UserRole;
  age_confirmed_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Campaign {
  id: string;
  slug: string;
  name: string;
  status: CampaignStatus;
  access_mode: AccessMode;
  headline: string;
  intro_copy: string;
  story_copy: string;
  vote_opens_at: string | null;
  vote_closes_at: string | null;
  timezone: string;
  show_vote_counts_mode: VoteCountVisibility;
  planned_quantity: number;
  price_display_mode: PriceDisplayMode;
  min_price_php: number | null;
  max_price_php: number | null;
  main_shop_url: string;
  priority_sale_url: string | null;
  winning_design_id: string | null;
  hero_wallpaper_url?: string | null;
  hero_wallpaper_opacity?: number | null;
  created_at: string;
  updated_at: string;
}

export interface Design {
  id: string;
  campaign_id: string;
  code: string;
  title: string;
  subtitle?: string | null;
  description: string;
  alt_text: string;
  original_image_path: string;
  full_image_path: string;
  thumbnail_path: string;
  sort_order: number;
  is_published: boolean;
  archived_at?: string | null;
  created_at: string;
  updated_at: string;
  // Aggregate count for presentation:
  vote_count?: number;
}

export interface Vote {
  id: string;
  campaign_id: string;
  user_id: string;
  design_id: string;
  source?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_content?: string | null;
  created_at: string;
  updated_at: string;
}

export interface VoteEvent {
  id: string;
  vote_id: string;
  campaign_id: string;
  user_id: string;
  from_design_id: string | null;
  to_design_id: string;
  event_type: 'created' | 'changed' | 'invalidated';
  reason?: string | null;
  created_at: string;
}

export interface Pledge {
  id: string;
  campaign_id: string;
  user_id: string;
  design_id: string | null;
  status: 'active' | 'withdrawn' | 'converted';
  bottle_count: number;
  preferred_number: number | null;
  interest_tier: InterestTier;
  nonbinding_acknowledged_at: string;
  campaign_updates_consent_at: string;
  marketing_consent_at: string | null;
  withdrawn_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Invitation {
  id: string;
  campaign_id: string;
  email_normalized: string;
  reference_code: string;
  status: 'pending' | 'sent' | 'visited' | 'voted' | 'pledged' | 'deactivated';
  sent_at: string | null;
  first_visited_at: string | null;
  joined_user_id: string | null;
  voted_at: string | null;
  pledged_at: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ConsentEvent {
  id: string;
  user_id?: string | null;
  consent_type: string;
  granted: boolean;
  policy_version: string;
  ip_hash?: string | null;
  user_agent?: string | null;
  created_at: string;
}

export interface AdminAuditLog {
  id: string;
  actor_user_id?: string | null;
  actor_email?: string | null;
  action: string;
  entity_type: string;
  entity_id?: string | null;
  before_state?: any;
  after_state?: any;
  reason?: string | null;
  created_at: string;
}

export interface SessionUser {
  id: string;
  email: string;
  display_name?: string | null;
  role: UserRole;
  age_confirmed: boolean;
}

export interface CampaignDataResponse {
  campaign: Campaign;
  designs: Design[];
  userVote: Vote | null;
  userPledge: Pledge | null;
  canVote: boolean;
  votingPhaseActive: boolean;
  showCounts: boolean;
  totalVotesCount: number;
}
