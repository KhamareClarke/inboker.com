'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/providers/auth-provider';
import { Section } from '@/components/ui/section';
import { Container } from '@/components/ui/container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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

  const brandSlug = searchParams.get('brand') || searchParams.get('slug') || '';

  useEffect(() => {
    if (searchParams.get('signup') === 'success') {
      setSuccess('Account created successfully! Please log in to continue.');
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
      
      // Sync session to cookies so API routes can access it
      try {
        const syncResponse = await fetch('/api/auth/sync-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            access_token: authData.session.access_token,
            refresh_token: authData.session.refresh_token,
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
      
      // Verify session is set and wait for it to be fully persisted
      let sessionVerified = false;
      for (let i = 0; i < 5; i++) {
        await new Promise(resolve => setTimeout(resolve, 500));
        const { data: { session } } = await supabase.auth.getSession();
        if (session && session.user) {
          console.log('✅ Session verified on attempt', i + 1);
          sessionVerified = true;
          break;
        }
      }
      
      if (!sessionVerified) {
        console.warn('⚠️ Session not verified after multiple attempts, but proceeding');
      }
      
      // Get user role from database
      let role: string | null = null;
      let businessSlug = null;
      
      try {
        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('id', authData.user.id)
          .single();
        
        if (profile?.role) {
          role = profile.role;
        }
        
        // Get business slug if business owner
        if (role === 'business_owner') {
          const { data: businessProfile } = await supabase
            .from('business_profiles')
            .select('business_slug, business_name')
            .eq('user_id', authData.user.id)
            .single();
          
          if (businessProfile) {
            businessSlug = businessProfile.business_slug || 
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
        // Don't default to business_owner - let it be null and redirect to customer dashboard as fallback
      }
      
      // Check for redirect parameter
      const redirectParam = searchParams.get('redirect');
      
      // Determine redirect URL - NEVER go to /dashboard, go directly to role-specific pages
      // Default to customer dashboard if role is unknown (safer than defaulting to business_owner)
      let redirectUrl = '/dashboard/customer'; // Default fallback
      if (redirectParam) {
        // Use redirect parameter if provided (but not /dashboard)
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
        // If role is null or unknown, default to customer dashboard (safer than business_owner)
        console.warn('⚠️ Unknown role, defaulting to customer dashboard');
        redirectUrl = '/dashboard/customer';
      }
      
      // Force a full page reload to ensure session is synced
      console.log('✅ Redirecting to:', redirectUrl);
      // Use window.location.href for full page reload (replace might not work in some cases)
      setTimeout(() => {
        console.log('🔄 Executing redirect now...');
        window.location.href = redirectUrl;
      }, 500);
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

  const primary = brand?.primary_color ?? '#3b82f6';
  const signupHref = brandSlug ? `/signup?brand=${encodeURIComponent(brandSlug)}` : '/signup';

  return (
    <Section
      as="div"
      className="min-h-screen flex items-center justify-center py-ds-6 bg-gray-50"
    >
      <Container size="narrow" className="max-w-md w-full">
        <Card
          className="w-full rounded-ds-lg shadow-ds-xl border-t-4 border-t-[length:4px]"
          style={{ borderTopColor: primary }}
        >
          <CardHeader className="space-y-1 text-center">
            {brandLoading ? (
              <div className="flex justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
              </div>
            ) : (
              <>
                {brand && (
                  <div className="flex flex-col items-center mb-2">
                    {brand.logo_url && (
                      <img
                        src={brand.logo_url}
                        alt={brand.business_name}
                        className="h-14 w-auto object-contain mb-3"
                      />
                    )}
                    <CardTitle className="ds-heading-3 text-gray-900 text-center">
                      {brand.business_name}
                    </CardTitle>
                    <p className="ds-body-sm text-gray-500 mt-0.5">Sign in to your account</p>
                  </div>
                )}
                {!brand && (
                  <CardTitle className="ds-heading-2 text-center text-gray-900">Login</CardTitle>
                )}
              </>
            )}
          </CardHeader>
          <CardContent>
            {!brandLoading && (
              <>
                {success && (
                  <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-ds ds-body-sm">
                    {success}
                  </div>
                )}

                {error && (
                  <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-ds ds-body-sm">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                      className="bg-background"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                      className="bg-background"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full"
                    style={{ backgroundColor: primary }}
                    onMouseOver={(e) => {
                      if (!loading) e.currentTarget.style.filter = 'brightness(1.05)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.filter = '';
                    }}
                  >
                    {loading ? 'Logging in...' : 'Login'}
                  </Button>
                </form>

                <div className="mt-ds-4 text-center">
                  <p className="ds-body-sm text-gray-600">
                    Don&apos;t have an account?{' '}
                    <Link
                      href={signupHref}
                      className="font-medium"
                      style={{ color: primary }}
                    >
                      Sign up
                    </Link>
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </Container>
    </Section>
  );
}

