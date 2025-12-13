'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get('signup') === 'success') {
      setSuccess('Account created successfully! Please log in to continue.');
    }
  }, [searchParams]);

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
      let role = 'business_owner';
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
        console.warn('⚠️ Could not fetch profile, using default role');
      }
      
      // Check for redirect parameter
      const redirectParam = searchParams.get('redirect');
      
      // Determine redirect URL
      let redirectUrl = '/dashboard';
      if (redirectParam) {
        // Use redirect parameter if provided
        redirectUrl = redirectParam;
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
        
        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
            {success}
          </div>
        )}
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              className="w-full px-3 py-2 border rounded-md"
                disabled={loading}
              />
            </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              className="w-full px-3 py-2 border rounded-md"
                disabled={loading}
              />
            </div>

          <button
              type="submit"
              disabled={loading}
            className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link href="/signup" className="text-blue-600 hover:text-blue-700 font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

