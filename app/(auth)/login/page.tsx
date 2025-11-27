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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('🔵 Calling login API...');
      
      // Add timeout to fetch
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log('🔵 API response:', response.status);

      const result = await response.json();
      console.log('🔵 API result:', result);

      if (!response.ok) {
        // Check if it's a suspended account error
        if (response.status === 403 || result.error?.includes('suspended')) {
          setError('Your account has been suspended by admin');
        } else {
          setError(result.error || 'Invalid email or password');
        }
        setLoading(false);
        return;
      }

      if (result.success && result.session) {
        console.log('✅ Login successful, setting session...');
        
        // Set session and wait for it to be established
        console.log('🔄 Setting session...');
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: result.session.access_token,
          refresh_token: result.session.refresh_token,
        });

        if (sessionError) {
          console.error('❌ Session set error:', sessionError);
        } else {
          console.log('✅ Session set successfully');
        }
        
        // Wait for session to be verified
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Verify session exists
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          console.log('✅ Session verified:', session.user.email);
        } else {
          console.warn('⚠️ Session not found after set, but proceeding');
        }
        
        // Get role and business slug from login response
        const role = result.role || 'business_owner';
        const businessSlug = result.businessSlug;
        
        console.log('✅ User role from login:', role);
        console.log('✅ Business slug:', businessSlug);
        
        // Redirect based on role
        if (role === 'customer') {
          console.log('✅ Redirecting customer to /dashboard/customer');
          window.location.href = '/dashboard/customer';
        } else if (role === 'business_owner') {
          // If business owner has a business profile, redirect to business dashboard
          if (businessSlug) {
            console.log('✅ Redirecting business owner to /' + businessSlug + '/dashboard');
            window.location.href = `/${businessSlug}/dashboard`;
          } else {
            console.log('✅ Redirecting business owner to /dashboard/business-owner (no profile)');
            window.location.href = '/dashboard/business-owner';
          }
        } else if (role === 'admin') {
          console.log('✅ Redirecting admin to /admin');
          window.location.href = '/admin';
        } else {
          console.log('⚠️ Unknown role, defaulting to business owner');
          window.location.href = '/dashboard/business-owner';
        }
        return;
      }

      setError('Login failed');
      setLoading(false);
    } catch (err: any) {
      console.error('❌ Login error:', err);
      if (err.name === 'AbortError') {
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
