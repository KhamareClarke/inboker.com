'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Check, CreditCard, AlertCircle, Calendar, Zap } from 'lucide-react';
import { useAuth } from '@/lib/providers/auth-provider';
import { supabase } from '@/lib/supabase';
import { SUBSCRIPTION_PLANS, TRIAL_PERIOD_DAYS, SubscriptionPlan } from '@/lib/stripe-config';

async function syncBrowserSessionToCookies(): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!supabase) {
    return { ok: false, error: 'Authentication is not configured.' };
  }
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token || !session.refresh_token) {
    return { ok: false, error: 'No active session in this browser.' };
  }
  const res = await fetch('/api/auth/sync-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
    }),
  });
  const raw = await res.text();
  let body: { error?: string } = {};
  try { body = raw ? JSON.parse(raw) : {}; } catch { /* ignore */ }
  if (!res.ok) {
    return { ok: false, error: body.error || raw || `Session sync failed (${res.status})` };
  }
  return { ok: true };
}

export default function TrialSignupPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>('monthly');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  useEffect(() => {
    const plan = searchParams.get('plan') as SubscriptionPlan;
    if (plan && (plan === 'monthly' || plan === 'annually')) {
      setSelectedPlan(plan);
    }
  }, [searchParams]);

  useEffect(() => {
    if (authLoading || !user || !supabase) return;
    let cancelled = false;
    void (async () => {
      const result = await syncBrowserSessionToCookies();
      if (!cancelled && !result.ok) {
        console.warn('Trial page: background session sync failed', result.error);
      }
    })();
    return () => { cancelled = true; };
  }, [user, authLoading]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login?redirect=/signup/trial&message=Please log in to start your free trial');
    }
  }, [user, authLoading, router]);

  const handleStartTrial = async () => {
    if (!agreedToTerms) {
      setError('Please agree to the terms and conditions to continue');
      return;
    }
    if (!user) {
      setError('You must be logged in to start a trial. Redirecting to login…');
      setTimeout(() => { router.replace('/login?redirect=/signup/trial'); }, 2000);
      return;
    }

    try {
      setProcessing(true);
      setError(null);

      const syncResult = await syncBrowserSessionToCookies();
      if (!syncResult.ok) {
        setError(`${syncResult.error} Please sign in again, then return to this page.`);
        setProcessing(false);
        router.replace('/login?redirect=/signup/trial');
        return;
      }

      const response = await fetch('/api/stripe/create-trial-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ plan: selectedPlan }),
      });

      const raw = await response.text();
      let data: { error?: string; url?: string } = {};
      try {
        data = raw ? JSON.parse(raw) : {};
      } catch {
        setError(raw ? `Something went wrong (${response.status}). ${raw.slice(0, 200)}` : `Something went wrong (${response.status}).`);
        setProcessing(false);
        return;
      }

      if (response.ok && data.url) {
        window.location.href = data.url;
      } else {
        if (response.status === 401) {
          setError('Session expired. Please log in again.');
          setTimeout(() => { router.replace('/login?redirect=/signup/trial'); }, 2000);
        } else {
          setError(data.error || (response.status >= 500 ? 'Server error starting checkout. Check Stripe env vars and try again.' : 'Failed to start trial. Please try again.'));
        }
        setProcessing(false);
      }
    } catch (err: any) {
      console.error('Error starting trial:', err);
      setError('Failed to start trial. Please try again.');
      setProcessing(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
      </div>
    );
  }

  const monthlyPlan = SUBSCRIPTION_PLANS.monthly;
  const annualPlan = SUBSCRIPTION_PLANS.annually;
  const annualSavings = (SUBSCRIPTION_PLANS.monthly.amount * 12) - SUBSCRIPTION_PLANS.annually.amount;

  return (
    <div className="min-h-screen bg-white">

      {/* Header */}
      <header className="border-b border-gray-100 px-5 py-4 flex items-center justify-between max-w-5xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <Calendar className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-gray-900 text-lg">Inboker</span>
        </Link>
        <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium">
          <Check className="h-4 w-4" />
          Account created
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-5 py-14">

        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 mb-5">
            <Zap className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="font-display text-3xl font-extrabold text-gray-900 mb-2">
            Start your {TRIAL_PERIOD_DAYS}-day free trial
          </h1>
          <p className="text-gray-500 text-base">
            No charges for {TRIAL_PERIOD_DAYS} days. Cancel anytime during your trial.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600 mb-6">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Plan cards */}
        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          {/* Monthly */}
          <button
            type="button"
            onClick={() => setSelectedPlan('monthly')}
            className={`text-left rounded-2xl border-2 p-5 transition-all ${
              selectedPlan === 'monthly'
                ? 'border-blue-500 bg-blue-50/50 shadow-sm'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <p className="font-semibold text-gray-900">{monthlyPlan.name}</p>
              <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${selectedPlan === 'monthly' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}`}>
                {selectedPlan === 'monthly' && <Check className="h-3 w-3 text-white" />}
              </div>
            </div>
            <div className="mb-4">
              <span className="text-3xl font-extrabold text-gray-900">£{monthlyPlan.amount}</span>
              <span className="text-gray-500 text-sm">/{monthlyPlan.interval}</span>
            </div>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm text-gray-600">
                <Check className="h-3.5 w-3.5 text-emerald-500" />
                {TRIAL_PERIOD_DAYS} days free
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-600">
                <Check className="h-3.5 w-3.5 text-emerald-500" />
                Cancel anytime
              </li>
            </ul>
          </button>

          {/* Annual */}
          <button
            type="button"
            onClick={() => setSelectedPlan('annually')}
            className={`text-left rounded-2xl border-2 p-5 transition-all relative ${
              selectedPlan === 'annually'
                ? 'border-blue-500 bg-blue-50/50 shadow-sm'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="absolute -top-3 left-4">
              <span className="rounded-full bg-emerald-100 px-3 py-0.5 text-[11px] font-bold text-emerald-700">
                Save £{annualSavings}/yr
              </span>
            </div>
            <div className="flex items-start justify-between mb-3">
              <p className="font-semibold text-gray-900">{annualPlan.name}</p>
              <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${selectedPlan === 'annually' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}`}>
                {selectedPlan === 'annually' && <Check className="h-3 w-3 text-white" />}
              </div>
            </div>
            <div className="mb-4">
              <span className="text-3xl font-extrabold text-gray-900">£{annualPlan.amount}</span>
              <span className="text-gray-500 text-sm">/{annualPlan.interval}</span>
            </div>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm text-gray-600">
                <Check className="h-3.5 w-3.5 text-emerald-500" />
                {TRIAL_PERIOD_DAYS} days free
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-600">
                <Check className="h-3.5 w-3.5 text-emerald-500" />
                Cancel anytime
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-600">
                <Check className="h-3.5 w-3.5 text-emerald-500" />
                Best value
              </li>
            </ul>
          </button>
        </div>

        {/* Card notice */}
        <div className="flex items-start gap-3 rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 mb-6">
          <CreditCard className="h-4 w-4 text-gray-500 shrink-0 mt-0.5" />
          <p className="text-sm text-gray-600">
            <strong className="text-gray-900">Card required to start trial.</strong>{' '}
            You won't be charged until your {TRIAL_PERIOD_DAYS}-day trial ends. Cancel anytime before then.
          </p>
        </div>

        {/* Terms checkbox */}
        <div className="flex items-start gap-3 mb-6">
          <input
            type="checkbox"
            id="agree"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="agree" className="text-sm text-gray-600 cursor-pointer leading-relaxed">
            I agree to the{' '}
            <Link href="/terms" className="text-blue-600 hover:underline">terms of service</Link>{' '}
            and understand my card will be charged £{selectedPlan === 'monthly' ? monthlyPlan.amount : annualPlan.amount}
            {' '}{selectedPlan === 'monthly' ? 'monthly' : 'annually'} after my {TRIAL_PERIOD_DAYS}-day trial ends, unless I cancel first.
          </label>
        </div>

        <button
          onClick={handleStartTrial}
          disabled={processing || !agreedToTerms}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {processing ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Processing…</>
          ) : (
            <><CreditCard className="h-4 w-4" /> Continue to payment</>
          )}
        </button>

        <p className="text-center text-xs text-gray-400 mt-4">
          You'll be redirected to Stripe to securely enter your payment details.
        </p>
      </div>
    </div>
  );
}
