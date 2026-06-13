'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { signUp } from '@/lib/auth';
import type { UserRole } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { Loader2, ArrowRight, Briefcase, User, AlertCircle, CreditCard, Check, Calendar, Bell, BarChart3, Star } from 'lucide-react';

const inputClass = 'w-full h-11 px-3.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 disabled:opacity-60 transition bg-white';

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [userType, setUserType] = useState<'business_owner' | 'customer'>('business_owner');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const canceled = searchParams.get('canceled') === 'true';

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const host = window.location.host || '';
    if (host.includes('vercel.app')) {
      const canonical = 'https://inboker.com';
      const path = window.location.pathname + window.location.search;
      window.location.replace(canonical + path);
      return;
    }
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setIsLoggedIn(true);
          const { data: subscription } = await supabase
            .from('subscriptions')
            .select('status')
            .eq('user_id', session.user.id)
            .single();
          const isActive = subscription?.status === 'active' ||
                           subscription?.status === 'trialing' ||
                           subscription?.status === 'trial';
          setHasActiveSubscription(isActive || false);
        }
      } catch (err) {
        console.error('Error checking auth:', err);
      } finally {
        setCheckingAuth(false);
      }
    };
    checkAuth();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const role: UserRole = userType === 'business_owner' ? 'business_owner' : 'customer';
      console.log('🔄 Starting signup...');

      const signupPromise = signUp(email, password, fullName, role);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('TIMEOUT')), 30000)
      );

      const result = await Promise.race([signupPromise, timeoutPromise]) as any;
      console.log('✅ Signup result:', result);

      if (result && result.user) {
        console.log('✅ User created successfully!');
        setError('');

        if (userType !== 'business_owner') {
          const welcomeToken = result.session?.access_token;
          if (welcomeToken) {
            try {
              await fetch('/api/auth/welcome-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${welcomeToken}` },
                body: JSON.stringify({ fullName: fullName.trim() }),
              });
            } catch (welcomeErr) {
              console.warn('Welcome email request failed:', welcomeErr);
            }
          }
        }

        if (userType === 'business_owner') {
          try {
            const signInResult = await supabase.auth.signInWithPassword({
              email: email.trim().toLowerCase(),
              password: password,
            });

            if (signInResult.error || !signInResult.data?.session) {
              console.error('❌ Auto-login failed:', signInResult.error);
              setError('Account created but login failed. Please sign in manually.');
              setLoading(false);
              return;
            }

            console.log('✅ Auto-authentication successful!');

            try {
              const syncResponse = await fetch('/api/auth/sync-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                  access_token: signInResult.data.session.access_token,
                  refresh_token: signInResult.data.session.refresh_token,
                }),
              });
              if (syncResponse.ok) {
                console.log('✅ Session synced to cookies');
              }
            } catch (syncErr) {
              console.warn('⚠️ Error syncing session to cookies:', syncErr);
            }

            try {
              await fetch('/api/auth/welcome-email', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${signInResult.data.session.access_token}`,
                },
                body: JSON.stringify({ fullName: fullName.trim() }),
              });
            } catch (welcomeErr) {
              console.warn('Welcome email request failed:', welcomeErr);
            }

            await new Promise(resolve => setTimeout(resolve, 1000));
            window.location.href = '/signup/trial?plan=monthly';
            return;
          } catch (authErr: any) {
            console.error('❌ Auto-authentication error:', authErr);
            setError('Account created but login failed. Please sign in manually.');
            setLoading(false);
            return;
          }
        }

        setLoading(false);
        window.location.replace('/login?signup=success');
        return;
      }

      setError('Signup completed but redirect failed. Please try logging in.');
      setLoading(false);
    } catch (err: any) {
      console.error('❌ Signup error:', err);
      if (err.message === 'TIMEOUT') {
        setError('');
        setLoading(false);
        console.log('⚠️ Signup timeout - redirecting to login');
        window.location.replace('/login?signup=timeout');
      } else {
        setError(err.message || 'Failed to create account');
        setLoading(false);
      }
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
      </div>
    );
  }

  if (isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-5">
        <div className="w-full max-w-[400px]">
          <div className="mb-8 text-center">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <Calendar className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-gray-900 text-lg">Inboker</span>
            </Link>
          </div>

          <h1 className="font-display text-2xl font-bold text-gray-900 mb-2 text-center">
            {canceled ? 'Payment canceled' : 'Already signed in'}
          </h1>
          <p className="text-sm text-gray-500 text-center mb-6">
            {canceled
              ? 'Your payment was canceled. Complete your subscription to access your dashboard.'
              : "You're already signed in to Inboker."}
          </p>

          {canceled && (
            <div className="flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-100 px-4 py-3 text-sm text-amber-700 mb-5">
              <AlertCircle className="h-4 w-4 shrink-0" />
              No dashboard access without an active subscription.
            </div>
          )}

          <div className="flex flex-col gap-3">
            {canceled || !hasActiveSubscription ? (
              <>
                <button
                  onClick={() => router.push('/signup/trial?plan=monthly')}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-500 transition-colors"
                >
                  <CreditCard className="h-4 w-4" />
                  Complete subscription setup
                </button>
                <button
                  onClick={async () => { await supabase.auth.signOut(); window.location.href = '/signup'; }}
                  className="inline-flex w-full items-center justify-center rounded-xl border border-gray-200 px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-500 transition-colors"
                >
                  Go to dashboard
                </button>
                <button
                  onClick={async () => { await supabase.auth.signOut(); window.location.href = '/signup'; }}
                  className="inline-flex w-full items-center justify-center rounded-xl border border-gray-200 px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Log out and create new account
                </button>
                <Link href="/login" className="text-sm text-center text-gray-500 hover:text-blue-600 transition-colors">
                  Go to login page
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Left panel — dark brand */}
      <div className="hidden lg:flex lg:w-[44%] bg-[#070c18] flex-col justify-between p-12 relative overflow-hidden shrink-0">
        <div className="absolute inset-0 hero-grid opacity-40" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(59,130,246,0.15),transparent)]" />

        {/* Logo */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-white text-xl">Inboker</span>
          </Link>
        </div>

        {/* Headline + bullets */}
        <div className="relative z-10 -mt-8">
          <div className="inline-block rounded-full border border-blue-400/20 bg-blue-600/[0.12] px-4 py-1.5 text-[11px] font-semibold text-blue-400 uppercase tracking-widest mb-6">
            14-day free trial
          </div>
          <h2 className="font-display text-[2rem] font-extrabold text-white leading-tight mb-6">
            Fill your calendar,<br />automatically
          </h2>
          <ul className="space-y-4">
            {[
              { icon: Calendar, text: 'Online booking page live in minutes' },
              { icon: Bell, text: 'Automated SMS & email reminders' },
              { icon: BarChart3, text: 'Analytics that reveal your best hours' },
              { icon: Check, text: 'No contracts, cancel anytime' },
            ].map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600/20 border border-blue-400/20">
                  <Icon className="h-3 w-3 text-blue-400" />
                </span>
                <span className="text-sm text-white/60">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Testimonial */}
        <div className="relative z-10 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
          <div className="flex gap-0.5 mb-3">
            {[1,2,3,4,5].map((s) => <Star key={s} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />)}
          </div>
          <p className="text-sm text-white/55 leading-relaxed mb-3">
            "Set up in under 10 minutes. I went from taking bookings over WhatsApp to having a proper system."
          </p>
          <div>
            <p className="text-sm font-semibold text-white">Priya Nair</p>
            <p className="text-xs text-white/35">Owner, The Brow Studio</p>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white min-h-screen">
        <div className="w-full max-w-[420px]">

          {/* Mobile logo */}
          <div className="flex justify-center mb-8 lg:hidden">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <Calendar className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-gray-900 text-lg">Inboker</span>
            </Link>
          </div>

          <h1 className="font-display text-2xl font-bold text-gray-900 mb-1">Create your account</h1>
          <p className="text-sm text-gray-500 mb-7">Get started free. No credit card needed to sign up.</p>

          {/* User type toggle */}
          <div className="flex rounded-xl border border-gray-200 p-1 mb-6 bg-gray-50">
            <button
              type="button"
              onClick={() => setUserType('business_owner')}
              className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all ${
                userType === 'business_owner'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Briefcase className="h-4 w-4" />
              Business
            </button>
            <button
              type="button"
              onClick={() => setUserType('customer')}
              className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all ${
                userType === 'customer'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <User className="h-4 w-4" />
              Customer
            </button>
          </div>

          {userType === 'business_owner' && (
            <div className="rounded-xl bg-blue-50 border border-blue-100 px-4 py-3 mb-5">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-extrabold">
                  14
                </div>
                <div>
                  <p className="text-sm font-semibold text-blue-900 mb-0.5">14-day free trial</p>
                  <p className="text-xs text-blue-700">From £29/month after. Card required. Cancel anytime.</p>
                </div>
              </div>
            </div>
          )}

          {userType === 'customer' && (
            <div className="rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-3 mb-5">
              <p className="text-sm font-semibold text-emerald-900 mb-0.5">Customer account</p>
              <p className="text-xs text-emerald-700">Book and manage appointments with businesses using Inboker.</p>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600 mb-5">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="fullName">
                Full name <span className="text-red-400">*</span>
              </label>
              <input
                id="fullName"
                type="text"
                required
                autoComplete="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Jane Smith"
                disabled={loading}
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="email">
                Email <span className="text-red-400">*</span>
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@yourbusiness.com"
                disabled={loading}
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="password">
                Password <span className="text-red-400">*</span>
              </label>
              <input
                id="password"
                type="password"
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                disabled={loading}
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="confirmPassword">
                Confirm password <span className="text-red-400">*</span>
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat your password"
                disabled={loading}
                className={inputClass}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating account…
                </>
              ) : (
                <>
                  Create account
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-500 transition-colors">
              Sign in
            </Link>
          </p>

          <p className="text-center mt-4">
            <Link href="/" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
              ← Back to home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
