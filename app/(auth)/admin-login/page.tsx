'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, Shield, AlertCircle } from 'lucide-react';

const inputClass = 'w-full h-11 px-3.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 disabled:opacity-60 transition bg-white';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Authenticate against Supabase with provided credentials
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (authError || !authData?.session) {
        setError('Invalid credentials');
        setLoading(false);
        return;
      }

      // Verify the authenticated user actually has the admin role
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('role, suspended')
        .eq('id', authData.user.id)
        .single();

      if (profileError || !profile) {
        await supabase.auth.signOut();
        setError('Could not verify admin access. Please try again.');
        setLoading(false);
        return;
      }

      if (profile.suspended) {
        await supabase.auth.signOut();
        setError('This account has been suspended.');
        setLoading(false);
        return;
      }

      if (profile.role !== 'admin') {
        await supabase.auth.signOut();
        setError('Access denied. Admin privileges required.');
        setLoading(false);
        return;
      }

      // Sync session to cookies then redirect
      await fetch('/api/auth/sync-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          access_token: authData.session.access_token,
          refresh_token: authData.session.refresh_token,
        }),
      }).catch(() => undefined);

      window.location.href = '/admin/dashboard';
    } catch (err: any) {
      console.error('Admin login error:', err);
      setError('Login failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#070c18] px-5 py-12 relative overflow-hidden">
      <div className="absolute inset-0 hero-grid opacity-30" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(139,92,246,0.15),transparent)]" />

      <div className="relative z-10 w-full max-w-[380px]">

        <div className="flex justify-center mb-8">
          <div className="h-16 w-16 rounded-2xl bg-purple-600/20 border border-purple-500/20 flex items-center justify-center">
            <Shield className="h-8 w-8 text-purple-400" />
          </div>
        </div>

        <h1 className="font-display text-2xl font-bold text-white text-center mb-1">Admin login</h1>
        <p className="text-sm text-white/40 text-center mb-8">Restricted access. Inboker staff only.</p>

        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400 mb-5">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label className="block text-sm font-medium text-white/60 mb-1.5" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/60 mb-1.5" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className={inputClass}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 px-6 py-3 text-sm font-semibold text-white hover:bg-purple-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-[#070c18] mt-1"
          >
            {loading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Verifying…</>
            ) : (
              'Login as admin'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
