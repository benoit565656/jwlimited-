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
  Shield,
  Send,
  Sparkles,
  Smartphone,
  Monitor,
  CheckCircle2,
  AlertCircle,
  Upload,
  Play,
  FileText,
  Plus,
  X
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

  // Admin login credentials state
  const [adminUsername, setAdminUsername] = useState('admin');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState<string | null>(null);
  const [isSubmittingLogin, setIsSubmittingLogin] = useState(false);

  // Settings form state
  const [settingsForm, setSettingsForm] = useState<Partial<Campaign>>({});
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Design edit & creation states
  const [editingDesign, setEditingDesign] = useState<Design | null>(null);
  const [isUploadingEditImage, setIsUploadingEditImage] = useState(false);
  const [isAddingConcept, setIsAddingConcept] = useState(false);
  const [isSubmittingConcept, setIsSubmittingConcept] = useState(false);
  const [conceptImageFile, setConceptImageFile] = useState<File | null>(null);
  const [conceptImagePreview, setConceptImagePreview] = useState<string | null>(null);
  const [newConceptForm, setNewConceptForm] = useState({
    code: '',
    title: '',
    subtitle: '',
    description: '',
    alt_text: '',
    image_url: '',
  });

  // Invitations import state
  const [importEmailsText, setImportEmailsText] = useState('');
  const [importResult, setImportResult] = useState<any>(null);

  // Brevo Studio State
  const [brevoStatus, setBrevoStatus] = useState<any>(null);
  const [brevoConfig, setBrevoConfig] = useState<any>(null);
  const [isCheckingBrevo, setIsCheckingBrevo] = useState(false);
  const [brevoApiKey, setBrevoApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [brevoSubject, setBrevoSubject] = useState('Exclusive Invitation: Shape the 100-Bottle Johnnie Walker Philippines Edition');
  const [brevoHeadline, setBrevoHeadline] = useState('Exclusive Private Invitation');
  const [brevoPreviewText, setBrevoPreviewText] = useState('Cast your decisive vote for the official 100-bottle Philippines Edition and reserve your numbered bottle.');
  const [brevoCtaText, setBrevoCtaText] = useState('EXPLORE ALL 15 DESIGNS & CAST YOUR VOTE');
  const [brevoTestEmail, setBrevoTestEmail] = useState('contact@manila-wine.com');
  const [brevoBlastEmails, setBrevoBlastEmails] = useState('');
  const [brevoCampaignName, setBrevoCampaignName] = useState('JW Philippines 100-Bottle Collector Invitation');
  const [brevoCreateList, setBrevoCreateList] = useState(true);

  const [brevoSendingTest, setBrevoSendingTest] = useState(false);
  const [brevoTestMessage, setBrevoTestMessage] = useState<{ success: boolean; text: string } | null>(null);
  const [brevoInjecting, setBrevoInjecting] = useState(false);
  const [brevoInjectMessage, setBrevoInjectMessage] = useState<{ success: boolean; text: string } | null>(null);
  const [brevoBlasting, setBrevoBlasting] = useState(false);
  const [brevoBlastResult, setBrevoBlastResult] = useState<any>(null);
  const [previewViewport, setPreviewViewport] = useState<'desktop' | 'mobile'>('desktop');

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

  const handleEditImageUpload = async (file: File) => {
    if (!editingDesign) return;
    setIsUploadingEditImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('design_id', editingDesign.id);
      formData.append('code', editingDesign.code);

      const res = await fetch('/api/admin/designs/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      setEditingDesign((prev) => prev ? {
        ...prev,
        thumbnail_path: data.thumbnail_path,
        full_image_path: data.full_image_path,
        original_image_path: data.original_image_path,
      } : null);

      fetchAdminData();
    } catch (err: any) {
      alert(`Image upload failed: ${err.message}`);
    } finally {
      setIsUploadingEditImage(false);
    }
  };

  const handleNewConceptFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setConceptImageFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setConceptImagePreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCreateConcept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaign) return;
    if (!newConceptForm.title.trim()) {
      alert('Please enter a concept title.');
      return;
    }

    setIsSubmittingConcept(true);
    try {
      let imagePaths = {
        thumbnail_path: newConceptForm.image_url.trim() || '/concepts/thumbs/concept-01.webp',
        full_image_path: newConceptForm.image_url.trim() || '/concepts/full/concept-01.webp',
        original_image_path: newConceptForm.image_url.trim() || '/concepts/original/concept-01.png',
      };

      if (conceptImageFile) {
        const formData = new FormData();
        formData.append('file', conceptImageFile);
        formData.append('code', newConceptForm.code || 'concept');

        const uploadRes = await fetch('/api/admin/designs/upload', {
          method: 'POST',
          body: formData,
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.error || 'Image upload failed');
        imagePaths = {
          thumbnail_path: uploadData.thumbnail_path,
          full_image_path: uploadData.full_image_path,
          original_image_path: uploadData.original_image_path,
        };
      }

      const res = await fetch('/api/admin/designs?action=create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaign_id: campaign.id,
          code: newConceptForm.code.trim() || undefined,
          title: newConceptForm.title.trim(),
          subtitle: newConceptForm.subtitle.trim() || null,
          description: newConceptForm.description.trim(),
          alt_text: newConceptForm.alt_text.trim() || undefined,
          ...imagePaths,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create concept');

      setIsAddingConcept(false);
      setConceptImageFile(null);
      setConceptImagePreview(null);
      fetchAdminData();
      alert(`Concept "${data.design.code}" added successfully!`);
    } catch (err: any) {
      alert(`Error creating concept: ${err.message}`);
    } finally {
      setIsSubmittingConcept(false);
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

  const fetchBrevoStatus = useCallback(async (customKey?: string) => {
    setIsCheckingBrevo(true);
    try {
      const storedKey = typeof window !== 'undefined' ? (localStorage.getItem('mw_brevo_api_key') || '') : '';
      const keyToUse = customKey !== undefined ? customKey : (brevoApiKey || storedKey);
      if (keyToUse && !brevoApiKey) {
        setBrevoApiKey(keyToUse);
      }
      const queryParam = keyToUse ? `?apiKey=${encodeURIComponent(keyToUse)}` : '';
      const res = await fetch(`/api/admin/brevo${queryParam}`);
      const data = await res.json();
      if (res.ok) {
        setBrevoStatus(data.status);
        setBrevoConfig(data.config);
      }
    } catch (err) {
      console.error('Failed to check Brevo status:', err);
    } finally {
      setIsCheckingBrevo(false);
    }
  }, [brevoApiKey]);

  useEffect(() => {
    if (activeTab === 'invitations') {
      fetchBrevoStatus();
    }
  }, [activeTab, fetchBrevoStatus]);

  // Client-side email parsing and deduplication
  const parsedRecipients = React.useMemo(() => {
    if (!brevoBlastEmails.trim()) return { valid: [], invalid: [], total: 0, duplicatesCount: 0 };
    const tokens = brevoBlastEmails
      .split(/[\r\n,;\t ]+/)
      .map(t => t.trim().replace(/^["']|["']$/g, ''))
      .filter(Boolean);

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const seen = new Set<string>();
    const valid: string[] = [];
    const invalid: string[] = [];
    let duplicatesCount = 0;

    for (const token of tokens) {
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
    return { valid, invalid, total: tokens.length, duplicatesCount };
  }, [brevoBlastEmails]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setBrevoBlastEmails(prev => prev ? `${prev}\n${content}` : content);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleSendBrevoTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brevoTestEmail.trim()) {
      alert('Please enter a destination email for the test.');
      return;
    }
    setBrevoSendingTest(true);
    setBrevoTestMessage(null);
    try {
      const res = await fetch('/api/admin/brevo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send-test',
          toEmail: brevoTestEmail.trim(),
          subject: `[TEST PREVIEW] ${brevoSubject}`,
          apiKey: brevoApiKey || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setBrevoTestMessage({
          success: true,
          text: `Test email successfully delivered to ${brevoTestEmail}! (Message ID: ${data.messageId})`,
        });
      } else {
        setBrevoTestMessage({
          success: false,
          text: data.error || data.message || 'Failed to dispatch test email through Brevo.',
        });
      }
    } catch (err: any) {
      setBrevoTestMessage({ success: false, text: err.message || 'Network error.' });
    } finally {
      setBrevoSendingTest(false);
    }
  };

  const handleInjectTemplate = async () => {
    setBrevoInjecting(true);
    setBrevoInjectMessage(null);
    try {
      const res = await fetch('/api/admin/brevo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'inject-template',
          subject: brevoSubject,
          templateName: 'Manila Wine - JW Collector\'s Choice VIP Invitation',
          apiKey: brevoApiKey || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setBrevoInjectMessage({
          success: true,
          text: data.message || 'Template created/updated in your Brevo account!',
        });
      } else {
        setBrevoInjectMessage({
          success: false,
          text: data.message || data.error || 'Failed to inject template into Brevo.',
        });
      }
    } catch (err: any) {
      setBrevoInjectMessage({ success: false, text: err.message || 'Network error.' });
    } finally {
      setBrevoInjecting(false);
    }
  };

  const handleLaunchBlast = async () => {
    if (parsedRecipients.valid.length === 0) {
      alert('Please provide at least 1 valid email address to blast.');
      return;
    }

    const confirmed = window.confirm(
      `CONFIRM EMAIL CAMPAIGN BLAST:\n\n` +
      `You are about to blast this email to ${parsedRecipients.valid.length} VIP collectors.\n` +
      `Sender: MANILA WINE <contact@manila-wine.com>\n` +
      `Subject: ${brevoSubject}\n\n` +
      `Do you want to proceed with sending now?`
    );

    if (!confirmed) return;

    setBrevoBlasting(true);
    setBrevoBlastResult(null);

    try {
      const res = await fetch('/api/admin/brevo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'launch-blast',
          emails: parsedRecipients.valid,
          subject: brevoSubject,
          campaignName: brevoCampaignName,
          createBrevoList: brevoCreateList,
          apiKey: brevoApiKey || undefined,
        }),
      });
      const data = await res.json();
      setBrevoBlastResult(data);
      if (data.success) {
        fetchAdminData();
      }
    } catch (err: any) {
      setBrevoBlastResult({
        success: false,
        sentCount: 0,
        failedCount: parsedRecipients.valid.length,
        errors: [err.message || 'Network failure during blast execution'],
      });
    } finally {
      setBrevoBlasting(false);
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingLogin(true);
    setAdminError(null);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: adminUsername,
          password: adminPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }
      setIsAdminAuthenticated(true);
      await fetchAdminData();
    } catch (err: any) {
      setAdminError(err.message || 'Invalid administrator credentials');
    } finally {
      setIsSubmittingLogin(false);
    }
  };

  // If not logged in as Admin, show administrator username & password sign-in
  if (!isLoading && !isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-charcoal border border-gold/40 rounded-xl p-8 text-ivory shadow-luxury">
          <div className="text-center mb-6">
            <div className="relative h-10 w-44 mx-auto mb-4">
              <Image
                src="/brand/logo.webp"
                alt="Manila Wine"
                fill
                className="object-contain"
                priority
              />
            </div>
            <h2 className="font-serif text-2xl text-ivory mb-1">Manila Wine Admin Portal</h2>
            <p className="text-xs text-ivory/60">
              Sign in with administrator credentials
            </p>
          </div>

          {adminError && (
            <div className="mb-4 p-3 rounded bg-wine/20 border border-wine/40 text-xs text-wine-light flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{adminError}</span>
            </div>
          )}

          <form onSubmit={handlePasswordLogin} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-ivory/70 mb-1.5 font-medium">
                Username
              </label>
              <input
                type="text"
                value={adminUsername}
                onChange={(e) => setAdminUsername(e.target.value)}
                placeholder="admin"
                required
                className="w-full px-3.5 py-2.5 bg-ink rounded border border-charcoal-border focus:border-gold text-xs text-ivory placeholder-ivory/30 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-ivory/70 mb-1.5 font-medium">
                Password
              </label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Enter admin password"
                required
                autoFocus
                className="w-full px-3.5 py-2.5 bg-ink rounded border border-charcoal-border focus:border-gold text-xs text-ivory placeholder-ivory/30 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmittingLogin}
              className="w-full py-3 rounded bg-wine hover:bg-wine-light text-white font-semibold text-xs tracking-wider uppercase shadow-wine-glow transition-all duration-200"
            >
              {isSubmittingLogin ? 'Authenticating...' : 'Sign In as Administrator'}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-charcoal-border text-center">
            <Link
              href="/"
              className="inline-block text-xs text-ivory/60 hover:text-gold transition-colors"
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
            { id: 'invitations', label: 'Email Campaigns (Brevo)', icon: Mail },
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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="font-serif text-xl text-ivory">Concept Design Management</h3>
                <p className="text-xs text-ivory/60">
                  Manage all campaign bottle artworks, replace images, rename, update descriptions, add new concepts, or designate the winner.
                </p>
              </div>
              <button
                onClick={() => {
                  const nextNum = (designs.length || 0) + 1;
                  const codeStr = `Concept ${String(nextNum).padStart(2, '0')}`;
                  setNewConceptForm({
                    code: codeStr,
                    title: `${codeStr} — `,
                    subtitle: '',
                    description: '',
                    alt_text: `Four views of ${codeStr} Johnnie Walker Blue Label bottle artwork`,
                    image_url: '',
                  });
                  setConceptImageFile(null);
                  setConceptImagePreview(null);
                  setIsAddingConcept(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gold hover:bg-gold-light text-ink font-semibold text-xs tracking-wider uppercase shadow-gold-subtle transition-all"
              >
                <Plus className="w-4 h-4" />
                Add New Concept
              </button>
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
                      <div className="relative aspect-[3/2] w-full rounded bg-ink-deep mb-3 overflow-hidden group/img">
                        <Image
                          src={design.thumbnail_path}
                          alt={design.alt_text}
                          fill
                          className="object-contain p-2"
                          unoptimized={Boolean(design.thumbnail_path?.startsWith('data:') || design.thumbnail_path?.startsWith('http'))}
                        />
                        {isWinner && (
                          <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-gold text-ink font-bold text-[10px] tracking-wider uppercase z-20">
                            Winning Design
                          </div>
                        )}
                        <label className="absolute inset-0 bg-black/70 opacity-0 group-hover/img:opacity-100 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-opacity z-10 p-2 text-center">
                          <Upload className="w-5 h-5 text-gold" />
                          <span className="text-xs text-ivory font-medium">Click to Change Image</span>
                          <span className="text-[10px] text-ivory/60">Auto-converts to WebP</span>
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const formData = new FormData();
                              formData.append('file', file);
                              formData.append('design_id', design.id);
                              formData.append('code', design.code);
                              try {
                                const res = await fetch('/api/admin/designs/upload', {
                                  method: 'POST',
                                  body: formData,
                                });
                                const data = await res.json();
                                if (!res.ok) throw new Error(data.error || 'Failed to upload image');
                                fetchAdminData();
                                alert(`Image updated for ${design.code}!`);
                              } catch (err: any) {
                                alert(`Upload failed: ${err.message}`);
                              }
                            }}
                          />
                        </label>
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
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
                <form onSubmit={handleUpdateDesign} className="w-full max-w-lg bg-charcoal border border-gold/40 rounded-xl p-6 text-ivory space-y-4 my-8 shadow-2xl">
                  <div className="flex items-center justify-between pb-3 border-b border-charcoal-border">
                    <h3 className="font-serif text-xl text-ivory">Edit {editingDesign.code}</h3>
                    <button
                      type="button"
                      onClick={() => setEditingDesign(null)}
                      className="text-ivory/40 hover:text-white"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Artwork Image Replacement Section */}
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-ivory/60 mb-1.5">Artwork Image</label>
                    <div className="flex items-center gap-4 p-3 bg-ink rounded border border-charcoal-border">
                      <div className="relative w-20 h-20 rounded bg-ink-deep border border-charcoal-border overflow-hidden flex-shrink-0">
                        <Image
                          src={editingDesign.thumbnail_path || editingDesign.full_image_path}
                          alt={editingDesign.title}
                          fill
                          className="object-contain p-1"
                          unoptimized={Boolean((editingDesign.thumbnail_path || editingDesign.full_image_path)?.startsWith('data:') || (editingDesign.thumbnail_path || editingDesign.full_image_path)?.startsWith('http'))}
                        />
                      </div>
                      <div className="flex-1 min-w-0 space-y-2">
                        <p className="text-xs text-ivory/80 font-mono truncate">{editingDesign.thumbnail_path}</p>
                        <div className="flex items-center gap-2">
                          <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-charcoal hover:bg-ink-soft border border-charcoal-border text-xs text-gold hover:border-gold transition-colors">
                            <Upload className="w-3.5 h-3.5" />
                            {isUploadingEditImage ? 'Processing WebP...' : 'Upload / Replace Image'}
                            <input
                              type="file"
                              accept="image/png,image/jpeg,image/webp"
                              disabled={isUploadingEditImage}
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleEditImageUpload(file);
                              }}
                            />
                          </label>
                          {isUploadingEditImage && (
                            <span className="text-[11px] text-gold animate-pulse">Generating WebP & thumbs...</span>
                          )}
                        </div>
                        <div>
                          <input
                            type="text"
                            placeholder="Or paste direct Image URL (https://...)"
                            value={editingDesign.thumbnail_path?.startsWith('data:') ? '' : (editingDesign.thumbnail_path || '')}
                            onChange={(e) => {
                              const url = e.target.value.trim();
                              setEditingDesign({
                                ...editingDesign,
                                thumbnail_path: url,
                                full_image_path: url,
                                original_image_path: url,
                              });
                            }}
                            className="w-full px-2.5 py-1.5 bg-charcoal rounded border border-charcoal-border text-[11px] text-ivory placeholder:text-ivory/30 focus:border-gold outline-none"
                          />
                        </div>
                        <p className="text-[10px] text-ivory/40">Accepts PNG, JPG, WEBP upload, or any direct image URL.</p>
                      </div>
                    </div>
                  </div>

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

            {/* Add New Concept Modal */}
            {isAddingConcept && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
                <form onSubmit={handleCreateConcept} className="w-full max-w-xl bg-charcoal border border-gold/50 rounded-xl p-6 text-ivory space-y-4 my-8 shadow-2xl">
                  <div className="flex items-center justify-between pb-3 border-b border-charcoal-border">
                    <div>
                      <h3 className="font-serif text-xl text-gold">Add New Concept Artwork</h3>
                      <p className="text-xs text-ivory/60">Add a new bottle design to the Manila Wine Collector's Choice campaign.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsAddingConcept(false)}
                      className="p-1 rounded text-ivory/50 hover:text-white"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Image Upload Area */}
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-gold mb-1.5 font-semibold">
                      Bottle Artwork Image <span className="text-wine-light">*</span>
                    </label>
                    <div className="border-2 border-dashed border-charcoal-border hover:border-gold/60 rounded-xl p-4 bg-ink/50 text-center transition-colors">
                      {conceptImagePreview ? (
                        <div className="space-y-3">
                          <div className="relative aspect-[3/2] w-full max-w-xs mx-auto rounded-lg overflow-hidden bg-ink-deep border border-charcoal-border">
                            <img
                              src={conceptImagePreview}
                              alt="New Concept Preview"
                              className="w-full h-full object-contain p-2"
                            />
                          </div>
                          <div className="flex items-center justify-center gap-3">
                            <label className="cursor-pointer text-xs text-gold hover:underline">
                              Choose Different File
                              <input
                                type="file"
                                accept="image/png,image/jpeg,image/webp"
                                className="hidden"
                                onChange={handleNewConceptFileChange}
                              />
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                setConceptImageFile(null);
                                setConceptImagePreview(null);
                              }}
                              className="text-xs text-ivory/40 hover:text-wine-light"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label className="cursor-pointer flex flex-col items-center justify-center py-6 gap-2">
                          <div className="w-12 h-12 rounded-full bg-gold/10 text-gold flex items-center justify-center border border-gold/30">
                            <Upload className="w-6 h-6" />
                          </div>
                          <p className="text-xs text-ivory font-medium">Click to upload bottle artwork (PNG, JPG, WEBP)</p>
                          <p className="text-[11px] text-ivory/50">High-res 4-bottle render recommended (1536×1024 or higher)</p>
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            className="hidden"
                            onChange={handleNewConceptFileChange}
                          />
                        </label>
                      )}
                    </div>
                    <div className="mt-2 text-center text-ivory/40 text-[11px] font-medium">— OR PASTE DIRECT IMAGE URL —</div>
                    <div className="mt-1.5">
                      <input
                        type="text"
                        placeholder="Image URL (e.g. https://...)"
                        value={newConceptForm.image_url || ''}
                        onChange={(e) => {
                          const url = e.target.value.trim();
                          setNewConceptForm({ ...newConceptForm, image_url: url });
                          if (url.startsWith('http')) {
                            setConceptImagePreview(url);
                          }
                        }}
                        className="w-full px-3 py-2 bg-ink rounded border border-charcoal-border text-xs text-ivory placeholder:text-ivory/30 focus:border-gold outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-ivory/60 mb-1">Concept Code</label>
                      <input
                        type="text"
                        required
                        value={newConceptForm.code}
                        onChange={(e) => setNewConceptForm({ ...newConceptForm, code: e.target.value })}
                        className="w-full px-3 py-2 bg-ink rounded border border-charcoal-border text-xs text-ivory focus:border-gold outline-none"
                        placeholder="e.g. Concept 16"
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-ivory/60 mb-1">Subtitle / Craft Note</label>
                      <input
                        type="text"
                        value={newConceptForm.subtitle}
                        onChange={(e) => setNewConceptForm({ ...newConceptForm, subtitle: e.target.value })}
                        className="w-full px-3 py-2 bg-ink rounded border border-charcoal-border text-xs text-ivory focus:border-gold outline-none"
                        placeholder="e.g. Royal Pearls & Golden Filigree"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-ivory/60 mb-1">
                      Title <span className="text-wine-light">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={newConceptForm.title}
                      onChange={(e) => setNewConceptForm({ ...newConceptForm, title: e.target.value })}
                      className="w-full px-3 py-2 bg-ink rounded border border-charcoal-border text-xs text-ivory focus:border-gold outline-none"
                      placeholder="e.g. Concept 16 — Royal Maharlika"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-ivory/60 mb-1">Description</label>
                    <textarea
                      rows={3}
                      value={newConceptForm.description}
                      onChange={(e) => setNewConceptForm({ ...newConceptForm, description: e.target.value })}
                      className="w-full px-3 py-2 bg-ink rounded border border-charcoal-border text-xs text-ivory focus:border-gold outline-none"
                      placeholder="Describe the artwork inspiration, cultural motifs, materials, and significance..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-ivory/60 mb-1">Accessibility Alt Text</label>
                    <textarea
                      rows={2}
                      value={newConceptForm.alt_text}
                      onChange={(e) => setNewConceptForm({ ...newConceptForm, alt_text: e.target.value })}
                      className="w-full px-3 py-2 bg-ink rounded border border-charcoal-border text-xs text-ivory focus:border-gold outline-none"
                      placeholder="Visual description for screen readers and search engines..."
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-charcoal-border">
                    <button
                      type="button"
                      disabled={isSubmittingConcept}
                      onClick={() => setIsAddingConcept(false)}
                      className="px-4 py-2 rounded text-xs text-ivory/60 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingConcept}
                      className="px-5 py-2.5 rounded bg-gold hover:bg-gold-light text-ink font-semibold text-xs tracking-wider uppercase shadow-gold-subtle disabled:opacity-50 inline-flex items-center gap-2"
                    >
                      {isSubmittingConcept ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          Creating Concept...
                        </>
                      ) : (
                        'Publish Concept'
                      )}
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

        {/* TAB 5: BREVO EMAIL CAMPAIGNS & BLAST */}
        {activeTab === 'invitations' && (
          <div className="space-y-8">
            
            {/* Header & Subhead */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="font-serif text-2xl text-ivory flex items-center gap-2.5">
                  <Mail className="w-6 h-6 text-gold" />
                  Brevo Email Campaign Studio & Blast
                </h3>
                <p className="text-xs text-ivory/60 mt-1">
                  Design luxury HTML invitations, inject templates into your Brevo builder, preview across devices, and blast campaigns to collector lists.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => fetchBrevoStatus()}
                  disabled={isCheckingBrevo}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded bg-ink border border-charcoal-border hover:border-gold/60 text-xs text-ivory/80 hover:text-white transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-gold ${isCheckingBrevo ? 'animate-spin' : ''}`} />
                  {isCheckingBrevo ? 'Checking Brevo...' : 'Refresh Status'}
                </button>

                <button
                  type="button"
                  onClick={handleInjectTemplate}
                  disabled={brevoInjecting}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded bg-gold/15 hover:bg-gold/25 border border-gold/40 text-xs font-semibold text-gold transition-colors"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${brevoInjecting ? 'animate-spin' : ''}`} />
                  {brevoInjecting ? 'Injecting to Brevo...' : 'Inject Template to Brevo Builder'}
                </button>
              </div>
            </div>

            {/* Brevo Connection Status Banner */}
            <div className="p-5 rounded-xl bg-charcoal border border-charcoal-border space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    brevoStatus?.connected 
                      ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]' 
                      : brevoStatus?.isIpRestricted
                      ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                      : 'bg-rose-500'
                  }`} />
                  <div>
                    <h4 className="text-sm font-semibold text-ivory">
                      {brevoStatus?.connected ? (
                        <>Brevo Connected &bull; {brevoStatus.companyName || brevoStatus.accountEmail}</>
                      ) : brevoStatus?.isIpRestricted ? (
                        <>Brevo Security: IP Authorization Required</>
                      ) : (
                        <>Brevo Connection Pending</>
                      )}
                    </h4>
                    <p className="text-xs text-ivory/50">
                      {brevoStatus?.connected ? (
                        <>Plan: <strong className="text-ivory">{brevoStatus.planType}</strong> {brevoStatus.credits !== undefined ? `• Credits: ${brevoStatus.credits}` : ''}</>
                      ) : (
                        brevoStatus?.error || 'Checking API connectivity...'
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-ink border border-charcoal-border">
                    <span className="text-ivory/50">Sender:</span>
                    <strong className="text-ivory font-mono text-[11px]">{brevoConfig?.senderEmail || 'contact@manila-wine.com'}</strong>
                    {brevoStatus?.verifiedSender && (
                      <span className="text-emerald-400 ml-1 font-semibold flex items-center gap-0.5" title="Verified in Brevo with DKIM/DMARC">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* API Key Configuration Row */}
              <div className="pt-2 border-t border-charcoal-border/50 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-ivory/50">Brevo API Key:</span>
                  <span className="font-mono text-ivory/90 text-[11px] bg-ink px-2 py-0.5 rounded border border-charcoal-border">
                    {brevoConfig?.maskedKey || (brevoApiKey ? `${brevoApiKey.slice(0, 12)}...${brevoApiKey.slice(-6)}` : 'Not Set')}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowApiKeyInput(!showApiKeyInput)}
                    className="text-gold hover:underline text-[11px] ml-1 font-semibold"
                  >
                    {showApiKeyInput ? 'Close' : 'Configure / Change Key'}
                  </button>
                </div>
              </div>

              {/* Editable API Key Input */}
              {showApiKeyInput && (
                <div className="p-3 rounded-lg bg-ink border border-gold/40 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 text-xs animate-in fade-in duration-150">
                  <input
                    type="text"
                    value={brevoApiKey}
                    onChange={(e) => setBrevoApiKey(e.target.value)}
                    placeholder="Paste Brevo API key here..."
                    className="flex-1 px-3 py-1.5 bg-charcoal rounded border border-charcoal-border focus:border-gold text-ivory text-xs font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        localStorage.setItem('mw_brevo_api_key', brevoApiKey.trim());
                      }
                      setShowApiKeyInput(false);
                      fetchBrevoStatus(brevoApiKey.trim());
                    }}
                    className="px-4 py-1.5 rounded bg-gold text-ink font-semibold hover:bg-gold-light transition-colors whitespace-nowrap"
                  >
                    Save & Test Key
                  </button>
                </div>
              )}

              {/* IP Restriction Warning Box */}
              {brevoStatus?.isIpRestricted && (
                <div className="p-4 rounded-lg bg-amber-950/40 border border-amber-500/40 text-xs text-amber-200 space-y-2">
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h5 className="font-semibold text-amber-300 text-sm">Action Needed in Brevo: Deactivate IP Restrictions</h5>
                      <p className="text-ivory/80 mt-1 leading-relaxed">
                        Brevo blocked the API call because it came from a new IP ({brevoStatus.clientIp || 'cloud IP'}). 
                        Because Vercel and local networks use rotating IPs, please click below to open your Brevo settings and click 
                        <strong className="text-amber-300"> &ldquo;Deactivate for API keys&rdquo;</strong> (or authorize the IP).
                      </p>
                      <div className="mt-3 flex items-center gap-3">
                        <a
                          href={brevoStatus.authUrl || 'https://app.brevo.com/security/authorised_ips'}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-amber-500 text-ink font-semibold hover:bg-amber-400 transition-colors"
                        >
                          Open Brevo Authorized IPs Settings <ExternalLink className="w-3 h-3" />
                        </a>
                        <button
                          type="button"
                          onClick={() => fetchBrevoStatus()}
                          className="px-3 py-1.5 rounded bg-ink border border-amber-500/50 text-amber-200 hover:text-white transition-colors"
                        >
                          I Did It, Refresh Connection
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Template Injection Feedback */}
              {brevoInjectMessage && (
                <div className={`p-3 rounded text-xs flex items-center gap-2 ${
                  brevoInjectMessage.success ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800' : 'bg-rose-950/60 text-rose-300 border border-rose-800'
                }`}>
                  {brevoInjectMessage.success ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
                  <span>{brevoInjectMessage.text}</span>
                  {brevoInjectMessage.success && (
                    <a
                      href="https://app.brevo.com/templates"
                      target="_blank"
                      rel="noreferrer"
                      className="ml-auto underline text-emerald-200 hover:text-white"
                    >
                      View in Brevo Templates ↗
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Studio Workspace: 2-Column Split */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* LEFT COLUMN: Controls, Customizer, Test Send & Blast (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* 1. Email Content & Copy Customizer */}
                <div className="p-6 rounded-xl bg-charcoal border border-charcoal-border space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-gold uppercase tracking-wider flex items-center gap-2">
                      <FileText className="w-4 h-4" /> 1. Campaign Content & Subject
                    </h4>
                    <span className="text-[11px] text-ivory/40">Real-time live sync</span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-ivory/70 mb-1 font-medium">Subject Line</label>
                      <input
                        type="text"
                        value={brevoSubject}
                        onChange={(e) => setBrevoSubject(e.target.value)}
                        placeholder="Subject line seen in collector inbox"
                        className="w-full px-3.5 py-2.5 bg-ink rounded border border-charcoal-border focus:border-gold text-ivory"
                      />
                    </div>

                    <div>
                      <label className="block text-ivory/70 mb-1 font-medium">Preheader Snippet (Inbox preview line)</label>
                      <input
                        type="text"
                        value={brevoPreviewText}
                        onChange={(e) => setBrevoPreviewText(e.target.value)}
                        placeholder="Short summary preview line"
                        className="w-full px-3.5 py-2 bg-ink rounded border border-charcoal-border focus:border-gold text-ivory/80"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-ivory/70 mb-1 font-medium">Hero Headline</label>
                        <input
                          type="text"
                          value={brevoHeadline}
                          onChange={(e) => setBrevoHeadline(e.target.value)}
                          placeholder="Exclusive Private Invitation"
                          className="w-full px-3.5 py-2 bg-ink rounded border border-charcoal-border focus:border-gold text-ivory"
                        />
                      </div>
                      <div>
                        <label className="block text-ivory/70 mb-1 font-medium">Primary CTA Button</label>
                        <input
                          type="text"
                          value={brevoCtaText}
                          onChange={(e) => setBrevoCtaText(e.target.value)}
                          placeholder="EXPLORE ALL 15 DESIGNS & CAST YOUR VOTE"
                          className="w-full px-3.5 py-2 bg-ink rounded border border-charcoal-border focus:border-gold text-ivory"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Instant Test Send */}
                <form onSubmit={handleSendBrevoTest} className="p-6 rounded-xl bg-charcoal border border-charcoal-border space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-gold uppercase tracking-wider flex items-center gap-2">
                      <Send className="w-4 h-4" /> 2. Instant Test Send
                    </h4>
                    <span className="text-[11px] text-ivory/40">Verify in your personal inbox first</span>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="email"
                      value={brevoTestEmail}
                      onChange={(e) => setBrevoTestEmail(e.target.value)}
                      placeholder="Enter your email to receive test"
                      required
                      className="flex-1 px-3.5 py-2.5 bg-ink rounded border border-charcoal-border focus:border-gold text-xs text-ivory"
                    />
                    <button
                      type="submit"
                      disabled={brevoSendingTest}
                      className="px-5 py-2.5 rounded bg-charcoal-border hover:bg-gold/20 hover:border-gold text-gold border border-gold/40 text-xs font-semibold tracking-wider uppercase transition-colors whitespace-nowrap flex items-center justify-center gap-2"
                    >
                      <Send className={`w-3.5 h-3.5 ${brevoSendingTest ? 'animate-pulse' : ''}`} />
                      {brevoSendingTest ? 'Sending Test...' : 'Send Test Email'}
                    </button>
                  </div>

                  {brevoTestMessage && (
                    <div className={`p-3 rounded text-xs flex items-center gap-2 ${
                      brevoTestMessage.success ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800' : 'bg-rose-950/60 text-rose-300 border border-rose-800'
                    }`}>
                      {brevoTestMessage.success ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
                      <span>{brevoTestMessage.text}</span>
                    </div>
                  )}
                </form>

                {/* 3. Recipient Audience & Blast Trigger */}
                <div className="p-6 rounded-xl bg-charcoal border border-charcoal-border space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-gold uppercase tracking-wider flex items-center gap-2">
                      <Users className="w-4 h-4" /> 3. VIP Collector Recipients & Blast
                    </h4>
                    <label className="cursor-pointer inline-flex items-center gap-1 px-2.5 py-1 rounded bg-ink border border-charcoal-border hover:border-gold text-[11px] text-gold transition-colors">
                      <Upload className="w-3 h-3" />
                      <span>Upload .csv / .txt</span>
                      <input
                        type="file"
                        accept=".csv,.txt"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <p className="text-xs text-ivory/60">
                    Paste your collector emails below (separated by newlines, commas, or semicolons) or upload a CSV file. Invalid syntax and duplicates are automatically cleaned.
                  </p>

                  <textarea
                    rows={5}
                    value={brevoBlastEmails}
                    onChange={(e) => setBrevoBlastEmails(e.target.value)}
                    placeholder={"vipbuyer1@example.com\nvipbuyer2@example.com\n\"VIP Client\" <client@domain.com>"}
                    className="w-full px-3.5 py-2.5 bg-ink rounded border border-charcoal-border focus:border-gold text-xs font-mono text-ivory"
                  />

                  {/* Real-time Email Stats Badge */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="px-2.5 py-1 rounded bg-ink border border-charcoal-border text-ivory/70">
                      Total Tokens: <strong className="text-ivory">{parsedRecipients.total}</strong>
                    </span>
                    <span className="px-2.5 py-1 rounded bg-emerald-950/60 border border-emerald-800 text-emerald-300">
                      Valid VIP Emails: <strong className="text-emerald-200">{parsedRecipients.valid.length}</strong>
                    </span>
                    {parsedRecipients.duplicatesCount > 0 && (
                      <span className="px-2.5 py-1 rounded bg-amber-950/60 border border-amber-800 text-amber-300">
                        Duplicates Removed: <strong className="text-amber-200">{parsedRecipients.duplicatesCount}</strong>
                      </span>
                    )}
                    {parsedRecipients.invalid.length > 0 && (
                      <span className="px-2.5 py-1 rounded bg-rose-950/60 border border-rose-800 text-rose-300" title={`Invalid: ${parsedRecipients.invalid.slice(0, 3).join(', ')}`}>
                        Invalid Skipped: <strong className="text-rose-200">{parsedRecipients.invalid.length}</strong>
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-ivory/70 mb-1 text-xs">Campaign Reference Name</label>
                      <input
                        type="text"
                        value={brevoCampaignName}
                        onChange={(e) => setBrevoCampaignName(e.target.value)}
                        placeholder="Campaign name in Brevo"
                        className="w-full px-3 py-2 bg-ink rounded border border-charcoal-border focus:border-gold text-xs text-ivory"
                      />
                    </div>
                    <div className="flex items-center pt-5">
                      <label className="flex items-center gap-2 cursor-pointer text-xs text-ivory/80">
                        <input
                          type="checkbox"
                          checked={brevoCreateList}
                          onChange={(e) => setBrevoCreateList(e.target.checked)}
                          className="w-4 h-4 rounded border-charcoal-border text-gold focus:ring-gold bg-ink"
                        />
                        <span>Sync audience to Brevo Contact List</span>
                      </label>
                    </div>
                  </div>

                  {/* Big Blast Trigger Button */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleLaunchBlast}
                      disabled={brevoBlasting || parsedRecipients.valid.length === 0}
                      className="w-full py-3.5 px-6 rounded-lg bg-gradient-to-r from-wine to-wine-light hover:from-wine-light hover:to-wine text-white font-serif tracking-wider uppercase text-sm font-semibold shadow-luxury disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                    >
                      <Play className={`w-4 h-4 text-gold ${brevoBlasting ? 'animate-spin' : ''}`} />
                      {brevoBlasting
                        ? 'Blasting Campaign via Brevo API...'
                        : `Launch Email Blast to ${parsedRecipients.valid.length} Collectors`}
                    </button>
                  </div>

                  {/* Blast Results Banner */}
                  {brevoBlastResult && (
                    <div className={`p-4 rounded-xl border space-y-2 text-xs ${
                      brevoBlastResult.success
                        ? 'bg-emerald-950/40 border-emerald-700/60 text-emerald-200'
                        : 'bg-rose-950/40 border-rose-700/60 text-rose-200'
                    }`}>
                      <div className="flex items-center justify-between font-semibold text-sm">
                        <span>
                          {brevoBlastResult.success ? '🎉 Campaign Blast Completed!' : '⚠️ Blast Encountered Errors'}
                        </span>
                        <span>
                          {brevoBlastResult.sentCount} / {brevoBlastResult.totalRequested} Sent
                        </span>
                      </div>
                      <p className="text-ivory/80">
                        {brevoBlastResult.sentCount} emails were successfully accepted by Brevo for delivery.
                        {brevoBlastResult.failedCount > 0 && ` ${brevoBlastResult.failedCount} failed.`}
                      </p>
                      {brevoBlastResult.errors && brevoBlastResult.errors.length > 0 && (
                        <div className="pt-1">
                          <span className="font-semibold text-rose-300">Errors:</span>
                          <ul className="list-disc pl-4 space-y-0.5 text-rose-200 text-[11px] mt-1">
                            {brevoBlastResult.errors.map((err: string, i: number) => (
                              <li key={i}>{err}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>

              </div>

              {/* RIGHT COLUMN: Live Responsive Preview (5 cols) */}
              <div className="lg:col-span-5 space-y-4 sticky top-24">
                
                {/* Preview Header & Viewport Toggle */}
                <div className="flex items-center justify-between bg-charcoal p-3 rounded-xl border border-charcoal-border">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-gold" />
                    <span className="text-xs font-semibold text-ivory uppercase tracking-wider">Live Preview</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="bg-ink p-0.5 rounded border border-charcoal-border flex items-center">
                      <button
                        type="button"
                        onClick={() => setPreviewViewport('desktop')}
                        className={`px-2.5 py-1 rounded text-xs flex items-center gap-1.5 transition-colors ${
                          previewViewport === 'desktop' ? 'bg-gold/20 text-gold font-semibold' : 'text-ivory/50 hover:text-ivory'
                        }`}
                      >
                        <Monitor className="w-3.5 h-3.5" /> Desktop
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewViewport('mobile')}
                        className={`px-2.5 py-1 rounded text-xs flex items-center gap-1.5 transition-colors ${
                          previewViewport === 'mobile' ? 'bg-gold/20 text-gold font-semibold' : 'text-ivory/50 hover:text-ivory'
                        }`}
                      >
                        <Smartphone className="w-3.5 h-3.5" /> Mobile
                      </button>
                    </div>

                    <a
                      href={`/api/admin/brevo?format=html&subject=${encodeURIComponent(brevoSubject)}&headline=${encodeURIComponent(brevoHeadline)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded bg-ink border border-charcoal-border text-ivory/60 hover:text-gold transition-colors"
                      title="Open full email preview in new tab"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* Preview Frame Container */}
                <div className="flex justify-center bg-charcoal/40 p-4 rounded-xl border border-charcoal-border">
                  <div
                    className={`transition-all duration-300 overflow-hidden bg-ink shadow-2xl ${
                      previewViewport === 'mobile'
                        ? 'w-[375px] h-[680px] rounded-[36px] border-4 border-charcoal-border'
                        : 'w-full h-[680px] rounded-lg border border-charcoal-border'
                    }`}
                  >
                    <iframe
                      src={`/api/admin/brevo?format=html&subject=${encodeURIComponent(brevoSubject)}&headline=${encodeURIComponent(brevoHeadline)}&previewText=${encodeURIComponent(brevoPreviewText)}&ctaText=${encodeURIComponent(brevoCtaText)}`}
                      title="Brevo Email Preview"
                      className="w-full h-full border-0"
                    />
                  </div>
                </div>

                <div className="text-center text-[11px] text-ivory/40">
                  Rendered with inline responsive styles compatible with Gmail, Apple Mail, and Outlook.
                </div>
              </div>

            </div>

            {/* Existing Database Invitations Table (Collapsed Archive) */}
            <div className="p-6 rounded-xl bg-charcoal border border-charcoal-border space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-sm font-semibold text-ivory">Legacy Registered Invitations ({invitations.length})</h4>
                  <p className="text-xs text-ivory/50">Historical reference codes stored in local database.</p>
                </div>
                <a
                  href="/api/admin/export?type=invitations"
                  className="text-xs text-gold hover:underline inline-flex items-center gap-1"
                >
                  <Download className="w-3 h-3" />
                  Export CSV
                </a>
              </div>

              {invitations.length === 0 ? (
                <div className="py-6 text-center text-ivory/40 text-xs">
                  No legacy database invitation codes recorded.
                </div>
              ) : (
                <div className="overflow-x-auto max-h-60">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-charcoal-border text-ivory/50 uppercase sticky top-0 bg-charcoal">
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
              )}
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
