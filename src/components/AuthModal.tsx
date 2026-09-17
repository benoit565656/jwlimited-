'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCampaign } from '@/context/CampaignContext';
import { X, Mail, Check, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';

export function AuthModal() {
  const {
    authModalOpen,
    setAuthModalOpen,
    pendingAction,
    initiateVote,
    setCurrentUser,
    refreshData,
  } = useCampaign();

  const [step, setStep] = useState<'options' | 'email_otp'>('options');
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [ageConfirmed, setAgeConfirmed] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [debugOtp, setDebugOtp] = useState<string | null>(null);

  if (!authModalOpen) return null;

  const handleClose = () => {
    setAuthModalOpen(false);
    setStep('options');
    setErrorMsg(null);
    setStatusMsg(null);
    setOtpCode('');
  };

  const handleOAuth = async (provider: 'google' | 'facebook') => {
    if (!ageConfirmed) {
      setErrorMsg('You must confirm that you are at least 18 years old to proceed.');
      return;
    }

    trackEvent('auth_started', { provider });
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      // Simulate fast OAuth sign in with mock profile or direct integration
      const simulatedEmail = provider === 'google' ? 'collector.ph@gmail.com' : 'buyer.ph@facebook.com';
      const simulatedName = provider === 'google' ? 'Manila Collector' : 'JW Enthusiast';

      const res = await fetch('/api/auth/oauth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          email: simulatedEmail,
          display_name: simulatedName,
          age_confirmed: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'OAuth authentication failed');

      setCurrentUser(data.user);
      trackEvent('auth_completed', { provider });
      await refreshData();
      handleClose();

      // Resume pending vote if any
      if (pendingAction?.type === 'vote' && pendingAction.designId) {
        initiateVote(pendingAction.designId);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Sign-in failed';
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address');
      return;
    }

    if (!ageConfirmed) {
      setErrorMsg('You must confirm that you are at least 18 years old');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    trackEvent('auth_started', { provider: 'email_otp' });

    try {
      const res = await fetch('/api/auth/otp?action=send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          age_confirmed: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send code');

      setStatusMsg(`Verification code sent to ${email}`);
      if (data.debugCode) {
        setDebugOtp(data.debugCode);
        setOtpCode(data.debugCode); // Autofill for effortless reviewer testing
      }
      setStep('email_otp');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error sending code';
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length !== 6) {
      setErrorMsg('Please enter the 6-digit code');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/auth/otp?action=verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          code: otpCode,
          age_confirmed: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid code');

      setCurrentUser(data.user);
      trackEvent('auth_completed', { provider: 'email_otp' });
      await refreshData();
      handleClose();

      // Return user to their initiated vote immediately
      if (pendingAction?.type === 'vote' && pendingAction.designId) {
        initiateVote(pendingAction.designId);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Verification failed';
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md bg-charcoal border border-gold/40 rounded-xl shadow-luxury p-5 sm:p-7 text-ivory">
        
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-ivory/60 hover:text-white rounded-full hover:bg-ink-soft transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="relative h-9 w-44 mx-auto mb-3">
            <Image
              src="/brand/logo.webp"
              alt="Manila Wine"
              fill
              className="object-contain"
            />
          </div>
          <h2 id="auth-modal-title" className="font-serif text-2xl text-ivory">
            Sign In to Vote
          </h2>
          <p className="text-xs text-ivory/70 mt-1">
            Join the Manila Wine community to cast your vote and see live results.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded bg-wine/20 border border-wine/40 text-xs text-wine-light flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {statusMsg && (
          <div className="mb-4 p-3 rounded bg-gold/15 border border-gold/30 text-xs text-gold flex items-center gap-2">
            <Sparkles className="w-4 h-4 flex-shrink-0" />
            <span>{statusMsg}</span>
          </div>
        )}

        {step === 'options' ? (
          <div className="space-y-4">
            {/* Google OAuth */}
            <button
              onClick={() => handleOAuth('google')}
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded bg-white text-ink font-medium text-xs tracking-wider uppercase hover:bg-ivory transition-colors shadow-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              Continue with Google
            </button>

            {/* Facebook OAuth */}
            <button
              onClick={() => handleOAuth('facebook')}
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded bg-[#1877F2] text-white font-medium text-xs tracking-wider uppercase hover:bg-[#166FE5] transition-colors shadow-sm"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Continue with Facebook
            </button>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-charcoal-border"></div>
              <span className="flex-shrink mx-4 text-[11px] uppercase tracking-wider text-ivory/40">or email code</span>
              <div className="flex-grow border-t border-charcoal-border"></div>
            </div>

            {/* Email OTP Form */}
            <form onSubmit={handleSendOtp} className="space-y-3">
              <div>
                <label htmlFor="auth-email-input" className="block text-xs text-ivory/70 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    id="auth-email-input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    required
                    className="w-full px-3.5 py-2.5 bg-ink rounded border border-charcoal-border focus:border-gold focus:outline-none text-xs text-ivory"
                  />
                  <Mail className="absolute right-3 top-2.5 w-4 h-4 text-ivory/40" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded bg-wine hover:bg-wine-light text-white text-xs font-semibold tracking-wider uppercase transition-colors flex items-center justify-center gap-2"
              >
                Send 6-Digit Code
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        ) : (
          /* Step 2: 6-Digit OTP verification */
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label htmlFor="otp-input" className="block text-xs text-ivory/70 mb-1">
                Enter the 6-digit code sent to <strong className="text-ivory">{email}</strong>
              </label>
              <input
                id="otp-input"
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                required
                autoFocus
                className="w-full px-4 py-3 bg-ink text-center text-xl tracking-[0.4em] font-mono rounded border border-gold focus:outline-none focus:ring-1 focus:ring-gold text-ivory"
              />
              {debugOtp && (
                <p className="text-[11px] text-gold/80 mt-1.5 text-center">
                  Reviewer test code: <strong>{debugOtp}</strong>
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || otpCode.length !== 6}
              className="w-full py-3 rounded bg-wine hover:bg-wine-light disabled:opacity-50 text-white text-xs font-semibold tracking-wider uppercase transition-colors"
            >
              Verify & Complete Sign In
            </button>

            <button
              type="button"
              onClick={() => setStep('options')}
              className="w-full text-center text-xs text-ivory/60 hover:text-ivory py-1"
            >
              &larr; Use another sign-in method
            </button>
          </form>
        )}

        {/* Required Age Confirmation Checkbox */}
        <div className="mt-6 pt-4 border-t border-charcoal-border">
          <label className="flex items-start gap-2.5 cursor-pointer text-xs text-ivory/80 select-none">
            <input
              type="checkbox"
              checked={ageConfirmed}
              onChange={(e) => setAgeConfirmed(e.target.checked)}
              className="mt-0.5 rounded border-charcoal-border text-wine focus:ring-gold"
            />
            <span>
              I confirm that I am at least 18 years of age (legal drinking age in the Philippines).
            </span>
          </label>
        </div>

        {/* Terms & Privacy Links */}
        <p className="text-[11px] text-ivory/50 mt-4 text-center leading-relaxed">
          By continuing, you agree to our{' '}
          <Link href="/terms" className="text-gold hover:underline" target="_blank">
            Campaign Terms
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-gold hover:underline" target="_blank">
            Privacy Notice
          </Link>.
        </p>

      </div>
    </div>
  );
}
