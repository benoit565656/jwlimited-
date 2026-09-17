'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Campaign, 
  Design, 
  CampaignStatus, 
  AccessMode, 
  VoteCountVisibility, 
  PriceDisplayMode,
  AdminAuditLog 
} from '@/types';
import { 
  LayoutDashboard, 
  Sliders, 
  Image as ImageIcon, 
  Users, 
  Mail, 
  History, 
  Download, 
  AlertTriangle, 
  Check, 
  ExternalLink, 
  Eye, 
  ArrowUpDown, 
  Award, 
  Archive, 
  RefreshCw,
  LogOut,
  Shield
} from 'lucide-react';
import { formatPhp, formatDate } from '@/lib/utils';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'settings' | 'designs' | 'voters' | 'invitations' | 'audit'>('overview');
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [designs, setDesigns] = useState<Design[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [pledgesList, setPledgesList] = useState<any[]>([]);
  const [votesList, setVotesList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean | null>(null);

  // Settings form state
  const [settingsForm, setSettingsForm] = useState<Partial<Campaign>>({});
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Design edit modal
  const [editingDesign, setEditingDesign] = useState<Design | null>(null);

  // Invitations import state
  const [importEmailsText, setImportEmailsText] = useState('');
  const [importResult, setImportResult] = useState<any>(null);

  const fetchAdminData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Check current session
      const authRes = await fetch('/api/auth/session');
      const authData = await authRes.json();
      
      if (!authData.user || authData.user.role !== 'admin') {
        setIsAdminAuthenticated(false);
        setIsLoading(false);
        return;
      }
      setIsAdminAuthenticated(true);

      // 2. Fetch campaign settings
      const settingsRes = await fetch('/api/admin/settings');
      const settingsData = await settingsRes.json();
      setCampaign(settingsData.campaign);
      setSettingsForm(settingsData.campaign);

      // 3. Fetch designs
      const designsRes = await fetch(`/api/admin/designs?campaign_id=${settingsData.campaign.id}`);
      const designsData = await designsRes.json();
      setDesigns(designsData.designs);

      // 4. Fetch analytics
      const analyticsRes = await fetch(`/api/admin/analytics?campaign_id=${settingsData.campaign.id}`);
      const analyticsData = await analyticsRes.json();
      setAnalytics(analyticsData.analytics);
      setAuditLogs(analyticsData.auditLogs);
      setPledgesList(analyticsData.recentPledges || []);
      setVotesList(analyticsData.recentVotes || []);

      // 5. Fetch invitations
      const invRes = await fetch(`/api/admin/invitations?campaign_id=${settingsData.campaign.id}`);
      const invData = await invRes.json();
      setInvitations(invData.invitations || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  // Admin Quick Sign In for Development / Reviewers
  const handleAdminSignIn = async (emailToUse: string = 'admin@manila-wine.com') => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/oauth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'google',
          email: emailToUse,
          display_name: 'Administrator',
          age_confirmed: true,
        }),
      });
      if (res.ok) {
        await fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus('Saving changes...');

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsForm),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');

      setCampaign(data.campaign);
      setSaveStatus('Settings updated successfully!');
      setTimeout(() => setSaveStatus(null), 3000);
      fetchAdminData();
    } catch (err: any) {
      setSaveStatus(`Error: ${err.message}`);
    }
  };

  const handleUpdateDesign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDesign) return;

    try {
      const res = await fetch('/api/admin/designs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingDesign),
      });
      if (!res.ok) throw new Error('Failed to update design');
      setEditingDesign(null);
      fetchAdminData();
    } catch (err) {
      alert('Error updating design');
    }
  };

  const handleSetWinner = async (designId: string | null) => {
    if (!campaign) return;
    const confirmText = designId 
      ? `Declare this design as the official winner? This will set campaign status to 'winner_announced'.`
      : `Remove winning design selection?`;
    
    if (!window.confirm(confirmText)) return;

    try {
      const res = await fetch('/api/admin/designs?action=set_winner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaign_id: campaign.id,
          winning_design_id: designId,
        }),
      });
      if (!res.ok) throw new Error('Failed to set winner');
      fetchAdminData();
    } catch (err) {
      alert('Error setting winner');
    }
  };

  const handleArchiveDesign = async (designId: string) => {
    if (!window.confirm('Are you sure you want to archive this design? It will be safely preserved in history.')) return;

    try {
      const res = await fetch(`/api/admin/designs?design_id=${designId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Archive failed');
      fetchAdminData();
    } catch (err) {
      alert('Error archiving design');
    }
  };

  const handleImportInvitations = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaign || !importEmailsText.trim()) return;

    const emails = importEmailsText
      .split(/[\n,;]+/)
      .map(e => e.trim())
      .filter(Boolean);

    try {
      const res = await fetch('/api/admin/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaign_id: campaign.id,
          emails,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setImportResult(data.result);
      setImportEmailsText('');
      fetchAdminData();
    } catch (err: any) {
      alert(`Import failed: ${err.message}`);
    }
  };

  const handleResetVote = async (email: string) => {
    if (!window.confirm(`Reset vote and registered priority pledge for ${email}?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/vote?campaign_id=${campaign?.id}&email=${encodeURIComponent(email)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || 'Vote reset successfully');
        fetchAdminData();
      } else {
        alert(data.error || 'Failed to reset vote');
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  // If not logged in as Admin, show administrator sign-in gateway
  if (!isLoading && !isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-charcoal border border-gold/40 rounded-xl p-8 text-center text-ivory shadow-luxury">
          <div className="w-14 h-14 rounded-full bg-wine/20 border border-gold/40 text-gold flex items-center justify-center mx-auto mb-4">
            <Shield className="w-7 h-7" />
          </div>
          <h2 className="font-serif text-2xl text-ivory mb-2">Manila Wine Admin Portal</h2>
          <p className="text-xs text-ivory/70 mb-6">
            Authentication required with administrator credentials.
          </p>

          <div className="space-y-3">
            <button
              onClick={() => handleAdminSignIn('benoit5656@gmail.com')}
              className="w-full py-3 rounded bg-wine hover:bg-wine-light text-white font-semibold text-xs tracking-wider uppercase shadow-wine-glow transition-colors"
            >
              Sign In as benoit5656@gmail.com
            </button>

            <button
              onClick={() => handleAdminSignIn('admin@manila-wine.com')}
              className="w-full py-2.5 rounded bg-charcoal hover:bg-ink border border-charcoal-border hover:border-gold text-ivory/80 text-xs font-medium tracking-wider uppercase transition-colors"
            >
              Sign In as admin@manila-wine.com
            </button>

            <Link
              href="/"
              className="block w-full py-2.5 rounded border border-charcoal-border hover:border-gold text-ivory/60 hover:text-ivory text-xs transition-colors"
            >
              &larr; Return to Public Microsite
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink text-ivory flex flex-col">
      {/* Admin Top Navigation */}
      <header className="bg-charcoal border-b border-charcoal-border px-6 py-4 sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative h-8 w-40">
            <Image
              src="/brand/logo.webp"
              alt="Manila Wine"
              fill
              className="object-contain"
            />
          </div>
          <span className="text-xs px-2.5 py-1 rounded bg-gold/20 text-gold font-semibold tracking-wider uppercase border border-gold/30">
            Admin Console
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <Link
            href="/"
            target="_blank"
            className="text-ivory/70 hover:text-gold flex items-center gap-1.5 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            View Live Microsite
            <ExternalLink className="w-3 h-3" />
          </Link>

          <button
            onClick={() => fetchAdminData()}
            className="p-1.5 text-ivory/70 hover:text-white rounded hover:bg-ink-soft transition-colors"
            title="Refresh data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={async () => {
              await fetch('/api/auth/session', { method: 'POST' });
              setIsAdminAuthenticated(false);
            }}
            className="flex items-center gap-1.5 text-wine-light hover:text-white py-1 px-2.5 rounded hover:bg-wine/20 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Admin Body */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Flagged Pre-Launch Alerts (Section 18 requirement) */}
        {campaign && (
          <div className="mb-8 space-y-3">
            {(!campaign.min_price_php || !campaign.vote_opens_at || !campaign.vote_closes_at || campaign.status === 'draft') && (
              <div className="p-4 rounded-lg bg-gold/10 border border-gold/40 text-xs text-gold flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 flex-shrink-0 text-gold mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-semibold text-sm">Launch Readiness Checklist (Section 18):</h4>
                  <ul className="list-disc pl-4 space-y-0.5 text-ivory/80">
                    {!campaign.min_price_php && <li><strong>Minimum Bottle Price:</strong> UNSET — Required before launching campaign</li>}
                    {!campaign.vote_opens_at && <li><strong>Voting Open Date:</strong> UNSET — Required before launching campaign</li>}
                    {!campaign.vote_closes_at && <li><strong>Voting Close Date:</strong> UNSET — Required before launching campaign</li>}
                    {campaign.status === 'draft' && <li><strong>Current Status:</strong> Draft — Campaign is private to admins until set to &apos;voting_open&apos;</li>}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab Navigation */}
        <nav className="flex space-x-2 border-b border-charcoal-border pb-px mb-8 overflow-x-auto" aria-label="Admin Tabs">
          {[
            { id: 'overview', label: 'Overview & Metrics', icon: LayoutDashboard },
            { id: 'settings', label: 'Campaign Settings', icon: Sliders },
            { id: 'designs', label: 'Design Artworks', icon: ImageIcon },
            { id: 'voters', label: 'Voters & Pledges', icon: Users },
            { id: 'invitations', label: 'Invitations', icon: Mail },
            { id: 'audit', label: 'Audit Log', icon: History },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold tracking-wider uppercase border-b-2 transition-colors whitespace-nowrap ${
                  isActive
                    ? 'border-gold text-gold bg-charcoal/30'
                    : 'border-transparent text-ivory/60 hover:text-ivory hover:border-white/20'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* TAB 1: OVERVIEW & METRICS */}
        {activeTab === 'overview' && analytics && (
          <div className="space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="p-5 rounded-xl bg-charcoal border border-charcoal-border">
                <span className="text-xs uppercase tracking-wider text-ivory/50 block mb-1">Total Verified Voters</span>
                <span className="font-serif text-3xl text-gold font-normal">{analytics.totalVoters}</span>
                <span className="text-[11px] text-ivory/40 block mt-1">Unique single-vote collectors</span>
              </div>

              <div className="p-5 rounded-xl bg-charcoal border border-charcoal-border">
                <span className="text-xs uppercase tracking-wider text-ivory/50 block mb-1">Pledging Collectors</span>
                <span className="font-serif text-3xl text-wine-light font-normal">{analytics.totalPledges}</span>
                <span className="text-[11px] text-ivory/40 block mt-1">Registered expressions</span>
              </div>

              <div className="p-5 rounded-xl bg-charcoal border border-gold/40 shadow-luxury">
                <span className="text-xs uppercase tracking-wider text-gold font-semibold block mb-1">Total Bottles Pledged</span>
                <span className="font-serif text-3xl text-gold font-medium">{analytics.totalBottlesPledged ?? analytics.totalPledges}</span>
                <span className="text-[11px] text-gold/60 block mt-1">Expressed bottle volume</span>
              </div>

              <div className="p-5 rounded-xl bg-charcoal border border-charcoal-border">
                <span className="text-xs uppercase tracking-wider text-ivory/50 block mb-1">Pledge Conversion</span>
                <span className="font-serif text-3xl text-ivory font-normal">{analytics.conversionRate}%</span>
                <span className="text-[11px] text-ivory/40 block mt-1">Pledges ÷ Voters</span>
              </div>

              <div className="p-5 rounded-xl bg-charcoal border border-charcoal-border">
                <span className="text-xs uppercase tracking-wider text-ivory/50 block mb-1">Planned Production</span>
                <span className="font-serif text-3xl text-ivory font-normal">{campaign?.planned_quantity || 100}</span>
                <span className="text-[11px] text-ivory/40 block mt-1">Numbered bottles</span>
              </div>
            </div>

            {/* Vote Distribution By Concept */}
            <div className="p-6 rounded-xl bg-charcoal border border-charcoal-border space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-serif text-lg text-ivory">Vote Distribution by Concept</h3>
                <a
                  href="/api/admin/export?type=designs"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-ink border border-charcoal-border hover:border-gold text-xs text-gold transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export Results CSV
                </a>
              </div>

              <div className="space-y-3 pt-2">
                {analytics.designs.map((d: Design) => {
                  const votes = d.vote_count || 0;
                  const total = analytics.totalVoters || 1;
                  const pct = Math.round((votes / total) * 100);
                  const isWinning = campaign?.winning_design_id === d.id;

                  return (
                    <div key={d.id} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium text-ivory flex items-center gap-2">
                          <span className="text-gold">{d.code}</span> — {d.title}
                          {isWinning && (
                            <span className="px-1.5 py-0.5 rounded bg-gold text-ink font-bold text-[10px] uppercase">
                              Winner
                            </span>
                          )}
                        </span>
                        <span className="text-ivory/70">{votes} votes ({pct}%)</span>
                      </div>
                      <div className="w-full h-2.5 bg-ink rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isWinning ? 'bg-gold' : 'bg-wine'
                          }`}
                          style={{ width: `${Math.max(pct, votes > 0 ? 2 : 0)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Interest Tier & Preferred Numbers Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="p-6 rounded-xl bg-charcoal border border-charcoal-border">
                <h3 className="font-serif text-lg text-ivory mb-4">Interest Tier Breakdown</h3>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between py-2 border-b border-charcoal-border">
                    <span className="text-ivory/80">Any Available Number:</span>
                    <strong className="text-ivory">{analytics.tierCounts.any_available}</strong>
                  </div>
                  <div className="flex justify-between py-2 border-b border-charcoal-border">
                    <span className="text-ivory/80">Specific Standard Number:</span>
                    <strong className="text-ivory">{analytics.tierCounts.specific_standard}</strong>
                  </div>
                  <div className="flex justify-between py-2 border-b border-charcoal-border">
                    <span className="text-ivory/80">Premium Collector Number (#1, #8, #88, #100):</span>
                    <strong className="text-gold font-semibold">{analytics.tierCounts.premium_collector}</strong>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-xl bg-charcoal border border-charcoal-border">
                <h3 className="font-serif text-lg text-ivory mb-4">Traffic & Referral Attribution (UTMs)</h3>
                <div className="space-y-2 text-xs">
                  {Object.keys(analytics.utmBreakdown).length === 0 ? (
                    <p className="text-ivory/40">No external referral sources recorded yet.</p>
                  ) : (
                    Object.entries(analytics.utmBreakdown).map(([source, count]: [string, any]) => (
                      <div key={source} className="flex justify-between py-1.5 border-b border-charcoal-border/50">
                        <span className="text-ivory/70">{source}</span>
                        <span className="font-medium text-ivory">{count} visits/votes</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CAMPAIGN SETTINGS */}
        {activeTab === 'settings' && campaign && (
          <form onSubmit={handleSaveSettings} className="space-y-8 max-w-4xl">
            {saveStatus && (
              <div className={`p-4 rounded text-xs flex items-center gap-2 ${
                saveStatus.includes('success') 
                  ? 'bg-gold/15 text-gold border border-gold/40' 
                  : 'bg-wine/20 text-wine-light border border-wine/40'
              }`}>
                {saveStatus.includes('success') ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                <span>{saveStatus}</span>
              </div>
            )}

            {/* Campaign Phase & Lifecycle State Machine */}
            <div className="p-6 rounded-xl bg-charcoal border border-charcoal-border space-y-4">
              <h3 className="font-serif text-lg text-ivory">Campaign Lifecycle & Status</h3>
              <p className="text-xs text-ivory/60 leading-relaxed">
                Controls the campaign state machine. Only &apos;voting_open&apos; permits voters to cast and change votes.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-ivory/60 mb-1.5">
                    Campaign Status / Phase
                  </label>
                  <select
                    value={settingsForm.status || 'draft'}
                    onChange={(e) => setSettingsForm({ ...settingsForm, status: e.target.value as CampaignStatus })}
                    className="w-full px-3.5 py-2.5 bg-ink rounded border border-charcoal-border focus:border-gold text-xs text-ivory"
                  >
                    <option value="draft">draft — Private to Admins</option>
                    <option value="coming_soon">coming_soon — Public Story; No Voting</option>
                    <option value="voting_open">voting_open — Active Voting & Pledges</option>
                    <option value="voting_closed">voting_closed — Voting Closed; Finalizing</option>
                    <option value="winner_announced">winner_announced — Winner Showcased</option>
                    <option value="priority_sale">priority_sale — Advance Purchasing Live</option>
                    <option value="archived">archived — Read-only Historical Page</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-ivory/60 mb-1.5">
                    Access Mode
                  </label>
                  <select
                    value={settingsForm.access_mode || 'public_authenticated'}
                    onChange={(e) => setSettingsForm({ ...settingsForm, access_mode: e.target.value as AccessMode })}
                    className="w-full px-3.5 py-2.5 bg-ink rounded border border-charcoal-border focus:border-gold text-xs text-ivory"
                  >
                    <option value="public_authenticated">public_authenticated — Any adult 18+ can vote</option>
                    <option value="invite_only">invite_only — Restricted to imported VIP list</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Dates & Schedule */}
            <div className="p-6 rounded-xl bg-charcoal border border-charcoal-border space-y-4">
              <h3 className="font-serif text-lg text-ivory">Campaign Dates & Deadline</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-ivory/60 mb-1.5">
                    Vote Opens At (ISO Date or Leave Empty)
                  </label>
                  <input
                    type="datetime-local"
                    value={settingsForm.vote_opens_at ? settingsForm.vote_opens_at.slice(0, 16) : ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, vote_opens_at: e.target.value ? new Date(e.target.value).toISOString() : null })}
                    className="w-full px-3.5 py-2 bg-ink rounded border border-charcoal-border focus:border-gold text-xs text-ivory"
                  />
                  <span className="text-[11px] text-ivory/40 mt-1 block">Current: {formatDate(settingsForm.vote_opens_at)}</span>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-ivory/60 mb-1.5">
                    Vote Closes At (Voting Deadline)
                  </label>
                  <input
                    type="datetime-local"
                    value={settingsForm.vote_closes_at ? settingsForm.vote_closes_at.slice(0, 16) : ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, vote_closes_at: e.target.value ? new Date(e.target.value).toISOString() : null })}
                    className="w-full px-3.5 py-2 bg-ink rounded border border-charcoal-border focus:border-gold text-xs text-ivory"
                  />
                  <span className="text-[11px] text-ivory/40 mt-1 block">Current: {formatDate(settingsForm.vote_closes_at)}</span>
                </div>
              </div>
            </div>

            {/* Pricing & Display Configuration */}
            <div className="p-6 rounded-xl bg-charcoal border border-charcoal-border space-y-4">
              <h3 className="font-serif text-lg text-ivory">Pricing & Count Visibility</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-ivory/60 mb-1.5">
                    Price Display Mode
                  </label>
                  <select
                    value={settingsForm.price_display_mode || 'starting_from'}
                    onChange={(e) => setSettingsForm({ ...settingsForm, price_display_mode: e.target.value as PriceDisplayMode })}
                    className="w-full px-3.5 py-2.5 bg-ink rounded border border-charcoal-border focus:border-gold text-xs text-ivory"
                  >
                    <option value="starting_from">starting_from (From ₱X)</option>
                    <option value="range">range (₱X - ₱Y)</option>
                    <option value="hidden">hidden</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-ivory/60 mb-1.5">
                    Minimum Price (PHP)
                  </label>
                  <input
                    type="number"
                    value={settingsForm.min_price_php ?? ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, min_price_php: e.target.value ? parseFloat(e.target.value) : null })}
                    placeholder="e.g. 24000"
                    className="w-full px-3.5 py-2.5 bg-ink rounded border border-charcoal-border focus:border-gold text-xs text-ivory"
                  />
                  <span className="text-[11px] text-ivory/40 mt-1 block">{formatPhp(settingsForm.min_price_php)}</span>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-ivory/60 mb-1.5">
                    Maximum Price (PHP)
                  </label>
                  <input
                    type="number"
                    value={settingsForm.max_price_php ?? ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, max_price_php: e.target.value ? parseFloat(e.target.value) : null })}
                    placeholder="e.g. 38000"
                    className="w-full px-3.5 py-2.5 bg-ink rounded border border-charcoal-border focus:border-gold text-xs text-ivory"
                  />
                  <span className="text-[11px] text-ivory/40 mt-1 block">{formatPhp(settingsForm.max_price_php)}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-ivory/60 mb-1.5">
                  Vote Counts Visibility Mode
                </label>
                <select
                  value={settingsForm.show_vote_counts_mode || 'signed_in_only'}
                  onChange={(e) => setSettingsForm({ ...settingsForm, show_vote_counts_mode: e.target.value as VoteCountVisibility })}
                  className="w-full px-3.5 py-2.5 bg-ink rounded border border-charcoal-border focus:border-gold text-xs text-ivory"
                >
                  <option value="signed_in_only">signed_in_only (Default: visible only after signing in)</option>
                  <option value="public">public (Visible to all visitors)</option>
                  <option value="hidden">hidden (Totals concealed until campaign ends)</option>
                </select>
              </div>
            </div>

            {/* Campaign Copy & External URLs */}
            <div className="p-6 rounded-xl bg-charcoal border border-charcoal-border space-y-4">
              <h3 className="font-serif text-lg text-ivory">Campaign Editorial Copy</h3>
              
              <div>
                <label className="block text-xs uppercase tracking-wider text-ivory/60 mb-1.5">
                  Main Headline
                </label>
                <input
                  type="text"
                  value={settingsForm.headline || ''}
                  onChange={(e) => setSettingsForm({ ...settingsForm, headline: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-ink rounded border border-charcoal-border focus:border-gold text-xs text-ivory"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-ivory/60 mb-1.5">
                  Intro Proposition Copy
                </label>
                <textarea
                  rows={3}
                  value={settingsForm.intro_copy || ''}
                  onChange={(e) => setSettingsForm({ ...settingsForm, intro_copy: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-ink rounded border border-charcoal-border focus:border-gold text-xs text-ivory"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-ivory/60 mb-1.5">
                    Main Manila Wine Shop URL
                  </label>
                  <input
                    type="url"
                    value={settingsForm.main_shop_url || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, main_shop_url: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-ink rounded border border-charcoal-border focus:border-gold text-xs text-ivory"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-ivory/60 mb-1.5">
                    Priority Sale Checkout URL (Future Phase)
                  </label>
                  <input
                    type="url"
                    value={settingsForm.priority_sale_url || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, priority_sale_url: e.target.value })}
                    placeholder="https://manila-wine.com/exclusive/jw-blue-ph"
                    className="w-full px-3.5 py-2.5 bg-ink rounded border border-charcoal-border focus:border-gold text-xs text-ivory"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="px-8 py-3 rounded bg-wine hover:bg-wine-light text-white font-semibold text-xs tracking-wider uppercase shadow-wine-glow transition-colors"
            >
              Save Campaign Settings
            </button>
          </form>
        )}

        {/* TAB 3: DESIGN ARTWORKS */}
        {activeTab === 'designs' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-serif text-xl text-ivory">Concept Design Management</h3>
                <p className="text-xs text-ivory/60">
                  Manage all campaign bottle artworks, rename, update descriptions, reorder, or designate the winner.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {designs.map((design) => {
                const isWinner = campaign?.winning_design_id === design.id;

                return (
                  <div
                    key={design.id}
                    className={`p-5 rounded-xl bg-charcoal border flex flex-col justify-between ${
                      isWinner ? 'border-gold ring-1 ring-gold shadow-gold-subtle' : 'border-charcoal-border'
                    }`}
                  >
                    <div>
                      <div className="relative aspect-[3/2] w-full rounded bg-ink-deep mb-3 overflow-hidden">
                        <Image
                          src={design.thumbnail_path}
                          alt={design.alt_text}
                          fill
                          className="object-contain p-2"
                        />
                        {isWinner && (
                          <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-gold text-ink font-bold text-[10px] tracking-wider uppercase">
                            Winning Design
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-xs text-gold mb-1">
                        <span className="font-semibold">{design.code}</span>
                        <span className="text-ivory/60">{design.vote_count ?? 0} votes</span>
                      </div>

                      <h4 className="font-serif text-base text-ivory font-normal mb-1">{design.title}</h4>
                      <p className="text-xs text-ivory/60 line-clamp-2 mb-4">{design.description}</p>
                    </div>

                    <div className="pt-3 border-t border-charcoal-border flex flex-wrap items-center gap-2 text-xs">
                      <button
                        onClick={() => setEditingDesign(design)}
                        className="px-3 py-1.5 rounded bg-ink hover:bg-ink-soft border border-charcoal-border text-ivory/80 hover:text-white"
                      >
                        Edit Details
                      </button>

                      <button
                        onClick={() => handleSetWinner(isWinner ? null : design.id)}
                        className={`px-3 py-1.5 rounded border transition-colors ${
                          isWinner 
                            ? 'bg-gold/20 text-gold border-gold hover:bg-wine/20 hover:text-wine-light' 
                            : 'border-charcoal-border text-gold hover:border-gold'
                        }`}
                      >
                        {isWinner ? 'Clear Winner' : 'Mark as Winner'}
                      </button>

                      <button
                        onClick={() => handleArchiveDesign(design.id)}
                        className="p-1.5 text-ivory/40 hover:text-wine-light ml-auto"
                        title="Archive Design"
                      >
                        <Archive className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Design Edit Modal */}
            {editingDesign && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <form onSubmit={handleUpdateDesign} className="w-full max-w-lg bg-charcoal border border-gold/40 rounded-xl p-6 text-ivory space-y-4">
                  <h3 className="font-serif text-xl text-ivory">Edit {editingDesign.code}</h3>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-ivory/60 mb-1">Title</label>
                    <input
                      type="text"
                      value={editingDesign.title}
                      onChange={(e) => setEditingDesign({ ...editingDesign, title: e.target.value })}
                      className="w-full px-3 py-2 bg-ink rounded border border-charcoal-border text-xs text-ivory"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-ivory/60 mb-1">Subtitle</label>
                    <input
                      type="text"
                      value={editingDesign.subtitle || ''}
                      onChange={(e) => setEditingDesign({ ...editingDesign, subtitle: e.target.value })}
                      className="w-full px-3 py-2 bg-ink rounded border border-charcoal-border text-xs text-ivory"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-ivory/60 mb-1">Description</label>
                    <textarea
                      rows={3}
                      value={editingDesign.description}
                      onChange={(e) => setEditingDesign({ ...editingDesign, description: e.target.value })}
                      className="w-full px-3 py-2 bg-ink rounded border border-charcoal-border text-xs text-ivory"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-ivory/60 mb-1">Accessibility Alt Text</label>
                    <textarea
                      rows={2}
                      value={editingDesign.alt_text}
                      onChange={(e) => setEditingDesign({ ...editingDesign, alt_text: e.target.value })}
                      className="w-full px-3 py-2 bg-ink rounded border border-charcoal-border text-xs text-ivory"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-charcoal-border">
                    <button
                      type="button"
                      onClick={() => setEditingDesign(null)}
                      className="px-4 py-2 rounded text-xs text-ivory/60 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded bg-wine text-white text-xs font-semibold tracking-wider uppercase"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: VOTERS & PLEDGES */}
        {activeTab === 'voters' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-serif text-xl text-ivory">Voters & Pledges Registry</h3>
                <p className="text-xs text-ivory/60">
                  Real-time record of all verified collector expressions, bottle volume requested, and CSV exports.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <a
                  href="/api/admin/export?type=votes"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded bg-wine hover:bg-wine-light text-white text-xs font-semibold tracking-wider uppercase transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export Votes CSV
                </a>

                <a
                  href="/api/admin/export?type=pledges"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded bg-charcoal hover:bg-ink border border-gold/40 text-gold text-xs font-semibold tracking-wider uppercase transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export Pledges CSV
                </a>
              </div>
            </div>

            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-charcoal border border-charcoal-border">
                <span className="text-xs text-ivory/50 block">Pledging Collectors</span>
                <span className="text-2xl font-serif text-gold font-medium">{pledgesList.length}</span>
              </div>
              <div className="p-4 rounded-lg bg-charcoal border border-gold/40 shadow-luxury">
                <span className="text-xs text-gold font-semibold block">Total Bottles Requested</span>
                <span className="text-2xl font-serif text-gold font-bold">
                  {pledgesList.reduce((sum: number, p: any) => sum + (Number(p.bottle_count) || 1), 0)}
                </span>
              </div>
              <div className="p-4 rounded-lg bg-charcoal border border-charcoal-border">
                <span className="text-xs text-ivory/50 block">Verified Voters</span>
                <span className="text-2xl font-serif text-ivory font-medium">{votesList.length}</span>
              </div>
            </div>

            {/* Live Pledges Table */}
            <div className="p-6 rounded-xl bg-charcoal border border-charcoal-border">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h4 className="text-sm font-semibold text-ivory">Registered Collector Pledges ({pledgesList.length})</h4>
                  <p className="text-xs text-ivory/50">Details include quantity requested per buyer, allocation preferences, and status.</p>
                </div>
              </div>

              {pledgesList.length === 0 ? (
                <div className="py-12 text-center text-ivory/40 text-xs">
                  No collector pledges registered yet. They will appear here immediately upon submission.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-charcoal-border text-ivory/50 uppercase">
                      <tr>
                        <th className="py-2.5">Collector</th>
                        <th className="py-2.5">Quantity Requested</th>
                        <th className="py-2.5">Associated Concept</th>
                        <th className="py-2.5">Preferred Number</th>
                        <th className="py-2.5">Tier</th>
                        <th className="py-2.5">Status</th>
                        <th className="py-2.5">Date</th>
                        <th className="py-2.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-charcoal-border/50 text-ivory/80">
                      {pledgesList.map((pledge: any) => (
                        <tr key={pledge.pledge_id || pledge.id} className="hover:bg-ink-soft/40 transition-colors">
                          <td className="py-3 font-medium text-ivory">{pledge.user_email}</td>
                          <td className="py-3">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded bg-wine/30 text-gold border border-gold/30 font-bold text-xs">
                              {pledge.bottle_count || 1} { (pledge.bottle_count || 1) === 1 ? 'Bottle' : 'Bottles' }
                            </span>
                          </td>
                          <td className="py-3">
                            {pledge.associated_design_code ? (
                              <span className="text-gold font-medium">{pledge.associated_design_code}</span>
                            ) : (
                              <span className="text-ivory/40 italic">None</span>
                            )}
                          </td>
                          <td className="py-3 font-mono">
                            {pledge.preferred_number ? `#${pledge.preferred_number}` : <span className="text-ivory/40">Any</span>}
                          </td>
                          <td className="py-3">
                            <span className="text-[11px] text-ivory/70 capitalize">
                              {(pledge.interest_tier || '').replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="py-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-semibold tracking-wider ${
                              pledge.status === 'active' 
                                ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/40' 
                                : 'bg-charcoal text-ivory/40 border border-white/10'
                            }`}>
                              {pledge.status}
                            </span>
                          </td>
                          <td className="py-3 text-ivory/40 font-mono text-[11px]">
                            {formatDate(pledge.pledged_at || pledge.created_at)}
                          </td>
                          <td className="py-3 text-right">
                            <button
                              onClick={() => handleResetVote(pledge.user_email)}
                              className="px-2.5 py-1 rounded bg-wine/20 hover:bg-wine text-wine-light hover:text-white border border-wine/40 text-[10px] font-semibold tracking-wider uppercase transition-colors"
                              title="Reset this user's vote and pledge so they can vote again"
                            >
                              Reset Vote
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="p-6 rounded-xl bg-charcoal border border-charcoal-border text-center space-y-2">
              <Users className="w-8 h-8 text-gold mx-auto" />
              <h4 className="font-serif text-base text-ivory">Direct CRM Integration</h4>
              <p className="text-xs text-ivory/70 max-w-lg mx-auto">
                All buyer emails, bottle counts (e.g. 5 bottles), preferred numbering, and consent timestamps can be exported above at any time for direct import into Manila Wine sales channels.
              </p>
            </div>
          </div>
        )}

        {/* TAB 5: INVITATIONS */}
        {activeTab === 'invitations' && (
          <div className="space-y-6">
            <div>
              <h3 className="font-serif text-xl text-ivory">VIP Invitation Management</h3>
              <p className="text-xs text-ivory/60">
                Import emails of previous Johnnie Walker Blue edition buyers to grant exclusive access when campaign is in &apos;invite_only&apos; mode.
              </p>
            </div>

            <form onSubmit={handleImportInvitations} className="p-6 rounded-xl bg-charcoal border border-charcoal-border space-y-4">
              <h4 className="text-sm font-semibold text-gold uppercase tracking-wider">Bulk Import VIP Emails</h4>
              <textarea
                rows={4}
                value={importEmailsText}
                onChange={(e) => setImportEmailsText(e.target.value)}
                placeholder="vipbuyer1@example.com&#10;vipbuyer2@example.com"
                className="w-full px-3.5 py-2.5 bg-ink rounded border border-charcoal-border focus:border-gold text-xs text-ivory"
              />

              {importResult && (
                <div className="p-3 rounded bg-ink border border-charcoal-border text-xs text-ivory/80">
                  Import result: <strong>{importResult.imported} added</strong>, {importResult.duplicates} duplicates skipped, {importResult.invalid} invalid.
                </div>
              )}

              <button
                type="submit"
                className="px-6 py-2.5 rounded bg-wine hover:bg-wine-light text-white text-xs font-semibold tracking-wider uppercase transition-colors"
              >
                Import VIP List
              </button>
            </form>

            <div className="p-6 rounded-xl bg-charcoal border border-charcoal-border">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-sm font-semibold text-ivory">Active VIP Invitations ({invitations.length})</h4>
                <a
                  href="/api/admin/export?type=invitations"
                  className="text-xs text-gold hover:underline inline-flex items-center gap-1"
                >
                  <Download className="w-3 h-3" />
                  Export Invitation Status CSV
                </a>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-charcoal-border text-ivory/50 uppercase">
                    <tr>
                      <th className="py-2">Email</th>
                      <th className="py-2">Reference Code</th>
                      <th className="py-2">Status</th>
                      <th className="py-2">Sent Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-charcoal-border/50 text-ivory/80">
                    {invitations.map((inv) => (
                      <tr key={inv.id}>
                        <td className="py-2.5">{inv.email_normalized}</td>
                        <td className="py-2.5 font-mono text-gold">{inv.reference_code}</td>
                        <td className="py-2.5">
                          <span className="px-2 py-0.5 rounded bg-ink border border-white/10 text-[10px] uppercase">
                            {inv.status}
                          </span>
                        </td>
                        <td className="py-2.5 text-ivory/40">{formatDate(inv.sent_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: AUDIT LOG */}
        {activeTab === 'audit' && (
          <div className="space-y-4">
            <h3 className="font-serif text-xl text-ivory">Immutable Administrative Audit Trail</h3>
            <p className="text-xs text-ivory/60">
              Complete chronological audit trail recording changes to campaign status, deadlines, prices, artwork edits, and CSV exports.
            </p>

            <div className="p-6 rounded-xl bg-charcoal border border-charcoal-border overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-charcoal-border text-ivory/50 uppercase">
                  <tr>
                    <th className="py-2">Timestamp (UTC)</th>
                    <th className="py-2">Actor</th>
                    <th className="py-2">Action</th>
                    <th className="py-2">Entity</th>
                    <th className="py-2">Reason / Summary</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-charcoal-border/50 text-ivory/80">
                  {auditLogs.map((log) => (
                    <tr key={log.id}>
                      <td className="py-2.5 font-mono text-[11px] text-ivory/50">{formatDate(log.created_at)}</td>
                      <td className="py-2.5 font-medium text-gold">{log.actor_email}</td>
                      <td className="py-2.5 uppercase font-mono text-[10px]">{log.action}</td>
                      <td className="py-2.5 text-ivory/70">{log.entity_type} ({log.entity_id?.slice(0, 8)})</td>
                      <td className="py-2.5 text-ivory/60">{log.reason || 'Admin modification'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
