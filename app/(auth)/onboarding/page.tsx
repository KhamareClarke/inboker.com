'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/providers/auth-provider';
import { Loader2, AlertCircle, Calendar, Check, ArrowRight } from 'lucide-react';

const inputClass = 'w-full h-11 px-3.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 disabled:opacity-60 transition bg-white';

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [workspaceName, setWorkspaceName] = useState('');
  const [workspaceSlug, setWorkspaceSlug] = useState('');

  const generateSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

  const handleWorkspaceNameChange = (name: string) => {
    setWorkspaceName(name);
    if (!workspaceSlug || generateSlug(workspaceName) === workspaceSlug) {
      setWorkspaceSlug(generateSlug(name));
    }
  };

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data: existingWorkspace } = await supabase
        .from('workspaces')
        .select('id')
        .eq('slug', workspaceSlug)
        .maybeSingle();

      if (existingWorkspace) {
        setError('This workspace URL is already taken. Please choose another.');
        setLoading(false);
        return;
      }

      const { data: workspace, error: workspaceError } = await supabase
        .from('workspaces')
        .insert({ name: workspaceName, slug: workspaceSlug, primary_color: '#3b82f6' })
        .select()
        .single();

      if (workspaceError) throw workspaceError;

      const { error: memberError } = await supabase
        .from('workspace_members')
        .insert({ workspace_id: workspace.id, user_id: user?.id, role: 'owner', is_active: true });

      if (memberError) throw memberError;

      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to create workspace');
    } finally {
      setLoading(false);
    }
  };

  const included = [
    'Online booking page for your clients',
    'Team scheduling & staff management',
    'SMS & email reminders',
    'Client CRM & history',
  ];

  return (
    <div className="min-h-screen bg-white">

      {/* Header */}
      <header className="border-b border-gray-100 px-5 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Calendar className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg">Inboker</span>
          </Link>
          <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium">
            <Check className="h-4 w-4" />
            Trial activated
          </div>
        </div>
      </header>

      <div className="max-w-xl mx-auto px-5 py-14">

        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 mb-5">
            <Calendar className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="font-display text-3xl font-extrabold text-gray-900 mb-2">Welcome to Inboker!</h1>
          <p className="text-gray-500">Set up your booking platform in under 2 minutes.</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600 mb-6">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleCreateWorkspace} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="workspaceName">
              Business name <span className="text-red-400">*</span>
            </label>
            <input
              id="workspaceName"
              type="text"
              required
              placeholder="The Brow Studio"
              value={workspaceName}
              onChange={(e) => handleWorkspaceNameChange(e.target.value)}
              disabled={loading}
              className={inputClass}
            />
            <p className="mt-1.5 text-xs text-gray-400">The name of your business or organisation.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="workspaceSlug">
              Booking page URL <span className="text-red-400">*</span>
            </label>
            <div className="flex items-center gap-0 rounded-xl border border-gray-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/30 transition overflow-hidden bg-white">
              <span className="pl-3.5 pr-1 text-sm text-gray-400 shrink-0">inboker.com/</span>
              <input
                id="workspaceSlug"
                type="text"
                required
                placeholder="my-business"
                value={workspaceSlug}
                onChange={(e) => setWorkspaceSlug(generateSlug(e.target.value))}
                disabled={loading}
                className="flex-1 h-11 pr-3.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none disabled:opacity-60 bg-transparent"
              />
            </div>
            <p className="mt-1.5 text-xs text-gray-400">Your unique booking page address.</p>
          </div>

          {/* Included features */}
          <div className="rounded-2xl bg-gray-50 border border-gray-100 p-5">
            <p className="text-sm font-semibold text-gray-700 mb-3">What's included in your trial:</p>
            <ul className="space-y-2.5">
              {included.map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-sm text-gray-600">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50">
                    <Check className="h-3 w-3 text-emerald-500" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <button
            type="submit"
            disabled={loading || !workspaceName || !workspaceSlug}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {loading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Creating workspace…</>
            ) : (
              <>Create workspace <ArrowRight className="h-4 w-4" /></>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
