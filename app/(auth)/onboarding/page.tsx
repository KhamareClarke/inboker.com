'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Section } from '@/components/ui/section';
import { Container } from '@/components/ui/container';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Sparkles } from 'lucide-react';

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [workspaceName, setWorkspaceName] = useState('');
  const [workspaceSlug, setWorkspaceSlug] = useState('');

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

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
        .insert({
          name: workspaceName,
          slug: workspaceSlug,
          primary_color: '#3b82f6',
        })
        .select()
        .single();

      if (workspaceError) throw workspaceError;

      const { error: memberError } = await supabase
        .from('workspace_members')
        .insert({
          workspace_id: workspace.id,
          user_id: user?.id,
          role: 'owner',
          is_active: true,
        });

      if (memberError) throw memberError;

      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to create workspace');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Section as="div" className="min-h-screen flex items-center justify-center py-ds-6 relative overflow-hidden bg-gradient-to-br from-blue-50 via-cyan-50 to-indigo-50 dark:from-blue-950/30 dark:via-cyan-950/30 dark:to-indigo-950/30">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLW9wYWNpdHk9IjAuMDMiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-40" />
      <Container size="narrow" className="max-w-2xl w-full relative z-10">
        <Card className="w-full border-2 shadow-ds-xl backdrop-blur-sm bg-background/80 rounded-ds-lg">
          <CardHeader className="text-center pb-6">
            <div className="flex items-center justify-center mb-ds-2">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600 via-cyan-600 to-indigo-600 rounded-ds-lg flex items-center justify-center shadow-ds-xl shadow-blue-500/30">
                <Sparkles className="h-10 w-10 text-white" />
              </div>
            </div>
            <CardTitle className="ds-heading-1">Welcome to Inboker!</CardTitle>
          <CardDescription className="text-lg mt-2">
            Let's set up your AI-powered booking platform in just a few steps
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleCreateWorkspace}>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="workspaceName">Workspace Name</Label>
                <Input
                  id="workspaceName"
                  placeholder="My Booking Business"
                  value={workspaceName}
                  onChange={(e) => handleWorkspaceNameChange(e.target.value)}
                  required
                  disabled={loading}
                  className="h-11"
                />
                <p className="text-sm text-muted-foreground">
                  This is the name of your business or organization
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="workspaceSlug">Workspace URL</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">umlate.com/</span>
                  <Input
                    id="workspaceSlug"
                    placeholder="my-business"
                    value={workspaceSlug}
                    onChange={(e) => setWorkspaceSlug(generateSlug(e.target.value))}
                    required
                    disabled={loading}
                    className="flex-1 h-11"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  This will be your unique booking page URL
                </p>
              </div>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium mb-2">What's included:</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                  Team management and scheduling
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                  Intelligent booking system
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                  CRM and client management
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                  Public booking page
                </li>
              </ul>
            </div>

            <Button type="submit" className="w-full h-14 bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 hover:from-blue-700 hover:via-cyan-700 hover:to-blue-700 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 bg-[length:200%_100%] hover:bg-right text-lg" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              Create Workspace
            </Button>
          </CardContent>
        </form>
        </Card>
      </Container>
    </Section>
  );
}
