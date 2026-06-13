'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Calendar, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/providers/auth-provider';

type BrandInfo = {
  business_name: string;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
};

export default function LoginPage() {
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [brand, setBrand] = useState<BrandInfo | null>(null);
  const [brandLoading, setBrandLoading] = useState(false);
  const [loginStep, setLoginStep] = useState<'password' | 'mfa'>('password');
  const [mfaFactorId, setMfaFactorId] = useState<string | null>(null);
  const [mfaOtp, setMfaOtp] = useState('');

  const brandSlug = searchParams.get('brand') || searchParams.get('slug') || '';

  useEffect(() => {
    if (searchParams.get('signup') === 'success') {
      setSuccess('Account created successfully! Please log in to continue.');
    }
    if (searchParams.get('timeout') === '1') {
      setError('Your session ended due to inactivity. Please sign in again.');
    }
  }, [searchParams]);

  // White-label: load brand when login is opened with ?brand=slug (e.g. from booking link)
  useEffect(() => {
    if (!brandSlug) {
      setBrand(null);
      return;
    }
    let cancelled = false;
    setBrandLoading(true);
    fetch(`/api/brand/${encodeURIComponent(brandSlug)}`)
      .then((res) => {
        if (!res.ok) return null;
        return res.json();
      })
      .then((data) => {
        if (!cancelled && data?.business_name) {
          setBrand({
            business_name: data.business_name,
            logo_url: data.logo_url ?? null,
            primary_color: data.primary_color ?? '#3b82f6',
            secondary_color: data.secondary_color ?? '#06b6d4',
          });
        } else if (!cancelled) {
          setBrand(null);
        }
      })
      .catch(() => {
        if (!cancelled) setBrand(null);
      })
      .finally(() => {
        if (!cancelled) setBrandLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [brandSlug]);

  // Don't redirect here - let middleware handle it to avoid redirect loops
  // The middleware will redirect authenticated users away from login page

  const finalizeLoginSession = async (userId: string, session: { access_token: string; refresh_token: string }) => {
    if (!supabase) {
      setError('Authentication service unavailable. Please refresh and try again.');
      setLoading(false);
      return;
    }
    try {
      try {
        const syncResponse = await fetch('/api/auth/sync-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            access_token: session.access_token,
            refresh_token: session.refresh_token,
          }),
        });

        if (syncResponse.ok) {
          console.log('✅ Session synced to cookies');
        } else {
          console.warn('⚠️ Failed to sync session to cookies, but continuing');
        }
      } catch (syncErr) {
        console.warn('⚠️ Error syncing session to cookies:', syncErr);
      }

      let sessionVerified = false;
      for (let i = 0; i < 5; i++) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        const {
          data: { session: s },
        } = await supabase.auth.getSession();
        if (s && s.user) {
          sessionVerified = true;
          break;
        }
      }

      if (!sessionVerified) {
        console.warn('⚠️ Session not verified after multiple attempts, but proceeding');
      }

      let role: string | null = null;
      let businessSlug = null;

      try {
        const { data: profile } = await supabase.from('users').select('role').eq('id', userId).single();

        if (profile?.role) {
          role = profile.role;
        }

        if (role === 'business_owner') {
          const { data: businessProfile } = await supabase
            .from('business_profiles')
            .select('business_slug, business_name')
            .eq('user_id', userId)
            .single();

          if (businessProfile) {
            businessSlug =
              businessProfile.business_slug ||
              businessProfile.business_name
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim();
          }
        }
      } catch (profileErr) {
        console.error('❌ Could not fetch profile:', profileErr);
      }

      const redirectParam = searchParams.get('redirect');

      let redirectUrl = '/dashboard/customer';
      if (redirectParam) {
        redirectUrl = redirectParam === '/dashboard' ? '/dashboard/customer' : redirectParam;
      } else if (role === 'customer') {
        redirectUrl = '/dashboard/customer';
      } else if (role === 'business_owner') {
        if (businessSlug) {
          redirectUrl = `/${businessSlug}/dashboard`;
        } else {
          redirectUrl = '/dashboard/business-owner';
        }
      } else if (role === 'admin') {
        redirectUrl = '/admin/dashboard';
      } else {
        console.warn('⚠️ Unknown role, defaulting to customer dashboard');
        redirectUrl = '/dashboard/customer';
      }

      setTimeout(() => {
        window.location.href = redirectUrl;
      }, 500);
    } catch (e) {
      console.error(e);
      setError('Could not complete sign-in.');
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('🔵 Signing in with Supabase...');

      // Use signInWithPassword directly - this automatically handles session persistence
      const signInPromise = supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: password,
      });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Login timeout')), 10000)
      );

      const { data: authData, error: authError } = await Promise.race([
        signInPromise,
        timeoutPromise
      ]) as any;

      if (authError) {
        console.error('❌ Auth error:', authError);
        if (authError.message?.includes('Invalid login credentials')) {
          setError('Invalid email or password');
        } else if (authError.message?.includes('Email not confirmed')) {
          setError('Please confirm your email before logging in');
        } else {
          setError(authError.message || 'Login failed');
        }
        setLoading(false);
        return;
      }

      if (!authData?.session) {
        setError('Login failed - no session created');
        setLoading(false);
        return;
      }

      console.log('✅ Login successful, session created automatically');

      const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (
        aalData?.currentLevel === 'aal1' &&
        aalData?.nextLevel === 'aal2'
      ) {
        const { data: facData } = await supabase.auth.mfa.listFactors();
        const totp = facData?.totp?.find((f: { status: string }) => f.status === 'verified');
        if (totp?.id) {
          setMfaFactorId(totp.id);
          setLoginStep('mfa');
          setLoading(false);
          return;
        }
      }

      await finalizeLoginSession(authData.user.id, authData.session);
    } catch (err: any) {
      console.error('❌ Login error:', err);
      if (err.message === 'Login timeout') {
        setError('Login timed out. Please check your connection.');
      } else {
        setError('Login failed. Please try again.');
      }
      setLoading(false);
    }
  };

  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !mfaFactorId) return;
    setError('');
    setLoading(true);
    try {
      const { data, error: mfaErr } = await supabase.auth.mfa.challengeAndVerify({
        factorId: mfaFactorId,
        code: mfaOtp.replace(/\s/g, ''),
      });
      if (mfaErr) {
        setError(mfaErr.message || 'Invalid code');
        setLoading(false);
        return;
      }
      if (data?.access_token && data?.refresh_token) {
        await supabase.auth.setSession({
          access_token: data.access_token,
          refresh_token: data.refresh_token,
        });
      }
      const {
        data: { session: s },
      } = await supabase.auth.getSession();
      if (!s?.user?.id) {
        setError('MFA verified but session missing');
        setLoading(false);
        return;
      }
      await finalizeLoginSession(s.user.id, s);
    } catch (err: unknown) {
      console.error(err);
      setError('Two-factor verification failed');
      setLoading(false);
    }
  };

  const primary = brand?.primary_color ?? '#2563eb';
  const signupHref = brandSlug ? `/signup?brand=${encodeURIComponent(brandSlug)}` : '/signup';

  const inputClass = 'w-full h-11 px-3.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 disabled:opacity-60 transition bg-white';

  return (
    <div className="min-h-screen flex">
      {/* Left panel — blue brand */}
      <div className="hidden lg:flex lg:w-[44%] bg-gradient-to-br from-blue-900 via-[#1a2d6b] to-indigo-900 flex-col justify-between p-12 relative overflow-hidden shrink-0">
        <div className="absolute inset-0 hero-grid opacity-40" />
        <div className="absolute top-1/3 -left-40 w-[500px] h-[500px] bg-cyan-400/20 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-300/15 rounded-full blur-[70px] pointer-events-none" />

        {/* Logo */}
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2.5 w-fit group">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 group-hover:bg-blue-500 transition-colors">
              <Calendar className="h-4 w-4 text-white" />
            </div>
            <span className="font-display text-[17px] font-bold text-white">Inboker</span>
          </Link>
        </div>

        {/* Mid — headline + bullets */}
        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="font-display text-[1.6rem] font-bold text-white leading-snug mb-3">
              Fill your calendar<br />automatically
            </h2>
            <p className="text-white/70 text-[15px] leading-relaxed max-w-[280px]">
              AI scheduling, automated reminders, and no-show reduction, all in one platform for UK appointment businesses.
            </p>
          </div>
          <div className="space-y-3">
            {[
              '92% reduction in no-shows',
              'Live in under 5 minutes',
              'No credit card required',
              'GDPR-compliant by default',
            ].map((f) => (
              <div key={f} className="flex items-center gap-2.5">
                <div className="w-4 h-4 rounded-full bg-white/15 flex items-center justify-center shrink-0">
                  <Check className="h-2.5 w-2.5 text-white" />
                </div>
                <span className="text-[13px] text-white/75">{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom testimonial */}
        <div className="relative z-10 border-t border-white/[0.07] pt-6">
          <p className="text-[13px] text-white/60 leading-relaxed italic mb-3">
            &ldquo;Switching to Inboker cut our no-shows nearly in half. Clients rebook themselves and our front desk finally breathes.&rdquo;
          </p>
          <p className="text-[12px] text-white/45">Aisha R., Clinic Manager · Prime Health Clinic</p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white min-h-screen">
        <div className="w-full max-w-[400px]">

          {/* Mobile-only logo */}
          <div className="lg:hidden mb-8">
            <Link href="/" className="flex items-center gap-2.5 w-fit">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600">
                <Calendar className="h-4 w-4 text-white" />
              </div>
              <span className="font-display text-[17px] font-bold text-gray-900">Inboker</span>
            </Link>
          </div>

          {brandLoading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600" />
            </div>
          ) : (
            <>
              {/* Heading */}
              {brand ? (
                <div className="text-center mb-8">
                  {brand.logo_url && (
                    <img src={brand.logo_url} alt={brand.business_name} className="h-12 w-auto mx-auto mb-3 object-contain" />
                  )}
                  <h1 className="font-display text-xl font-bold text-gray-900">{brand.business_name}</h1>
                  <p className="text-sm text-gray-400 mt-1">Sign in to your account</p>
                </div>
              ) : (
                <div className="mb-8">
                  <h1 className="font-display text-[1.6rem] font-bold text-gray-900 mb-1">Welcome back</h1>
                  <p className="text-[14px] text-gray-400">Sign in to your Inboker account</p>
                </div>
              )}

              {/* Messages */}
              {success && (
                <div className="mb-5 px-4 py-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm">
                  {success}
                </div>
              )}
              {error && (
                <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
                  {error}
                </div>
              )}

              {/* Form */}
              <form onSubmit={loginStep === 'mfa' ? handleMfaSubmit : handleSubmit} className="space-y-4">
                {loginStep === 'password' ? (
                  <>
                    <div>
                      <label htmlFor="login-email" className="block text-[13px] font-medium text-gray-700 mb-1.5">
                        Email address
                      </label>
                      <input
                        id="login-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loading}
                        placeholder="you@example.com"
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label htmlFor="login-password" className="text-[13px] font-medium text-gray-700">
                          Password
                        </label>
                        <Link href="/forgot-password" className="text-[12px] text-blue-600 hover:text-blue-700 transition-colors">
                          Forgot password?
                        </Link>
                      </div>
                      <input
                        id="login-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                        placeholder="••••••••"
                        className={inputClass}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      style={{ backgroundColor: primary }}
                      className="w-full h-11 rounded-xl text-[14px] font-semibold text-white transition hover:brightness-[1.06] disabled:opacity-60 mt-1"
                    >
                      {loading ? 'Signing in…' : 'Sign in'}
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-[13px] text-gray-500 text-center">
                      Enter the 6-digit code from your authenticator app
                    </p>
                    <div>
                      <label htmlFor="mfa-otp" className="block text-[13px] font-medium text-gray-700 mb-1.5">
                        Authenticator code
                      </label>
                      <input
                        id="mfa-otp"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        value={mfaOtp}
                        onChange={(e) => setMfaOtp(e.target.value.replace(/\D/g, '').slice(0, 8))}
                        disabled={loading}
                        placeholder="000 000"
                        className={`${inputClass} text-center tracking-[0.25em] font-mono text-lg`}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading || mfaOtp.length < 6}
                      style={{ backgroundColor: primary }}
                      className="w-full h-11 rounded-xl text-[14px] font-semibold text-white transition hover:brightness-[1.06] disabled:opacity-60"
                    >
                      {loading ? 'Verifying…' : 'Verify & continue'}
                    </button>
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => {
                        setLoginStep('password');
                        setMfaFactorId(null);
                        setMfaOtp('');
                        setError('');
                      }}
                      className="w-full h-11 rounded-xl text-[13px] font-medium text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      ← Back to password
                    </button>
                  </>
                )}
              </form>

              <p className="mt-7 text-center text-[13px] text-gray-400">
                Don&apos;t have an account?{' '}
                <Link href={signupHref} className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                  Sign up free
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
